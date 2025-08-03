import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/mockApi.js'
import KPI from '../components/KPI.jsx'
import TypingDots from '../components/TypingDots.jsx'
import MiniForm from '../components/MiniForm.jsx'
import { useDemoData } from '../demoData.jsx'

const TOPICS = { math: ["Linear Equations", "Quadratic Equations"], science: ["Atoms", "Chemical Reactions"] }
const normSubject = s => String(s || 'Math').toLowerCase()

export default function TeacherAssessmentStudio() {
  const { dataset, setDataset } = useDemoData()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('Math')
  const [grade, setGrade] = useState(dataset.replace('g','') || '8')
  const [topic, setTopic] = useState('Linear Equations')
  const [seed, setSeed] = useState('42')
  const [count, setCount] = useState(8)
  const [elapsed, setElapsed] = useState(0)

  const topicOptions = useMemo(() => TOPICS[normSubject(subject)] || TOPICS.math, [subject])
  useEffect(() => { if (!topicOptions.includes(topic)) setTopic(topicOptions[0]) }, [topicOptions])

  const generate = async () => {
    setLoading(true); setRows([]); setElapsed(0);
    const t0 = performance.now()
    const q = await api.getQuestions(subject, topic, seed, count)
    const bank = q.items && q.items.length ? q.items : []
    for (let i=0;i<bank.length;i++) {
      await new Promise(r=>setTimeout(r, 120))
      setRows(prev => [...prev, bank[i]])
      setElapsed(Math.round(performance.now()-t0)/1000)
    }
    setLoading(false)
  }

  useEffect(() => { generate() }, [dataset, subject, topic])

  const onGradeChange = (e) => {
    const g = e.target.value; setGrade(g)
    const next = `g${g}`; if (next !== dataset) setDataset(next)
  }

  return (
    <div className="grid" style={{gridTemplateColumns: '1fr 1fr'}}>
      <div className="grid">
        <div className="card">
          <h2>Assessment Studio</h2>
          <div className="grid" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
            <div>
              <label>Grade</label>
              <select value={grade} onChange={onGradeChange}>
                <option>7</option><option>8</option><option>9</option>
              </select>
            </div>
            <div>
              <label>Subject</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)}>
                <option>Math</option><option>Science</option>
              </select>
            </div>
            <div>
              <label>Topic</label>
              <select className="input" value={topic} onChange={e=>setTopic(e.target.value)}>
                {topicOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <MiniForm>
            <div>
              <label>Seed</label>
              <input className="input" value={seed} onChange={e=>setSeed(e.target.value)} style={{width:120}}/>
            </div>
            <div>
              <label>Count</label>
              <input type="number" className="input" value={count} min={1} max={15} onChange={e=>setCount(Number(e.target.value||8))} style={{width:100}}/>
            </div>
            <button className="btn" onClick={generate} style={{marginBottom:0}}>Generate with AI</button>
            {loading && <TypingDots text="Generating questions" />}
          </MiniForm>
        </div>

        <div className="card">
          <h3>Generated Items</h3>
          <table className="table mono">
            <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Variant 1</th><th>Variant 2</th><th>Rubric</th></tr></thead>
            <tbody>
              {rows.map((it, i) => (
                <tr key={i}>
                  <td>{i+1}</td>
                  <td>{it.question}</td>
                  <td>{it.answer}</td>
                  <td>{it.variant_1}</td>
                  <td>{it.variant_2}</td>
                  <td>{it.rubric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid">
        <KPI label="Questions generated" value={rows.length || '—'} delta={`~${elapsed.toFixed(1)}s elapsed`}/>
        <KPI label="Teacher time saved" value="3.0 hrs / week"/>
        <KPI label="Curriculum alignment" value={`NCERT G${grade} • ${subject} • ${topic}`}/>
      </div>
    </div>
  )
}
