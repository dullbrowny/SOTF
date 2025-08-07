// ✅ AIInsightsPanel.jsx
import React from 'react';

const AIInsightsPanel = ({ filters = {} }) => {
  const {
    grade = 'Grade 7',
    class: className = 'A',
    student = 'Kabir'
  } = filters;

  const mockInsights = [
    {
      title: 'Math Mastery Alert',
      insight: `${student} has shown strong improvement in Algebra but struggles with Geometry. Focus on spatial reasoning exercises.`
    },
    {
      title: 'Reading Comprehension Drop',
      insight: `${student}'s recent assessments show a drop in inference skills. Suggest reading narrative texts with guiding questions.`
    },
    {
      title: 'Science Curiosity Spike',
      insight: `${student} has shown increased interest in experiments. Encourage hands-on activities related to current curriculum.`
    }
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-white mb-4">AI-Generated Insights</h2>

      <div className="text-gray-300 mb-4">
        <p>Grade: {grade}</p>
        <p>Class: {className}</p>
        <p>Student: {student}</p>
      </div>

      <ul className="space-y-4">
        {mockInsights.map((insight, idx) => (
          <li key={idx} className="bg-gray-700 p-3 rounded text-gray-200">
            <h3 className="font-semibold text-white">{insight.title}</h3>
            <p className="text-sm">{insight.insight}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIInsightsPanel;

