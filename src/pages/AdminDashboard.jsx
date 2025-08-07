import React from "react";
import AdminPanelMain from "../components/adaptive/AdminPanelMain";
import { adminViewData } from "../data/mockData/adminView"; // adjust path if needed

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminPanelMain data={adminViewData} />
    </div>
  );
};

export default AdminDashboard;

