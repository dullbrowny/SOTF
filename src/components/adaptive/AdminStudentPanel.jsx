import React from "react";
import Sparkline from "../Sparkline";

const AdminStudentPanel = ({ data }) => {
  return (
    <div className="panel student-panel">
      <h3>📚 Student Panel</h3>
      <p><strong>Scores:</strong> {data.scores.join(", ")}</p>
      <Sparkline data={data.scores} />

      <p><strong>Engagement:</strong></p>
      <Sparkline data={data.engagement} />

      <p><strong>Attendance:</strong> {data.attendance}</p>
    </div>
  );
};

export default AdminStudentPanel;

