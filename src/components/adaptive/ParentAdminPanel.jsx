import React from 'react';
import EngagementCard from '../EngagementCard';

const ParentAdminPanel = ({ data }) => (
  <div>
    {data.map((item, idx) => (
      <EngagementCard key={idx} {...item} />
    ))}
  </div>
);

export default ParentAdminPanel;
