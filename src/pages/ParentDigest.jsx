
// src/pages/ParentDigest.jsx
import { useEffect, useState } from 'react'
import { api } from '../api/mockApi.js'
import { useDemoData } from '../demoData.jsx'

export default function ParentDigest() {
  const { dataset } = useDemoData()
  const [data, setData] = useState(null)
  const [note, setNote] = useState('Proud of your effort this week!')

  useEffect(() => { api.getParentDigest().then(setData) }, [dataset])

  if (!data) return <div className="card">Loading…</div>

  const sendEncouragement = () => {
    const msgs = JSON.parse(localStorage.getItem('parent_msgs') || '[]')
    msgs.push(note)
    localStorage.setItem('parent_msgs', JSON.stringify(msgs))
    alert('Sent to Tutor: ' + note)
    setNote('Keep going — you’ve got this!')
  }

  return (
    <div className="grid" style={{gridTemplateColumns: '1fr 1fr'}}>
      <div className="card">
        <h2>Weekly Digest (Arjun • Grade 8)</h2>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div><div className="badge">Math Mastery</div><div className="kpi"><div className="value">{data.math.mastery}%</div><div className="badge">+{data.math.delta}%</div></div></div>
          <div><div className="badge">Attendance</div><div className="kpi"><div className="value">{data.attendance.days}/5</div></div></div>
          <div><div className="badge">Parent NPS</div><div className="kpi"><div className="value">+41</div></div></div>
        </div>
        <div className="card">
          <strong>Recommended:</strong> Watch 2-min video on solving 2-step equations.
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <h3>Alerts</h3>
          <ul>
            {data.alerts.map((a,i)=>(<li key={i}>{a}</li>))}
          </ul>
        </div>
        <div className="card">
          <h3>Messages</h3>
          <div className="mono">Teacher → Parent: Arjun missed the remediation quiz this week.</div>
        </div>
        <div className="card">
          <h3>Encourage your child</h3>
          <input className="input" value={note} onChange={(e)=>setNote(e.target.value)} />
          <div className="row" style={{justifyContent:'flex-end', marginTop:8}}>
            <button className="btn" onClick={sendEncouragement}>Send to Tutor</button>
          </div>
          <div className="badge">This message appears in the Student’s Tutor chat.</div>
        </div>
      </div>
    </div>
  )
}
