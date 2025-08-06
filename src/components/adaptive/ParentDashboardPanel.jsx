import React from 'react';
import { parentEngagement } from '../../data/mock-engagement-data';

export default function ParentDashboardPanel() {
  return (
    <div className="card mt-4 p-4">
      <h3>👪 Parent Engagement Overview</h3>
      <p>Messages Sent: {parentEngagement.messagesSent}</p>
      <p>Avg Response Time: {parentEngagement.avgResponseTime}</p>
      <p>Participation Rate: {parentEngagement.participationRate}</p>
      <p className="mt-2">🚀 Tip: Send encouragement regularly to improve student motivation!</p>
    </div>
  );
}
