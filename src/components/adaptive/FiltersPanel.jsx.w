// FiltersPanel.jsx
import React from 'react';

const FiltersPanel = ({ grade, setGrade, classSection, setClassSection, student, setStudent }) => {
  const grades = ['Grade 6', 'Grade 7', 'Grade 8'];
  const classSections = ['A', 'B', 'C'];
  const studentsByClass = {
    'Grade 6-A': ['Kabir', 'Sneha', 'Aarav'],
    'Grade 6-B': ['Isha', 'Rohan'],
    'Grade 7-A': ['Meera', 'Dev'],
    'Grade 8-C': ['Tanvi', 'Aditya']
  };

  const studentOptions = studentsByClass[`${grade}-${classSection}`] || [];

  return (
    <div style={{ padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
      <h3>Filters</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label>Grade:</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          {grades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Class:</label>
        <select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
          {classSections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Student:</label>
        <select value={student} onChange={(e) => setStudent(e.target.value)}>
          {studentOptions.map((stu) => (
            <option key={stu} value={stu}>{stu}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltersPanel;

