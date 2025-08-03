import { useEffect, useState } from 'react'
import { api } from '../api/mockApi.js'
import { Line, Heatmap } from './charts.jsx'
import KPI from '../components/KPI.jsx'
import VariantPicker from '../components/VariantPicker.jsx'
import { useDemoData } from '../demoData.jsx'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { dataset } = useDemoData()
  const [data, setData] = useState(null)
  const [picker, setPicker] = useState(false)
  const [student, setStudent] = useState(null)
  const nav = useNavigate()

  useEffect(() => { api.getAdminMetrics().then(setData) }, [dataset])

  if (!data) return <div className="card">Loading…</div>

  const startAssign = (s) => { setStudent(s); setPicker(true) }
  const confirmAssign = (opts) => {
    setPicker(false)
    const q = new URLSearchParams({ topic: opts.topic, subject: opts.subject, difficulty: opts.difficulty, count: String(opts.count), distractors: opts.distractors, from: 'admin', student: student?.name || '' }).toString()
    nav('/practice?' + q)
  }

  return (
    <div className="grid" style={{gridTemplateColumns: '1fr 1fr'}}>
      <div className="grid">
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <KPI label="% Students >80% mastery" value={`${data.top.mastery80}%`} />
          <KPI label="Grading backlog" value={data.top.backlog} />
          <KPI label="Avg engagement" value={`${data.top.engagement} / class`} />
        </div>
        <div className="card"><h3>Mastery Trend (8 weeks)</h3><Line labels={data.trend.labels} values={data.trend.values} /></div>
        <div className="card"><h3>Alerts</h3><ul>{data.alerts.map((a,i)=>(<li key={i}>{a}</li>))}</ul></div>
      </div>

      <div className="grid">
        <div className="card"><h3>Mastery by Topic (Heatmap)</h3><Heatmap labels={data.heatmap.labels} matrix={data.heatmap.matrix} /></div>
        <div className="card">
          <h3>At-Risk Cohort</h3>
          <div className="badge">{data.risk.summary}</div>
          <table className="table"><thead><tr><th>Student</th><th>Reason</th><th>Action</th></tr></thead>
            <tbody>
            {data.risk.students.map((s,i)=>(<tr key={i}><td>{s.name}</td><td>{s.reason}</td><td><button className="btn" onClick={()=>startAssign(s)}>Assign practice</button></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
      <VariantPicker open={picker} onClose={()=>setPicker(false)} onConfirm={confirmAssign} defaults={{ subject: 'Math', topic: 'Linear Equations', difficulty: 'easy', count: 5 }} />
    </div>
  )
}
