import React from "react";
import Sparkline from "./Sparkline";

const AdminParentPanel = ({ data }) => {
  return (
    <div className="panel parent-panel">
      <h3>👨‍👩‍👧 Parent Panel</h3>
      <p><strong>Feedback Count:</strong> {data.feedbackCount}</p>
      <p><strong>Feedback Trends:</strong></p>
      <Sparkline data={data.feedbackTrends} />
    </div>
  );
};

export default AdminParentPanel;

