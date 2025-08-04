// src/pages/StudentPractice.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KPI from '../components/KPI.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { api } from '../api/mockApi';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

export default function StudentPractice() {
  const nav = useNavigate();
  const q = useQuery();
  const from = q.from || null;

  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(58);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const set = await api.createPracticeSet({
        grade: Number(q.grade || 8),
        subject: q.subject || 'Math',
        topic: q.topic || 'Linear Equations',
        difficulty: q.difficulty || 'easy',
        count: Number(q.count || 5),
        distractors: q.distractors || 'numeric',
      });
      if (!alive) return;
      setItems(set); setIdx(0); setDone(false); setStreak(0);
    })();
    return () => (alive = false);
  }, [q.subject, q.topic, q.difficulty, q.count, q.distractors]);

  const cur = items[idx] || null;
  const answered = Math.min(idx, items.length);

  const choose = (opt) => {
    if (!cur) return;
    const ok = String(opt) === String(cur.answer);
    setProgress(p => Math.max(0, Math.min(100, p + (ok ? 3 : -1))));
    setStreak(s => ok ? s+1 : 0);
    if (idx >= items.length-1) setDone(true);
    else setIdx(i => i+1);
  };

  const returnTo = () => {
    if (from === 'tutor') nav('/tutor');
    else if (from === 'admin') nav('/admin');
    else nav('/practice');
  };

  return (
    <div className="page">
      <div className="grid two">
        <section className="card">
          <h2>Personalized Practice</h2>
          <div className="row">
            <div className="badge">Topic: {(q.subject||'Math')} • {(q.topic||'Linear Equations')}</div>
            <div className="badge">Difficulty: {(q.difficulty||'easy')}</div>
            <div className="badge">Distractors: {(q.distractors||'numeric')}</div>
            {from && <a className="badge" onClick={returnTo} href="#">↩ Return to {from}</a>}
          </div>

          <ProgressBar value={answered} max={Math.max(1, items.length)} label={`${answered}/${items.length}`} />

          {cur && (
            <div className="card" style={{marginTop:12}}>
              <div><strong>Q{idx+1}.</strong> {cur.question}</div>
              <div className="row" style={{flexWrap:'wrap', marginTop:8}}>
                {cur.options.map((op,j) => (
                  <button className="btn secondary" key={j} onClick={()=>choose(op)}>{op}</button>
                ))}
              </div>
              <div className="badge" style={{marginTop:8}}>{cur.hint}</div>
            </div>
          )}

          {done && (
            <div className="row" style={{marginTop:12}}>
              <div className="badge">Session complete</div>
              <button className="btn" onClick={returnTo}>Return</button>
            </div>
          )}
        </section>

        <aside>
          <KPI label="Mastery now" value={`${progress}%`} delta="+9pp in 3 weeks"/>
          <KPI label="Adaptive difficulty" value={streak>=3 ? 'Increasing' : 'Stable'}/>
          <KPI label="Engagement" value="1.7× baseline"/>
        </aside>
      </div>
    </div>
  );
}