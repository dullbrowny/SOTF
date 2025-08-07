import React from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  RadarController,
  PointElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  BarElement,
  RadarController,
  PointElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const getMockData = (student) => {
  const studentScores = {
    Kabir: [75, 68, 80, 85, 78],
    Aarav: [85, 82, 79, 91, 89],
    Anaya: [92, 90, 94, 89, 93],
  };

  const subjectScores = {
    Kabir: [78, 67, 85, 64],
    Aarav: [90, 85, 88, 84],
    Anaya: [94, 92, 95, 91],
  };

  const radarScores = {
    Kabir: [4, 3, 4, 2, 3],
    Aarav: [5, 5, 4, 4, 5],
    Anaya: [5, 4, 5, 5, 4],
  };

  return {
    line: studentScores[student] || [70, 72, 74, 76, 78],
    bar: subjectScores[student] || [80, 75, 85, 70],
    radar: radarScores[student] || [3, 3, 3, 3, 3],
  };
};

const ChartsPanel = ({ grade, classSection, student }) => {
  const mock = getMockData(student);

  return (
    <div>
      <h3>Performance Overview</h3>
      <Line
        data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [
            {
              label: 'Score',
              data: mock.line,
              fill: false,
              borderColor: '#8884d8',
              tension: 0.3,
            },
          ],
        }}
        height={150}
      />

      <Bar
        data={{
          labels: ['Math', 'Science', 'English', 'History'],
          datasets: [
            {
              label: 'Scores',
              data: mock.bar,
              backgroundColor: '#82ca9d',
            },
          ],
        }}
        height={150}
      />

      <Radar
        data={{
          labels: ['Participation', 'Homework', 'Test', 'Project', 'Engagement'],
          datasets: [
            {
              label: 'Skill Radar',
              data: mock.radar,
              backgroundColor: 'rgba(135, 206, 235, 0.5)',
              borderColor: '#00bfff',
              pointBackgroundColor: '#00bfff',
            },
          ],
        }}
        height={200}
      />
    </div>
  );
};

export default ChartsPanel;

