import React, { useState } from "react";
export function QuestionNumeric({ item, onCheck, onHint }) {
  const [val, setVal] = useState(""); const [revealed, setRevealed] = useState(false);
  function eq(a,b,tol=0){ const na=Number(a), nb=Number(b); if(!Number.isNaN(na)&&!Number.isNaN(nb)) return Math.abs(na-nb)<=tol; return String(a).trim()===String(b).trim(); }
  function check(){ const ok = eq(val, item.answer, item.tolerance ?? 0); setRevealed(true); onCheck({ correct: ok }); }
  return (
    <div className="card">
      <div style={{ fontWeight:600, marginBottom:10 }}>{item.stem}</div>
      <input className="input" value={val} onChange={e=>setVal(e.target.value)} placeholder="Type your answer…" disabled={revealed}/>
      {!revealed ? (
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button className="btn" onClick={check} disabled={!val}>Check</button>
          <button className="btn secondary" onClick={onHint}>Hint</button>
        </div>
      ) : (
        item.rubricHint ? <div style={{ marginTop:12 }} className="card" style={{ background:"rgba(255,255,255,0.02)" }}><strong>Walkthrough:</strong> {item.rubricHint}</div> : null
      )}
    </div>
  );
}
