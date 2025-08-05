// src/pages/ParentDigest.jsx
import React, { useMemo, useState } from 'react';
import { api } from '../api/mockApi';
import { useDemoData } from '../demoData.jsx';

const TONES = [
  { key: 'proud', text: 'Proud of your effort this week!' },
  { key: 'keepGoing', text: 'Keep going — your practice is paying off.' },
  { key: 'focus', text: 'Let’s focus on 2-step equations this week.' },
  { key: 'congrats', text: 'Congrats on your progress — great job!' },
];

export default function ParentDigest() {
  const { grade } = useDemoData();
  const [text, setText] = useState(TONES[0].text);
  const [busy, setBusy] = useState(false);
  const child = useMemo(() => ({ name: 'Arjun', grade: grade || '8' }), [grade]);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      // Reuse the existing mock API hook you already had
      api.pushParentMessage(text);
      alert('Sent to Tutor: ' + text);
      setText('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Weekly Digest ({child.name} • Grade {child.grade})</h2>
          <div className="row" style={{ flexWrap:'wrap', gap:8 }}>
            <div className="badge">Math Mastery 66%</div>
            <div className="badge">Attendance 5/5</div>
            <div className="badge">Parent NPS +41</div>
          </div>
          <div className="badge" style={{marginTop:8}}>
            Recommended: Watch 2-min video on solving 2-step equations.
          </div>
        </section>

        <aside className="card">
          <h3>Encourage your child</h3>

          <div className="row" style={{ gap:8, flexWrap:'wrap', margin: '6px 0 8px' }}>
            {TONES.map(t => (
              <button
                key={t.key}
                className={'chip ' + (text === t.text ? 'selected' : '')}
                onClick={()=>setText(t.text)}
                type="button"
                aria-pressed={text === t.text}
                title="Quick message"
              >
                {t.text}
              </button>
            ))}
          </div>

          <input className="input" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a short note…" />
          <button className="btn" onClick={send} style={{marginTop:8}} disabled={busy || !text.trim()}>
            {busy ? 'Sending…' : 'Send to Tutor'}
          </button>
          <div className="small muted" style={{marginTop:8}}>
            This message appears in the Student’s Tutor chat.
          </div>
        </aside>
      </div>

      <style>{`
        .chip {
          border: 1px solid #1f2937;
          background: #0b1220;
          color: #e5e7eb;
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 12px;
        }
        .chip.selected {
          border-color: #60a5fa;
          background: #0b2344;
        }
      `}</style>
    </div>
  );
}

