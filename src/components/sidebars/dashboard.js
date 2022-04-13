import React from "react";

const DashboardSidebar = () => {
  return (
    <div className="flex flex-col bg-slate-600 w-60 pt-4 items-center sm:w-20">
      <img
        href="#"
        className="w-4 h-4"
        src={require("../../assets/assets/hamburger.png")}
      />
    </div>
  );
};

export default DashboardSidebar;