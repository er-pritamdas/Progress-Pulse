import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchDashboardData, createCategory } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import HeaderSection from "../../../components/Expense/HeaderSection";
import CategoryCard from "../../../components/Expense/CategoryCard";
import { Plus } from "lucide-react";

const ExpDashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Dashboard Coming Soon
        </h1>
        <p className="text-base-content/60 max-w-md mx-auto">
          We are building a comprehensive analytics dashboard for your financial insights.
          Use the <span className="font-bold text-primary">Table View</span> and <span className="font-bold text-primary">Table Entry</span> tabs for now.
        </p>
      </div>
    </div>
  );
};

export default ExpDashboard;
