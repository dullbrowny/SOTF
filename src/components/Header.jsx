// src/components/Header.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDemoData } from '../demoData.jsx';

export default function Header() {
  const { grade, setGrade, role, setRole } = useDemoData();
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div className="topbar">
      <strong style={{marginRight:8}}>School PoC</strong>
      <select value={grade} onChange={(e)=>setGrade(e.target.value)}>
        {['7','8','9'].map(g => <option key={g} value={g}>Grade {g}</option>)}
      </select>
      <select value={role} onChange={(e)=>setRole(e.target.value)}>
        {['Teacher','Student','Admin','Parent'].map(r => <option key={r}>{r}</option>)}
      </select>
      <select onChange={(e)=> e.target.value && nav(e.target.value)} defaultValue="">
        <option value="" disabled>Open as…</option>
        <option value="/assessment">Assessment</option>
        <option value="/grading">Grading</option>
        <option value="/practice">Practice</option>
        <option value="/tutor">Tutor</option>
        <option value="/admin">Admin</option>
        <option value="/parent">Parent</option>
      </select>
      <span style={{opacity:.6, marginLeft:'auto', fontSize:12}}>{loc.pathname}</span>
    </div>
  );
}