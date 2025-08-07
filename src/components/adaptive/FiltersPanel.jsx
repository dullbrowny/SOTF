// ✅ FiltersPanel.jsx
import React from 'react';

const FiltersPanel = ({ filters = {}, setFilters }) => {
  // Safe destructuring with defaults
  const {
    grade = '',
    class: className = '',
    student = '',
  } = filters;

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold text-white mb-2">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-300 mb-1">Grade</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={grade}
            onChange={(e) => handleChange('grade', e.target.value)}
          >
            <option value="">Select Grade</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Class</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={className}
            onChange={(e) => handleChange('class', e.target.value)}
          >
            <option value="">Select Class</option>
            <option value="A">Class A</option>
            <option value="B">Class B</option>
            <option value="C">Class C</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Student</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={student}
            onChange={(e) => handleChange('student', e.target.value)}
          >
            <option value="">Select Student</option>
            <option value="Kabir">Kabir</option>
            <option value="Tara">Tara</option>
            <option value="Ravi">Ravi</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;

