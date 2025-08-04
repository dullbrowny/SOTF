import { useEffect, useState } from 'react';
import { api } from '../api/mockApi.js';

function Bubble({ who, children }) {
  const align = who === 'ai' ? 'flex-start' : 'flex-end';
  return (
    <div style={{ display: 'flex', justifyContent: align }}>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="badge">{who === 'ai' ? 'AI Tutor' : 'You'}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function StudentTutorChat() {
  const [script, setScript] = useState([]);
  const [input, setInput] = useState('I don’t get how to solve 2x + 3 = 11');
  const [typing, setTyping] = useState(false);

  // modes + comfort
  const [mode, setMode] = useState('Standard'); // Standard | ELI5 | Socratic | Steps
  const [level, setLevel] = useState(null);     // 'low' | 'med' | 'high'
  const [awaiting, setAwaiting] = useState(false); // Socratic wait flag

  // practice handoff
  const [subj, setSubj] = useState('Math');
  const [grade, setGrade] = useState('8');
  const [topic, setTopic] = useState('Linear Equations');
  const [pcount, setPcount] = useState(5);
  const [pdiff, setPdiff] = useState('easy');

  useEffect(() => {
    api.getTutorScript?.().then((s) => setScript(s || [
      { who: 'ai', text: 'Hi! What are you stuck on in Linear Equations today?' },
    ]));
  }, []);

  const push = (who, text) => setScript((s) => [...s, { who, text }]);

  const eli5 = () => {
    push('ai', 'Think of 2x + 3 = 11 like a balance. Remove 3 from both sides → 2x = 8. Now split 8 into 2 equal groups → x = 4.');
  };
  const showSteps = () => {
    push('ai', '1) Subtract 3: 2x + 3 − 3 = 11 − 3 → 2x = 8');
    push('ai', '2) Divide by 2: 2x / 2 = 8 / 2 → x = 4');
    push('ai', 'Check: 2·4 + 3 = 11 ✓');
  };

  const send = async () => {
    if (!input.trim()) return;
    push('you', input);
    const userMsg = input;
    setInput('');

    // comfort gate the first time
    if (!level) {
      setTyping(true);
      await new Promise((r) => setTimeout(r, 300));
      push('ai', 'Before we dive in—how comfortable are you with this topic?');
      push('ai', 'Choose one below: Not at all / A bit / Mostly / I’ve got it');
      setTyping(false);
      return;
    }

    if (mode === 'ELI5') {
      setTyping(true);
      await new Promise((r) => setTimeout(r, 250));
      eli5();
      setTyping(false);
      return;
    }
    if (mode === 'Steps') {
      setTyping(true);
      await new Promise((r) => setTimeout(r, 250));
      showSteps();
      setTyping(false);
      return;
    }
    if (mode === 'Socratic') {
      if (!awaiting) {
        setAwaiting(true);
        setTyping(true);
        await new Promise((r) => setTimeout(r, 250));
        push('ai', 'What could you subtract from both sides to remove the +3?');
        setTyping(false);
      } else {
        // user replied → next probe, tailored roughly by response length
        const short = userMsg.length < 5;
        setAwaiting(false);
        setTyping(true);
        await new Promise((r) => setTimeout(r, 250));
        push('ai', short
          ? 'Good—try subtracting 3 first. After that, what remains on the left?'
          : 'Great. After subtracting 3, what operation undoes ×2 on x?');
        setTyping(false);
        setAwaiting(true);
      }
      return;
    }

    // Standard
    setTyping(true);
    await new Promise((r) => setTimeout(r, 250));
    push('ai', 'Let’s subtract 3 from both sides, then divide by 2. What do you get?');
    setTyping(false);
  };

  const sendPractice = () => {
    // Navigate to Practice with query params (no router dependency)
    const params = new URLSearchParams({
      from: 'tutor',
      subject: subj,
      grade,
      topic,
      difficulty: pdiff,
      count: String(pcount),
    }).toString();
    window.location.href = `/practice?${params}`;
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
      <div className="grid">
        <div className="card">
          <h2>AI Tutor</h2>
          <div className="badge">Topic: {topic} • Source: NCERT G{grade}</div>
        </div>

        <div className="grid">
          {script.map((m, i) => (
            <Bubble who={m.who} key={i}>
              {m.text}
            </Bubble>
          ))}
          {typing && <Bubble who="ai">Typing…</Bubble>}
        </div>

        {/* input + actions */}
        <div className="card">
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="btn" onClick={send}>Send</button>
          </div>

          {/* mode selector */}
          <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
            <span className="badge">Mode</span>
            {['Standard', 'ELI5', 'Socratic', 'Steps'].map((m) => (
              <button
                key={m}
                className={`btn ${mode === m ? 'primary' : 'secondary'}`}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>

          {/* comfort quick-taps (only until chosen) */}
          {!level && (
            <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
              <span className="badge">Comfort</span>
              {[
                { k: 'low', label: 'Not at all' },
                { k: 'med', label: 'A bit' },
                { k: 'high', label: 'Mostly' },
                { k: 'high', label: 'I’ve got it' },
              ].map((o) => (
                <button
                  key={o.label}
                  className="btn secondary"
                  onClick={() => {
                    setLevel(o.k);
                    push('ai', `Got it — ${o.label.toLowerCase()}. I’ll adjust my explanations.`);
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column: quick practice handoff */}
      <div className="grid">
        <div className="card">
          <div className="kpi">
            <div className="label">Completion without human help</div>
            <div className="value">82%</div>
          </div>
        </div>

        <div className="card">
          <div className="kpi">
            <div className="label">Recommended next</div>
            <div className="value">2-step equations (easy)</div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <div>
              <div className="label">Subject</div>
              <select className="input" value={subj} onChange={(e) => setSubj(e.target.value)}>
                {['Math', 'Science'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">Grade</div>
              <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                {['6', '7', '8', '9', '10'].map((g) => (
                  <option key={g} value={g}>
                    G{g}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: 200, flex: '1 1 220px' }}>
              <div className="label">Topic</div>
              <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {['Linear Equations', 'Fractions', 'Integers', 'Physics — acceleration'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">Difficulty</div>
              <select className="input" value={pdiff} onChange={(e) => setPdiff(e.target.value)}>
                {['easy', 'medium', 'hard'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">Count</div>
              <input
                className="input"
                type="number"
                min={1}
                max={20}
                value={pcount}
                onChange={(e) => setPcount(e.target.value)}
                style={{ width: 80 }}
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" onClick={sendPractice}>Make a practice set</button>
          </div>
        </div>
      </div>
    </div>
  );
}

