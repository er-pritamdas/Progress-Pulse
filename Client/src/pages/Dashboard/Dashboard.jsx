import React from "react";
import Navbar from "../../components/Dashboard/Navbar";
import ActiveLastBreadcrumb from "../../components/Dashboard/ActiveLastBreadcrumb";
import DatePicker from "../../components/Dashboard/DatePicker";

const Dashboard = () => {
  return (
    <>
      <div>
        <ActiveLastBreadcrumb />
        <DatePicker />  
        This is Dashboard
      </div>
    </>
  );
};

export default Dashboard;