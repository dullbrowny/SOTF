// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import KPI from '../components/KPI.jsx';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({ subject:'Math', topic:'Linear Equations', difficulty:'easy', count:5, distractors:'numeric' });

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Admin Overview</h2>
          <div className="row">
            <KPI label="% Students >80% mastery" value="62%"/>
            <KPI label="Grading backlog" value="3"/>
          </div>
          <div className="card">
            <div className="row" style={{justifyContent:'space-between'}}>
              <strong>At-risk students</strong>
              <button className="btn secondary" onClick={()=>setOpen(true)}>Assign practice</button>
            </div>
            <ul>
              <li>Arjun – Mastery 52%</li>
              <li>Meera – Mastery 55%</li>
              <li>Dev – Mastery 57%</li>
            </ul>
          </div>
        </section>
        <aside>
          <KPI label="Avg engagement" value="5.6 / class" />
        </aside>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <h3>Assign practice</h3>
            <div className="row">
              <label>Subject<select value={opts.subject} onChange={(e)=>setOpts(o=>({...o,subject:e.target.value}))}><option>Math</option><option>Science</option></select></label>
              <label>Topic<select value={opts.topic} onChange={(e)=>setOpts(o=>({...o,topic:e.target.value}))}>
                {opts.subject==='Math' ? <><option>Linear Equations</option><option>Quadratic Equations</option></> : <><option>Atoms</option><option>Chemical Reactions</option></>}
              </select></label>
              <label>Difficulty<select value={opts.difficulty} onChange={(e)=>setOpts(o=>({...o,difficulty:e.target.value}))}><option>easy</option><option>medium</option><option>hard</option></select></label>
              <label># Items<input type="number" min="3" max="10" value={opts.count} onChange={(e)=>setOpts(o=>({...o,count:Number(e.target.value||5)}))}/></label>
              <label>Distractors<select value={opts.distractors} onChange={(e)=>setOpts(o=>({...o,distractors:e.target.value}))}><option>numeric</option><option>words</option></select></label>
            </div>
            <div className="row" style={{justifyContent:'flex-end'}}>
              <button className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button>
              <button className="btn" onClick={()=>{ setOpen(false); const qs = new URLSearchParams({...opts, from:'admin'}); nav('/practice?'+qs.toString()); }}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}