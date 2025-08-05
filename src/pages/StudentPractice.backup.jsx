import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/mockApi";

const DEFAULTS = {
  subject: "Math",
  grade: "8",
  topic: "Linear Equations",
  difficulty: "easy",
  distractors: "numeric",
  count: 5,
};

export default function StudentPractice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // --- Controls ---
  const [subject, setSubject] = useState(searchParams.get("subject") || DEFAULTS.subject);
  const [grade, setGrade] = useState(searchParams.get("grade") || DEFAULTS.grade);
  const [topic, setTopic] = useState(searchParams.get("topic") || DEFAULTS.topic);
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || DEFAULTS.difficulty);
  const [distractors, setDistractors] = useState(searchParams.get("distractors") || DEFAULTS.distractors);
  const [count, setCount] = useState(Number(searchParams.get("count")) || DEFAULTS.count);

  // --- Session ---
  const [sessionState, setSessionState] = useState("idle"); // idle | active | finished
  const [items, setItems] = useState([]);                   // normalized items
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");

  const activeItem = items[idx] || null;
  const total = items.length;
  const progressPct = useMemo(() => (total > 0 ? Math.round((idx / total) * 100) : 0), [idx, total]);

  // Sync URL ONLY when it would actually change (prevents update-depth loop)
  useEffect(() => {
    const desired = new URLSearchParams({
      subject,
      grade,
      topic,
      difficulty,
      distractors,
      count: String(count),
      ...(searchParams.get("from") ? { from: "tutor" } : {}),
    }).toString();

    if (desired !== searchParams.toString()) {
      setSearchParams(desired, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, topic, difficulty, distractors, count]);

  // Auto-start when coming from Tutor (once per landing) if no active session
  useEffect(() => {
    const fromTutor = searchParams.get("from") === "tutor";
    if (fromTutor && sessionState === "idle" && items.length === 0) {
      generate(true);
    }
    // run when the URL changes (e.g., navigating back from Tutor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Enter => Next while feedback is shown
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Enter" && revealed) {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, idx, total]);

  async function generate(isAuto = false) {
    if (sessionState === "active") return;
    setError("");
    setSessionState("idle");
    setItems([]);
    setIdx(0);
    setSelected(null);
    setRevealed(false);

    try {
      const seed = Date.now().toString();
      const params = { subject, grade, topic, difficulty, distractors, count, seed };
      const raw = await api.generatePracticeItems(params);

      const normalized = Array.isArray(raw) ? raw.map(normalizePracticeItem) : [];
      // Filter out malformed entries defensively
      const safe = normalized.filter(
        (it) => it && typeof it.stem === "string" && Array.isArray(it.options) && Number.isInteger(it.correct)
      );

      if (safe.length === 0) {
        setError("No questions were generated. Try adjusting controls and Generate again.");
        setSessionState("idle");
        return;
      }
      setItems(safe);
      setSessionState("active");
    } catch (e) {
      setError("Failed to generate items.");
      setSessionState("idle");
    }
  }

  function restart() {
    setSessionState("idle");
    setItems([]);
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setError("");
  }

  function selectOption(opt) {
    if (!activeItem || revealed) return;
    setSelected(opt);
  }

  function reveal() {
    if (!activeItem || selected == null) return;
    setRevealed(true);
  }

  function handleNext() {
    if (!revealed) return;
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setSessionState("finished");
    }
  }

  function generateSimilar() {
    generate();
  }

  const disableGenerate = sessionState === "active";
  const generateTitle = disableGenerate ? "Finish or Restart to generate a new set" : "Generate a practice set";

  return (
    <div className="container" style={{ maxWidth: 920 }}>
      {/* Header */}
      <header className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>
          Personalized Practice{" "}
          {sessionState === "active" && total ? (
            <small> • Question {idx + 1} of {total}</small>
          ) : null}
        </h2>
        <div className="row">
          <button onClick={restart} className="btn secondary" title="Clear and start fresh" disabled={sessionState === "idle"}>
            Restart
          </button>
          <button
            onClick={() => generate()}
            className="btn"
            title={generateTitle}
            disabled={disableGenerate}
            style={disableGenerate ? { opacity: 0.6, cursor: "not-allowed" } : {}}
          >
            {sessionState === "active" ? "Generate (disabled)" : "Generate"}
          </button>
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

        {sessionState === "active" && total > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Question {idx + 1} of {total}</div>
            <div className="progress"><span style={{ width: `${progressPct}%` }} /></div>
          </div>
        )}
      </section>

      {/* Body */}
      {error && (
        <div className="card" style={{ marginBottom: 12, borderColor: "#c2410c" }}>
          <div style={{ color: "#fca5a5" }}>{error}</div>
        </div>
      )}

      {sessionState === "idle" && !error && (
        <EmptyState
          title="Ready to practice?"
          subtitle="Set your controls and click Generate. If you arrived from Tutor, generating will mirror those settings."
        />
      )}

      {sessionState === "active" && activeItem && (
        <QuestionCard
          item={activeItem}
          selected={selected}
          revealed={revealed}
          onSelect={selectOption}
          onReveal={reveal}
          onNext={handleNext}
        />
      )}

      {sessionState === "finished" && (
        <CompletionCard
          onAgain={generateSimilar}
          backHref={`/tutor?subject=${encodeURIComponent(subject)}&grade=${encodeURIComponent(grade)}&topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}`}
        />
      )}
    </div>
  );
}

function normalizePracticeItem(raw) {
  // mockApi.generatePracticeItems shape:
  // { id, stem, answer: string, rubric: string, choices: string[] }
  const stem = raw?.stem ?? raw?.question ?? raw?.prompt ?? "";
  const options = Array.isArray(raw?.choices) ? raw.choices.slice(0, 8) : []; // cap defensively
  // find the index of the exact (or trimmed) match; fall back to 0
  let correct = null;
  if (options.length) {
    const ans = String(raw?.answer ?? "").trim();
    const idx = options.findIndex(
      (o) => String(o).trim() === ans
    );
    correct = idx >= 0 ? idx : 0;
  }
  const rubricHint = raw?.rubric ?? raw?.hint ?? "";

  return { stem, options, correct, rubricHint };
}


function Labeled({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{subtitle}</p>
    </div>
  );
}

function QuestionCard({ item, selected, revealed, onSelect, onReveal, onNext }) {
  const hasOptions = Array.isArray(item.options);
  const isCorrect = selected != null && selected === item.correct;

  if (!hasOptions) {
    return (
      <div className="card">
        <div style={{ color: "#fca5a5" }}>This question is malformed (no options). Use Restart or Generate again.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ marginBottom: 12, fontWeight: 600 }}>{item.stem}</div>

      <div className="grid">
        {item.options.map((opt, i) => {
          const chosen = selected === i;
          const showCheck = revealed && i === item.correct;
          const showCross = revealed && chosen && !showCheck;

          return (
            <button
              key={i}
              className={`btn secondary`}
              onClick={() => onSelect(i)}
              disabled={revealed}
              style={{
                justifyContent: "flex-start",
                border:
                  chosen && !revealed ? "1px solid #9ca3af" :
                  showCheck ? "1px solid #22d3ee" :
                  showCross ? "1px solid #ef4444" : undefined,
                background:
                  chosen && !revealed ? "#0b1220" :
                  showCheck ? "rgba(34,211,238,0.08)" :
                  showCross ? "rgba(239,68,68,0.08)" : undefined
              }}
            >
              <span style={{ marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>
              <span>{opt}</span>
              {showCheck && <span style={{ marginLeft: "auto" }}>✅</span>}
              {showCross && <span style={{ marginLeft: "auto" }}>❌</span>}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={onReveal} disabled={selected == null}>
            Check answer
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            {isCorrect ? "✅ Correct!" : "❌ Not quite."}{" "}
            {!isCorrect && (
              <span>
                Correct answer: <strong>{String.fromCharCode(65 + item.correct)}</strong>
              </span>
            )}
          </div>
          {item.rubricHint && (
            <div className="card" style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
              <strong>Hint:</strong> {item.rubricHint}
            </div>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={onNext}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionCard({ onAgain, backHref }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h3 style={{ marginTop: 0 }}>You’re done! 🎉</h3>
      <p style={{ color: "var(--muted)" }}>Great work. Want to keep going or return to the Tutor?</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn" onClick={onAgain}>Generate similar set</button>
        <Link to={backHref} className="btn secondary">Back to Tutor</Link>
      </div>
    </div>
  );
}

