import React from "react";
import Navbar from "../../components/Dashboard/Navbar/Navbar.jsx";
import ActiveLastBreadcrumb from "../../components/Dashboard/ActiveLastBreadcrumb";
import DatePicker from "../../components/Dashboard/DatePicker";
import Linecharts from "../../components/Dashboard/Expense/charts/Linecharts.jsx";
import { useAuth }  from "../../Context/JwtAuthContext.jsx";

const Dashboard = () => {
  const {user} = useAuth(); // Access the user from the context
  return (
    <>
      <div>
        {/* <ActiveLastBreadcrumb /> */}
        {/* <DatePicker />   */}
        Welcome {user} to your dashboard!
        <Linecharts />
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