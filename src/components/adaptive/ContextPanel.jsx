import React from "react";
import { MINI_LESSONS } from "../../data/mini-lessons";
export function ContextPanel({ skillId, lastOutcome, miniOpen, onOpenMini, onCloseMini }) {
  const mini = MINI_LESSONS[skillId];
  return (
    <div className="card">
      <div style={{ display:"grid", gap:10 }}>
        <Section title="Key idea">Keep both sides balanced; use inverse operations to isolate the variable.</Section>
        {lastOutcome==="incorrect" && <Section title="Common mistake">Sign flips and doing an operation on only one side.</Section>}
        {mini && !miniOpen && <button className="btn" onClick={onOpenMini}>Open mini-lesson</button>}
        {mini && miniOpen && <MiniLesson mini={mini} onClose={onCloseMini} />}
      </div>
    </div>
  );
}
function Section({ title, children }){ return (<div><div style={{fontWeight:600,marginBottom:6}}>{title}</div><div style={{opacity:.9}}>{children}</div></div>); }
function MiniLesson({ mini, onClose }){
  return (
    <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
      <div style={{ fontWeight:600, marginBottom:6 }}>{mini.title}</div>
      <ul style={{ margin:0, paddingLeft:16 }}>{mini.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>
      <div style={{ marginTop:10 }}><button className="btn secondary" onClick={onClose}>Close</button></div>
    </div>
  );
}
