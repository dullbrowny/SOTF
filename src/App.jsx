// src/App.jsx
import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDemoData } from "./demoData.jsx";

import TeacherAssessmentStudio from "./pages/TeacherAssessmentStudio.jsx";
import TeacherAutoGrading from "./pages/TeacherAutoGrading.jsx";
import StudentPractice from "./pages/StudentPractice.jsx";
import StudentTutorChat from "./pages/StudentTutorChat.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ParentDigest from "./pages/ParentDigest.jsx";
import DemoScript from "./components/DemoScript.jsx";

/** Top-right "Demo data" switcher — driven by global grade */
function DatasetSwitcher() {
  const { grade, setGrade } = useDemoData();
  const onChange = (e) => {
    const v = e.target.value;         // e.g., "g7"
    const gMatch = (v || "").match(/\d+/);
    if (gMatch && typeof setGrade === "function") setGrade(gMatch[0]);
  };
  return (
    <div className="row">
      <span className="badge">Demo data</span>
      <select aria-label="Demo dataset grade" value={`g${grade || "7"}`} onChange={onChange}>
        <option value="g6">Grade 6</option>
        <option value="g7">Grade 7</option>
        <option value="g8">Grade 8</option>
        <option value="g9">Grade 9</option>
        <option value="g10">Grade 10</option>
      </select>
    </div>
  );
}

function RoleSwitcher() {
  const nav = useNavigate();
  const [val, setVal] = useState("");
  const onChange = (e) => {
    const v = e.target.value;
    setVal(v);
    if (!v) return;
    nav(v);
    setTimeout(() => setVal(""), 0);
  };
  return (
    <div className="row">
      <span className="badge">Role</span>
      <select aria-label="Open as role" value={val} onChange={onChange}>
        <option value="">Open as…</option>
        <option value="/">Teacher – Assessment</option>
        <option value="/grading">Teacher – Grading</option>
        <option value="/practice">Student – Practice</option>
        <option value="/tutor">Student – Tutor</option>
        <option value="/admin">Admin – Dashboard</option>
        <option value="/parent">Parent – Digest</option>
      </select>
    </div>
  );
}

export default function App() {
  const { setGrade } = useDemoData();
  const loc = useLocation();
  const nav = useNavigate();

  // Deep-link support: ?dataset=g7&route=/admin
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    const ds = p.get("dataset"); // e.g., "g7"
    const route = p.get("route");
    if (ds) {
      const gMatch = ds.match(/\d+/);
      if (gMatch && typeof setGrade === "function") setGrade(gMatch[0]);
    }
    if (route) nav(route, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <nav className="nav" role="navigation" aria-label="Global">
        <div className="inner">
          <div className="row">
            <strong>School of the Future PoC</strong>
            <span className="badge">Demo • Mock Data</span>
          </div>

          <div className="links" role="tablist" aria-label="Primary pages">
            {[
              { to: "/", label: "Assessment", end: true },
              { to: "/grading", label: "Grading" },
              { to: "/practice", label: "Practice" },
              { to: "/tutor", label: "Tutor" },
              { to: "/admin", label: "Admin" },
              { to: "/parent", label: "Parent" },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="row" style={{ gap: 12 }}>
            <DatasetSwitcher />
            <RoleSwitcher />
          </div>
        </div>
      </nav>

      <div className="container">
        <DemoScript />
        <Routes>
          <Route path="/" element={<TeacherAssessmentStudio />} />
          <Route path="/grading" element={<TeacherAutoGrading />} />
          <Route path="/practice" element={<StudentPractice />} />
          <Route path="/tutor" element={<StudentTutorChat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/parent" element={<ParentDigest />} />
        </Routes>
      </div>

      {/* Active-tab underline + small visual tweaks */}
      <style>{`
        .links .navlink {
          position: relative;
          padding-bottom: 6px;
        }
        .links .navlink.active::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 2px;
          background: #ef4444; /* red-500 */
          border-radius: 2px;
        }
        @media (hover:hover) {
          .links .navlink:not(.active):hover::after {
            content: "";
            position: absolute;
            left: 20%; right: 20%; bottom: -2px;
            height: 2px; background: #374151; border-radius:2px;
          }
        }
      `}</style>
    </div>
  );
}

