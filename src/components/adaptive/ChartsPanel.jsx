// ✅ ChartsPanel.jsx
import React from 'react';

const ChartsPanel = ({ filters = {} }) => {
  const {
    grade = 'Grade 7',
    class: className = 'A',
    student = 'Kabir'
  } = filters;

  const mockPerformanceData = {
    Math: [80, 85, 90, 95],
    Science: [70, 75, 85, 90],
    English: [88, 82, 85, 91]
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold text-white mb-4">Performance Chart</h2>

      <div className="text-gray-300 mb-4">
        <p>Grade: {grade}</p>
        <p>Class: {className}</p>
        <p>Student: {student}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(mockPerformanceData).map(([subject, scores]) => (
          <div key={subject} className="bg-gray-700 p-3 rounded">
            <h3 className="text-white font-medium mb-2">{subject}</h3>
            <ul className="text-gray-300 text-sm">
              {scores.map((score, idx) => (
                <li key={idx}>Test {idx + 1}: {score}%</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartsPanel;

