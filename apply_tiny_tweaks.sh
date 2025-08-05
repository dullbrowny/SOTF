#!/usr/bin/env bash
set -euo pipefail

# Detect BSD vs GNU sed -i
if sed --version >/dev/null 2>&1; then
  SED_INPLACE=(-i)
else
  SED_INPLACE=(-i '')
fi

changed=0

# ---------- 1) CSS: compact button, sticky rails, taller chat ----------
css="src/styles/adaptive.css"
if [ -f "$css" ] && ! grep -q '\.btn\.compact' "$css"; then
  cp "$css" "$css.bak.$(date +%s)"
  cat >> "$css" <<'CSS'

/* Compact CTA used in dense toolbars (Tutor header) */
.btn.compact { padding: 6px 10px; font-size: 13px; border-radius: 10px; }

/* Keep rails visible while center content scrolls */
.practice-grid .left,
.practice-grid .right {
  position: sticky;
  top: 96px;      /* adjust if your top bar height differs */
  align-self: start;
}

/* Taller chat card with internal scroll */
.tutor-chat {
  display: grid;
  grid-template-rows: 1fr auto;
  height: 60vh;   /* was ~46vh */
}
CSS
  echo "✔ CSS tweaks appended to $css"
  changed=1
else
  echo "• CSS already contains compact/sticky/tutor-chat rules or file missing."
fi

# ---------- 2) Data: add ALG.LE.Q2 mini-lesson ----------
ml="src/data/mini-lessons.js"
if [ -f "$ml" ] && ! grep -q '"ALG.LE.Q2"' "$ml"; then
  cp "$ml" "$ml.bak.$(date +%s)"
  # Insert before the final closing brace };
  awk '
    BEGIN{added=0}
    /};[[:space:]]*$/ && added==0 {
      print "  ,"
      print "  \"ALG.LE.Q2\": {"
      print "    title: \"Two-step Linear Equations (120s)\","
      print "    bullets: ["
      print "      \"Undo addition/subtraction first, then undo multiplication/division.\","
      print "      \"Keep both sides balanced at every step.\","
      print "      \"Check by substitution.\""
      print "    ],"
      print "    diagram: \"two-step.svg\","
      print "    quickCheck: {"
      print "      kind: \"numeric\","
      print "      stem: \"Solve 2x + 3 = 11\","
      print "      answer: 4"
      print "    }"
      print "  }"
      added=1
    }
    { print }
  ' "$ml" > "$ml.tmp" && mv "$ml.tmp" "$ml"
  echo "✔ Added ALG.LE.Q2 mini-lesson to $ml"
  changed=1
else
  echo "• mini-lessons already contains ALG.LE.Q2 or file missing."
fi

# ---------- 3) Tutor page tweaks ----------
tp="src/pages/StudentTutorChat.jsx"
if [ -f "$tp" ]; then
  cp "$tp" "$tp.bak.$(date +%s)"

  # 3a) Make the CTA compact (only the Make a practice set link)
  if grep -q 'Make a practice set' "$tp"; then
    # add .compact if not present on that Link
    if ! grep -q 'className="btn compact"' "$tp"; then
      "${SED_INPLACE[@]}" 's/className="btn" to={practiceHref} title="Create a practice set from these settings"/className="btn compact" to={practiceHref} title="Create a practice set from these settings"/' "$tp" || true
      "${SED_INPLACE[@]}" 's/className="btn" to={practiceHref}/className="btn compact" to={practiceHref}/' "$tp" || true
    fi
  fi

  # 3b) Replace chat section inline style with .tutor-chat class (keep marginBottom)
  if grep -q 'gridTemplateRows: "1fr auto"' "$tp"; then
    "${SED_INPLACE[@]}" 's/section className="card" style={{ display: "grid", gridTemplateRows: "1fr auto", height: "46vh", marginBottom: 12 }}/section className="card tutor-chat" style={{ marginBottom: 12 }}/' "$tp"
  fi

  # 3c) Replace generateReply implementation with mode-aware version
  if grep -n 'function generateReply' "$tp" >/dev/null; then
    # Delete existing function block up to the next function declaration
    start=$(grep -n 'function generateReply' "$tp" | head -1 | cut -d: -f1)
    if [ -n "$start" ]; then
      # find end: the next function line after start
      end=$(awk "NR>$start && /function [a-zA-Z0-9_]+\(/ {print NR; exit}" "$tp")
      if [ -z "$end" ]; then end=$(wc -l < "$tp"); fi
      # Build new file
      head -n $((start-1)) "$tp" > "$tp.new"
      cat >> "$tp.new" <<'JS'
function generateReply(userText, ctx) {
  const { mode, comfort, topic } = ctx;

  const tone = {
    "Not at all": { pre: "No worries—let’s go slow. ", post: " You’re doing fine; we’ll build it step by step." },
    "A bit":      { pre: "Alright, let’s unpack that. ", post: " Tell me where it still feels fuzzy." },
    "Mostly":     { pre: "", post: " Quick check: can you restate the key idea in one line?" },
    "I’ve got it":{ pre: "", post: "" }
  }[comfort] || { pre: "", post: "" };

  const standard = () =>
    `${tone.pre}In ${topic}, translate words into an equation and perform the same operation on both sides to isolate the variable.${tone.post}`;

  const eli5 = () =>
    `${tone.pre}Think of the equation like a see-saw: if you add 3 on one side, add 3 on the other so it stays level. Keep doing the opposite action until x is alone.${tone.post}`;

  const steps = () => ({
    text: `${tone.pre}Here’s a short plan for ${topic}.${tone.post}`,
    meta: {
      expand: [
        "1) Write the equation clearly.",
        "2) Identify the operation on x.",
        "3) Apply the inverse operation to both sides.",
        "4) Simplify and check."
      ].join("\n")
    }
  });

  const socratic = () => ({
    text: `${tone.pre}If the equation is 2x + 5 = 13, what's the very first thing you'd do to both sides?${tone.post}`
  });

  switch (mode) {
    case "ELI5":     return { role: "assistant", text: eli5() };
    case "Steps":    return { role: "assistant", ...steps() };
    case "Socratic": return { role: "assistant", ...socratic() };
    default:         return { role: "assistant", text: standard() };
  }
}
JS
      tail -n +"$end" "$tp" >> "$tp.new"
      mv "$tp.new" "$tp"
    fi
  fi

  echo "✔ Updated $tp"
  changed=1
else
  echo "• $tp not found; skipped."
fi

if [ $changed -eq 0 ]; then
  echo "Nothing changed. (Likely already applied)"
fi
