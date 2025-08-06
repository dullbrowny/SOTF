import React from "react";
import AdminPanelMain from "./AdminPanelMain";
import { adminViewData } from "../../data/mockData/adminView";
console.log("📊 Loaded adminView mockData:", adminView);

console.log("✅ AdminDashboardAdaptive rendered");
console.log("props or data used inside AdminDashboardAdaptive:", /* put your props or mockData here if any */);
const AdminDashboardAdaptive = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <AdminPanelMain data={adminViewData} />
    </div>
  );
};

export default AdminDashboardAdaptive;

