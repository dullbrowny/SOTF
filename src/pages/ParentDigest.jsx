// src/pages/ParentDigest.jsx
import React, { useState } from 'react';
import { api } from '../api/mockApi';

export default function ParentDigest() {
  const [text, setText] = useState('Proud of your effort this week!');

  const send = () => {
    api.pushParentMessage(text);
    alert('Sent to Tutor: ' + text);
    setText('');
  };

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Weekly Digest (Arjun • Grade 8)</h2>
          <div className="row">
            <div className="badge">Math Mastery 66%</div>
            <div className="badge">Attendance 5/5</div>
            <div className="badge">Parent NPS +41</div>
          </div>
          <div className="badge" style={{marginTop:8}}>Recommended: Watch 2‑min video on solving 2‑step equations.</div>
        </section>
        <aside className="card">
          <h3>Encourage your child</h3>
          <input className="input" value={text} onChange={(e)=>setText(e.target.value)} />
          <button className="btn" onClick={send} style={{marginTop:8}}>Send to Tutor</button>
          <div className="small muted" style={{marginTop:8}}>This message appears in the Student’s Tutor chat.</div>
        </aside>
      </div>
    </div>
  );
}