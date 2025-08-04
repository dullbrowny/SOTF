import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/mockApi.js';
import KPI from '../components/KPI.jsx';

/* --- simple theme helpers (reuse your app styles/classes where possible) --- */
const optCls = (state) =>
  `btn ${state === 'neutral' ? 'secondary' : state === 'success' ? 'success' : 'danger'}`;

/* presets aligned with Assessment */
const SUBJECTS = ['Math', 'Science'];
const GRADES = ['6', '7', '8', '9', '10'];
const PRESETS = {
  Math: {
    '6': ['Fractions — add, subtract, compare', 'Integers — basics', 'Geometry — rectangles'],
    '7': ['Fractions — add, subtract, compare', 'Integers — operations', 'Algebra — simple equations'],
    '8': ['Integers — operations', 'Algebra — simple equations'],
    '9': ['Algebra — simple equations', 'Integers — operations'],
    '10': ['Algebra — simple equations'],
  },
  Science: {
    '6': ['Physics — speed problems', 'Chemistry — density'],
    '7': ['Physics — speed problems', 'Chemistry — density'],
    '8': ['Physics — acceleration', 'Chemistry — density'],
    '9': ['Physics — acceleration', 'Chemistry — % composition'],
    '10': ['Physics — acceleration', 'Chemistry — % composition'],
  },
};

const DIFFS = ['easy', 'medium', 'hard'];
const DISTRACTORS = ['numeric', 'mixed'];

function rng(seed) {
  // deterministic PRNG for distractors
  let t = seed || 1234567;
  return () => (t = (1103515245 * t + 12345) % 2 ** 31) / 2 ** 31;
}
function shuffle(a, r = Math.random) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function StudentPractice() {
  // controls
  const [subject, setSubject] = useState('Math');
  const [grade, setGrade] = useState('8');
  const [seed, setSeed] = useState(PRESETS['Math']['8'][0]);
  const [difficulty, setDifficulty] = useState('easy');
  const [distractors, setDistractors] = useState('numeric');
  const [count, setCount] = useState(5);

  // session
  const [items, setItems] = useState([]); // [{question, options[], answer, hint}]
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]); // {q, picked, correct, answer}
  const [loading, setLoading] = useState(false);

  // visual progress
  const total = items.length || count;
  const displayIndex = done ? total : Math.min(idx + (picked != null ? 1 : 0), total);
  const progressPct = Math.round((displayIndex / Math.max(1, total)) * 100);

  const presetList = useMemo(() => PRESETS[subject]?.[String(grade)] || [], [subject, grade]);

  useEffect(() => {
    // change subject/grade -> default the seed to first preset
    if (presetList.length) setSeed(presetList[0]);
  }, [subject, grade]); // eslint-disable-line

  const cur = items[idx] || null;

  const resetSession = () => {
    setItems([]);
    setIdx(0);
    setPicked(null);
    setDone(false);
    setHistory([]);
  };

  const adaptFromAssessmentItems = (arr) => {
    // Convert Assessment-style items → Practice MCQ items
    const r = rng(seed.length + Number(grade) * 31);
    return (arr || []).slice(0, count).map((it, i) => {
      const answer = Number(it.answer ?? 0);
      let opts = [];
      if (distractors === 'numeric' && !Number.isNaN(answer)) {
        const near = [answer, answer + 1, answer - 1, answer + 2, answer - 2].slice(0, 4);
        opts = shuffle(near, r);
      } else {
        const pool = ['A', 'B', 'C', 'D', String(answer || '1')].slice(0, 4);
        opts = shuffle(pool, r);
      }
      return {
        question: it.stem || `Q${i + 1}`,
        answer: opts.find((x) => String(x) === String(answer)) ?? String(answer),
        options: opts,
        hint: it.rubric || 'Show your steps.',
      };
    });
  };

  const generate = async () => {
    // Allow regenerate in the middle safely
    setLoading(true);
    try {
      const payload = {
        subject,
        grade: String(grade),
        seed,
        difficulty,
        distractors,
        count: Number(count),
      };

      let out = [];
      // try api.generatePractice(payload) → {items: [...]}
      if (api?.generatePractice) {
        const res = await api.generatePractice(payload);
        out = Array.isArray(res) ? res : res?.items || [];
      }
      // fallback: api.getPractice() → {items}
      if (!out.length && api?.getPractice) {
        const res = await api.getPractice(payload);
        out = Array.isArray(res) ? res : res?.items || [];
      }
      // final fallback: use assessment generator, then adapt
      if (!out.length && (api?.generateAssessmentItems || api?.generateAssessment)) {
        const res =
          (await api.generateAssessmentItems?.(payload)) ||
          (await api.generateAssessment?.(payload)) ||
          {};
        const src = Array.isArray(res) ? res : res.items || [];
        out = adaptFromAssessmentItems(src);
      }

      // normalize shape
      const normalized = (out || []).map((q, i) => ({
        question: q.question ?? q.stem ?? `Q${i + 1}`,
        options: Array.isArray(q.options) && q.options.length ? q.options : [q.answer, 'A', 'B', 'C'],
        answer: q.answer ?? q.correct ?? q.options?.[0] ?? 'A',
        hint: q.hint ?? q.rubric ?? '',
      }));

      resetSession();
      setItems(normalized.slice(0, Number(count) || 5));
    } catch (e) {
      console.error('Practice generate failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const choose = (opt) => {
    if (!cur || picked != null) return;
    const pickedStr = String(opt);
    const ok = pickedStr === String(cur.answer);
    setPicked(pickedStr);
    setHistory((h) => [...h, { q: cur, picked: pickedStr, correct: ok, answer: String(cur.answer) }]);
  };

  const next = () => {
    if (idx >= items.length - 1) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  const correctCount = useMemo(() => history.filter((h) => h.correct).length, [history]);
  const masteryNow = useMemo(() => {
    // simple synthetic mastery curve
    const base = subject === 'Math' ? 58 : 54;
    const adj = Math.round((correctCount / Math.max(1, total)) * 30);
    return Math.max(20, Math.min(100, base + adj));
  }, [subject, correctCount, total]);

  // initial demo set
  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      generate();
    }
  }, []); // eslint-disable-line

  return (
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
      <div className="grid">
        {/* Header + controls */}
        <div className="card">
          <h2 style={{ marginBottom: 8 }}>Personalized Practice</h2>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div className="label">Subject</div>
              <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="label">Grade</div>
              <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    G{g}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 280, flex: '1 1 320px' }}>
              <div className="label">Seed / Topic</div>
              <input className="input" value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>

            <div>
              <div className="label">Presets</div>
              <select
                className="input"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                disabled={!presetList.length}
              >
                {presetList.length === 0 && <option>—</option>}
                {presetList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="label">Difficulty</div>
              <select
                className="input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="label">Distractors</div>
              <select
                className="input"
                value={distractors}
                onChange={(e) => setDistractors(e.target.value)}
              >
                {DISTRACTORS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="label">Count</div>
              <input
                className="input"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                style={{ width: 80 }}
              />
            </div>

            <div>
              <button className="btn" disabled={loading} onClick={generate}>
                {loading ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>

          {/* progress bar */}
          <div
            className="badge"
            style={{ marginTop: 12, display: 'block', position: 'relative', overflow: 'hidden' }}
          >
            {displayIndex}/{total}
            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: 3,
                width: `${progressPct}%`,
                background: 'var(--accent, #60a5fa)',
                transition: 'width 160ms',
              }}
            />
          </div>
        </div>

        {/* Question */}
        {cur && !done && (
          <div className="card">
            <div>
              <strong>Q{idx + 1}/{total}.</strong> {cur.question}
            </div>

            <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
              {cur.options.map((op, j) => {
                let state = 'neutral';
                if (picked != null) {
                  if (String(op) === String(cur.answer)) state = 'success';
                  else if (String(op) === String(picked)) state = 'danger';
                }
                return (
                  <button
                    key={j}
                    className={optCls(state)}
                    onClick={() => choose(op)}
                    disabled={picked != null}
                  >
                    {op}
                  </button>
                );
              })}
            </div>

            {picked != null && (
              <div className="card" style={{ marginTop: 10 }}>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge">
                    Your answer: <b>{picked}</b>{' '}
                    {picked === String(cur.answer) ? '✓' : '✗'}
                  </span>
                  <span className="badge">
                    Correct: <b>{cur.answer}</b>
                  </span>
                  {cur.hint && <span className="badge">Explain: {cur.hint}</span>}
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn" onClick={next}>
                    {idx >= total - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* End-of-set summary */}
        {done && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Session summary</h3>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="badge">Score: {correctCount}/{total}</span>
              <span className="badge">Difficulty: {difficulty}</span>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => {
                  const missed = history.filter((h) => !h.correct).map((h) => h.q);
                  if (!missed.length) return generate();
                  setItems(missed.slice(0, Number(count)));
                  setIdx(0);
                  setPicked(null);
                  setDone(false);
                  setHistory([]);
                }}
              >
                Retry missed
              </button>
              <button
                className="btn"
                onClick={() => {
                  resetSession();
                  generate();
                }}
              >
                Another set
              </button>
              <button
                className="btn"
                onClick={() => {
                  const next =
                    difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'hard';
                  setDifficulty(next);
                  resetSession();
                  generate();
                }}
              >
                Harder next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right column KPIs */}
      <div className="grid">
        <KPI label="Mastery now" value={`${masteryNow}%`} delta="+9pp in 3 weeks" />
        <KPI label="Adaptive difficulty" value={difficulty === 'easy' ? 'Stable' : 'Rising'} />
        <KPI label="Engagement" value="1.7× baseline" />
      </div>
    </div>
  );
}

