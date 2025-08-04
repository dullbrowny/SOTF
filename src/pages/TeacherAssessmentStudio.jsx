// src/pages/TeacherAssessmentStudio.jsx
import React, { useEffect, useState } from 'react';
import KPI from '../components/KPI.jsx';
import { useDemoData } from '../demoData.jsx';
import { api } from '../api/mockApi';

export default function TeacherAssessmentStudio() {
  const { grade } = useDemoData();
  const [subject, setSubject] = useState('Math');
  const [topic, setTopic] = useState('Linear Equations');
  const [seed, setSeed] = useState(42);
  const [count, setCount] = useState(8);
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const t0 = performance.now();
    const { items } = await api.generateQuestions({ grade: Number(grade), subject, topic, seed, count });
    const t1 = performance.now();
    setItems(items);
    setLabel(`Loaded via seed ${seed} • count ${count} (Δ~${((t1-t0)/1000).toFixed(1)}s)`);
    setLoading(false);
  }
  useEffect(()=>{ run() }, []);

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Assessment Studio</h2>
          <div className="row">
            <label>Grade
              <select value={grade} readOnly>
                <option>{grade}</option>
              </select>
            </label>
            <label>Subject
              <select value={subject} onChange={e=>setSubject(e.target.value)}>
                <option>Math</option><option>Science</option>
              </select>
            </label>
            <label>Topic
              <select value={topic} onChange={e=>setTopic(e.target.value)}>
                {subject==='Math' ? <><option>Linear Equations</option><option>Quadratic Equations</option></> :
                  <><option>Atoms</option><option>Chemical Reactions</option></>}
              </select>
            </label>
          </div>
          <div className="row">
            <label>Seed<input value={seed} onChange={e=>setSeed(Number(e.target.value)||0)} /></label>
            <label>Count<input type="number" min="1" max="20" value={count} onChange={e=>setCount(Number(e.target.value)||8)} /></label>
            <button className="btn" disabled={loading} onClick={run}>{loading?'Generating…':'Generate with AI'}</button>
          </div>

          <div className="table-wrap">
            <div className="small muted">{label}</div>
            <table className="table">
              <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Alt wording A</th><th>Alt wording B</th><th>Rubric</th></tr></thead>
              <tbody>
                {items.map((r,i)=>(
                  <tr key={i}><td>{i+1}</td><td>{r.question}</td><td>{r.answer}</td><td>{r.variantA}</td><td>{r.variantB}</td><td>{r.rubric}</td></tr>
                ))}
                {!items.length && !loading && <tr><td colSpan="6" className="muted">No items yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <aside>
          <KPI label="Questions generated" value={items.length || '—'} />
          <KPI label="Teacher time saved" value="3.0 hrs / week" />
          <KPI label="Curriculum alignment" value={`NCERT G${grade} • ${subject} • ${topic}`} />
        </aside>
      </div>
    </div>
  );
}