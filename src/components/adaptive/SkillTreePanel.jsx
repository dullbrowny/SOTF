import React from "react";
export function SkillTreePanel({ graph, subject, grade, activeSkillId, onSelect }) {
  const key = `${subject}:${grade}`; const data = graph[key];
  if (!data) return <div className="card">No skills for {subject} Grade {grade}.</div>;
  return (
    <div className="card">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Skills</div>
      {Object.entries(data.strands).map(([strand, val]) => (
        <div key={strand} style={{ marginBottom: 8 }}>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>{strand}</div>
          <div style={{ display: "grid", gap: 6 }}>
            {val.skills.map(s => (
              <button key={s.id} className="btn secondary" onClick={() => onSelect(s.id)}
                style={s.id===activeSkillId?{ borderColor:"#ef4444"}:null} title={s.id}>{s.name}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
