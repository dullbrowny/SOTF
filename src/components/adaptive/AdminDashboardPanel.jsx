import React from 'react';
import { classEngagementData, teacherEngagement } from '../../data/mock-engagement-data';

export default function AdminDashboardPanel() {
  return (
    <div className="card mt-4 p-4">
      <h3>📊 Class Overview Panel</h3>
      <ul>
        {classEngagementData.map((s) => (
          <li key={s.student}>{s.student}: Mastery {s.mastery}%, Engagement {s.engagement}/class</li>
        ))}
      </ul>
      <h4 className="mt-4">👩‍🏫 Teacher Snapshot: {teacherEngagement.name}</h4>
      <p>Sessions Conducted: {teacherEngagement.sessionsConducted}</p>
      <p>Avg Rating: {teacherEngagement.avgRating}</p>
      <p>Feedback: {teacherEngagement.feedback}</p>
    </div>
  );
}
