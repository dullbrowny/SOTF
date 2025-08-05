import React, { useState } from "react";
export function QuestionMCQ({ item, onCheck, onHint }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correctIdx = item.correct;
  function check(){ if(selected==null) return; const ok = selected===correctIdx; setRevealed(true); onCheck({ correct: ok }); }
  return (
    <div className="card">
      <div style={{ fontWeight:600, marginBottom:10 }}>{item.stem}</div>
      <div style={{ display:"grid", gap:8 }}>
        {item.options.map((opt,i)=>{
          const chosen = selected===i, showCheck = revealed && i===correctIdx, showCross = revealed && chosen && !showCheck;
          return (
            <button key={i} className="btn secondary" disabled={revealed} onClick={()=>setSelected(i)}
              style={{ justifyContent:"flex-start", border: chosen && !revealed ? "1px solid #9ca3af" : showCheck ? "1px solid #22d3ee" : showCross ? "1px solid #ef4444" : undefined }}>
              <span style={{ marginRight:8 }}>{String.fromCharCode(65+i)}.</span>{opt}
              {showCheck && <span style={{ marginLeft:"auto" }}>✅</span>}
              {showCross && <span style={{ marginLeft:"auto" }}>❌</span>}
            </button>
          );
        })}
      </div>
      {!revealed ? (
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button className="btn" onClick={check} disabled={selected==null}>Check</button>
          <button className="btn secondary" onClick={onHint}>Hint</button>
        </div>
      ) : (
        item.rubricHint ? <div style={{ marginTop:12 }} className="card" style={{ background:"rgba(255,255,255,0.02)" }}><strong>Hint:</strong> {item.rubricHint}</div> : null
      )}
    </div>
  );
}
