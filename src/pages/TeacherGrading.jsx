import React from 'react';
import mockGrades from '../mock/grading.json';

export default function TeacherGrading() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Auto-Grading Dashboard</h1>
      <p>Average grading time reduced from 6 hrs → 2 hrs</p>
      <ul>
        {mockGrades.map((g, i) => (
          <li key={i}>
            <strong>{g.student}</strong>: {g.feedback} (Confidence: {g.confidence}%)
          </li>
        ))}
      </ul>
    </div>
  );
}