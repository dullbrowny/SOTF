import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ParentPanelMain.css';

const studentPerformance = [
  { week: 'Week 1', score: 68 },
  { week: 'Week 2', score: 72 },
  { week: 'Week 3', score: 78 },
  { week: 'Week 4', score: 75 },
  { week: 'Week 5', score: 82 },
  { week: 'Week 6', score: 88 },
];

const ParentPanelMain = () => {
  return (
    <div className="panel-container">
      {/* Left Panel: Summary */}
      <div className="panel">
        <h2>Student Summary</h2>
        <ul>
          <li><strong>Name:</strong> Arjun Rao</li>
          <li><strong>Grade:</strong> 7</li>
          <li><strong>Average Attendance:</strong> 92%</li>
          <li><strong>Subjects at Risk:</strong> Math, Science</li>
        </ul>
      </div>

      {/* Center Panel: Engagement Chart */}
      <div className="panel">
        <h2>Engagement Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={studentPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Right Panel: AI Insights */}
      <div className="panel">
        <h2>AI-Driven Suggestions</h2>
        <ul>
          <li>Math engagement dropped in Week 3. Suggest extra class.</li>
          <li>Peer mentoring could help with Science retention.</li>
          <li>Encourage participation in quiz club (verbal skills improving).</li>
        </ul>
        <button className="action-btn">Schedule Extra Class</button>
        <button className="action-btn">Send Progress Letter</button>
        <button className="action-btn">Request Teacher Meeting</button>
      </div>
    </div>
  );
};

export default ParentPanelMain;

