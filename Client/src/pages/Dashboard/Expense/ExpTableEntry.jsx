import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, setMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import ExpenseTable from "../../../components/Expense/ExpenseTable";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";

const ExpTableEntry = () => {
  const dispatch = useDispatch();
  const { transactions, loading, currentMonth, salary } = useSelector((state) => state.expense);
  const { user } = useAuth();

  const [showDebit, setShowDebit] = useState(true);
  const [showCredit, setShowCredit] = useState(true);

  useEffect(() => {
    if (user) {
      dispatch(fetchDashboardData(currentMonth));
    }
  }, [currentMonth, user, dispatch]);

  // Sidebar Stats
  const debitTransactions = transactions.filter(t => t.type !== 'Credit'); // Default to Debit if missing
  const creditTransactions = transactions.filter(t => t.type === 'Credit');

  const totalDebited = debitTransactions.reduce((sum, t) => sum + t.amount, 0);
  const debitCount = debitTransactions.length;

  const totalCredited = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
  const creditCount = creditTransactions.length;

  return (
    <div className="p-4 md:p-6 w-full max-w-[1600px] mx-auto pb-20">

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Stats (Left) */}
        <div className="w-full lg:w-72 shrink-0 space-y-6">

          {/* Debited Card */}
          <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group">
            {/* Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <TrendingDown size={120} className="text-error" />
            </div>
            <div className="card-body p-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-1">Total Debited</h3>
                <button onClick={() => setShowDebit(!showDebit)} className="btn btn-xs btn-ghost btn-square opacity-50 hover:opacity-100">
                  {showDebit ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="text-3xl font-bold text-error font-mono tracking-tighter">
                {showDebit ? `₹${totalDebited.toLocaleString()}` : "••••••••"}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                <span className="text-xs text-base-content/60 font-medium">{debitCount} Transactions</span>
              </div>
            </div>
          </div>

          {/* Credited Card */}
          <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group">
            {/* Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={120} className="text-success" />
            </div>
            <div className="card-body p-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-1">Total Credited</h3>
                <button onClick={() => setShowCredit(!showCredit)} className="btn btn-xs btn-ghost btn-square opacity-50 hover:opacity-100">
                  {showCredit ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="text-3xl font-bold text-success font-mono tracking-tighter">
                {showCredit ? `₹${totalCredited.toLocaleString()}` : "••••••••"}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-xs text-base-content/60 font-medium">{creditCount} Transactions</span>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-md border border-base-200/50">
            <div className="card-body p-6">
              <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-2">Current Period</h3>

              <div className="flex items-center justify-between bg-base-100 rounded-lg p-1 border border-base-200">
                <button
                  onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
                  className="btn btn-sm btn-ghost btn-square"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-lg font-bold text-base-content font-sans tracking-wide">
                  {dayjs(currentMonth).format("MMMM YYYY")}
                </span>

                <button
                  onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
                  className="btn btn-sm btn-ghost btn-square"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Area (Right) */}
        <div className="flex-1">
          <ExpenseTable />
        </div>

      </div>
    </div>
  );
};

export default ExpTableEntry;