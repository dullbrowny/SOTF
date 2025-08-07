// AIInsightsPanel.jsx
import React from 'react';

const mockInsights = {
  Kabir: ['Struggles with geometry', 'Improved in reading comprehension'],
  Sneha: ['Strong in all subjects', 'Could assist peers'],
  Aarav: ['Needs help with fractions', 'Consistent in science'],
  Meera: ['Excels in math', 'Could use more writing practice'],
  Dev: ['Needs more focus in class', 'Showing improvement in social science'],
  Isha: ['Consistent across subjects', 'Works well in teams'],
  Rohan: ['Has leadership potential', 'Keep encouraging critical thinking'],
  Tanvi: ['Excellent grasp of topics', 'Keep engaged with advanced material'],
  Aditya: ['Occasional lapses in attention', 'Encourage more participation'],
};

const AIInsightsPanel = ({ student }) => {
  const insights = mockInsights[student] || [];

  return (
    <div style={{ padding: '1rem', backgroundColor: '#2b2b2b', borderRadius: '8px' }}>
      <h3>AI Insights for {student}</h3>
      <ul>
        {insights.map((tip, idx) => (
          <li key={idx}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};

export default AIInsightsPanel;

