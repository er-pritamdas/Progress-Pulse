import React from "react";
import Navbar from "../../components/Dashboard/Navbar/Navbar.jsx";
import ActiveLastBreadcrumb from "../../components/Dashboard/ActiveLastBreadcrumb";
import DatePicker from "../../components/Dashboard/DatePicker";
import Linecharts from "../../components/Dashboard/Expense/charts/Linecharts.jsx";
import { TitleChanger } from "../../utils/TitleChanger.jsx";
import BrushBarChart  from "../../components/Dashboard/Habit/Charts/BrushBarChart.jsx"


const Dashboard = () => {
  TitleChanger("Progress Pulse | Dashboard")
  
  const user = localStorage.getItem("username");
  return (
    <>
      <div>
        {/* <ActiveLastBreadcrumb /> */}
        {/* <DatePicker />   */}
        Welcome {user} to your dashboard!
        <BrushBarChart />
        <Linecharts />
        <Linecharts />
        <Linecharts />
        <Linecharts />
        <Linecharts />
        <Linecharts />
        <Linecharts />
        <Linecharts />

      </div>
    </>
  );
};

export default Dashboard;