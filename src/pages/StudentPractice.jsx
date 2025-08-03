import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/mockApi.js'
import KPI from '../components/KPI.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Modal from '../components/Modal.jsx'
import { useDemoData } from '../demoData.jsx'

function useQuery() { const { search } = useLocation(); return new URLSearchParams(search) }

export default function StudentPractice() {
  const { dataset } = useDemoData()
  const q = useQuery()
  const nav = useNavigate()

  const seedTopic = q.get('topic')
  const seedSubject = q.get('subject') || 'Math'
  const difficulty = q.get('difficulty') || 'easy'
  const count = Number(q.get('count') || '5')
  const distractors = q.get('distractors') || 'numeric'
  const from = q.get('from')

  const [data, setData] = useState({ items: [] })
  const [progress, setProgress] = useState(58)
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(null)
  const [streak, setStreak] = useState(0)
  const [done, setDone] = useState(false)

  const fetchData = async () => {
    if (seedTopic) {
      const gen = await api.generatePractice(seedSubject, seedTopic, { difficulty, count, distractors })
      setData(gen)
    } else {
      const d = await api.getPractice()
      setData(d && d.items ? d : { items: [] })
    }
    setIndex(0); setCorrect(null); setDone(false)
  }
  useEffect(() => { fetchData() }, [dataset, seedTopic, difficulty, count, distractors])

  const items = data.items || []
  const cur = items[index] || null
  const answered = useMemo(()=> Math.min(index, items.length), [index, items.length])

  const choose = (opt) => {
    if (!cur) return
    const ok = String(opt) === String(cur.answer)
    setCorrect(ok)
    setProgress(p => Math.max(0, Math.min(100, p + (ok ? 3 : -1))))
    setStreak(s => ok ? s+1 : 0)
    const last = index >= items.length-1
    setTimeout(()=> {
      if (last) setDone(true)
      else setIndex(i => i+1)
      setCorrect(null)
    }, 500)
  }

  const returnTo = () => {
    if (from === 'tutor') nav('/tutor')
    else if (from === 'admin') nav('/admin')
    else nav('/')
  }

  return (
    <div className="grid" style={{gridTemplateColumns: '2fr 1fr'}}>
      <div className="grid">
        <div className="card">
          <h2>Personalized Practice</h2>
          <div className="row" style={{gap:12, flexWrap:'wrap'}}>
            <div className="badge">Dataset: {dataset.toUpperCase()}</div>
            {seedTopic && <div className="badge">Topic: {seedSubject} • {seedTopic}</div>}
            <div className="badge">Difficulty: {difficulty}</div>
            <div className="badge">Distractors: {distractors}</div>
            <div className="badge">Streak: {streak}</div>
          </div>
          <ProgressBar value={answered} max={Math.max(1, items.length)} label={`${answered}/${items.length}`} />
          {from && <div className="badge" style={{marginTop:8}}>← <a href="#" onClick={(e)=>{e.preventDefault(); returnTo();}}>Return to {from}</a></div>}
        </div>

        {!cur && <div className="card">No practice items found.</div>}
        {cur && <div className="card">
          <div><strong>Q{index+1}.</strong> {cur.question}</div>
          <div className="row" style={{marginTop: 8, flexWrap: 'wrap'}}>
            {cur.options.map((opt, j) => {
              const isCorrect = String(opt)===String(cur.answer);
              const cls = (correct===null) ? 'btn secondary' : (isCorrect ? 'btn' : 'btn secondary');
              return <button className={cls} key={j} onClick={()=>choose(opt)}>{opt}</button>
            })}
          </div>
          <div style={{marginTop:8}}>
            <div className="badge">{cur.hint || 'Try reversing the last operation.'}</div>
            {correct!==null && <div className="badge">{correct ? '✓ Correct — great job!' : '✕ Not quite — try the next one.'}</div>}
          </div>
        </div>}
      </div>
      <div className="grid">
        <KPI label="Mastery now" value={`${progress}%`} delta="+9pp in 3 weeks"/>
        <KPI label="Adaptive difficulty" value={streak>=3 ? 'Increasing' : 'Stable'}/>
        <KPI label="Engagement" value="1.7× baseline"/>
      </div>

      <Modal open={done} title="Session complete" onClose={()=>setDone(false)}
        actions={<button className="btn" onClick={()=>{ setDone(false); returnTo(); }}>Return</button>}>
        <div className="kpi"><div className="label">Mastery improved to</div><div className="value">{Math.min(100, progress)}%</div></div>
        {seedTopic && <div className="badge">Assigned topic: {seedTopic}</div>}
      </Modal>
    </div>
  )
}
