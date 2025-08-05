# create the script
cat > install_adaptive_v1_1.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "➡️  Creating folders…"
mkdir -p src/data src/hooks src/components/adaptive src/styles

echo "➡️  Writing data files…"
cat > src/data/mini-lessons.js <<'JS'
export const MINI_LESSONS = {
  "ALG.OP.BAL": {
    title: "Balance & Inverse Operations (90s)",
    bullets: [
      "An equation is like a scale—keep both sides equal.",
      "Undo additions with subtractions; undo multiplications with divisions.",
      "Work from the outside in until the variable is alone."
    ],
    diagram: "balance.svg",
    quickCheck: {
      kind: "mcq",
      stem: "To undo +7 on the left side, what should you do?",
      choices: ["+7 on the right", "−7 on both sides", "×7 on the right", "÷7 on both sides"],
      answer: "−7 on both sides"
    }
  },
  "ALG.LE.Q1": {
    title: "One-step Linear Equations (120s)",
    bullets: [
      "Identify the operation applied to x.",
      "Apply the inverse operation to both sides.",
      "Check by substitution."
    ],
    diagram: "one-step.svg",
    quickCheck: {
      kind: "numeric",
      stem: "Solve x + 5 = 12",
      answer: 7
    }
  }
};
JS

cat > src/data/skills-graph.json <<'JSON'
{
  "Math:6": {
    "strands": {
      "Algebra": {
        "skills": [
          { "id": "ALG.LE.Q1", "name": "One-step linear equations", "prereqs": ["ALG.OP.BAL"] },
          { "id": "ALG.LE.Q2", "name": "Two-step linear equations", "prereqs": ["ALG.LE.Q1"] }
        ]
      },
      "Number Sense": {
        "skills": [
          { "id": "ALG.OP.BAL", "name": "Balance and inverse operations", "prereqs": [] }
        ]
      }
    }
  },
  "Math:8": {
    "strands": {
      "Algebra": {
        "skills": [
          { "id": "ALG.LE.Q1", "name": "One-step linear equations", "prereqs": ["ALG.OP.BAL"] },
          { "id": "ALG.LE.Q2", "name": "Two-step linear equations", "prereqs": ["ALG.LE.Q1"] }
        ]
      }
    }
  }
}
JSON

echo "➡️  Writing hook…"
cat > src/hooks/useAdaptiveSession.js <<'JS'
import { useState } from "react";
export function useAdaptiveSession({ getItems, skillGraph }) {
  const [state, setState] = useState("idle");
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [streak, setStreak] = useState(0);
  const [skillId, setSkillId] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [lastOutcome, setLastOutcome] = useState(null);

  const item = queue[idx] || null;
  const total = queue.length;

  async function start({ skillId: s, difficulty: d = 3, count = 5, types = ["mcq","numeric"] }) {
    setSkillId(s); setDifficulty(d); setState("idle"); setHintsUsed(0); setLastOutcome(null); setStreak(0);
    const items = await getItems({ skillId: s, difficulty: d, count, types });
    setQueue(items); setIdx(0); setState(items.length ? "active" : "idle");
  }
  function giveHint(){ setHintsUsed(h => h+1); }
  function record({ correct }) {
    setLastOutcome(correct ? "correct":"incorrect");
    if (correct && hintsUsed===0) setDifficulty(x=>Math.min(5,x+1));
    if (!correct) setDifficulty(x=>Math.max(1,x-1));
    setStreak(s=> correct ? Math.max(1,s+1) : Math.min(-1,s-1));
    setHintsUsed(0);
  }
  async function next(){
    if (streak <= -2 && skillGraph?.[skillId]?.prereqs?.length){
      const prereq = skillGraph[skillId].prereqs[0];
      const items = await getItems({ skillId: prereq, difficulty: Math.max(1,difficulty-1), count: 3, types: ["mcq","numeric"] });
      setQueue(items); setIdx(0); setState(items.length?"active":"finished"); setStreak(0); setSkillId(prereq);
      return { branched:true, prereq };
    }
    if (idx+1 < total){ setIdx(idx+1); return { branched:false }; }
    setState("finished"); return { branched:false };
  }
  return { state,item,idx,total,difficulty,skillId,lastOutcome,start,next,record,giveHint };
}
JS

echo "➡️  Writing shared components…"
cat > src/components/adaptive/SkillTreePanel.jsx <<'JS'
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
JS

cat > src/components/adaptive/ContextPanel.jsx <<'JS'
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
JS

cat > src/components/adaptive/QuestionMCQ.jsx <<'JS'
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
JS

cat > src/components/adaptive/QuestionNumeric.jsx <<'JS'
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
JS

cat > src/components/adaptive/ActiveTaskCard.jsx <<'JS'
import React from "react";
import { QuestionMCQ } from "./QuestionMCQ";
import { QuestionNumeric } from "./QuestionNumeric";
export function ActiveTaskCard({ item, onCheck, onHint }) {
  if (!item) return null;
  return item.variant==="mcq" ? <QuestionMCQ item={item} onCheck={onCheck} onHint={onHint}/> : <QuestionNumeric item={item} onCheck={onCheck} onHint={onHint}/>;
}
JS

echo "➡️  Writing CSS…"
cat > src/styles/adaptive.css <<'CSS'
.practice-grid { display:grid; grid-template-columns:260px 1fr 300px; gap:16px; }
.practice-grid .left, .practice-grid .center, .practice-grid .right { min-width:0; }
@media (max-width:1100px){ .practice-grid{ grid-template-columns:1fr } .practice-grid .left, .practice-grid .right{ display:none } }
.progress{ height:3px; background:#233; border-radius:2px; }
.progress>span{ display:block; height:100%; background:#ef4444; border-radius:2px; }
.muted{ color: var(--muted); }
CSS

echo "➡️  Writing adaptive pages…"
cat > src/pages/StudentPractice.adaptive.jsx <<'JS'
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/mockApi";
import skillsGraph from "../data/skills-graph.json";
import { useAdaptiveSession } from "../hooks/useAdaptiveSession";
import { SkillTreePanel } from "../components/adaptive/SkillTreePanel";
import { ContextPanel } from "../components/adaptive/ContextPanel";
import { ActiveTaskCard } from "../components/adaptive/ActiveTaskCard";

const DEFAULTS = { subject: "Math", grade: "8", topic: "Linear Equations", difficulty: "easy", distractors: "numeric", count: 5 };

export default function StudentPracticeAdaptive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [subject, setSubject] = useState(searchParams.get("subject") || DEFAULTS.subject);
  const [grade, setGrade] = useState(searchParams.get("grade") || DEFAULTS.grade);
  const [topic, setTopic] = useState(searchParams.get("topic") || DEFAULTS.topic);
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || DEFAULTS.difficulty);
  const [distractors, setDistractors] = useState(searchParams.get("distractors") || DEFAULTS.distractors);
  const [count, setCount] = useState(Number(searchParams.get("count")) || DEFAULTS.count);
  const [skillId, setSkillId] = useState(searchParams.get("skillId") || "ALG.LE.Q1");
  const [miniOpen, setMiniOpen] = useState(false);

  const graphLookup = useMemo(() => {
    const key = `${subject}:${grade}`;
    const strands = skillsGraph[key]?.strands || {};
    const flat = {};
    Object.values(strands).forEach(({ skills }) => skills.forEach((s) => (flat[s.id] = s)));
    return flat;
  }, [subject, grade]);

  const session = useAdaptiveSession({
    skillGraph: graphLookup,
    getItems: async ({ skillId: s, difficulty: d, count: c, types }) => {
      const seed = `${s}-${d}-${Date.now()}`;
      const raw = await api.generatePracticeItems({ subject, grade, topic, difficulty, distractors, count: c, seed });
      return normalizeBatchToVariants(raw, types);
    }
  });

  const { state: sessionState, item: activeItem, idx, total, difficulty: diffLevel, lastOutcome } = session;
  const progressPct = useMemo(() => (total > 0 ? Math.round((idx / total) * 100) : 0), [idx, total]);

  useEffect(() => {
    const desired = new URLSearchParams({ subject, grade, topic, difficulty, distractors, count: String(count), skillId, ...(searchParams.get("from") ? { from: "tutor" } : {}) }).toString();
    if (desired !== searchParams.toString()) setSearchParams(desired, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, topic, difficulty, distractors, count, skillId]);

  useEffect(() => {
    const fromTutor = searchParams.get("from") === "tutor";
    if (fromTutor && sessionState === "idle") session.start({ skillId, difficulty: 3, count, types: ["mcq", "numeric"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  function restart(){ session.start({ skillId, difficulty: 3, count, types: ["mcq","numeric"] }); }
  const disableGenerate = sessionState === "active";
  const generateTitle = disableGenerate ? "Finish or Restart to generate a new set" : "Generate a practice set";

  return (
    <div className="container" style={{ maxWidth: 1280 }}>
      <header className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Personalized Practice {sessionState==="active" && total ? <small> • Q {idx+1} of {total}</small> : null}</h2>
        <div className="row">
          <button onClick={restart} className="btn secondary">Restart</button>
          <button onClick={() => session.start({ skillId, difficulty: 3, count, types: ["mcq","numeric"] })} className="btn" title={generateTitle} disabled={disableGenerate} style={disableGenerate ? { opacity:.6, cursor:"not-allowed"} : {}}>
            {sessionState==="active" ? "Generate (disabled)" : "Generate"}
          </button>
        </div>
      </header>

      <div className="practice-grid">
        <aside className="left">
          <SkillTreePanel graph={skillsGraph} subject={subject} grade={grade} activeSkillId={skillId} onSelect={id=>setSkillId(id)} />
        </aside>
        <main className="center">
          <section className="card" style={{ marginBottom: 12 }}>
            <div className="grid" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
              <Labeled label="Subject"><select className="input" value={subject} onChange={e=>setSubject(e.target.value)}><option>Math</option></select></Labeled>
              <Labeled label="Grade"><select className="input" value={grade} onChange={e=>setGrade(e.target.value)}><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></Labeled>
              <Labeled label="Topic"><input className="input" value={topic} onChange={e=>setTopic(e.target.value)}/></Labeled>
              <Labeled label="Count"><input className="input" type="number" min={3} max={20} value={count} onChange={e=>setCount(Math.max(3, Math.min(20, Number(e.target.value) || 5)))}/></Labeled>
              <Labeled label="Adaptive difficulty"><Badge>{diffLevel}</Badge></Labeled>
            </div>
            {sessionState==="active" && total>0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>Question {idx+1} of {total}</div>
                <div className="progress"><span style={{ width: `${progressPct}%` }}/></div>
              </div>
            )}
          </section>

          {sessionState==="idle" && <div className="card" style={{ textAlign:"center" }}><h3 style={{marginTop:0}}>Ready to practice?</h3><p className="muted">Pick a skill from the left, then Generate.</p></div>}
          {sessionState==="active" && <ActiveTaskCard item={activeItem} onHint={()=>session.giveHint()} onCheck={async (outcome)=>{ session.record(outcome); await session.next(); }}/>}
          {sessionState==="finished" && <CompletionCard onAgain={()=>session.start({ skillId, difficulty: diffLevel, count, types:["mcq","numeric"] })} backHref={`/tutor?from=practice&subject=${encodeURIComponent(subject)}&grade=${encodeURIComponent(grade)}&skillId=${encodeURIComponent(skillId)}&lastOutcome=${session.lastOutcome || ""}`} />}
        </main>
        <aside className="right">
          <ContextPanel skillId={skillId} lastOutcome={lastOutcome} miniOpen={miniOpen} onOpenMini={()=>setMiniOpen(true)} onCloseMini={()=>setMiniOpen(false)} />
        </aside>
      </div>
    </div>
  );
}
function normalizeBatchToVariants(raw, types){
  if(!Array.isArray(raw)) return [];
  return raw.map((r,i)=>{
    const options = Array.isArray(r.choices)? r.choices : [];
    const ansIndex = options.findIndex(o=> String(o).trim()===String(r.answer).trim());
    const variant = (types.includes("numeric") && i%3===2) ? "numeric" : "mcq";
    if (variant==="mcq" && options.length>=2) return { id:r.id, variant:"mcq", stem:r.stem, options, correct: ansIndex>=0?ansIndex:0, rubricHint: r.rubric || "" };
    return { id:r.id, variant:"numeric", stem:r.stem, answer:r.answer, tolerance:0, rubricHint: r.rubric || "" };
  });
}
function Labeled({label,children}){ return (<label style={{display:"grid",gap:6,fontSize:14}}><span style={{color:"var(--muted)"}}>{label}</span>{children}</label>); }
function CompletionCard({ onAgain, backHref }){
  return (<div className="card" style={{ textAlign:"center" }}>
    <h3 style={{ marginTop:0 }}>You’re done! 🎉</h3>
    <p style={{ color:"var(--muted)" }}>Great work. Want to keep going or return to the Tutor?</p>
    <div className="row" style={{ justifyContent:"center" }}>
      <button className="btn" onClick={onAgain}>Generate similar set</button>
      <a href={backHref} className="btn secondary">Back to Tutor</a>
    </div>
  </div>);
}
function Badge({children}){ return <span style={{ padding:"2px 8px", borderRadius:999, fontSize:12, background:"#0b1220", border:"1px solid #1f2937" }}>{children}</span>; }
export default StudentPracticeAdaptive;
JS

cat > src/pages/StudentTutorChat.adaptive.jsx <<'JS'
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import skillsGraph from "../data/skills-graph.json";
import { useAdaptiveSession } from "../hooks/useAdaptiveSession";
import { SkillTreePanel } from "../components/adaptive/SkillTreePanel";
import { ContextPanel } from "../components/adaptive/ContextPanel";
import { ActiveTaskCard } from "../components/adaptive/ActiveTaskCard";

const DEFAULTS = { subject: "Math", grade: "8", topic: "Linear Equations", difficulty: "easy", distractors: "numeric", count: 5 };
const MODES = ["Standard", "ELI5", "Socratic", "Steps"];
const COMFORT = ["Not at all", "A bit", "Mostly", "I’ve got it"];

export default function StudentTutorChatAdaptive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get("subject") || DEFAULTS.subject);
  const [grade, setGrade] = useState(searchParams.get("grade") || DEFAULTS.grade);
  const [topic, setTopic] = useState(searchParams.get("topic") || DEFAULTS.topic);
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || DEFAULTS.difficulty);
  const [distractors, setDistractors] = useState(searchParams.get("distractors") || DEFAULTS.distractors);
  const [count, setCount] = useState(Number(searchParams.get("count")) || DEFAULTS.count);
  const [skillId, setSkillId] = useState(searchParams.get("skillId") || "ALG.LE.Q1");
  const [miniOpen, setMiniOpen] = useState(false);

  const [mode, setMode] = useState(searchParams.get("mode") || "Standard");
  const [comfort, setComfort] = useState(searchParams.get("comfort") || "A bit");

  const [messages, setMessages] = useState([{ role: "assistant", text: `You're in ${mode} mode. Tell me what part of ${topic} in Grade ${grade} ${subject} you’d like help with.`, meta: { mode, comfort } }]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const flatSkills = useMemo(() => {
    const key = `${subject}:${grade}`;
    const strands = skillsGraph[key]?.strands || {};
    const flat = {}; Object.values(strands).forEach(({ skills }) => skills.forEach((s) => (flat[s.id] = s)));
    return flat;
  }, [subject, grade]);

  const session = useAdaptiveSession({
    skillGraph: flatSkills,
    getItems: async ({ skillId: s, difficulty: d, count: c, types }) => {
      const seed = `${s}-${d}-${Date.now()}`;
      const raw = await import("../api/mockApi").then(({ api }) =>
        api.generatePracticeItems({ subject, grade, topic, difficulty, distractors, count: c, seed })
      );
      return normalizeBatchToVariants(raw, types);
    }
  });

  useEffect(() => {
    const desired = new URLSearchParams({ subject, grade, topic, difficulty, distractors, count: String(count), skillId, mode, comfort }).toString();
    if (desired !== searchParams.toString()) setSearchParams(desired, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, topic, difficulty, distractors, count, skillId, mode, comfort]);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  function send(){
    const trimmed = input.trim(); if(!trimmed) return;
    const userMsg = { role:"user", text: trimmed };
    const reply = generateReply(trimmed, { mode, comfort, subject, grade, topic, difficulty });
    setMessages(m=>[...m, userMsg, reply]); setInput("");
  }

  const practiceHref = useMemo(() => {
    const qp = new URLSearchParams({ from:"tutor", subject, grade, skillId, topic, difficulty, distractors, count: String(count) }).toString();
    return `/practice?${qp}`;
  }, [subject, grade, topic, difficulty, distractors, count, skillId]);

  return (
    <div className="container" style={{ maxWidth: 1280 }}>
      <header className="row" style={{ justifyContent:"space-between", marginBottom:12 }}>
        <h2 style={{ margin:0 }}>AI Tutor</h2>
        <div className="row">
          <select value={mode} onChange={e=>setMode(e.target.value)} title="Tutor mode">{MODES.map(m=><option key={m} value={m}>{m}</option>)}</select>
          <select value={comfort} onChange={e=>setComfort(e.target.value)} title="Comfort level">{COMFORT.map(c=><option key={c} value={c}>{c}</option>)}</select>
          <Link className="btn" to={practiceHref}>Make a practice set</Link>
        </div>
      </header>

      <div className="practice-grid">
        <aside className="left"><SkillTreePanel graph={skillsGraph} subject={subject} grade={grade} activeSkillId={skillId} onSelect={id=>setSkillId(id)}/></aside>
        <main className="center">
          <section className="card" style={{ marginBottom: 12 }}>
            <div className="grid" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
              <Labeled label="Subject"><select className="input" value={subject} onChange={e=>setSubject(e.target.value)}><option>Math</option></select></Labeled>
              <Labeled label="Grade"><select className="input" value={grade} onChange={e=>setGrade(e.target.value)}><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></Labeled>
              <Labeled label="Topic"><input className="input" value={topic} onChange={e=>setTopic(e.target.value)}/></Labeled>
              <Labeled label="Count"><input className="input" type="number" min={3} max={20} value={count} onChange={e=>setCount(Math.max(3, Math.min(20, Number(e.target.value) || 5)))}/></Labeled>
            </div>
          </section>

          <section className="card" style={{ display:"grid", gridTemplateRows:"1fr auto", height:"46vh", marginBottom:12 }}>
            <div ref={listRef} style={{ overflowY:"auto", padding:12 }}>{messages.map((m,i)=><MessageBubble key={i} role={m.role} text={m.text} meta={m.meta}/>)}</div>
            <div className="row" style={{ padding:12, borderTop:"1px solid #1f2937" }}>
              <input className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"?send():null} placeholder={`Ask about ${topic}…`} style={{ flex:1 }}/>
              <button className="btn" onClick={send}>Send</button>
              <button className="btn secondary" onClick={()=>session.start({ skillId, difficulty:3, count:1, types:["mcq","numeric"] })}>Quick check</button>
            </div>
          </section>

          {session.state==="active" && <ActiveTaskCard item={session.item} onHint={()=>session.giveHint()} onCheck={async (outcome)=>{ session.record(outcome); await session.next(); }}/>}
        </main>
        <aside className="right"><ContextPanel skillId={skillId} lastOutcome={session.lastOutcome} miniOpen={miniOpen} onOpenMini={()=>setMiniOpen(true)} onCloseMini={()=>setMiniOpen(false)}/></aside>
      </div>
    </div>
  );
}
function Labeled({label,children}){ return (<label style={{display:"grid",gap:6,fontSize:14}}><span style={{color:"var(--muted)"}}>{label}</span>{children}</label>); }
function MessageBubble({ role, text, meta }){ const isUser = role==="user"; return (<div style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:8}}><div style={{maxWidth:"80%",background:isUser?"#0b1220":"var(--card)",border:"1px solid #1f2937",padding:"8px 10px",borderRadius:8,whiteSpace:"pre-wrap"}}>{text}{meta?.expand && (<details style={{marginTop:6}}><summary style={{cursor:"pointer"}}>Show steps</summary><div style={{marginTop:6}}>{meta.expand}</div></details>)}</div></div>); }
function generateReply(){ const concise = "Focus on translating words to an equation, then do the same operation on both sides to isolate the variable."; const check="Try a quick example and tell me your first step."; return { role:"assistant", text: `${concise}\n\n${check}`}; }
function normalizeBatchToVariants(raw, types){ if(!Array.isArray(raw)) return []; return raw.map((r,i)=>{ const options = Array.isArray(r.choices)? r.choices:[]; const ansIndex = options.findIndex(o=> String(o).trim()===String(r.answer).trim()); const variant = (types.includes("numeric") && i%3===2) ? "numeric":"mcq"; if(variant==="mcq" && options.length>=2) return { id:r.id, variant:"mcq", stem:r.stem, options, correct: ansIndex>=0?ansIndex:0, rubricHint: r.rubric || "" }; return { id:r.id, variant:"numeric", stem:r.stem, answer:r.answer, tolerance:0, rubricHint: r.rubric || "" }; }); }
export default StudentTutorChatAdaptive;
JS

echo "✅ Done. Files created."
EOF

# run it
bash install_adaptive_v1_1.sh

