import React from 'react';
import { AdaptiveDashboardPanel } from './AdaptiveDashboardPanel';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { PiChartBarFill } from 'react-icons/pi';
import { RiAlertLine } from 'react-icons/ri';
import { adminViewData } from '../../data/mockData/adminView';



const AdminTeacherPanel = () => {
  const data = adminViewData?.teacherView;

  if (!data) {
    return <div className="text-red-500">No data available for Teacher View</div>;
  }

  return (
    <div className="space-y-4">
      <AdaptiveDashboardPanel
        title={<><FaChalkboardTeacher className="inline-block mr-2" /> Teacher KPIs and Alerts</>}
        subtitle="Performance metrics and alerts for faculty effectiveness."
        items={data.map((item) => ({
          ...item,
          icon: item.alert ? <RiAlertLine className="text-yellow-400" /> : <PiChartBarFill className="text-green-400" />,
        }))}
      />
    </div>
  );
};

export default AdminTeacherPanel;

