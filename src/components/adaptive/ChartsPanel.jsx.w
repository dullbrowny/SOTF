// ChartsPanel.jsx
import React from 'react';

const mockPerformanceData = {
  Kabir: [80, 85, 78],
  Sneha: [90, 92, 95],
  Aarav: [70, 75, 72],
  Meera: [88, 87, 90],
  Dev: [65, 68, 66],
  Isha: [77, 75, 79],
  Rohan: [82, 81, 84],
  Tanvi: [91, 93, 92],
  Aditya: [73, 74, 76],
};

const ChartsPanel = ({ student }) => {
  const data = mockPerformanceData[student] || [];
  return (
    <div style={{ padding: '1rem', backgroundColor: '#222', borderRadius: '8px' }}>
      <h3>{student}'s Performance</h3>
      <ul>
        {data.map((score, idx) => (
          <li key={idx}>Test {idx + 1}: {score}%</li>
        ))}
      </ul>
    </div>
  );
};

export default ChartsPanel;

