// Place this in: src/components/charts/HomeworkLineChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { week: 'Week 1', Math: 80, Science: 75 },
  { week: 'Week 2', Math: 85, Science: 65 },
  { week: 'Week 3', Math: 60, Science: 70 },
];

const HomeworkLineChart = () => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="week" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="Math" stroke="#8884d8" />
      <Line type="monotone" dataKey="Science" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
);

export default HomeworkLineChart;

