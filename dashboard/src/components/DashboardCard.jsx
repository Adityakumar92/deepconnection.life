import React from "react";

const DashboardCard = ({ title, value, icon: Icon, bgColor }) => {
  return (
    <div className={`p-5 rounded-xl shadow-md text-white ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>
        {Icon && <Icon size={40} />}
      </div>
    </div>
  );
};

export default DashboardCard;
