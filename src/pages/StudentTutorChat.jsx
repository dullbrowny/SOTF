import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/mockApi.js'
import QuickChips from '../components/QuickChips.jsx'
import VariantPicker from '../components/VariantPicker.jsx'
import { useDemoData } from '../demoData.jsx'

function Bubble({ who, children }) {
  const align = who === 'ai' ? 'flex-start' : 'flex-end'
  return (
    <div style={{display:'flex', justifyContent: align}}>
      <div className="card" style={{maxWidth: 560}}>
        <div className="badge">{who === 'ai' ? 'AI Tutor' : 'You'}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default function StudentTutorChat() {
  const { dataset } = useDemoData()
  const nav = useNavigate()
  const [script, setScript] = useState([])
  const [input, setInput] = useState('I don’t get how to solve 2x + 3 = 11')
  const [typing, setTyping] = useState(false)
  const [picker, setPicker] = useState(false)

  useEffect(() => { api.getTutorScript().then(setScript) }, [dataset])

  useEffect(() => {
    const onFocus = () => {
      const msgs = JSON.parse(localStorage.getItem('parent_msgs') || '[]')
      if (msgs.length) setScript(s => [...s, {who:'ai', text:`Message from Parent: “${msgs[msgs.length-1]}”` }])
    }
    window.addEventListener('focus', onFocus)
    onFocus()
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const send = async (text) => {
    const message = text ?? input
    if (!message) return
    setScript(s => [...s, { who: 'user', text: message }])
    setInput('')
    setTyping(true)
    await new Promise(r=>setTimeout(r, 800))
    const ai = { who:'ai', text:'Try this: subtract 3 from both sides, then divide by 2. What is x now?' }
    setScript(s => [...s, ai])
    setTyping(false)
  }

  const confirmPractice = (opts) => {
    setPicker(false)
    const q = new URLSearchParams({ topic: opts.topic, subject: opts.subject, difficulty: opts.difficulty, count: String(opts.count), distractors: opts.distractors, from: 'tutor' }).toString()
    nav('/practice?' + q)
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'2fr 1fr'}}>
      <div className="grid">
        <div className="card">
          <h2>AI Tutor</h2>
          <div className="row" style={{gap:8}}>
            <div className="badge">Dataset: {dataset.toUpperCase()}</div>
            <div className="badge">Topic: Linear Equations • Confidence: High • Source: NCERT</div>
          </div>
        </div>
        <div className="grid">
          {script.map((m, i) => <Bubble who={m.who} key={i}>{m.text}</Bubble>)}
          {typing && <Bubble who="ai">Typing…</Bubble>}
        </div>
        <div className="card row" style={{gap:8, alignItems:'center'}}>
          <input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question…" />
          <button className="btn" onClick={()=>send()}>Send</button>
        </div>
        <div className="card">
          <QuickChips
            items={['Hint','Explain like I’m 10','Another example','Make a practice set']}
            onPick={(t)=> t==='Make a practice set' ? setPicker(true) : send(t)}
          />
        </div>
      </div>
      <div className="grid">
        <div className="card"><div className="kpi"><div className="label">Completion without human help</div><div className="value">82%</div></div></div>
        <div className="card"><div className="kpi"><div className="label">Recommended next</div><div className="value">2-step equations (easy)</div></div></div>
      </div>
      <VariantPicker open={picker} onClose={()=>setPicker(false)} onConfirm={confirmPractice} />
    </div>
  )
}
