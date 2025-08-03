import { useNavigate, useLocation } from "react-router-dom";

const steps = [
  { label: "Teacher • Assessment", route: "/" },
  { label: "Teacher • Grading", route: "/grading" },
  { label: "Student • Practice", route: "/practice" },
  { label: "Student • Tutor", route: "/tutor" },
  { label: "Admin • Dashboard", route: "/admin" },
  { label: "Parent • Digest", route: "/parent" },
];

export default function DemoScript() {
  const nav = useNavigate();
  const loc = useLocation();
  const idx = Math.max(0, steps.findIndex((s) => s.route === loc.pathname));

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="badge">Demo Script</div>
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn secondary"
            disabled={idx <= 0}
            onClick={() => nav(steps[idx - 1].route)}
          >
            ◀ Prev
          </button>
          <div className="badge">{steps[idx]?.label ?? "Start"}</div>
          <button
            className="btn secondary"
            disabled={idx >= steps.length - 1}
            onClick={() => nav(steps[idx + 1].route)}
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
