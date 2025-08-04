// src/pages/TeacherAutoGrading.jsx
import React, { useEffect, useState } from 'react';
import KPI from '../components/KPI.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../api/mockApi';

function fakeRows(n=24){
  const names = ['Arjun','Meera','Kavya','Dev','Zoya','Irfan','Nina','Omar','Lila','Rohit'];
  return Array.from({length:n},(_,i)=> ({
    id:i+1, student: `${names[i%10]} ${7+(i%4)}`, score: 50+((i*7)%41), confidence: 60+((i*11)%31), status: 'Pending'
  }));
}

export default function TeacherAutoGrading() {
  const [rows, setRows] = useState(fakeRows());
  const [show, setShow] = useState(null);
  const [toast, setToast] = useState('');

  function gradeAll() {
    setRows(prev => prev.map((r,i)=> ({...r, status: (i%7===0)?'Needs review':'Auto-graded', confidence: r.status==='Auto-graded'?r.confidence:Math.max(55, r.confidence-15)})));
  }

  function regrade(id, comment) {
    setRows(prev => prev.map(r => r.id!==id ? r : ({
      ...r,
      score: Math.min(100, r.score + Math.min(7, Math.floor((comment||'').length/20))),
      confidence: Math.min(100, r.confidence + 2),
      status: 'Auto-graded'
    })));
    setShow(null);
    setToast('Regraded with teacher input');
    setTimeout(()=>setToast(''), 1200);
  }

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Auto-Grading</h2>
          <div className="row">
            <button className="btn" onClick={gradeAll}>Grade All (Simulated)</button>
            {toast && <span className="badge">{toast}</span>}
          </div>
          <table className="table">
            <thead><tr><th>#</th><th>Student</th><th>Score</th><th>Confidence</th><th>Status</th><th>Evidence</th></tr></thead>
            <tbody>
              {rows.slice(0,12).map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.student}</td><td>{r.score}%</td><td>{r.confidence}%</td><td>{r.status}</td>
                  <td><button className="btn secondary" onClick={()=>setShow({id:r.id, comment:''})}>Show</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside>
          <KPI label="Grading time" value="6h → 2h" delta="-4h/week"/>
          <KPI label="Feedback latency" value="< 5 min (MCQ)"/>
          <KPI label="Human-in-loop" value="Enabled for essays"/>
        </aside>
      </div>

      <Modal open={!!show} title={`Evidence • #${show?.id}`} onClose={()=>setShow(null)}
        actions={<button className="btn" onClick={()=>regrade(show.id, show.comment||'')}>Regrade</button>}>
        <div className="mono small">Question: Explain why 2x + 3 = 11 leads to x = 4</div>
        <div className="mono small">Student: I subtracted 3 and divided by 2.</div>
        <div className="mono small" style={{marginTop:6}}>Rubric:</div>
        <table className="table mono">
          <thead><tr><th>Dim</th><th>Score</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>Setup</td><td>✓</td><td>Correct isolation of variable</td></tr>
            <tr><td>Method</td><td>✓</td><td>Valid operations used</td></tr>
            <tr><td>Answer</td><td>✓</td><td>Correct final value</td></tr>
          </tbody>
        </table>
        <div style={{marginTop:8}}>
          <label>Teacher comment</label>
          <textarea className="input" rows="3" placeholder="Explain your adjustment…" value={show?.comment||''} onChange={(e)=>setShow({...show, comment:e.target.value})} />
        </div>
      </Modal>
    </div>
  );
}