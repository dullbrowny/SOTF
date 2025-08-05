import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const DEFAULTS = {
  subject: "Math",
  grade: "8",
  topic: "Linear Equations",
  difficulty: "easy",
  distractors: "numeric",
  count: 5,
};

const MODES = ["Standard", "ELI5", "Socratic", "Steps"];
const COMFORT = ["Not at all", "A bit", "Mostly", "I’ve got it"];

export default function StudentTutorChat() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [subject, setSubject] = useState(searchParams.get("subject") || DEFAULTS.subject);
  const [grade, setGrade] = useState(searchParams.get("grade") || DEFAULTS.grade);
  const [topic, setTopic] = useState(searchParams.get("topic") || DEFAULTS.topic);
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || DEFAULTS.difficulty);
  const [distractors, setDistractors] = useState(searchParams.get("distractors") || DEFAULTS.distractors);
  const [count, setCount] = useState(Number(searchParams.get("count")) || DEFAULTS.count);

  const [mode, setMode] = useState(searchParams.get("mode") || "Standard");
  const [comfort, setComfort] = useState(searchParams.get("comfort") || "A bit");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `You're in ${mode} mode. Tell me what part of ${topic} in Grade ${grade} ${subject} you’d like help with.`,
      meta: { mode, comfort },
    },
  ]);

  const [input, setInput] = useState("");
  const listRef = useRef(null);

  // Sync URL only when changed
  useEffect(() => {
    const desired = new URLSearchParams({
      subject, grade, topic, difficulty, distractors, count: String(count),
      mode, comfort
    }).toString();
    if (desired !== searchParams.toString()) {
      setSearchParams(desired, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, topic, difficulty, distractors, count, mode, comfort]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { role: "user", text: trimmed };
    const reply = generateReply(trimmed, { mode, comfort, subject, grade, topic, difficulty });
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  }

  const practiceHref = useMemo(() => {
    const qp = new URLSearchParams({
      from: "tutor",
      subject, grade, topic, difficulty, distractors, count: String(count),
    }).toString();
    return `/practice?${qp}`;
  }, [subject, grade, topic, difficulty, distractors, count]);

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <header className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>AI Tutor</h2>
        <div className="row">
          <select className="input" value={mode} onChange={e => setMode(e.target.value)} title="Tutor mode">
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="input" value={comfort} onChange={e => setComfort(e.target.value)} title="Comfort level">
            {COMFORT.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Link className="btn" to={practiceHref} title="Create a practice set from these settings">
            Make a practice set
          </Link>
        </div>
      </header>

      {/* Controls */}
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <Labeled label="Subject"><input className="input" value={subject} onChange={e => setSubject(e.target.value)} /></Labeled>
          <Labeled label="Grade"><input className="input" value={grade} onChange={e => setGrade(e.target.value)} /></Labeled>
          <Labeled label="Topic"><input className="input" value={topic} onChange={e => setTopic(e.target.value)} /></Labeled>
          <Labeled label="Difficulty">
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option>
            </select>
          </Labeled>
          <Labeled label="Distractors">
            <select className="input" value={distractors} onChange={e => setDistractors(e.target.value)}>
              <option value="numeric">numeric</option><option value="symbolic">symbolic</option><option value="conceptual">conceptual</option>
            </select>
          </Labeled>
          <Labeled label="Count">
            <input
              className="input"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            />
          </Labeled>
        </div>
      </section>

      {/* Chat */}
      <section className="card" style={{ display: "grid", gridTemplateRows: "1fr auto", height: "60vh" }}>
        <div ref={listRef} style={{ overflowY: "auto", padding: 12 }}>
          {messages.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} meta={m.meta} />)}
        </div>
        <div className="row" style={{ padding: 12, borderTop: "1px solid #1f2937" }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" ? send() : null}
            placeholder={`Ask about ${topic}…`}
            style={{ flex: 1 }}
          />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </section>
    </div>
  );
}

function Labeled({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      {children}
    </label>
  );
}

function MessageBubble({ role, text, meta }) {
  const isUser = role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 8
    }}>
      <div style={{
        maxWidth: "80%",
        background: isUser ? "#0b1220" : "var(--card)",
        border: "1px solid #1f2937",
        padding: "8px 10px",
        borderRadius: 8,
        whiteSpace: "pre-wrap"
      }}>
        {text}
        {meta?.expand && (
          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: "pointer" }}>Show steps</summary>
            <div style={{ marginTop: 6 }}>{meta.expand}</div>
          </details>
        )}
      </div>
    </div>
  );
}

function generateReply(userText, ctx) {
  const { mode, comfort, topic } = ctx;

  const tone = {
    "Not at all": { pre: "No worries—let’s go slow. ", post: " You’re doing fine; we’ll build it step by step." },
    "A bit": { pre: "Alright, let’s unpack that. ", post: " Tell me where it still feels fuzzy." },
    "Mostly": { pre: "", post: " Quick check: can you restate the key idea in one line?" },
    "I’ve got it": { pre: "", post: "" },
  }[comfort] || { pre: "", post: "" };

  if (mode === "Socratic") {
    const q = userText.toLowerCase().includes("stuck")
      ? "Where exactly do you feel stuck—setting up the equation or solving it?"
      : "If 3x + 5 = 20, what operation removes +5 while keeping balance?";
    return { role: "assistant", text: `${tone.pre}${q}${tone.post}` };
  }

  if (mode === "ELI5") {
    const expl = `${topic} is like balancing a seesaw: whatever you do to one side, do to the other. Undo extras around the unknown until it’s alone.`;
    return { role: "assistant", text: `${tone.pre}${expl}${tone.post}` };
  }

  if (mode === "Steps") {
    const steps = [
      "Translate the problem into an equation.",
      "Combine like terms (if any).",
      "Move constants off the variable by +/−.",
      "Isolate the variable by ×/÷.",
      "Check by substitution.",
    ];
    return {
      role: "assistant",
      text: `${tone.pre}We’ll do this in a few focused steps.${tone.post}`,
      meta: { expand: steps.map((s, i) => `${i + 1}. ${s}`).join("\n") },
    };
  }

  // Standard
  const concise = `Focus on translating words to an equation, then do the same operation on both sides to isolate the variable.`;
  const check = `Try a quick example and tell me your first step.`;
  return { role: "assistant", text: `${tone.pre}${concise}\n\n${check}${tone.post}` };
}

