// src/pages/AdminDashboard.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPI from '../components/KPI.jsx';
import { useDemoData } from '../demoData.jsx';

export default function AdminDashboard() {
  const { grade } = useDemoData();        // make the dashboard reflect the global grade
  const nav = useNavigate();

  // simple simulated cohort metrics (keeps existing look-and-feel)
  const metrics = useMemo(() => {
    const g = Number(grade || 8);
    const base = 50 + (g - 6) * 3;        // slightly increases by grade
    const mastery = Math.min(92, Math.max(38, Math.round(base + (Math.random()*6-3))));
    const backlog = Math.max(0, Math.round(5 - (g-6))); // higher grades, slightly lower backlog
    const engagement = (4.8 + (g-6)*0.15).toFixed(1);
    return { mastery: `${mastery}%`, backlog: String(backlog), engagement: `${engagement} / class` };
  }, [grade]);

  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({
    subject: 'Math',
    topic: 'Linear Equations',
    difficulty: 'easy',
    count: 5,
    distractors: 'numeric',
    section: '',
    due: '',
  });

  const topicsBySubject = {
    Math: ['Linear Equations', 'Integers — operations', 'Fractions — add, subtract, compare'],
    Science: ['Physics — speed problems', 'Physics — acceleration', 'Chemistry — density'],
  };

  const assign = () => {
    setOpen(false);
    const qs = new URLSearchParams({
      from: 'admin',
      subject: opts.subject,
      grade: `G${grade || '8'}`,
      topic: opts.topic,
      difficulty: opts.difficulty,
      count: String(opts.count || 5),
      distractors: opts.distractors,
      ...(opts.section ? { section: opts.section } : {}),
      ...(opts.due ? { due: opts.due } : {}),
    });
    nav('/practice?' + qs.toString());
  };

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Admin Overview</h2>

          <div className="row" style={{ gap: 12 }}>
            <KPI label="% Students ≥80% mastery" value={metrics.mastery}/>
            <KPI label="Grading backlog" value={metrics.backlog}/>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
              <strong>At-risk students — Grade {grade || '8'}</strong>
              <button className="btn secondary" onClick={()=>setOpen(true)}>Assign practice</button>
            </div>
            <ul style={{ marginTop: 8 }}>
              <li>Arjun — Mastery 52%</li>
              <li>Meera — Mastery 55%</li>
              <li>Dev — Mastery 57%</li>
            </ul>
            <div className="small muted" style={{marginTop:8}}>
              Tip: Click <b>Assign practice</b> to send a targeted practice set to the selected cohort. It will deep-link to the Student Practice page prefilled with your choices.
            </div>
          </div>
        </section>

        <aside>
          <KPI label="Avg engagement" value={metrics.engagement} />
          <div className="card" style={{ marginTop: 12 }}>
            <div className="small muted">Cohort</div>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <span className="badge">Grade {grade || '8'}</span>
              <span className="badge">Section • 8B</span>
              <span className="badge">Subject • Math</span>
            </div>
          </div>
        </aside>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <h3>Assign practice</h3>
            <div className="row" style={{ gap: 12, flexWrap:'wrap' }}>
              <label>Subject
                <select value={opts.subject} onChange={(e)=>setOpts(o=>({...o,subject:e.target.value, topic: topicsBySubject[e.target.value][0]}))}>
                  {Object.keys(topicsBySubject).map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Topic
                <select value={opts.topic} onChange={(e)=>setOpts(o=>({...o,topic:e.target.value}))}>
                  {topicsBySubject[opts.subject].map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>Difficulty
                <select value={opts.difficulty} onChange={(e)=>setOpts(o=>({...o,difficulty:e.target.value}))}>
                  <option>easy</option><option>medium</option><option>hard</option>
                </select>
              </label>
              <label># Items
                <input type="number" min="3" max="10" value={opts.count}
                       onChange={(e)=>setOpts(o=>({...o,count:Number(e.target.value||5)}))}/>
              </label>
              <label>Distractors
                <select value={opts.distractors} onChange={(e)=>setOpts(o=>({...o,distractors:e.target.value}))}>
                  <option>numeric</option><option>words</option>
                </select>
              </label>
              <label>Section
                <input placeholder="e.g., 8B" value={opts.section} onChange={(e)=>setOpts(o=>({...o,section:e.target.value}))}/>
              </label>
              <label>Due date
                <input type="date" value={opts.due} onChange={(e)=>setOpts(o=>({...o,due:e.target.value}))}/>
              </label>
            </div>

            <div className="row" style={{justifyContent:'flex-end', gap:8, marginTop:12}}>
              <button className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button>
              <button className="btn" onClick={assign}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

