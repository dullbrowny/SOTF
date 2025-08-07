import React from 'react';

const AIInsightsPanel = ({ grade, classSection, student }) => {
  const actions = {
    Kabir: [
      'Needs improvement in Science.',
      'Recommend Mock Test for Science.',
      'Schedule additional Math class.',
      'Send letter to parents regarding late submissions.',
    ],
    Aarav: [
      'Excellent performance.',
      'Encourage participation in Math Olympiad.',
    ],
    Anaya: [
      'High scores across subjects.',
      'Recommend mentoring peers.',
    ],
  };

  const insights = actions[student] || ['Select a grade/class/student to view insights.'];

  return (
    <div>
      <h3>AI-Generated Insights</h3>
      <ul style={{ paddingLeft: '1rem' }}>
        {insights.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
        ))}
      </ul>

      <div>
        {insights.some(text => text.toLowerCase().includes('mock')) && (
          <button onClick={() => alert('Mock test scheduled')}>📘 Schedule Mock Test</button>
        )}
        {insights.some(text => text.toLowerCase().includes('class')) && (
          <button onClick={() => alert('Extra class scheduled')}>📗 Schedule Extra Class</button>
        )}
        {insights.some(text => text.toLowerCase().includes('letter')) && (
          <button onClick={() => alert('Letter sent to parents')}>📨 Send Letter</button>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;

