import { useEffect, useState } from 'react'
import { api } from '../api/mockApi.js'
import KPI from '../components/KPI.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Modal from '../components/Modal.jsx'
import { useDemoData } from '../demoData.jsx'

function synthesize(d) {
  const n = d?.submissions ?? 24;
  return Array.from({length: n}).map((_,i)=> ({
    id: i+1,
    student: ['Arjun','Meera','Kavya','Dev','Zoya','Irfan','Nina','Omar','Lila','Rohit'][i%10] + ' ' + (7+(i%4)),
    score: 50 + ((i*7)%41),
    confidence: 60 + ((i*11)%31),
    status: 'pending',
    comment: ''
  }));
}

export default function TeacherAutoGrading() {
  const { dataset } = useDemoData()
  const [rows, setRows] = useState([])
  const [show, setShow] = useState(null)
  const [highlight, setHighlight] = useState(null)

  useEffect(() => { api.getGradingBatch().then((d)=> setRows(synthesize(d))) }, [dataset])

  const needsReview = rows.filter(r=>r.status==='needs-review').length
  const cleared = rows.filter(r=>r.status!=='pending').length

  const gradeAll = () => {
    let i = 0;
    const copy = [...rows];
    const timer = setInterval(()=>{
      if (i >= copy.length) { clearInterval(timer); setRows([...copy]); return; }
      const r = copy[i];
      r.status = (i % 8 === 0) ? 'needs-review' : 'auto-graded';
      r.confidence = r.status==='auto-graded' ? r.confidence : Math.max(55, r.confidence-15);
      i++;
      setRows([...copy]);
    }, 70);
  }

  const regradeWithComment = (id, comment) => {
    const copy = rows.map(r => {
      if (r.id !== id) return r;
      const delta = Math.min(10, comment.length/20);
      const newScore = Math.min(100, r.score + Math.round(delta));
      const newConf = Math.min(100, r.confidence + Math.round(delta/2));
      return { ...r, score: newScore, confidence: newConf, status: 'auto-graded', comment };
    })
    setRows(copy);
    setHighlight(id);
    setTimeout(()=>setHighlight(null), 1200);
  }

  return (
    <div className="grid" style={{gridTemplateColumns: '2fr 1fr'}}>
      <div className="grid">
        <div className="card">
          <h2>Auto-Grading</h2>
          <div className="row">
            <button className="btn" onClick={gradeAll}>Grade All</button>
            <span className="badge">Simulated</span>
          </div>
        </div>

        <div className="card">
          <h3>Results</h3>
          <div className="row" style={{gap: 24, alignItems:'center'}}>
            <div className="badge">{rows.length} submissions</div>
            <div className="badge">{needsReview} needs review</div>
            <div className="badge">AI confidence avg: {Math.round(rows.reduce((a,b)=>a+b.confidence,0)/Math.max(1,rows.length))}%</div>
          </div>
          <table className="table" style={{marginTop:12}}>
            <thead><tr><th>#</th><th>Student</th><th>Score</th><th>Confidence</th><th>Status</th><th>Evidence</th></tr></thead>
            <tbody>
              {rows.slice(0,12).map(r=> (
                <tr key={r.id} style={{outline: r.id===highlight ? '2px solid #27c1e6' : 'none'}}>
                  <td>{r.id}</td>
                  <td>{r.student}</td>
                  <td>{r.score}%</td>
                  <td>{r.confidence}%</td>
                  <td>{r.status==='pending' ? 'Pending' : r.status==='needs-review' ? 'Needs review' : 'Auto-graded'}</td>
                  <td><button className="btn secondary" onClick={()=>setShow(r)}>Show</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid">
        <KPI label="Grading time" value="6h → 2h" delta="-4h/week"/>
        <KPI label="Feedback latency" value="< 5 min (MCQ)"/>
        <div className="card">
          <div className="kpi">
            <div className="label">Queue cleared</div>
            <div className="value">{Math.round((cleared/Math.max(1,rows.length))*100)}%</div>
            <ProgressBar value={cleared} max={Math.max(1, rows.length)} />
          </div>
        </div>
        <KPI label="Human-in-loop" value="Enabled for essays"/>
      </div>

      <Modal open={!!show} title={`Evidence • ${show?.student ?? ''}`} onClose={()=>setShow(null)}
        actions={<button className="btn" onClick={()=>regradeWithComment(show.id, show.comment || '')}>Regrade</button>}>
        {show && <Evidence row={show} onChange={(c)=>setShow({...show, comment:c})} />}
      </Modal>
    </div>
  )
}

function Evidence({ row, onChange }) {
  const ev = api.evidenceBank(row.id);
  return (
    <div className="mono">
      <div><strong>Question:</strong> {ev.question}</div>
      <div><strong>Student:</strong> {ev.student}</div>
      <div style={{marginTop:8}}><strong>Rubric scoring:</strong></div>
      <table className="table mono">
        <thead><tr><th>Dimension</th><th>Score</th><th>Note</th></tr></thead>
        <tbody>
          {ev.rubric.map((r,i)=>(
            <tr key={i}><td>{r.dim}</td><td>{r.score ? '✓' : '✕'}</td><td>{r.note}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:8}}>
        <label>Teacher comment</label>
        <textarea className="input" rows="3" placeholder="Explain your adjustment…" value={row.comment||''} onChange={(e)=>onChange(e.target.value)} />
      </div>
      <div className="badge" style={{marginTop:8}}>Regrade will nudge score & confidence based on the comment.</div>
    </div>
  );
}
