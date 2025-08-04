// src/pages/StudentPractice.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KPI from '../components/KPI.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { api } from '../api/mockApi.js';
import { useDemoData } from '../demoData.jsx';

const T = {
  sub:'#9ca3af', border:'#1f2937', hdr:'#0b1220'
};
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

function buildMCQ(items, count=5) {
  // Fallback: turn assessment-like items into MCQs with simple distractors
  const out = (items||[]).slice(0, count).map((r, i) => {
    const answer = String(r?.answer ?? '');
    const opts = new Set([answer]);
    while (opts.size < 4) {
      const j = Math.max(0, Math.min(answer.length ? Number(answer) + (Math.floor(Math.random()*7)-3) : i+1, 9999));
      opts.add(String(j));
    }
    return {
      id: r?.id ?? i+1,
      question: r?.stem ?? `Solve: 2x + 3 = 11`,
      answer,
      options: Array.from(opts).sort(),
      hint: r?.rubric ? `Rubric hint: ${r.rubric}` : 'Isolate the unknown. Do the same to both sides.',
    };
  });
  return out;
}

export default function StudentPractice() {
  const nav = useNavigate();
  const q = useQuery();
  const { grade, setGrade } = useDemoData();

  // Controls (seed/topic can come from query or presets)
  const [subject, setSubject] = useState(q.subject || 'Math');
  const [seed, setSeed] = useState(q.topic || 'Linear Equations');
  const [difficulty, setDifficulty] = useState(q.difficulty || 'easy');
  const [distractors, setDistractors] = useState(q.distractors || 'numeric');
  const [count, setCount] = useState(Number(q.count || 5));

  useEffect(() => {
    // keep presets sensible when subject/grade change
    const first = PRESETS[subject]?.[String(grade)]?.[0];
    if (first) setSeed(prev => prev && PRESETS[subject]?.[String(grade)]?.includes(prev) ? prev : first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade]);

  const presets = useMemo(() => PRESETS[subject]?.[String(grade)] || [], [subject, grade]);

  // Items + session state
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(58);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const cur = items[idx] || null;
  const answered = Math.min(idx, items.length);

  const generate = async () => {
    // Try api.createPracticeSet, else fallback via assessment generator if available
    let set = [];
    try {
      if (typeof api.createPracticeSet === 'function') {
        set = await api.createPracticeSet({
          subject, grade: String(grade), topic: seed, difficulty, distractors, count
        });
      } else if (typeof api.generateAssessmentItems === 'function') {
        const raw = await api.generateAssessmentItems({ subject, grade: String(grade), seed, count });
        const itemsOnly = Array.isArray(raw) ? raw : (raw?.items || []);
        set = buildMCQ(itemsOnly, count);
      }
    } catch (e) {
      console.warn('Practice generation error; using fallback', e);
    }
    if (!Array.isArray(set) || set.length === 0) {
      // last-resort fallback
      set = buildMCQ([{ stem: `Solve: 2x + 4 = 10`, answer: 3 }], count);
    }
    setItems(set); setIdx(0); setDone(false); setStreak(0);
  };

  useEffect(() => {
    // Autogenerate if navigated from Tutor with params
    if (q.from === 'tutor') generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (opt) => {
    if (!cur) return;
    const ok = String(opt) === String(cur.answer);
    setProgress(p => Math.max(0, Math.min(100, p + (ok ? 3 : -1))));
    setStreak(s => ok ? s+1 : 0);
    if (idx >= items.length-1) setDone(true);
    else setIdx(i => i+1);
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
              <select style={input} value={subject} onChange={(e)=>setSubject(e.target.value)}>
                {Object.keys(PRESETS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={subtle}>Grade</div>
              <select style={input} value={String(grade)} onChange={(e)=>setGrade(String(e.target.value))}>
                {['6','7','8','9','10'].map(g => <option key={g} value={g}>G{g}</option>)}
              </select>
            </div>
            <div style={{ minWidth:260, flex:'1 1 280px' }}>
              <div style={subtle}>Seed / Topic</div>
              <input style={input} value={seed} onChange={(e)=>setSeed(e.target.value)} />
            </div>
            <div>
              <div style={subtle}>Presets</div>
              <select style={input} value={seed} onChange={(e)=>setSeed(e.target.value)}>
                {presets.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div style={subtle}>Difficulty</div>
              <select style={input} value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                <option>easy</option><option>medium</option><option>hard</option>
              </select>
            </div>
            <div>
              <div style={subtle}>Distractors</div>
              <select style={input} value={distractors} onChange={(e)=>setDistractors(e.target.value)}>
                <option>numeric</option><option>algebraic</option><option>mixed</option>
              </select>
            </div>
            <div>
              <div style={subtle}>Count</div>
              <input style={input} type="number" min={1} max={30} value={count} onChange={(e)=>setCount(Number(e.target.value||5))} />
            </div>
            <div style={{ alignSelf:'end' }}>
              <button className="btn" onClick={generate}>Generate</button>
            </div>
          </div>

          {/* Progress */}
          <ProgressBar value={answered} max={Math.max(1, items.length)} label={`${answered}/${items.length}`} />

          {/* Question */}
          {cur && (
            <div className="card" style={{marginTop:12}}>
              <div><strong>Q{idx+1}.</strong> {cur.question}</div>
              <div className="row" style={{flexWrap:'wrap', marginTop:8}}>
                {cur.options.map((op,j) => (
                  <button className="btn secondary" key={j} onClick={()=>choose(op)}>{op}</button>
                ))}
              </div>
              {cur.hint && <div className="badge" style={{marginTop:8}}>{cur.hint}</div>}
            </div>
          )}

          {/* Empty or done */}
          {!cur && items.length === 0 && (
            <div className="badge" style={{marginTop:8}}>Pick your controls above and click Generate.</div>
          )}
          {done && (
            <div className="row" style={{marginTop:12}}>
              <div className="badge">Session complete</div>
              <button className="btn" onClick={()=>setIdx(0)}>Restart</button>
            </div>
          )}
        </section>

        <aside>
          <KPI label="Mastery now" value={`${progress}%`} delta="+9pp in 3 weeks"/>
          <KPI label="Adaptive difficulty" value={streak>=3 ? 'Increasing' : 'Stable'}/>
          <KPI label="Engagement" value="1.7× baseline"/>
        </aside>
      </div>
    </div>
  );
}

