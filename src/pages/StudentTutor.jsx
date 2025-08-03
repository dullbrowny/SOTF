import React, { useState } from 'react';
import mockChat from '../mock/chat.json';

export default function StudentTutor() {
  const [messages] = useState(mockChat);
  return (
    <div style={{ padding: '20px' }}>
      <h1>AI Tutor Chat</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.role}:</strong> {msg.content}</p>
        ))}
      </div>
    </div>
  );
}