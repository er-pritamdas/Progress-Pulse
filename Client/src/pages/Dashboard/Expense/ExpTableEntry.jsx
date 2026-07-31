import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, setMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import ExpenseTable from "../../../components/Expense/ExpenseTable";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Eye, EyeOff, Calendar, X, Wallet, Search, Folder, ExternalLink, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { getSourceTagStyle, getCategoryTagStyle } from "../../../utils/expenseTheme";

const ExpTableEntry = () => {
  const dispatch = useDispatch();
  const { transactions, loading, currentMonth, salary, sources } = useSelector((state) => state.expense);
  const { user } = useAuth();

  const [showDebit, setShowDebit] = useState(true);
  const [showCredit, setShowCredit] = useState(true);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(null); // 'debit' | 'credit' | null

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
    <div className="p-4 md:p-2 w-full max-w-[1600px] mx-auto pb-20">

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Stats (Left) - Sticky */}
        <div className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-6 lg:h-fit">

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
          <div
            onClick={() => setShowTransactionModal("debit")}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-error/30"
          >
            {/* Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <TrendingDown size={120} className="text-error" />
            </div>
            <div className="card-body p-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  Total Debited <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-error" />
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDebit(!showDebit);
                  }}
                  className="btn btn-xs btn-ghost btn-square opacity-50 hover:opacity-100"
                  title={showDebit ? "Hide Balance" : "Show Balance"}
                >
                  {showDebit ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="text-3xl font-bold text-error font-mono tracking-tighter">
                {showDebit ? `₹${totalDebited.toLocaleString()}` : "••••••••"}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                  <span className="text-xs text-base-content/60 font-medium">{debitCount} Transactions</span>
                </div>
                <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-md opacity-80 group-hover:opacity-100 transition-opacity">
                  View Breakdown →
                </span>
              </div>
            </div>
          </div>

          {/* Credited Card */}
          <div
            onClick={() => setShowTransactionModal("credit")}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-success/30"
          >
            {/* Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={120} className="text-success" />
            </div>
            <div className="card-body p-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  Total Credited <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-success" />
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCredit(!showCredit);
                  }}
                  className="btn btn-xs btn-ghost btn-square opacity-50 hover:opacity-100"
                  title={showCredit ? "Hide Balance" : "Show Balance"}
                >
                  {showCredit ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="text-3xl font-bold text-success font-mono tracking-tighter">
                {showCredit ? `₹${totalCredited.toLocaleString()}` : "••••••••"}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-xs text-base-content/60 font-medium">{creditCount} Transactions</span>
                </div>
                <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md opacity-80 group-hover:opacity-100 transition-opacity">
                  View Breakdown →
                </span>
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

      {/* Debited / Credited Transactions List Popup Modal */}
      {showTransactionModal && (
        <TransactionListModal
          type={showTransactionModal}
          transactions={showTransactionModal === "debit" ? debitTransactions : creditTransactions}
          currentMonth={currentMonth}
          onClose={() => setShowTransactionModal(null)}
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
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-200 rounded-3xl shadow-2xl w-full max-w-2xl h-[580px] flex flex-col justify-between overflow-hidden border border-base-300 text-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="shrink-0 p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Spending Calendar ({dayjs(currentMonth).format("MMM YYYY")})
            </h3>
            <span className="badge badge-primary badge-outline gap-1.5 font-bold text-xs py-2 px-2.5 shadow-2xs">
              Today: {dayjs().format("DD MMM YYYY")}
            </span>
          </div>
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
              const isToday = dateStr === dayjs().format("YYYY-MM-DD");

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
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all cursor-default relative group ${
                    isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 z-10 font-black shadow-md border-2 border-primary scale-105' : ''
                  } ${bgClass}`}
                  title={(isToday ? 'Today - ' : '') + `Spending: ₹${amount.toLocaleString()}`}
                >
                  <span className={`text-xs ${amount > 0 || isToday ? 'opacity-100 font-bold' : 'opacity-80'}`}>{date.date()}</span>
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

        <div className="p-3 bg-base-100 border-t border-base-200 flex justify-center items-center gap-4 opacity-100 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
            <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/40 animate-pulse"></span>
            Today ({dayjs().format('D MMM')})
          </div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-success"></div> Low</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-warning"></div> Med</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-error"></div> High</div>
        </div>
      </div>
    </div>
  );
};

const TransactionListModal = ({ type, transactions, currentMonth, onClose }) => {
  const { categories, sources } = useSelector((state) => state.expense);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"
  const [limitCount, setLimitCount] = useState("all"); // "10" | "20" | "30" | "40" | "all"

  const isDebit = type === "debit";
  const title = isDebit ? "Debited Transactions" : "Credited Transactions";
  const accentColor = isDebit ? "text-error" : "text-success";
  const bgBadge = isDebit ? "bg-error/10 text-error border-error/20" : "bg-success/10 text-success border-success/20";
  const Icon = isDebit ? TrendingDown : TrendingUp;

  // Filter transactions matching search term, sort order & row limit
  const filteredTransactions = useMemo(() => {
    let list = transactions.filter((t) => {
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();

      const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
      const catName = catObj?.name || t.categoryName || "";

      const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
      const srcName = srcObj?.name || t.sourceName || "";

      const desc = t.description || "";
      const amountStr = String(t.amount || "");
      const dateStr = dayjs(t.date).format("DD MMM YYYY");

      return (
        desc.toLowerCase().includes(query) ||
        catName.toLowerCase().includes(query) ||
        srcName.toLowerCase().includes(query) ||
        amountStr.includes(query) ||
        dateStr.toLowerCase().includes(query)
      );
    });

    list.sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      return sortOrder === "newest" ? diff : -diff;
    });

    if (limitCount !== "all") {
      list = list.slice(0, Number(limitCount));
    }

    return list;
  }, [transactions, searchTerm, categories, sources, sortOrder, limitCount]);

  const totalSum = filteredTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isDebit ? 'bg-error/15 text-error' : 'bg-success/15 text-success'}`}>
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs opacity-60 font-mono font-medium">({dayjs(currentMonth).format("MMMM YYYY")})</span>
              </h3>
              <p className="text-xs opacity-60 font-medium mt-0.5">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-xl text-sm font-extrabold font-mono border ${bgBadge}`}>
              Total: ₹{totalSum.toLocaleString()}
            </span>
            <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Controls Bar: Search + Sort Order + Limit Selector */}
        <div className="p-4 border-b border-base-200 bg-base-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm select-bordered w-full pl-10 pr-8 bg-base-200/60 text-xs font-medium rounded-xl focus:bg-base-100 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end text-xs">
            {/* Sort Order Toggle */}
            <div className="join border border-base-300 rounded-xl p-0.5 bg-base-200/40">
              <button
                onClick={() => setSortOrder("newest")}
                className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${sortOrder === "newest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                title="Show Newest First"
              >
                <ArrowDown size={12} /> New First
              </button>
              <button
                onClick={() => setSortOrder("oldest")}
                className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${sortOrder === "oldest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                title="Show Oldest First"
              >
                <ArrowUp size={12} /> Old First
              </button>
            </div>

            {/* Row Limit Selector */}
            <div className="flex items-center gap-1 bg-base-200/40 border border-base-300 p-0.5 rounded-xl">
              <span className="px-2 text-[11px] font-bold opacity-60">Show:</span>
              {["10", "20", "30", "40", "all"].map((val) => (
                <button
                  key={val}
                  onClick={() => setLimitCount(val)}
                  className={`btn btn-xs rounded-lg font-bold capitalize ${limitCount === val ? "btn-neutral shadow-2xs" : "btn-ghost opacity-70"}`}
                >
                  {val === "all" ? "All" : val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-base-200 shadow-2xs">
              <table className="table table-sm w-full text-xs">
                <thead className="bg-base-200/70 text-base-content font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Source</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200/70 font-medium">
                  {filteredTransactions.map((t) => {
                    const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
                    const catTagStyle = getCategoryTagStyle(catObj, categories);

                    const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
                    const srcTagStyle = getSourceTagStyle(srcObj);

                    return (
                      <tr key={t._id || t.id} className="hover:bg-base-200/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-base-content/70 whitespace-nowrap">
                          {dayjs(t.date).format("DD MMM YYYY")}
                        </td>
                        <td className="py-3 px-4 font-semibold text-base-content">
                          {t.description || <span className="opacity-40 italic">No description</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${catTagStyle.bg} ${catTagStyle.text} border ${catTagStyle.border}`}
                          >
                            <Folder size={12} />
                            {catObj?.name || t.categoryName || "Uncategorized"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${srcTagStyle.bg} ${srcTagStyle.text} border ${srcTagStyle.border}`}
                          >
                            <Wallet size={12} />
                            {srcObj?.name || t.sourceName || "General"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                          <span className={isDebit ? "text-error" : "text-success"}>
                            {isDebit ? "-" : "+"}₹{Number(t.amount || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-sm opacity-50 italic">
              No transactions match your filter criteria.
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-base-200 bg-base-200/50 flex justify-between items-center text-xs">
          <span className="font-semibold text-base-content/70">
            Showing <strong className="font-mono">{filteredTransactions.length}</strong> transactions | Total {isDebit ? 'Debited' : 'Credited'}: <strong className={`font-mono font-bold ${accentColor}`}>₹{totalSum.toLocaleString()}</strong>
          </span>
          <button onClick={onClose} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpTableEntry;