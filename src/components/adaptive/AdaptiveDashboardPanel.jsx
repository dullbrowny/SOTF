import React from "react";
import AdminDashboardAdaptive from "./AdminDashboard.adaptive";
import ParentDigestAdaptive from "./ParentDigest.adaptive";
// import StudentPracticeAdaptive from "./StudentPractice.adaptive"; // 🔴 Not yet implemented

export const AdaptiveDashboardPanel = ({ role, data }) => {
  if (!data) return <div>No data available for role: {role}</div>;

  return (
    <div>
      {role === "Admin" && <AdminDashboardAdaptive />}
      {role === "Parent" && <ParentDigestAdaptive />}
      {/* {role === "Student" && <StudentPracticeAdaptive />} // 🔴 Temporarily disabled */}
    </div>
  );
};

