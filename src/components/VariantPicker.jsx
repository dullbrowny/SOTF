import { useState } from 'react'
import Modal from './Modal.jsx'

export default function VariantPicker({ open, onClose, onConfirm, defaults = {} }) {
  const [subject, setSubject] = useState(defaults.subject || 'Math')
  const [topic, setTopic] = useState(defaults.topic || 'Linear Equations')
  const [difficulty, setDifficulty] = useState(defaults.difficulty || 'easy')
  const [count, setCount] = useState(defaults.count || 5)
  const [distractors, setDistractors] = useState(defaults.distractors || 'numeric')

  const confirm = () => onConfirm?.({ subject, topic, difficulty, count, distractors })

  return (
    <Modal open={open} title="Create practice set" onClose={onClose}
      actions={<button className="btn" onClick={confirm}>Generate</button>}>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div>
          <label>Subject</label>
          <select className="input" value={subject} onChange={(e)=>setSubject(e.target.value)}><option>Math</option><option>Science</option></select>
        </div>
        <div>
          <label>Topic</label>
          <select className="input" value={topic} onChange={(e)=>setTopic(e.target.value)}>
            <option>Linear Equations</option><option>Quadratic Equations</option><option>Atoms</option><option>Chemical Reactions</option>
          </select>
        </div>
        <div>
          <label>Difficulty</label>
          <select className="input" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}><option>easy</option><option>medium</option><option>hard</option></select>
        </div>
        <div>
          <label># Items</label>
          <input className="input" type="number" min="3" max="10" value={count} onChange={(e)=>setCount(Number(e.target.value||5))}/>
        </div>
        <div>
          <label>Distractors</label>
          <select className="input" value={distractors} onChange={(e)=>setDistractors(e.target.value)}><option>numeric</option><option>words</option></select>
        </div>
      </div>
    </Modal>
  )
}
