// src/pages/StudentPractice.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KPI from '../components/KPI.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { api } from '../api/mockApi.js';
import { useDemoData } from '../demoData.jsx';

const T = { sub:'#9ca3af', border:'#1f2937', hdr:'#0b1220' };
const subtle = { fontSize:12, color:T.sub, marginBottom:6 };
const row = { display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' };
const input = { padding:'8px 10px', border:`1px solid ${T.border}`, background:T.hdr, borderRadius:8, fontSize:14, color:'inherit' };

const PRESETS = {
  Math: {
    '6':['Fractions — add, subtract, compare','Decimals — place value','Integers — basics','Geometry — rectangles'],
    '7':['Fractions — add, subtract, compare','Decimals — rounding','Integers — operations','Geometry — area & perimeter','Algebra — simple equations'],
    '8':['Linear Equations','Integers — operations','Algebra — simple equations'],
    '9':['Algebra — simple equations','Quadratics — concepts'],
    '10':['Quadratics — concepts','Systems of equations'],
  },
  Science: {
    '6':['Physics — speed problems','Chemistry — density'],
    '7':['Physics — speed problems','Chemistry — density'],
    '8':['Physics — acceleration'],
    '9':['Chemistry — % composition'],
    '10':['Physics — acceleration','Chemistry — % composition'],
  }
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

/** Safe numeric helper */
function toNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Robust MCQ fallback (no infinite loops) */
function buildMCQ(items, count=5) {
  const out = [];
  const MAX_DIST_ITERS = 50;

  for (let i=0; i<Math.max(0, count); i++) {
    const src = items[i % (items.length || 1)] || {};
    const stem = src?.stem ?? 'Solve: 2x + 3 = 11';
    const ansStr = (src?.answer ?? '6') + '';
    const ansNum = toNum(ansStr, i+3);

    const opts = new Set([String(ansStr)]);
    let guard = 0;
    while (opts.size < 4 && guard < MAX_DIST_ITERS) {
      guard++;
      // generate numeric-ish distractors around ansNum, but keep them distinct
      const jitter = Math.floor(Math.random()*7) - 3; // -3..+3
      const cand = String(toNum(ansNum + jitter || i + jitter + 1, i + jitter + 1));
      opts.add(cand);
    }
    // Fill if still short
    while (opts.size < 4 && guard < MAX_DIST_ITERS) {
      guard++;
      opts.add(String(i + guard));
    }

    out.push({
      id: src?.id ?? i+1,
      question: stem,
      answer: String(ansStr),
      options: Array.from(opts).slice(0,4).sort(),
      hint: src?.rubric ? `Rubric hint: ${src.rubric}` : 'Isolate the unknown. Do the same to both sides.',
    });
  }
  return out;
}

export default function StudentPractice() {
  const nav = useNavigate();
  const q = useQuery();
  const { grade, setGrade } = useDemoData();

  const [subject, setSubject] = useState(q.subject || 'Math');
  const [seed, setSeed] = useState(q.topic || 'Linear Equations');
  const [difficulty, setDifficulty] = useState(q.difficulty || 'easy');
  const [distractors, setDistractors] = useState(q.distractors || 'numeric');
  const [count, setCount] = useState(toNum(q.count, 5));

  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(false);

  // Adjust presets when Subject/Grade changes
  useEffect(() => {
    const first = PRESETS[subject]?.[String(grade)]?.[0];
    if (first) setSeed(prev => prev && PRESETS[subject]?.[String(grade)]?.includes(prev) ? prev : first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade]);

  const presets = useMemo(() => PRESETS[subject]?.[String(grade)] || [], [subject, grade]);
  const cur = items[idx] || null;
  const total = items.length;
  const labelNow = cur ? `${idx+1}/${total}` : `0/${total || count}`;

  // Generate (safe mid-session)
  const generate = async () => {
    setLoading(true);
    // reset session first (prevents odd transitions)
    setItems([]); setIdx(0); setPicked(null); setDone(false);
    setProgressPct(0); setStreak(0);

    try {
      let set = [];
      if (typeof api.createPracticeSet === 'function') {
        set = await api.createPracticeSet({
          subject, grade: String(grade), topic: seed, difficulty, distractors, count
        });
      } else if (typeof api.generateAssessmentItems === 'function') {
        const raw = await api.generateAssessmentItems({ subject, grade: String(grade), seed, count });
        const itemsOnly = Array.isArray(raw) ? raw : (raw?.items || []);
        set = buildMCQ(itemsOnly, count);
      }
      if (!Array.isArray(set) || set.length === 0) set = buildMCQ([{ stem:'Solve: 2x + 4 = 10', answer: 3 }], count);
      setItems(set);
    } catch (e) {
      console.warn('Practice generation error; using fallback', e);
      setItems(buildMCQ([{ stem:'Solve: 2x + 4 = 10', answer: 3 }], count));
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when arriving from Tutor with params
  useEffect(() => {
    if (q.from === 'tutor') generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (opt) => {
    if (!cur) return;
    if (picked != null) return; // prevent double clicks
    const ok = String(opt) === String(cur.answer);
    setPicked(String(opt));
    // smoother progress (to next index)
    const nextIdx = Math.min(idx+1, Math.max(1, total));
    const pct = Math.round((nextIdx / Math.max(1,total)) * 100);
    setProgressPct(pct);
    setStreak(s => ok ? s+1 : 0);
  };

  const next = () => {
    if (idx >= total-1) {
      setDone(true);
    } else {
      setIdx(i => i+1);
      setPicked(null);
    }
  };

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Personalized Practice</h2>

          {/* Controls */}
          <div style={{ ...row, marginTop:4 }}>
            <div>
              <div style={subtle}>Subject</div>
              <select style={input} value={subject} onChange={(e)=>setSubject(e.target.value)} disabled={loading}>
                {Object.keys(PRESETS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={subtle}>Grade</div>
              <select style={input} value={String(grade)} onChange={(e)=>setGrade(String(e.target.value))} disabled={loading}>
                {['6','7','8','9','10'].map(g => <option key={g} value={g}>G{g}</option>)}
              </select>
            </div>
            <div style={{ minWidth:260, flex:'1 1 280px' }}>
              <div style={subtle}>Seed / Topic</div>
              <input style={input} value={seed} onChange={(e)=>setSeed(e.target.value)} disabled={loading}/>
            </div>
            <div>
              <div style={subtle}>Presets</div>
              <select style={input} value={seed} onChange={(e)=>setSeed(e.target.value)} disabled={loading}>
                {presets.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div style={subtle}>Difficulty</div>
              <select style={input} value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} disabled={loading}>
                <option>easy</option><option>medium</option><option>hard</option>
              </select>
            </div>
            <div>
              <div style={subtle}>Distractors</div>
              <select style={input} value={distractors} onChange={(e)=>setDistractors(e.target.value)} disabled={loading}>
                <option>numeric</option><option>algebraic</option><option>mixed</option>
              </select>
            </div>
            <div>
              <div style={subtle}>Count</div>
              <input style={input} type="number" min={1} max={30} value={count} onChange={(e)=>setCount(toNum(e.target.value,5))} disabled={loading}/>
            </div>
            <div style={{ alignSelf:'end' }}>
              <button className="btn" onClick={generate} disabled={loading}>{loading?'Generating…':'Generate'}</button>
            </div>
          </div>

          {/* Progress */}
          <ProgressBar value={cur ? idx+1 : 0} max={Math.max(1, total)} label={labelNow} />

          {/* Question */}
          {cur && (
            <div className="card" style={{marginTop:12}}>
              <div><strong>Q{idx+1}.</strong> {cur.question}</div>
              <div className="row" style={{flexWrap:'wrap', marginTop:8}}>
                {cur.options.map((op,j) => {
                  const isPicked = picked === String(op);
                  const isCorrect = String(op) === String(cur.answer);
                  const style = isPicked ? (isCorrect ? 'success' : 'danger') : 'secondary';
                  return (
                    <button
                      className={`btn ${style}`}
                      key={j}
                      onClick={()=>choose(op)}
                      disabled={picked != null}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
              {cur.hint && <div className="badge" style={{marginTop:8}}>{cur.hint}</div>}

              {picked != null && (
                <div className="row" style={{marginTop:10}}>
                  <button className="btn" onClick={next}>{idx >= total-1 ? 'Finish' : 'Next'}</button>
                </div>
              )}
            </div>
          )}

          {/* Empty or done */}
          {!cur && total === 0 && (
            <div className="badge" style={{marginTop:8}}>Pick your controls above and click Generate.</div>
          )}
          {done && (
            <div className="row" style={{marginTop:12}}>
              <div className="badge">Session complete</div>
              <button className="btn" onClick={()=>{ setIdx(0); setPicked(null); setDone(false); setProgressPct(0); }}>Restart</button>
            </div>
          )}
        </section>

        <aside>
          <KPI label="Mastery now" value={`${Math.max(0, Math.min(100, progressPct))}%`} delta="+9pp in 3 weeks"/>
          <KPI label="Adaptive difficulty" value={streak>=3 ? 'Increasing' : 'Stable'}/>
          <KPI label="Engagement" value="1.7× baseline"/>
        </aside>
      </div>
    </div>
  );
}

