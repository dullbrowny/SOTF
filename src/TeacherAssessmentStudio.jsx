import React, { useMemo, useState } from 'react';
import { generateAssessmentItems } from './api/mockApi.js';
import { itemsToCSV, downloadCSV } from './utils/csv.js';
import './styles.assessment.css';

const SUBJECTS = ['Math','Science'];
const TOPICS = {
  Math: ['Linear Equations'],
  Science: ['Atoms']
};
const GRADES = ['7','8','9','10'];

export default function TeacherAssessmentStudio() {
  const [grade, setGrade] = useState('8');
  const [subject, setSubject] = useState('Math');
  const [topic, setTopic] = useState(TOPICS['Math'][0]);
  const [seed, setSeed] = useState('42');
  const [count, setCount] = useState(8);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const variety = useMemo(() => {
    if (!items.length) return 0;
    const stems = new Set(items.map(i => (i.question||'').replace(/\s+/g,' ').trim()));
    return Math.round((stems.size / items.length) * 100);
  }, [items]);

  async function runGenerate() {
    setLoading(true);
    const t0 = performance.now();
    const { items: out } = await generateAssessmentItems({
      grade: Number(grade),
      subject, topic,
      seed, count: Number(count)
    });
    const t1 = performance.now();
    setElapsed(Math.max(0, t1 - t0));
    setItems(out);
    setLoading(false);
  }

  function onSubjectChange(v) {
    setSubject(v);
    const firstTopic = TOPICS[v]?.[0] || '';
    setTopic(firstTopic);
  }

  function exportCsv() {
    if (!items.length) return;
    const csv = itemsToCSV(items);
    const fn = `assessment_${subject}_${topic}_G${grade}_seed${seed}_n${count}.csv`;
    downloadCSV(fn, csv);
  }

  return (
    <div className="assess-grid">
      <div className="assess-card">
        <h2>Assessment Studio</h2>

        <div className="assess-controls" style={{marginTop: 8}}>
          <div className="field">
            <label>Grade</label>
            <select value={grade} onChange={e=>setGrade(e.target.value)}>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Subject</label>
            <select value={subject} onChange={e=>onSubjectChange(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Topic</label>
            <select value={topic} onChange={e=>setTopic(e.target.value)}>
              {(TOPICS[subject] || []).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Seed</label>
            <input value={seed} onChange={e=>setSeed(e.target.value)} style={{width:80}}/>
          </div>

          <div className="field">
            <label>Count</label>
            <input type="number" min="1" max="24" value={count} onChange={e=>setCount(e.target.value)} style={{width:80}}/>
          </div>

          <div className="field" style={{alignSelf:'end'}}>
            <button onClick={runGenerate} disabled={loading} className="pill" style={{padding:'10px 14px'}}>
              {loading ? 'Generating…' : 'Generate with AI'}
            </button>
          </div>
        </div>

        <div className="table-note">Loaded via seed {seed} • count {count} (Δ~{(elapsed/1000).toFixed(1)}s)</div>

        <div style={{overflowX:'auto', marginTop:12}}>
          <table className="table" style={{width:'100%'}}>
            <thead>
              <tr>
                <th style={{width:40}}>#</th>
                <th>Question</th>
                <th style={{width:120}}>Answer</th>
                <th style={{width:140}}>Alt wording A</th>
                <th style={{width:140}}>Alt wording B</th>
                <th style={{width:220}}>Rubric</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{idx+1}</td>
                  <td>{it.question}</td>
                  <td>{it.answer}</td>
                  <td>
                    <span className="pill" onClick={()=>navigator.clipboard?.writeText(it.altA)}>Copy A</span>
                  </td>
                  <td>
                    <span className="pill" onClick={()=>navigator.clipboard?.writeText(it.altB)}>Copy B</span>
                  </td>
                  <td>{it.rubric}</td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan="6" style={{opacity:0.6, padding:16}}>
                  No questions yet. Set your controls and click “Generate with AI”.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right rail */}
      <div className="right-rail">
        <div className="assess-card">
          <div className="kpi-subtle">Questions generated</div>
          <div className="kpi-number">{items.length || '—'}</div>
        </div>

        <div className="assess-card">
          <div className="kpi-subtle">Variety score</div>
          <div className="kpi-number">{variety}%</div>
          <div className="progress" style={{marginTop:8}}>
            <span style={{width: `${variety}%`}}></span>
          </div>
        </div>

        <div className="assess-card">
          <div className="kpi-subtle">Elapsed</div>
          <div>{(elapsed/1000).toFixed(1)}s</div>
        </div>

        <div className="assess-card cta-row">
          <button className="pill" onClick={exportCsv} disabled={!items.length}>Export CSV</button>
          <span className="kpi-subtle">PoC only</span>
        </div>

        <div className="assess-card">
          <div className="kpi-subtle">Curriculum alignment</div>
          <div style={{marginTop:8}}>NCERT G{grade} • {subject} • {topic}</div>
        </div>
      </div>
    </div>
  );
}