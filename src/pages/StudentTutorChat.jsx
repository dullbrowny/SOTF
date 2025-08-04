// src/pages/StudentTutorChat.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPI from '../components/KPI.jsx';
import { api } from '../api/mockApi.js';

function useStudentFeedback(studentName) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sof.student.inbox.v1');
      if (!raw) return;
      const idx = JSON.parse(raw);
      setItems(Array.isArray(idx?.[studentName]) ? idx[studentName] : []);
    } catch {}
  }, [studentName]);
  return items;
}

export default function StudentTutorChat() {
  const nav = useNavigate();
  const [chat, setChat] = useState([
    { role:'ai', text:'Hi! What are you stuck on in Linear Equations today?' }
  ]);
  const [input, setInput] = useState('I don’t get how to solve 2x + 3 = 11');
  const [parentBanner, setParentBanner] = useState(null);

  // optional: who is the student (for feedback lookup)
  const studentName = 'Student';

  useEffect(() => {
    try {
      const msg = api?.peekParentMessage?.();
      if (msg?.text) setParentBanner(msg.text);
    } catch {}
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setChat(p => [
      ...p,
      { role:'you', text: input },
      { role:'ai', text:'Let’s subtract 3 from both sides, then divide by 2. What do you get?' }
    ]);
    setInput('');
  };

  const openPracticeSet = () => {
    const params = new URLSearchParams({
      subject: 'Math', topic: 'Linear Equations', difficulty: 'easy',
      count: '5', distractors: 'numeric', from: 'tutor'
    });
    nav(`/practice?${params.toString()}`);
  };

  const feedback = useStudentFeedback(studentName);
  const latest = useMemo(() => feedback[0] || null, [feedback]);

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
          <div className="row" style={{marginTop:8}}>
            <button className="btn secondary" onClick={()=>setChat(p=>[...p,{role:'ai', text:'Hint: try isolating x.'}])}>Hint</button>
            <button className="btn secondary" onClick={()=>setChat(p=>[...p,{role:'ai', text:'Imagine a balance scale: do the same to both sides.'}])}>Explain like I’m 10</button>
            <button className="btn secondary" onClick={()=>setChat(p=>[...p,{role:'ai', text:'Another example: 3x + 5 = 17 → x = 4.'}])}>Another example</button>
            <button className="btn secondary" onClick={openPracticeSet}>Make a practice set</button>
          </div>
        </section>

        <aside>
          <KPI label="Completion without human help" value="82%" />
          <KPI label="Recommended next" value="2-step equations (easy)" />
          <div className="card" style={{marginTop:12}}>
            <h3 style={{marginTop:0}}>Teacher feedback</h3>
            {!latest ? (
              <div className="badge">No feedback yet</div>
            ) : (
              <>
                <div className="badge">{latest.subject} • Grade {latest.grade} • {latest.batch}</div>
                <div style={{marginTop:6}}>
                  <b>Score:</b> {latest.score}% &nbsp; <b>Confidence:</b> {latest.confidence}% &nbsp; <b>Status:</b> {latest.status}
                </div>
                {latest?.rubric && (
                  <div className="badge" style={{marginTop:6}}>
                    Rubric — Concept: {latest.rubric.concept} • Procedure: {latest.rubric.procedure} • Communication: {latest.rubric.communication}
                  </div>
                )}
                {latest.teacherNote && (
                  <div style={{marginTop:6, whiteSpace:'pre-wrap'}}>
                    <b>Teacher note:</b> {latest.teacherNote}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

