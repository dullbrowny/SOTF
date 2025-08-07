// AdminPanelMain.jsx
import React, { useState } from 'react';
import FiltersPanel from './FiltersPanel';
import ChartsPanel from './ChartsPanel';
import AIInsightsPanel from './AIInsightsPanel';

const AdminPanelMain = () => {
  const [grade, setGrade] = useState('Grade 6');
  const [classSection, setClassSection] = useState('A');
  const [student, setStudent] = useState('Kabir');

  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: '2rem', color: 'white' }}>
      <div style={{ flex: 1 }}>
        <FiltersPanel
          grade={grade}
          setGrade={setGrade}
          classSection={classSection}
          setClassSection={setClassSection}
          student={student}
          setStudent={setStudent}
        />
      </div>
      <div style={{ flex: 2 }}>
        <ChartsPanel student={student} />
      </div>
      <div style={{ flex: 1 }}>
        <AIInsightsPanel student={student} />
      </div>
    </div>
  );
};

export default AdminPanelMain;

