// src/pages/StudentPractice.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoData } from '../demoData.jsx';
import { generatePracticeItems as genFn, api } from '../api/mockApi.js';

const T = {
  bg: '#0a0f1a', card: '#0f172a', border: '#1f2937', text: '#e5e7eb', sub: '#9ca3af',
  header: '#0b1220', primary: '#06b6d4', chip: '#0b1220'
};
const card = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, color: T.text };
const label = { fontSize: 12, color: T.sub, marginBottom: 4 };
const input = { padding: '8px 10px', border: `1px solid ${T.border}`, background: T.header, borderRadius: 8, color: T.text, fontSize: 14, width: '100%' };
const select = input;
const pill = { display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: T.chip, border: `1px solid ${T.border}`, fontSize: 12, color: T.text };

const SUBJECTS = ['Math', 'Science', 'Biology'];
const GRADES = ['6','7','8','9','10'];
const PRESETS = {
  Math:   { '6':['Fractions — add, subtract, compare','Integers — operations'], '7':['Integers — operations','Algebra — simple equations'], '8':['Linear Equations','Integers — operations'], '9':['Linear Equations','Quadratics — intro'], '10':['Quadratics — intro'] },
  Science:{ '6':['Physics — speed problems'], '7':['Physics — speed problems'], '8':['Physics — acceleration'], '9':['Chemistry — density'], '10':['Physics — acceleration'] },
  Biology:{ '8':['Punnett squares — monohybrid'], '9':['Punnett squares — monohybrid'], '10':['Punnett squares — monohybrid'] }
};
const DIFFS = ['easy','medium','hard'];
const DISTRACT = ['numeric','conceptual'];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search).entries()), [search]);
}

export default function StudentPractice() {
  const nav = useNavigate();
  const q = useQuery();
  const { grade, setGrade } = useDemoData();

  // Controls
  const [subject, setSubject] = useState(q.subject || 'Math');
  const [seed, setSeed]       = useState(q.topic || PRESETS['Math'][String(grade)]?.[0] || 'Integers — operations');
  const [difficulty, setDifficulty] = useState(q.difficulty || 'easy');
  const [distractors, setDistractors] = useState(q.distractors || 'numeric');
  const [count, setCount] = useState(Number(q.count || 5));

  // Session
  const [items, setItems] = useState([]);         // [{id, stem, options[], answer, hint}]
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [note, setNote] = useState('');

  // Keep presets reactive to subject/grade
  const presets = useMemo(() => PRESETS[subject]?.[String(grade)] || [], [subject, grade]);
  useEffect(() => { if (presets.length) setSeed((s)=> presets.includes(s) ? s : presets[0]); }, [presets]);

  // If arriving from Tutor, reflect controls once
  useEffect(() => {
    if (q.from === 'tutor') {
      if (q.subject) setSubject(q.subject);
      if (q.topic)   setSeed(q.topic);
      if (q.grade)   setGrade(String(q.grade));
      if (q.difficulty) setDifficulty(q.difficulty);
      if (q.count) setCount(Number(q.count));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Changing any control mid-session enables Generate and shows a note
  useEffect(() => {
    if (items.length) {
      setCanGenerate(true);
      setNote('Controls changed — press Generate to start a new set.');
    } else {
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, seed, difficulty, distractors, count]);

  // Unified call that works with either export shape
  async function callGenerate({ subject, grade, seed, difficulty, distractors, count }) {
    const payload = { subject, grade: String(grade), seed, difficulty, distractors, count: Number(count) };
    const attempts = [
      () => genFn?.(payload),
      () => genFn?.(seed, Number(count)),
      () => api?.generatePracticeItems?.(payload),
      () => api?.generatePracticeItems?.(seed, Number(count)),
    ];
    for (const at of attempts) {
      try {
        const out = await at();
        if (!out) continue;
        const arr = Array.isArray(out) ? out : out?.items;
        if (Array.isArray(arr) && arr.length) return arr;
      } catch {}
    }
    return [];
  }

  const onGenerate = async () => {
    setLoading(true);
    try {
      const newItems = await callGenerate({ subject, grade, seed, difficulty, distractors, count });
      setItems(newItems.map((it,i) => ({
        id: it.id ?? i+1,
        stem: it.stem ?? it.question ?? '—',
        options: it.options ?? it.choices ?? [],
        answer: it.answer ?? it.correct ?? '',
        hint: it.rubric ?? it.hint ?? ''
      })));
      setIdx(0);
      setChosen(null);
      setCanGenerate(false);
      setNote('');
    } finally {
      setLoading(false);
    }
  };

  const onChoose = (opt) => {
    if (chosen != null) return;
    setChosen(opt);
  };
  const onNext = () => {
    const next = idx + 1;
    if (next < items.length) {
      setIdx(next);
      setChosen(null);
    } else {
      // Finished — subtle nudge
      setNote('Great work! Press Generate to start another set.');
      setCanGenerate(true);
    }
  };

  const cur = items[idx];
  const progress = items.length ? ((idx) / items.length) : 0;

  return (
    <div style={{ padding: 20, color: T.text }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
        {/* Left: Practice */}
        <div style={card}>
          <div style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>Personalized Practice</div>

          {/* Controls row */}
          <div style={{ display:'grid', gridTemplateColumns:'120px 100px 1fr 1fr 140px 140px 100px 140px', gap:12, alignItems:'end' }}>
            <div>
              <div style={label}>Subject</div>
              <select style={select} value={subject} onChange={(e)=>setSubject(e.target.value)}>
                {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={label}>Grade</div>
              <select style={select} value={String(grade)} onChange={(e)=>setGrade(String(e.target.value))}>
                {GRADES.map(g=><option key={g} value={g}>G{g}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <div style={label}>Seed / Topic</div>
              <input style={input} value={seed} onChange={(e)=>setSeed(e.target.value)} />
            </div>
            <div>
              <div style={label}>Presets</div>
              <select style={select} value={seed} onChange={(e)=>setSeed(e.target.value)}>
                {presets.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div style={label}>Difficulty</div>
              <select style={select} value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                {DIFFS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <div style={label}>Distractors</div>
              <select style={select} value={distractors} onChange={(e)=>setDistractors(e.target.value)}>
                {DISTRACT.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <div style={label}>Count</div>
              <input style={input} type="number" min={1} max={20} value={count} onChange={(e)=>setCount(Number(e.target.value||5))} />
            </div>
            <div style={{ alignSelf:'end' }}>
              <button
                type="button"
                onClick={onGenerate}
                disabled={loading}
                style={{ padding:'10px 14px', borderRadius:10, border:`1px solid ${T.border}`, background:T.primary, color:'#001b1f', fontWeight:700, cursor:'pointer' }}
              >
                {loading ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop:12 }}>
            <div style={{ height:8, background:T.header, border:`1px solid ${T.border}`, borderRadius:999, overflow:'hidden' }}>
              <div style={{ width:`${progress*100}%`, height:'100%', background:T.primary, transition:'width 200ms' }} />
            </div>
            <div style={{ marginTop:6, fontSize:13, color:T.sub }}>{items.length ? `${idx+1}/${items.length}` : `0/${count}`}</div>
          </div>

          {/* Note / nudge */}
          {note && <div style={{ marginTop:10, fontSize:13, color:'#93c5fd' }}>{note}</div>}

          {/* Question */}
          <div style={{ marginTop:12, border:`1px solid ${T.border}`, borderRadius:12, padding:12, background:T.header }}>
            {!cur ? (
              <div style={{ color:T.sub, fontSize:14 }}>Pick your controls above and click <b>Generate</b>.</div>
            ) : (
              <>
                <div style={{ fontWeight:700, marginBottom:10 }}>Q{idx+1}. {cur.stem}</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {(cur.options || []).map((opt,i)=>{
                    const isChosen = chosen === opt;
                    const isCorrect = opt === cur.answer;
                    const bg = chosen == null ? T.card
                           : isCorrect ? 'rgba(34,197,94,0.15)'
                           : isChosen ? 'rgba(239,68,68,0.15)'
                           : T.card;
                    const br = chosen == null ? T.border
                           : isCorrect ? 'rgba(34,197,94,0.4)'
                           : isChosen ? 'rgba(239,68,68,0.4)'
                           : T.border;
                    return (
                      <button key={i} onClick={()=>onChoose(opt)} disabled={chosen!=null}
                        style={{ padding:'6px 12px', borderRadius:10, background:bg, border:`1px solid ${br}`, color:T.text, cursor:'pointer' }}>
                        {String(opt)}
                      </button>
                    );
                  })}
                </div>
                {/* Reveal */}
                {chosen!=null && (
                  <div style={{ marginTop:10, fontSize:13 }}>
                    <span style={pill}>Rubric hint: {cur.hint || '—'}</span>
                  </div>
                )}
                {/* Next */}
                <div style={{ marginTop:12 }}>
                  <button type="button" onClick={onNext} disabled={chosen==null}
                    style={{ padding:'8px 12px', borderRadius:10, border:`1px solid ${T.border}`, background: chosen==null ? T.header : T.primary, color: chosen==null ? T.sub : '#001b1f', fontWeight:700, cursor: chosen==null?'default':'pointer' }}>
                    {idx+1 < items.length ? 'Next' : 'Finish'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right summary cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={label}>Mastery now</div>
            <div style={{ fontSize:28, fontWeight:800 }}>58%</div>
            <div style={{ fontSize:12, color:T.sub }}>+9pp in 3 weeks</div>
          </div>
          <div style={card}>
            <div style={label}>Adaptive difficulty</div>
            <div>Stable</div>
          </div>
          <div style={card}>
            <div style={label}>Engagement</div>
            <div>1.7× baseline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

