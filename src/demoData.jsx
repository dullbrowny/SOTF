// src/demoData.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useDemoData = () => useContext(Ctx);

export function DemoDataProvider({ children }) {
  const [grade, setGrade] = useState('8');
  const [role, setRole] = useState('Teacher');
  const [handoff, setHandoff] = useState(null); // { from, subject, topic, difficulty, count, distractors }
  const [parentMsgs, setParentMsgs] = useState([]);
  const pushParent = (text) => setParentMsgs(m => [...m, { ts: Date.now(), text }]);

  const value = useMemo(() => ({
    grade, setGrade,
    role, setRole,
    handoff, setHandoff,
    parentMsgs, pushParent,
  }), [grade, role, handoff, parentMsgs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}