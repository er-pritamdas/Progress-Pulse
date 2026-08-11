import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, setMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import ExpenseTable from "../../../components/Expense/ExpenseTable";
import BankBalancesModal from "../../../components/Expense/BankBalancesModal";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Eye, EyeOff, Calendar, X, Wallet, Search, Folder, ExternalLink, ArrowUp, ArrowDown, ArrowUpDown, ArrowRightLeft, Sparkles, Filter, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { getSourceTagStyle, getCategoryTagStyle } from "../../../utils/expenseTheme";

const ExpTableEntry = () => {
  const dispatch = useDispatch();
  const { transactions, loading, currentMonth, salary, sources, categories } = useSelector((state) => state.expense);
  const { user } = useAuth();
  const sidebarScrollRef = useRef(null);

  const [showDebit, setShowDebit] = useState(true);
  const [showCredit, setShowCredit] = useState(true);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(null); // 'debit' | 'credit' | null
  const [showBankBalancesModal, setShowBankBalancesModal] = useState(false);

  // Table Controls & Filters State
  const [filters, setFilters] = useState({
    date: "",
    description: "",
    sourceId: "",
    categoryId: "",
    subCategoryId: ""
  });
  const [sortOrder, setSortOrder] = useState(() => localStorage.getItem("expense_sort_order") || "newest");
  const [rowLimit, setRowLimit] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Collapsible Sidebar Sections (Collapsed by default)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isSortExpanded, setIsSortExpanded] = useState(false);

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder);
    localStorage.setItem("expense_sort_order", newOrder);
  };

  const monthCategories = categories.filter(c => !c.month || c.month === currentMonth);
  const selectedFilterCategoryObj = monthCategories.find(c => String(c._id) === String(filters.categoryId));

  const hasActiveFilters = Boolean(filters.date || filters.description || filters.sourceId || filters.categoryId || filters.subCategoryId);
  const clearFilters = () => {
    setFilters({
      date: "",
      description: "",
      sourceId: "",
      categoryId: "",
      subCategoryId: ""
    });
  };

  useEffect(() => {
    dispatch(fetchDashboardData(currentMonth));
  }, [currentMonth, user, dispatch]);

  // Sidebar Stats & Sorted Sources
  const debitTransactions = transactions.filter(t => t.type === 'Debit');
  const creditTransactions = transactions.filter(t => t.type === 'Credit');

  const totalDebited = debitTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCredited = creditTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Excluded Sources State (persisted in localStorage and synced across components)
  const [excludedSourceIds, setExcludedSourceIds] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_excluded_sources");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("expense_excluded_sources");
        setExcludedSourceIds(saved ? JSON.parse(saved) : []);
      } catch (e) {}
    };
    window.addEventListener("excluded_sources_updated", handleSync);
    return () => window.removeEventListener("excluded_sources_updated", handleSync);
  }, []);

  const toggleExcludeSource = (sourceId) => {
    const sId = String(sourceId);
    const updated = excludedSourceIds.includes(sId)
      ? excludedSourceIds.filter(id => id !== sId)
      : [...excludedSourceIds, sId];
    setExcludedSourceIds(updated);
    try {
      localStorage.setItem("expense_excluded_sources", JSON.stringify(updated));
      window.dispatchEvent(new Event("excluded_sources_updated"));
    } catch (e) {}
  };

  const sortedSources = useMemo(() => {
    const sourceTotals = sources.map(source => {
      const spent = transactions
        .filter(t => t.type === 'Debit' && (t.sourceId?._id === source._id || t.sourceId === source._id))
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...source, spent };
    });

    return [...sources].sort((a, b) => {
      const isABank = a.type === 'Bank';
      const isBBank = b.type === 'Bank';

      if (isABank && !isBBank) return -1;
      if (!isABank && isBBank) return 1;

      const getAmt = (s) => {
        if (s.type === 'Card') {
          const cardSpent = transactions
            .filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(s._id))
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          return cardSpent || s.balance || 0;
        }
        return s.balance || 0;
      };

      return getAmt(b) - getAmt(a);
    });
  }, [sources, transactions]);

  const totalBankBalance = sources
    .filter(s => (s.type === 'Bank' || !s.type) && !excludedSourceIds.includes(String(s._id)))
    .reduce((sum, s) => sum + (s.balance || 0), 0);

  const totalCardSpent = sources
    .filter(s => s.type === 'Card' && !excludedSourceIds.includes(String(s._id)))
    .reduce((sum, source) => {
      const cardSpent = transactions
        .filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(source._id))
        .reduce((s, t) => s + (t.amount || 0), 0);
      return sum + (cardSpent || source.balance || 0);
    }, 0);

  const totalNetBalance = totalBankBalance - totalCardSpent;

  return (
    <div className="p-4 md:p-2 w-full max-w-[1600px] mx-auto pb-20">

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Controls (Left) - Sticky */}
        <div className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-6 lg:h-fit">

          {/* Bank Balances Card - Clickable to open Popup */}
          <div
            onClick={() => setShowBankBalancesModal(true)}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-primary/40"
          >
            <div className="card-body p-4 relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary" />
                  <span>Bank Balances</span>
                </h3>
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1 group-hover:scale-105 transition-transform">
                  View All <ExternalLink size={10} />
                </span>
              </div>

              {/* Scrollable Bank & Card Balances List (Side arrows) */}
              <div className="w-full pt-1 border-t border-base-300/30 flex items-center gap-1">
                {/* Left Arrow Button */}
                {sortedSources.length > 3 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sidebarScrollRef.current?.scrollBy({ top: -38, behavior: 'smooth' });
                    }}
                    className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                    title="Scroll Up"
                  >
                    <ChevronLeft size={14} />
                  </button>
                ) : <div className="w-3 shrink-0" />}

                {/* List Container (Scrollable, 3 items height) */}
                <div
                  ref={sidebarScrollRef}
                  className="flex-1 max-h-[72px] overflow-y-auto space-y-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {sortedSources.map((source) => {
                    const isCard = source.type === 'Card';
                    const cardSpent = isCard
                      ? (transactions.filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(source._id)).reduce((sum, t) => sum + (t.amount || 0), 0) || source.balance || 0)
                      : 0;
                    const rawAmt = isCard ? cardSpent : (source.balance || 0);
                    const isNegativeBank = !isCard && rawAmt < 0;
                    const isErrorColor = isCard || isNegativeBank;
                    const isExcluded = excludedSourceIds.includes(String(source._id));

                    return (
                      <div
                        key={source._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExcludeSource(source._id);
                        }}
                        className={`flex items-center justify-between text-xs py-0.5 border-b border-base-300/20 last:border-0 gap-1.5 cursor-pointer hover:bg-base-300/30 px-1 rounded transition-all ${
                          isExcluded ? 'opacity-40 line-through select-none' : ''
                        }`}
                        title={isExcluded ? "Click to include in Total Net Balance" : "Click to exclude from Total Net Balance"}
                      >
                        <span className="font-semibold text-base-content/80 truncate text-xs text-left flex items-center gap-1">
                          {isExcluded && <EyeOff size={10} className="shrink-0 text-amber-500" />}
                          {source.name}
                        </span>
                        <span className={`font-mono font-extrabold text-xs shrink-0 text-right ${isExcluded ? 'text-base-content/40' : (isErrorColor ? 'text-error' : 'text-success')}`}>
                          {isCard ? `-₹${Math.abs(rawAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (rawAmt < 0 ? `-₹${Math.abs(rawAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${rawAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Arrow Button */}
                {sortedSources.length > 3 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sidebarScrollRef.current?.scrollBy({ top: 38, behavior: 'smooth' });
                    }}
                    className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                    title="Scroll Down"
                  >
                    <ChevronRight size={14} />
                  </button>
                ) : <div className="w-3 shrink-0" />}
              </div>

              {/* Total Net Balance Line */}
              <div className="pt-2 border-t border-base-300/40 flex justify-between items-center text-xs font-bold">
                <span className="text-[10px] uppercase font-extrabold text-base-content/60 tracking-wider">Total Net Balance</span>
                <span className={`font-mono text-xs font-extrabold ${totalNetBalance < 0 ? 'text-error' : 'text-success'}`}>
                  {totalNetBalance < 0 ? `-₹${Math.abs(totalNetBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${totalNetBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
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
                {showDebit ? `₹${totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
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
                {showCredit ? `₹${totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                </div>
                <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md opacity-80 group-hover:opacity-100 transition-opacity">
                  View Breakdown →
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Main Table Area (Right) */}
        <div className="flex-1 flex flex-col gap-6">
          <ExpenseTable
            externalFilters={filters}
            externalSetFilters={setFilters}
            externalSortOrder={sortOrder}
            externalSetSortOrder={setSortOrder}
            externalRowLimit={rowLimit}
            externalSetRowLimit={setRowLimit}
            externalIsAddModalOpen={isAddModalOpen}
            externalSetIsAddModalOpen={setIsAddModalOpen}
            onOpenHeatmap={() => setShowHeatmapModal(true)}
          />
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

      {/* Bank Balances & Accounts Detailed Popup Modal */}
      <BankBalancesModal
        isOpen={showBankBalancesModal}
        onClose={() => setShowBankBalancesModal(false)}
      />
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
                  title={(isToday ? 'Today - ' : '') + `Spending: ₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem("expense_sort_order") || "newest";
  }); // "newest" | "oldest"
  const [limitCount, setLimitCount] = useState("all"); // "10" | "20" | "30" | "40" | "all"

  // Deduplicated Categories for Current Month
  const currentMonthCategories = useMemo(() => {
    const raw = (categories || []).filter(c => !c.month || c.month === currentMonth);
    const seen = new Set();
    return raw.filter(c => {
      if (!c.name) return false;
      const key = c.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories, currentMonth]);

  // Column Specific Filters
  const [colFilters, setColFilters] = useState({
    date: "",
    description: "",
    sourceId: "",
    categoryId: ""
  });

  const hasColFilters = Boolean(colFilters.date || colFilters.description || colFilters.sourceId || colFilters.categoryId);
  const clearColFilters = () => setColFilters({ date: "", description: "", sourceId: "", categoryId: "" });

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder);
    localStorage.setItem("expense_sort_order", newOrder);
  };

  const isDebit = type === "debit";
  const title = isDebit ? "Debited Transactions" : "Credited Transactions";
  const accentColor = isDebit ? "text-error" : "text-success";
  const bgBadge = isDebit ? "bg-error/10 text-error border-error/20" : "bg-success/10 text-success border-success/20";
  const Icon = isDebit ? TrendingDown : TrendingUp;

  // Filter transactions matching search term, column filters, sort order & row limit
  const filteredTransactions = useMemo(() => {
    let list = transactions.filter((t) => {
      // Top search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();

        const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
        const catName = catObj?.name || t.categoryName || "";

        const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
        const srcName = srcObj?.name || t.sourceName || "";

        const desc = t.description || "";
        const amountStr = String(t.amount || "");
        const dateStr = dayjs(t.date).format("DD MMM YYYY");

        const matchesQuery = (
          desc.toLowerCase().includes(query) ||
          catName.toLowerCase().includes(query) ||
          srcName.toLowerCase().includes(query) ||
          amountStr.includes(query) ||
          dateStr.toLowerCase().includes(query)
        );
        if (!matchesQuery) return false;
      }

      // Column filters
      if (colFilters.date && dayjs(t.date).format("YYYY-MM-DD") !== colFilters.date) return false;
      if (colFilters.description && !(t.description || "").toLowerCase().includes(colFilters.description.toLowerCase())) return false;
      if (colFilters.sourceId && String(t.sourceId?._id || t.sourceId) !== String(colFilters.sourceId)) return false;
      if (colFilters.categoryId && String(t.categoryId?._id || t.categoryId) !== String(colFilters.categoryId)) return false;

      return true;
    });

    list.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();

      if (timeA !== timeB) {
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      }

      // Tie-breaker for identical dates based on updated/created timestamp
      const updateA = new Date(a.updatedAt || a.createdAt || a.date).getTime();
      const updateB = new Date(b.updatedAt || b.createdAt || b.date).getTime();

      return sortOrder === "newest" ? updateB - updateA : updateA - updateB;
    });

    if (limitCount !== "all") {
      list = list.slice(0, Number(limitCount));
    }

    return list;
  }, [transactions, searchTerm, colFilters, categories, sources, sortOrder, limitCount]);

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
              Total: ₹{totalSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Controls Bar: Search + Sort Order + Limit Selector + Clear Column Filters */}
        <div className="p-4 border-b border-base-200 bg-base-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
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

            {hasColFilters && (
              <button
                onClick={clearColFilters}
                className="btn btn-xs btn-ghost border border-error/30 text-error hover:bg-error/10 rounded-xl font-bold gap-1 shrink-0"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end text-xs">
            {/* Sort Order Toggle */}
            <div className="join border border-base-300 rounded-xl p-0.5 bg-base-200/40">
              <button
                onClick={() => handleSortChange("newest")}
                className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${sortOrder === "newest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                title="Show Newest First"
              >
                <ArrowDown size={12} /> New First
              </button>
              <button
                onClick={() => handleSortChange("oldest")}
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
                    {/* Date Column Header with Filter */}
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <div className="dropdown dropdown-bottom">
                          <button
                            tabIndex={0}
                            className={`btn btn-xs btn-square btn-ghost ${colFilters.date ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Date"
                          >
                            <Filter size={11} />
                          </button>
                          <div tabIndex={0} className="dropdown-content z-[99999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 space-y-2 font-normal text-xs normal-case">
                            <label className="text-[10px] font-bold text-base-content/50 uppercase block">Filter by Date</label>
                            <input
                              type="date"
                              value={colFilters.date}
                              onChange={(e) => setColFilters({ ...colFilters, date: e.target.value })}
                              className="input input-xs input-bordered w-full rounded-lg font-medium"
                            />
                            {colFilters.date && (
                              <button
                                onClick={() => setColFilters({ ...colFilters, date: "" })}
                                className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                              >
                                Clear Date
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </th>

                    {/* Description Column Header with Filter */}
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span>Description</span>
                        <div className="dropdown dropdown-bottom">
                          <button
                            tabIndex={0}
                            className={`btn btn-xs btn-square btn-ghost ${colFilters.description ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Description"
                          >
                            <Filter size={11} />
                          </button>
                          <div tabIndex={0} className="dropdown-content z-[99999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 space-y-2 font-normal text-xs normal-case">
                            <label className="text-[10px] font-bold text-base-content/50 uppercase block">Search Description</label>
                            <div className="relative">
                              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                              <input
                                type="text"
                                placeholder="Search text..."
                                value={colFilters.description}
                                onChange={(e) => setColFilters({ ...colFilters, description: e.target.value })}
                                className="input input-xs input-bordered w-full pl-7 font-medium rounded-lg"
                              />
                            </div>
                            {colFilters.description && (
                              <button
                                onClick={() => setColFilters({ ...colFilters, description: "" })}
                                className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                              >
                                Clear Search
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </th>

                    {/* Category / To Column Header with Filter */}
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-600 dark:text-purple-400">Category / To</span>
                        <div className="dropdown dropdown-bottom">
                          <button
                            tabIndex={0}
                            className={`btn btn-xs btn-square btn-ghost ${colFilters.categoryId ? 'text-purple-600 bg-purple-500/15' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Category"
                          >
                            <Filter size={11} />
                          </button>
                          <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 font-medium text-xs normal-case max-h-60 overflow-y-auto overflow-x-hidden">
                            <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Category</li>
                            <li>
                              <a onClick={() => setColFilters({ ...colFilters, categoryId: "" })} className={!colFilters.categoryId ? "font-bold text-primary" : ""}>
                                All Categories
                              </a>
                            </li>
                            {currentMonthCategories.map((c) => (
                              <li key={c._id}>
                                <a onClick={() => setColFilters({ ...colFilters, categoryId: c._id })} className={`truncate max-w-[200px] ${String(colFilters.categoryId) === String(c._id) ? "font-bold text-primary" : ""}`}>
                                  {c.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </th>

                    {/* Payment Source Column Header with Filter */}
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-600 dark:text-blue-400">Payment Source</span>
                        <div className="dropdown dropdown-bottom">
                          <button
                            tabIndex={0}
                            className={`btn btn-xs btn-square btn-ghost ${colFilters.sourceId ? 'text-blue-600 bg-blue-500/15' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Account / Bank"
                          >
                            <Filter size={11} />
                          </button>
                          <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 font-medium text-xs normal-case max-h-56 overflow-y-auto">
                            <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Account</li>
                            <li>
                              <a onClick={() => setColFilters({ ...colFilters, sourceId: "" })} className={!colFilters.sourceId ? "font-bold text-primary" : ""}>
                                All Accounts
                              </a>
                            </li>
                            {sources.map((s) => (
                              <li key={s._id}>
                                <a onClick={() => setColFilters({ ...colFilters, sourceId: s._id })} className={String(colFilters.sourceId) === String(s._id) ? "font-bold text-primary" : ""}>
                                  {s.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </th>

                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200/70 font-medium">
                  {filteredTransactions.map((t) => {
                    const isTrf = t.type === 'Transfer';
                    const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
                    const catTagStyle = getCategoryTagStyle(catObj, categories);

                    const targetObj = t.targetSourceId;
                    const targetName = targetObj?.name || (typeof targetObj === 'string' ? targetObj : 'Bank');

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
                          {isTrf ? (() => {
                            const trgStyle = getSourceTagStyle(targetObj || targetName, sources);
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${trgStyle.bg} ${trgStyle.text} border ${trgStyle.border}`}>
                                <ArrowRightLeft size={12} />
                                To: {targetName}
                              </span>
                            );
                          })() : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${catTagStyle.bg} ${catTagStyle.text} border ${catTagStyle.border}`}
                            >
                              <Folder size={12} />
                              {catObj?.name || t.categoryName || "Uncategorized"}
                            </span>
                          )}
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
                          <span className={isTrf ? "text-amber-500 dark:text-amber-400" : (isDebit ? "text-error" : "text-success")}>
                            {isTrf ? "" : (isDebit ? "-" : "+")}₹{Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            Showing <strong className="font-mono">{filteredTransactions.length}</strong> transactions | Total {isDebit ? 'Debited' : 'Credited'}: <strong className={`font-mono font-bold ${accentColor}`}>₹{totalSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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