// src/components/ProgressBar.jsx
import React from 'react';
export default function ProgressBar({ value=0, max=100, label }) {
  const pct = Math.round((value/Math.max(1,max))*100);
  return (
    <div style={{width:'100%', background:'rgba(255,255,255,.06)', borderRadius:8, overflow:'hidden'}}>
      <div style={{width:`${pct}%`, height:8, background:'#22d3ee'}} />
      {label && <div className="small muted" style={{marginTop:6}}>{label}</div>}
    </div>
  );
}