import React from "react";
import Navbar from "../../components/Dashboard/Navbar/Navbar.jsx";
import ActiveLastBreadcrumb from "../../components/Dashboard/ActiveLastBreadcrumb";
import DatePicker from "../../components/Dashboard/DatePicker";
import Linecharts from "../../components/Dashboard/Expense/charts/Linecharts.jsx";

const Dashboard = () => {
  return (
    <>
      <div>
        <ActiveLastBreadcrumb />
        <DatePicker />  
        This is Dashboard
        <Linecharts />
      </div>
    </>
  );
};

export default Dashboard;