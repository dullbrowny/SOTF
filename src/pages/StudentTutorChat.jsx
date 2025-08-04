// src/pages/StudentTutorChat.jsx
import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const T = { card:'#0f172a', border:'#1f2937', text:'#e5e7eb', sub:'#9ca3af', header:'#0b1220', primary:'#10bcd6' };
const card = { background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16, color:T.text };

const SUBJECTS = ['Math','Science','Biology'];
const GRADES = ['6','7','8','9','10'];
const TOPICS = {
  Math:['Linear Equations','Integers — operations','Fractions — add, subtract, compare'],
  Science:['Physics — speed problems','Physics — acceleration'],
  Biology:['Punnett squares — monohybrid']
};

export default function StudentTutorChat(){
  const nav = useNavigate();

  // chat state (static / simulated for mock)
  const [messages, setMessages] = useState([
    { role:'ai', text:'Hi! What are you stuck on in Linear Equations today?' }
  ]);
  const [input, setInput] = useState('');

  // mode & comfort
  const MODES = ['Standard','ELI5','Socratic','Steps'];
  const [mode, setMode] = useState('Standard');
  const [comfort, setComfort] = useState('Mostly'); // Not at all / A bit / Mostly / I’ve got it

  // practice set controls
  const [subject, setSubject] = useState('Math');
  const [grade, setGrade] = useState('8');
  const [topic, setTopic] = useState('Linear Equations');
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount] = useState(5);

  const topicList = useMemo(()=>TOPICS[subject] || [], [subject]);

  function send() {
    if (!input.trim()) return;

    const user = { role:'you', text: input.trim() };
    setMessages(m => [...m, user]);

    // very small simulator — tailor first bot line by mode
    const reply = (() => {
      if (mode === 'ELI5') {
        return 'Imagine x is a box. We want the box alone. What could we remove from both sides to get rid of the +3?';
      }
      if (mode === 'Socratic') {
        // ask one question at a time, and keep using comfort to tune
        const tone = comfort === 'Not at all' ? 'Let’s go slowly.' :
                     comfort === 'A bit' ? 'We’ll take it step by step.' :
                     comfort === 'Mostly' ? 'You’re close.' : 'Quick check:';
        return `${tone} What operation would undo the “+3” on the left?`;
      }
      if (mode === 'Steps') {
        return 'Step 1: Subtract 3 from both sides.\nStep 2: Divide both sides by 2.\nWhat value do you get for x?';
      }
      return 'Try subtracting 3 from both sides, then divide by 2. What do you get?';
    })();

    setMessages(m => [...m, { role:'ai', text: reply }]);
    setInput('');
  }

  function toPractice() {
    const params = new URLSearchParams({
      from: 'tutor',
      subject, topic, grade, difficulty, count: String(count)
    });
    nav(`/practice?${params.toString()}`);
  }

  return (
    <div style={{ padding:20, color:T.text }}>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        {/* Chat */}
        <div style={card}>
          <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>AI Tutor</div>
          <div style={{ display:'flex', gap:8, marginBottom:12, color:T.sub, fontSize:12 }}>
            <span>Topic: Linear Equations</span><span>•</span><span>Source: NCERT G8</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, minHeight:220, marginBottom:12 }}>
            {messages.map((m,i)=>(
              <div key={i} style={{
                alignSelf: m.role==='you'?'flex-end':'flex-start',
                background: m.role==='you'?T.primary:T.header,
                color: m.role==='you'?'#00151a':T.text,
                border:`1px solid ${T.border}`, borderRadius:12, padding:'8px 12px', maxWidth:'80%'
              }}>
                <div style={{ fontSize:11, color: m.role==='you'?'#00323d':T.sub, marginBottom:4 }}>
                  {m.role==='you'?'You':'AI Tutor'}
                </div>
                <div style={{ whiteSpace:'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question…"
                   style={{ flex:1, background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 12px' }} />
            <button onClick={send}
                    style={{ background:T.primary, color:'#00151a', border:'none', borderRadius:10, padding:'10px 14px', fontWeight:700 }}>
              Send
            </button>
          </div>

          {/* Mode & comfort */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>
            <span style={{ alignSelf:'center', color:T.sub, fontSize:12 }}>Mode</span>
            {MODES.map(m=>(
              <button key={m}
                onClick={()=>setMode(m)}
                style={{ background: m===mode?T.primary:T.header, color: m===mode?'#00151a':T.text,
                         border:`1px solid ${T.border}`, borderRadius:999, padding:'6px 10px' }}>
                {m}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
            <span style={{ alignSelf:'center', color:T.sub, fontSize:12 }}>Comfort</span>
            {['Not at all','A bit','Mostly','I’ve got it'].map(c=>(
              <button key={c}
                onClick={()=>setComfort(c)}
                style={{ background: c===comfort?T.primary:T.header, color: c===comfort?'#00151a':T.text,
                         border:`1px solid ${T.border}`, borderRadius:999, padding:'6px 10px' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Make a practice set */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={{ fontSize:12, color:T.sub }}>Completion without human help</div>
            <div style={{ fontSize:28, fontWeight:800 }}>82%</div>
          </div>

          <div style={card}>
            <div style={{ fontSize:12, color:T.sub }}>Recommended next</div>
            <div style={{ fontSize:22, fontWeight:800 }}>2-step equations (easy)</div>
          </div>

          <div style={card}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <div style={{ fontSize:12, color:T.sub }}>Subject</div>
                <select value={subject} onChange={e=>{ setSubject(e.target.value); setTopic((TOPICS[e.target.value]||[])[0]||''); }}
                        style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                  {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:12, color:T.sub }}>Grade</div>
                <select value={String(grade)} onChange={e=>setGrade(e.target.value)}
                        style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                  {GRADES.map(g=><option key={g} value={g}>G{g}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <div style={{ fontSize:12, color:T.sub }}>Topic</div>
                <select value={topic} onChange={e=>setTopic(e.target.value)}
                        style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                  {topicList.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:12, color:T.sub }}>Difficulty</div>
                <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}
                        style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }}>
                  {['easy','medium','hard'].map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:12, color:T.sub }}>Count</div>
                <input type="number" min={1} max={20} value={count} onChange={e=>setCount(Number(e.target.value))}
                       style={{ width:'100%', background:T.header, color:T.text, border:`1px solid ${T.border}`, borderRadius:8, padding:8 }} />
              </div>
            </div>

            <button onClick={toPractice}
                    style={{ marginTop:12, width:'100%', background:T.primary, color:'#00151a', border:'none', borderRadius:10, padding:'10px 14px', fontWeight:700 }}>
              Make a practice set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

