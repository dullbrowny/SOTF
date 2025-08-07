import React from "react";
import AdminPanelMain from "./AdminPanelMain";
import { adminViewData } from "../../data/mockData/adminView";
const AdminDashboardAdaptive = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <AdminPanelMain data={adminViewData} />
    </div>
  );
};

export default AdminDashboardAdaptive;

