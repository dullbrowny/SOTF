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
