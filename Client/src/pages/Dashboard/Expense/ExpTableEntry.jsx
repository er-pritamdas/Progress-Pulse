import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, setMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import ExpenseTable from "../../../components/Expense/ExpenseTable";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Eye, EyeOff, Calendar, X, Wallet } from "lucide-react";

const ExpTableEntry = () => {
  const dispatch = useDispatch();
  const { transactions, loading, currentMonth, salary, sources } = useSelector((state) => state.expense);
  const { user } = useAuth();

  const [showDebit, setShowDebit] = useState(true);
  const [showCredit, setShowCredit] = useState(true);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData(currentMonth));
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


          {/* EveryDay Spending Card */}
          <div
            onClick={() => setShowHeatmapModal(true)}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-md border border-base-200/50 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="card-body p-6 flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Daily Spending</h3>
                <p className="text-xs opacity-60">View heatmap of daily expenses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Area (Right) */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Sources Tags */}
          {sources.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {sources.map((source) => (
                <div key={source._id} className="badge badge-lg py-4 px-4 gap-2 bg-base-100 border border-base-200 shadow-sm">
                  <Wallet size={14} className="opacity-50" />
                  <span className="font-semibold">{source.name}</span>
                  <span className={`font-mono font-bold ${source.balance >= 0 ? 'text-success' : 'text-error'}`}>
                    ₹{source.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <ExpenseTable />
        </div>

      </div>

      {/* Heatmap Modal */}
      {showHeatmapModal && (
        <HeatmapModal
          transactions={debitTransactions}
          currentMonth={currentMonth}
          onClose={() => setShowHeatmapModal(false)}
        />
      )}
    </div>
  );
};

const HeatmapModal = ({ transactions, currentMonth, onClose }) => {
  // 1. Generate all dates for current month
  const startOfMonth = dayjs(currentMonth).startOf('month');
  const endOfMonth = dayjs(currentMonth).endOf('month');
  const daysInMonth = endOfMonth.date();
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

  // 2. Aggregate spending per day
  const dailySpending = {};
  transactions.forEach(t => {
    const dateStr = dayjs(t.date).format("YYYY-MM-DD");
    if (!dailySpending[dateStr]) dailySpending[dateStr] = 0;
    dailySpending[dateStr] += t.amount;
  });

  // 3. Calendar Grid Generation
  const days = [];
  // Padding for start of month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(startOfMonth.date(i));
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-base-200 text-sm">
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Spending Calendar ({dayjs(currentMonth).format("MMM YYYY")})
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-square rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-bold text-xs opacity-80 uppercase tracking-wider">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="aspect-square"></div>;

              const dateStr = date.format("YYYY-MM-DD");
              const amount = dailySpending[dateStr] || 0;

              // Intensity Logic
              let bgClass = "bg-base-200/50 hover:bg-base-200";
              let textClass = "text-base-content";

              if (amount > 0) {
                if (amount > 5000) {
                  bgClass = "bg-error text-error-content hover:bg-error/90";
                  textClass = "text-error-content font-bold";
                } else if (amount > 1000) {
                  bgClass = "bg-warning text-warning-content hover:bg-warning/90";
                  textClass = "text-warning-content font-bold";
                } else {
                  bgClass = "bg-success text-success-content hover:bg-success/90";
                  textClass = "text-success-content font-bold";
                }
              }

              return (
                <div
                  key={dateStr}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all cursor-default relative group ${bgClass}`}
                  title={`Spending: ₹${amount.toLocaleString()}`}
                >
                  <span className={`text-xs ${amount > 0 ? 'opacity-100' : 'opacity-80'}`}>{date.date()}</span>
                  {amount > 0 && (
                    <span className={`text-[10px] leading-tight mt-1 ${textClass}`}>
                      ₹{amount > 1000 ? (amount / 1000).toFixed(1) + "k" : amount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-base-100 border-t border-base-200 flex justify-center gap-4 opacity-100">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-success"></div> Low</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-warning"></div> Med</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-error"></div> High</div>
        </div>
      </div>
    </div>
  );
}

export default ExpTableEntry;