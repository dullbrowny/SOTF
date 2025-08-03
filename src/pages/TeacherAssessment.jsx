import React, { useState, useEffect } from 'react';
import mockData from '../mock/assessment.json';

export default function TeacherAssessment() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(mockData);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Assessment Studio</h1>
      <button onClick={() => setQuestions(mockData)}>Generate with AI</button>
      <ul>
        {questions.map((q, i) => (
          <li key={i}>
            <strong>{q.question}</strong>
            <ul>
              {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
            </ul>
            <p><em>Rubric: {q.rubric}</em></p>
          </li>
        ))}
      </ul>
    </div>
  );
}