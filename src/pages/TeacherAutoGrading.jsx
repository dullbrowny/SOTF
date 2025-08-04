// src/pages/TeacherAutoGrading.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/mockApi.js';
import { useDemoData } from '../demoData.jsx';

const T = { bg:'#0a0f1a', card:'#0f172a', border:'#1f2937', text:'#e5e7eb', sub:'#9ca3af', hdr:'#0b1220', primary:'#2563eb', row:'#111827' };
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

export default function TeacherAutoGrading() {
  const { grade, setGrade } = useDemoData();

  const [subject, setSubject] = useState('Math');
  const [seed, setSeed] = useState(PRESETS['Math'][0]);
  const [count, setCount] = useState(10);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const [showDrawer, setShowDrawer] = useState(false);
  const [active, setActive] = useState(null);

  // keep seed in sync with subject
  useEffect(() => { setSeed(PRESETS[subject][0]); }, [subject]);

  const avgScore = useMemo(() => rows.length ? Math.round(rows.reduce((s,r)=>s+r.score,0)/rows.length) : 0, [rows]);
  const passRate = useMemo(() => rows.length ? Math.round(100*rows.filter(r=>r.score>=60).length/rows.length) : 0, [rows]);
  const lowConfidence = useMemo(() => rows.filter(r=>r.confidence<55).length, [rows]);

  const gradeAll = async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      // prefer generator; if not present, fall back to JSON
      let data = [];
      if (typeof api.generateGradingBatch === 'function') {
        data = await api.generateGradingBatch({ subject, grade: String(grade), seed, count });
      } else {
        data = await api.getGradingBatch();
      }
      // mark as graded
      const graded = (data || []).map(d => ({ ...d, status: 'Graded' }));
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
    const headers = ['id','student','gradeLevel','subject','score','confidence','status'];
    const esc = v => v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `grading_${subject}_G${grade}.csv`; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const openEvidence = (r) => { setActive(r); setShowDrawer(true); };
  const closeEvidence = () => { setShowDrawer(false); setActive(null); };

  return (
    <div style={{ padding:20, background:T.bg, minHeight:'100vh', color:T.text }}>
      <div style={{ color:T.sub, fontSize:12, marginBottom:6 }}>Teacher • Grading</div>

      {/* Controls */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-end', flexWrap:'wrap' }}>
        <div>
          <div style={subtle}>Subject</div>
          <select style={{...input, width:140}} value={subject} onChange={(e)=>setSubject(e.target.value)}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <div style={subtle}>Grade</div>
          <select style={{...input, width:120}} value={String(grade)} onChange={(e)=>setGrade(String(e.target.value))}>
            {['6','7','8','9','10'].map(g => <option key={g} value={g}>G{g}</option>)}
          </select>
        </div>

        <div style={{ minWidth: 300, flex:'1 1 360px' }}>
          <div style={subtle}>Seed</div>
          <input style={input} value={seed} onChange={(e)=>setSeed(e.target.value)} />
        </div>

        <div>
          <div style={subtle}>Presets</div>
          <select style={{...input, width:240}} value={seed} onChange={(e)=>setSeed(e.target.value)}>
            {(PRESETS[subject]||[]).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <div style={subtle}>Students</div>
          <input style={{...input, width:120}} type="number" min={1} max={200} value={count} onChange={(e)=>setCount(e.target.value)} />
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button style={btn(true)} onClick={gradeAll} disabled={loading}>{loading?'Grading…':'Grade All (Simulated)'}</button>
          <button style={btn()} onClick={exportCSV} disabled={!rows.length}>Export CSV</button>
        </div>
      </div>

      {/* Callout */}
      <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ background:'linear-gradient(180deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08))', border:'1px solid rgba(16,185,129,0.35)', color:'#bbf7d0', borderRadius:12, padding:12, fontWeight:600 }}>
          {rows.length ? `${rows.length} Students graded` : 'No grades yet'}
          {rows.length ? <span style={{ fontWeight:500, marginLeft:8 }}>(in {(elapsedMs/1000).toFixed(2)}s)</span> : null}
        </div>
        {!!rows.length && <span style={chip}>Seed: “{seed.slice(0,48)}{seed.length>48?'…':''}”</span>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, marginTop:16 }}>
        {/* Table */}
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'separate', borderSpacing:0, width:'100%', fontSize:14 }}>
              <thead>
                <tr>
                  {['#','Student','Score','Confidence','Status','Evidence'].map((h,i)=>(
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <div style={{ padding:12, color:T.sub }}>Click <b>Grade All</b> to simulate a batch.</div>}
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

      {/* Evidence drawer */}
      {showDrawer && active && (
        <div role="dialog" aria-modal="true" style={{
          position:'fixed', top:0, right:0, bottom:0, width:420, background:T.card,
          borderLeft:`1px solid ${T.border}`, boxShadow:'-24px 0 48px rgba(0,0,0,0.35)', padding:16, zIndex:10000
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontWeight:700 }}>Evidence — {active.student}</div>
            <button onClick={closeEvidence} style={{...btn(), padding:'6px 10px'}}>Close</button>
          </div>
          <div style={{ color:T.sub, marginBottom:12 }}>
            Score <b style={{ color:T.text }}>{active.score}%</b> • Confidence <b style={{ color:T.text }}>{active.confidence}%</b>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={subtle}>Rationale</div>
            <div style={{ background:T.hdr, border:`1px solid ${T.border}`, borderRadius:8, padding:10 }}>{active?.evidence?.rationale || '—'}</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={subtle}>Rubric</div>
            <ul style={{ margin:0, paddingLeft:18 }}>
              {(active?.evidence?.rubric || []).map((r,i)=>(
                <li key={i}>{r.label}: {r.points} pt(s)</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={subtle}>Excerpts</div>
            <ul style={{ margin:0, paddingLeft:18 }}>
              {(active?.evidence?.excerpts || []).map((e,i)=>(<li key={i}>{e}</li>))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

