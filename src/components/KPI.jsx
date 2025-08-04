// src/components/KPI.jsx
import React from 'react';
export default function KPI({ label, value, delta }) {
  return (
    <div className="card">
      <div className="small">{label}</div>
      <div className="kpi">{value}</div>
      {delta && <div className="small muted">{delta}</div>}
    </div>
  );
}