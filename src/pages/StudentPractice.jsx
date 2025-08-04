// src/pages/StudentPractice.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, generateAssessmentItems } from '../api/mockApi.js'; // generatePracticeItems may not exist; we’ll shim

const T = {
  bg: '#0a0f1a', card: '#0f172a', border: '#1f2937',
  text: '#e5e7eb', sub: '#9ca3af', header: '#0b1220', primary: '#10bcd6'
};
const card = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, color: T.text };

const SUBJECTS = ['Math','Science','Biology'];
const GRADES = ['6','7','8','9','10'];
const PRESETS = {
  Math:   { '6':['Fractions — add, subtract, compare','Integers — operations','Linear Equations'],
            '7':['Linear Equations','Integers — operations','Fractions — add, subtract, compare'],
            '8':['Linear Equations','Integers — operations'], '9':['Linear Equations'], '10':['Algebra — simple equations'] },
  Science:{ '6':['Physics — speed problems'], '7':['Physics — speed problems'],
            '8':['Physics — acceleration'], '9':['Physics — acceleration'], '10':['Physics — acceleration'] },
  Biology:{ '8':['Punnett squares — monohybrid'], '9':['Punnett squares — monohybrid'], '10':['Punnett squares — monohybrid'] },
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// Small shim: prefer api.generatePracticeItems, else fall back to generateAssessmentItems
async function callPracticeAPI({ subject, grade, seed, count, difficulty, distractors }) {
  const payload = { subject, grade, seed, count, difficulty, distractors };
  if (api?.generatePracticeItems) {
    const r = await api.generatePracticeItems(payload);
    return Array.isArray(r) ? r : (r?.items || []);
  }
  // fallback – reuse assessment generator (same shape)
  const r = await generateAssessmentItems({ subject, grade, seed, count });
  return Array.isArray(r) ? r : (r?.items || []);
}

export default function StudentPractice() {
  const q = useQuery();

  // Defaults (will be overridden by query params if present)
  const [subject, setSubject] = useState(q.get('subject') || 'Math');
  const [grade, setGrade]     = useState(q.get('grade') || '8');
  const [seed, setSeed]       = useState(q.get('topic') || PRESETS['Math']['8'][0]);
  const [difficulty, setDifficulty]   = useState(q.get('difficulty') || 'easy');
  const [distractors, setDistractors] = useState(q.get('distractors') || 'numeric');
  const [count, setCount] = useState(Number(q.get('count') || 5));

  const [items, setItems] = useState([]);
  const [idx, setIdx]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState({}); // id -> chosen

  const presetList = useMemo(
    () => PRESETS[subject]?.[String(grade)] || [],
    [subject, grade]
  );

  // If we arrived from Tutor with query params, auto-generate once
  const autoRanRef = useRef(false);
  useEffect(() => {
    const cameFromTutor = q.get('from') === 'tutor';
    if (cameFromTutor && !autoRanRef.current) {
      autoRanRef.current = true;
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const arr = await callPracticeAPI({
        subject, grade: String(grade), seed, count: Number(count), difficulty, distractors
      });
      setItems(arr || []);
      setIdx(0);
      setAnswered({});
    } catch (e) {
      console.error('Practice generate failed:', e);
    } finally {
      setLoading(false);
    }
  }

  const current = items[idx];
  const progress = items.length ? (idx / items.length) * 100 : 0;

  function chooseOption(opt) {
    const id = current?.id ?? idx;
    setAnswered(a => ({ ...a, [id]: opt }));
  }

  function next() {
    if (!items.length) return;
    if (idx < items.length - 1) {
      setIdx(i => i + 1);
    } else {
      // session done – nudge to regenerate
      setIdx(items.length);
    }
  }

  function restart() {
    setIdx(0);
    setAnswered({});
  }

  return (
    <div style={{ padding: 20, color: T.text }}>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        {/* Left */}
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Personalized Practice</h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, minmax(0,1fr))', gap:12, marginTop:16 }}>
            <div>
              <div style={{ fontSize:12, color:T.sub }}>Subject</div>
              <select value={subject} onChange={e=>{ setSubject(e.target.value); setSeed((PRESETS[e.target.value]?.[String(grade)]||[])[0] || ''); }}
                      style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:12, color:T.sub }}>Grade</div>
              <select value={String(grade)} onChange={e=>{ setGrade(e.target.value); setSeed((PRESETS[subject]?.[String(e.target.value)]||[])[0] || ''); }}
                      style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                {GRADES.map(g=><option key={g} value={g}>G{g}</option>)}
              </select>
            </div>

            <div style={{ gridColumn:'span 2' }}>
              <div style={{ fontSize:12, color:T.sub }}>Seed / Topic</div>
              <input value={seed} onChange={e=>setSeed(e.target.value)}
                     placeholder="e.g., Linear Equations"
                     style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }} />
            </div>

            <div>
              <div style={{ fontSize:12, color:T.sub }}>Presets</div>
              <select value={seed} onChange={e=>setSeed(e.target.value)}
                      style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                {presetList.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize:12, color:T.sub }}>Count</div>
              <input type="number" min={1} max={20} value={count} onChange={e=>setCount(e.target.value)}
                     style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }} />
            </div>

            <div>
              <div style={{ fontSize:12, color:T.sub }}>Difficulty</div>
              <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}
                      style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                {['easy','medium','hard'].map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize:12, color:T.sub }}>Distractors</div>
              <select value={distractors} onChange={e=>setDistractors(e.target.value)}
                      style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                {['numeric','algebraic','mixed'].map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ alignSelf:'end' }}>
              <button onClick={handleGenerate} disabled={loading}
                      style={{ background:T.primary, color:'#00151a', border:'none', borderRadius:10, padding:'10px 14px', fontWeight:700 }}>
                {loading ? 'Generating…' : 'Generate'}
              </button>
              <span style={{ marginLeft:10, color:T.sub }}>{items.length?`${idx}/${items.length}`:`0/${count}`}</span>
            </div>
          </div>

          {/* progress */}
          <div style={{ marginTop:14, height:6, borderRadius:999, background:T.header, overflow:'hidden', border:`1px solid ${T.border}` }}>
            <div style={{ width:`${progress}%`, height:'100%', background:T.primary, transition:'width 200ms' }} />
          </div>

          {/* prompt / item */}
          <div style={{ marginTop:16, ...card }}>
            {!items.length && <div style={{ color:T.sub }}>Pick your controls above and click <b>Generate</b>.</div>}

            {!!items.length && idx < items.length && (
              <div>
                <div style={{ marginBottom:8, fontWeight:700 }}>{`Q${idx+1}. `}{current?.stem}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {(current?.options || current?.choices || [])
                    .map((opt,i) => (
                      <button
                        key={i}
                        onClick={()=>chooseOption(opt)}
                        style={{
                          background: (answered[current?.id ?? idx]===opt) ? T.primary : T.header,
                          color: (answered[current?.id ?? idx]===opt) ? '#00151a' : T.text,
                          border:`1px solid ${T.border}`, borderRadius:10, padding:'8px 12px'
                        }}
                      >
                        {String(opt)}
                      </button>
                    ))}
                </div>

                {/* subtle hint */}
                {current?.rubric && (
                  <div style={{ marginTop:10, fontSize:12, color:T.sub }}>
                    Rubric hint: {current.rubric}
                  </div>
                )}

                <div style={{ marginTop:14 }}>
                  <button onClick={next}
                          style={{ background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:10, padding:'8px 12px' }}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* session done */}
            {!!items.length && idx >= items.length && (
              <div>
                <div style={{ fontWeight:700, marginBottom:10 }}>Nice work — that set is complete.</div>
                {items[items.length-1]?.answer && (
                  <div style={{ fontSize:13, color:T.sub, marginBottom:12 }}>
                    Last answer: <b>{String(items[items.length-1].answer)}</b>
                  </div>
                )}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={restart}
                          style={{ background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:10, padding:'8px 12px' }}>
                    Review again
                  </button>
                  <button onClick={handleGenerate}
                          style={{ background:T.primary, color:'#00151a', border:'none', borderRadius:10, padding:'8px 12px', fontWeight:700 }}>
                    Generate new set
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right metrics */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={{ fontSize:12, color:T.sub }}>Mastery now</div>
            <div style={{ fontSize:28, fontWeight:800 }}>58%</div>
            <div style={{ fontSize:12, color:T.sub }}>+9pp in 3 weeks</div>
          </div>
          <div style={card}>
            <div style={{ fontSize:12, color:T.sub }}>Adaptive difficulty</div>
            <div>Stable</div>
          </div>
          <div style={card}>
            <div style={{ fontSize:12, color:T.sub }}>Engagement</div>
            <div>1.7× baseline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

