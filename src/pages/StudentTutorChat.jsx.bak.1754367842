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
