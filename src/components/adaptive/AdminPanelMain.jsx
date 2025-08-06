import React from "react";
import AdminStudentPanel from "./AdminStudentPanel";
import AdminParentPanel from "./AdminParentPanel";
import AdminTeacherPanel from "./AdminTeacherPanel";

const AdminPanelMain = ({ data }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <AdminStudentPanel data={data.Student} />
      <AdminParentPanel data={data.Parent} />
      <AdminTeacherPanel data={data.Teacher} />
    </div>
  );
};

export default AdminPanelMain;

