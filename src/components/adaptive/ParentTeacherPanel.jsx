import React from 'react';
import EngagementCard from '../EngagementCard';

const ParentTeacherPanel = ({ data }) => (
  <div>
    {data.map((item, idx) => (
      <EngagementCard key={idx} {...item} />
    ))}
  </div>
);

export default ParentTeacherPanel;
