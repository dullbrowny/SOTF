// src/pages/TeacherAutoGrading.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/mockApi.js';
import { useDemoData } from '../demoData.jsx';

const T = { bg:'#0a0f1a', card:'#0f172a', border:'#1f2937', text:'#e5e7eb', sub:'#9ca3af', hdr:'#0b1220', primary:'#2563eb', row:'#111827', good:'#10b981' };
const card = { background:T.card, border:`1px solid ${T.border}`, borderRadius:12, color:T.text, padding:16 };
const subtle = { fontSize:12, color:T.sub, marginBottom:4 };
const input = { padding:'8px 10px', border:`1px solid ${T.border}`, background:T.hdr, borderRadius:8, width:'100%', fontSize:14, color:T.text };
const btn = (primary=false)=>({ padding:'10px 14px', borderRadius:8, fontSize:14, border:primary?`1px solid ${T.primary}`:`1px solid ${T.border}`, background:primary?T.primary:T.hdr, color:primary?'white':T.text, cursor:'pointer' });
const chip = { display:'inline-block', padding:'2px 8px', border:`1px solid ${T.border}`, background:T.hdr, borderRadius:999, fontSize:12, color:T.text };

const SUBJECTS = ['Math','Science','Biology'];
const PRESETS = {
  Math: ['Unit test — integers','Unit test — fractions','Unit test — algebra'],
  Science: ['Unit test — speed','Unit test — acceleration','Unit test — density','Unit test — % composition'],
  Biology: ['Unit test — Punnett squares'],
};

const LS_KEY = 'sof.grading.v1';

export default function TeacherAutoGrading() {
  const { grade, setGrade } = useDemoData();

  // Batch builder
  const [subject, setSubject] = useState('Math');
  const [seed, setSeed] = useState(PRESETS['Math'][0]);
  const [count, setCount] = useState(10);
  const [batchName, setBatchName] = useState('');
  const [section, setSection] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [rosterText, setRosterText] = useState('');
  const rosterList = useMemo(() =>
    rosterText.split('\n').map(s=>s.trim()).filter(Boolean), [rosterText]);

  // Table
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Drawer (review)
  const [showDrawer, setShowDrawer] = useState(false);
  const [active, setActive] = useState(null);

  // Keep seed in sync with subject
  useEffect(() => { setSeed(PRESETS[subject][0]); }, [subject]);

  // Restore last session for convenience (non-destructive)
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (!s) return;
      const data = JSON.parse(s);
      if (data?.rows) setRows(data.rows);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ rows }));
  }, [rows]);

  const avgScore = useMemo(() => rows.length ? Math.round(rows.reduce((s,r)=>s+r.score,0)/rows.length) : 0, [rows]);
  const passRate = useMemo(() => rows.length ? Math.round(100*rows.filter(r=>r.score>=60).length/rows.length) : 0, [rows]);
  const lowConfidence = useMemo(() => rows.filter(r=>r.confidence<55).length, [rows]);

  // CSV import (roster)
  const fileRef = useRef(null);
  const onChooseCSV = () => fileRef.current?.click();
  const onCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        // very light parser: take first column as name
        const names = text.split(/\r?\n/).map(line => line.split(',')[0]?.trim()).filter(Boolean);
        setRosterText(names.join('\n'));
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const gradeAll = async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      let data = [];
      if (typeof api.generateGradingBatch === 'function') {
        const opts = {
          subject, grade: String(grade), seed: batchName || seed,
          count: rosterList.length ? rosterList.length : Number(count),
        };
        data = await api.generateGradingBatch(opts);
        // If a roster is provided, replace names in order
        if (rosterList.length) {
          data = data.map((row, i) => ({ ...row, student: rosterList[i] || row.student }));
        }
      } else {
        data = await api.getGradingBatch();
      }
      const graded = (data || []).map(d => ({ ...d, status: d.status || 'Graded', teacherNote: d.teacherNote || '' }));
      setRows(graded);
      setElapsedMs(performance.now() - t0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!rows.length) return;
    const headers = ['id','student','gradeLevel','subject','score','confidence','status','teacherNote','r_concept','r_procedure','r_communication','rationale'];
    const esc = v => v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
    const csv = [headers.join(','), ...rows.map(r => {
      const rb = r?.evidence?.rubric || [];
      const r1 = rb[0]?.points ?? '';
      const r2 = rb[1]?.points ?? '';
      const r3 = rb[2]?.points ?? '';
      return [
        r.id, r.student, r.gradeLevel, r.subject, r.score, r.confidence, r.status, r.teacherNote ?? '',
        r1, r2, r3, r?.evidence?.rationale ?? ''
      ].map(esc).join(',');
    })].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `grading_${subject}_G${grade}.csv`; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const openEvidence = (r) => { setActive(structuredClone(r)); setShowDrawer(true); };
  const closeEvidence = () => { setShowDrawer(false); setActive(null); };
  const saveEvidence = () => {
    if (!active) return;
    setRows(prev => prev.map(r => r.id === active.id ? active : r));
    closeEvidence();
  };

  const setActiveRubric = (idx, val) => {
    setActive(a => {
      const next = structuredClone(a);
      if (!next.evidence) next.evidence = {};
      if (!next.evidence.rubric) next.evidence.rubric = [{label:'Concept',points:0},{label:'Procedure',points:0},{label:'Communication',points:0}];
      next.evidence.rubric[idx].points = Number(val ?? 0);
      return next;
    });
  };

  return (
    <div style={{ padding:20, background:T.bg, minHeight:'100vh', color:T.text }}>
      <div style={{ color:T.sub, fontSize:12, marginBottom:6 }}>Teacher • Grading</div>

      {/* Batch Builder */}
      <div style={{ ...card, marginBottom:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:12 }}>
          <div style={{ gridColumn:'span 2' }}>
            <div style={subtle}>Subject</div>
            <select style={input} value={subject} onChange={(e)=>setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ gridColumn:'span 1' }}>
            <div style={subtle}>Grade</div>
            <select style={input} value={String(grade)} onChange={(e)=>setGrade(String(e.target.value))}>
              {['6','7','8','9','10'].map(g => <option key={g} value={g}>G{g}</option>)}
            </select>
          </div>

          <div style={{ gridColumn:'span 3' }}>
            <div style={subtle}>Seed</div>
            <input style={input} value={seed} onChange={(e)=>setSeed(e.target.value)} />
          </div>

          <div style={{ gridColumn:'span 3' }}>
            <div style={subtle}>Presets</div>
            <select style={input} value={seed} onChange={(e)=>setSeed(e.target.value)}>
              {(PRESETS[subject]||[]).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ gridColumn:'span 3' }}>
            <div style={subtle}>Batch name (optional)</div>
            <input style={input} placeholder="e.g., Unit 3 Midterm, Period 2" value={batchName} onChange={(e)=>setBatchName(e.target.value)} />
          </div>

          <div style={{ gridColumn:'span 3' }}>
            <div style={subtle}>Class / Section</div>
            <input style={input} placeholder="e.g., 8B" value={section} onChange={(e)=>setSection(e.target.value)} />
          </div>

          <div style={{ gridColumn:'span 2' }}>
            <div style={subtle}>Due date</div>
            <input style={input} type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
          </div>

          <div style={{ gridColumn:'span 2' }}>
            <div style={subtle}>Students</div>
            <input style={input} type="number" min={1} max={200} value={count} onChange={(e)=>setCount(e.target.value)} />
          </div>

          <div style={{ gridColumn:'span 12' }}>
            <div style={subtle}>Roster (paste one name per line) — or import CSV</div>
            <div style={{ display:'flex', gap:8 }}>
              <textarea style={{ ...input, width:'100%', minHeight:80, fontFamily:'inherit' }} value={rosterText} onChange={(e)=>setRosterText(e.target.value)} placeholder="Arjun Sharma&#10;Meera Patel&#10;..." />
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button style={btn()} onClick={onChooseCSV}>Import CSV</button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display:'none' }} onChange={onCSV} />
                <button style={btn(true)} onClick={gradeAll} disabled={loading}>{loading?'Grading…':'Grade All (Simulated)'}</button>
                <button style={btn()} onClick={exportCSV} disabled={!rows.length}>Export CSV</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Callout */}
      <div style={{ marginTop:0, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ background: rows.length ? 'linear-gradient(180deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08))' : T.hdr,
                      border:`1px solid ${rows.length ? 'rgba(16,185,129,0.35)' : T.border}`, color: rows.length ? '#bbf7d0' : T.sub,
                      borderRadius:12, padding:12, fontWeight:600 }}>
          {rows.length ? `${rows.length} Students graded` : 'No grades yet'}
          {rows.length ? <span style={{ fontWeight:500, marginLeft:8 }}>(in {(elapsedMs/1000).toFixed(2)}s)</span> : null}
        </div>
        {!!rows.length && <span style={chip}>Seed: “{(batchName || seed).slice(0,48)}{(batchName||seed).length>48?'…':''}”</span>}
        {!!section && <span style={chip}>Section: {section}</span>}
        {!!dueDate && <span style={chip}>Due: {dueDate}</span>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, marginTop:16 }}>
        {/* Table */}
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'separate', borderSpacing:0, width:'100%', fontSize:14 }}>
              <thead>
                <tr>
                  {['#','Student','Score','Confidence','Status','Evidence','Actions'].map((h,i)=>(
                    <th key={i} style={{ textAlign:'left', background:T.hdr, color:T.sub, borderBottom:`1px solid ${T.border}`, padding:'10px 12px', position:'sticky', top:0, zIndex:1, fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rows||[]).map((r,idx)=>(
                  <tr key={r.id||idx} style={{ borderBottom:`1px solid ${T.border}` }}
                      onMouseEnter={(e)=>e.currentTarget.style.background=T.row}
                      onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 12px', color:T.sub }}>{r.id||idx+1}</td>
                    <td style={{ padding:'10px 12px' }}>{r.student}</td>
                    <td style={{ padding:'10px 12px' }}>{r.score}%</td>
                    <td style={{ padding:'10px 12px' }}>{r.confidence}%</td>
                    <td style={{ padding:'10px 12px' }}>{r.status}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <button style={{...btn(), padding:'6px 10px'}} onClick={()=>openEvidence(r)}>Show</button>
                    </td>
                    <td style={{ padding:'10px 12px', whiteSpace:'nowrap' }}>
                      <button style={{...btn(), padding:'6px 8px'}} onClick={()=>setRows(prev => prev.map(x => x.id===r.id ? {...x, status:'Reviewed'} : x))}>Review</button>{' '}
                      <button style={{...btn(), padding:'6px 8px'}} onClick={()=>setRows(prev => prev.map(x => x.id===r.id ? {...x, status:'Override'} : x))}>Override</button>{' '}
                      <button style={{...btn(), padding:'6px 8px'}} onClick={()=>setRows(prev => prev.filter(x => x.id!==r.id))}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <div style={{ padding:12, color:T.sub }}>Click <b>Grade All</b> to simulate a batch. Paste/import a roster to grade specific students.</div>}
        </div>

        {/* Right metrics */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={subtle}>Average score</div>
            <div style={{ fontSize:28, fontWeight:700, color:'#c7d2fe' }}>{avgScore}%</div>
          </div>
          <div style={card}>
            <div style={subtle}>Pass rate (≥ 60%)</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#93c5fd' }}>{passRate}%</div>
          </div>
          <div style={card}>
            <div style={subtle}>Low-confidence</div>
            <div style={{ fontSize:20, fontWeight:700 }}>{lowConfidence}</div>
            <div style={{ marginTop:6, fontSize:12, color:T.sub }}>Confidence &lt; 55%.</div>
          </div>
          <div style={card}>
            <div style={subtle}>Session</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={chip}>Subject: {subject}</span>
              <span style={chip}>Grade: {String(grade)}</span>
              <span style={chip}>Rows: {rows.length}</span>
              <span style={chip}>Elapsed: {(elapsedMs/1000).toFixed(2)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence drawer (editable) */}
      {showDrawer && active && (
        <div role="dialog" aria-modal="true" style={{
          position:'fixed', top:0, right:0, bottom:0, width:480, background:T.card,
          borderLeft:`1px solid ${T.border}`, boxShadow:'-24px 0 48px rgba(0,0,0,0.35)', padding:16, zIndex:10000
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontWeight:700 }}>Evidence — {active.student}</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={saveEvidence} style={{...btn(true), padding:'6px 10px'}}>Save</button>
              <button onClick={closeEvidence} style={{...btn(), padding:'6px 10px'}}>Close</button>
            </div>
          </div>

          <div style={{ color:T.sub, marginBottom:12 }}>
            Score <b style={{ color:T.text }}>{active.score}%</b> • Confidence <b style={{ color:T.text }}>{active.confidence}%</b>
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={subtle}>Status</div>
            <select style={input} value={active.status} onChange={(e)=>setActive(a=>({...a, status:e.target.value}))}>
              <option>Pending</option>
              <option>Graded</option>
              <option>Reviewed</option>
              <option>Override</option>
            </select>
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={subtle}>Rationale</div>
            <textarea
              style={{ ...input, minHeight:80, fontFamily:'inherit' }}
              value={active?.evidence?.rationale || ''}
              onChange={(e)=>setActive(a=>({...a, evidence:{ ...(a.evidence||{}), rationale:e.target.value }}))}
            />
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={subtle}>Rubric points</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {['Concept','Procedure','Communication'].map((lab,i)=>(
                <div key={lab}>
                  <div style={{ ...subtle, marginBottom:6, color:T.text }}>{lab}</div>
                  <input type="number" min={0} max={i===2?2:4} style={input}
                         value={active?.evidence?.rubric?.[i]?.points ?? 0}
                         onChange={(e)=>setActiveRubric(i, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={subtle}>Teacher note</div>
            <textarea
              style={{ ...input, minHeight:80, fontFamily:'inherit' }}
              value={active?.teacherNote || ''}
              onChange={(e)=>setActive(a=>({...a, teacherNote:e.target.value}))}
              placeholder="Feedback to student or override justification…"
            />
          </div>
        </div>
      )}
    </div>
  );
}

