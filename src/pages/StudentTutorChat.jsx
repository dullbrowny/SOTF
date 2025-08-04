// src/pages/StudentTutorChat.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPI from '../components/KPI.jsx';
import { api } from '../api/mockApi.js';
import { useDemoData } from '../demoData.jsx';

const PRESETS = {
  Math: ['Linear Equations','Integers — operations','Fractions — compare'],
  Science: ['Physics — speed problems','Physics — acceleration','Chemistry — density']
};

export default function StudentTutorChat() {
  const nav = useNavigate();
  const { grade, setGrade } = useDemoData();

  const [chat, setChat] = useState([
    { role:'ai', text:'Hi! What are you stuck on in Linear Equations today?' }
  ]);
  const [input, setInput] = useState('I don’t get how to solve 2x + 3 = 11');
  const [parentBanner, setParentBanner] = useState(null);

  // mini practice picker
  const [subject, setSubject] = useState('Math');
  const [topic, setTopic] = useState(PRESETS['Math'][0]);
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount] = useState(5);

  useEffect(() => {
    try { const m = api?.peekParentMessage?.(); if (m?.text) setParentBanner(m.text); } catch {}
  }, []);

  useEffect(()=>{ setTopic(PRESETS[subject][0]); },[subject]);

  const send = () => {
    if (!input.trim()) return;
    setChat(p => [
      ...p,
      { role:'you', text: input },
      { role:'ai', text:'Let’s subtract 3 from both sides, then divide by 2. What do you get?' }
    ]);
    setInput('');
  };

  const goPractice = () => {
    const qs = new URLSearchParams({
      from:'tutor',
      subject, topic,
      grade:String(grade),
      difficulty, distractors:'numeric',
      count:String(count)
    });
    nav(`/practice?${qs.toString()}`);
  };

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>AI Tutor</h2>
          {parentBanner && (
            <div className="banner info">
              Message from Parent: {parentBanner}{' '}
              <button className="btn secondary" onClick={()=>setParentBanner(null)}>Dismiss</button>
            </div>
          )}
          <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:8}}>
            {chat.map((m,i)=>(
              <div key={i} className="bubble" style={{alignSelf: m.role==='you'?'flex-end':'flex-start'}}>
                <span className="badge" style={{marginRight:6}}>{m.role==='ai'?'AI Tutor':'You'}</span>{m.text}
              </div>
            ))}
          </div>
          <div className="row">
            <input className="input" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') send();}} />
            <button className="btn" onClick={send}>Send</button>
          </div>

          {/* mini practice picker */}
          <div className="card" style={{marginTop:12}}>
            <div className="row" style={{gap:12, flexWrap:'wrap'}}>
              <div>
                <div className="badge">Subject</div>
                <select className="input" value={subject} onChange={(e)=>setSubject(e.target.value)}>
                  {Object.keys(PRESETS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div className="badge">Grade</div>
                <select className="input" value={String(grade)} onChange={(e)=>setGrade(String(e.target.value))}>
                  {['6','7','8','9','10'].map(g => <option key={g} value={g}>G{g}</option>)}
                </select>
              </div>
              <div style={{ minWidth:220 }}>
                <div className="badge">Topic</div>
                <select className="input" value={topic} onChange={(e)=>setTopic(e.target.value)}>
                  {PRESETS[subject].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div className="badge">Difficulty</div>
                <select className="input" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                  <option>easy</option><option>medium</option><option>hard</option>
                </select>
              </div>
              <div>
                <div className="badge">Count</div>
                <input className="input" type="number" min={1} max={30} value={count} onChange={(e)=>setCount(Number(e.target.value||5))}/>
              </div>
              <div style={{ alignSelf:'end' }}>
                <button className="btn" onClick={goPractice}>Make a practice set</button>
              </div>
            </div>
          </div>
        </section>

        <aside>
          <KPI label="Completion without human help" value="82%" />
          <KPI label="Recommended next" value="2-step equations (easy)" />
          <div className="card" style={{marginTop:12}}>
            <h3 style={{marginTop:0}}>Teacher feedback</h3>
            <div className="badge">No feedback yet</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

