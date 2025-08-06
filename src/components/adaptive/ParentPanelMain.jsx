import React, { useState } from 'react';
import ParentStudentPanel from './ParentStudentPanel';
import ParentTeacherPanel from './ParentTeacherPanel';
import ParentAdminPanel from './ParentAdminPanel';

const ParentPanelMain = () => {
  const [view, setView] = useState('Student');

  return (
    <div className="adaptive-panel">
      <div className="tab-buttons">
        {['Student', 'Teacher', 'Admin'].map(role => (
          <button key={role} onClick={() => setView(role)} className={view === role ? 'active' : ''}>{role} View</button>
        ))}
      </div>
      <div className="panel-content">
        {view === 'Student' && <ParentStudentPanel />}
        {view === 'Teacher' && <ParentTeacherPanel />}
        {view === 'Admin' && <ParentAdminPanel />}
      </div>
    </div>
  );
};

export default ParentPanelMain;
