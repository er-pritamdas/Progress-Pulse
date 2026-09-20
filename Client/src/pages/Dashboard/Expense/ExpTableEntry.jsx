import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, setMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import ExpenseTable from "../../../components/Expense/ExpenseTable";
import BankBalancesModal from "../../../components/Expense/BankBalancesModal";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Eye, EyeOff, Calendar, X, Wallet, Search, Folder, ExternalLink, ArrowUp, ArrowDown, ArrowUpDown, ArrowRightLeft, Sparkles, Filter, ChevronDown, ChevronUp, Building2, CreditCard, Info, Handshake, Users, Plus, Minus, RotateCcw } from "lucide-react";
import { getSourceTagStyle, getCategoryTagStyle } from "../../../utils/expenseTheme";
import TransactionInfoModal from "../../../components/Expense/TransactionInfoModal";

export const getReimbursableBreakdown = (t, splitsMap = {}) => {
  const amt = Number(t?.amount || 0);
  const txKey = String(t?._id || t?.id || "");
  const entry = splitsMap[txKey];

  let splitCount = 1;
  let customAmount = null;

  if (typeof entry === "number") {
    splitCount = Math.max(1, Math.min(100, entry));
  } else if (entry && typeof entry === "object") {
    if (entry.splitCount !== undefined) {
      splitCount = Math.max(1, Math.min(100, Number(entry.splitCount) || 1));
    }
    if (entry.customAmount !== undefined && entry.customAmount !== null && entry.customAmount !== "") {
      const parsed = Number(entry.customAmount);
      if (!isNaN(parsed)) {
        customAmount = Math.max(0, parsed);
      }
    }
  }

  // If a custom amount to collect was entered by the user
  if (customAmount !== null && !isNaN(customAmount)) {
    const toCollect = Math.min(amt, Math.round((customAmount + Number.EPSILON) * 100) / 100);
    const myShare = Math.max(0, Math.round((amt - toCollect + Number.EPSILON) * 100) / 100);
    return {
      total: amt,
      splitCount,
      myShare,
      toCollect,
      isCustomAmount: true,
    };
  }

  // Standard split calculation
  if (splitCount <= 1) {
    return {
      total: amt,
      splitCount: 1,
      myShare: 0,
      toCollect: amt,
      isCustomAmount: false,
    };
  }

  const myShare = Math.round((amt / splitCount + Number.EPSILON) * 100) / 100;
  const toCollect = Math.round(((amt * (splitCount - 1)) / splitCount + Number.EPSILON) * 100) / 100;
  return {
    total: amt,
    splitCount,
    myShare,
    toCollect,
    isCustomAmount: false,
  };
};

const ExpTableEntry = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error, currentMonth, salary, sources, categories } = useSelector((state) => state.expense);
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const sidebarScrollRef = useRef(null);
  const cardScrollRef = useRef(null);

  const [showDebit, setShowDebit] = useState(true);
  const [showCredit, setShowCredit] = useState(true);
  const [showReimbursable, setShowReimbursable] = useState(true);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(null); // 'debit' | 'credit' | 'reimbursable' | null
  const [showBankBalancesModal, setShowBankBalancesModal] = useState(false);
  const [bankModalTypeFilter, setBankModalTypeFilter] = useState("all");

  // Reimbursable Splits Map (txId -> { splitCount, customAmount } or splitCount)
  const [reimbursableSplits, setReimbursableSplits] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_reimbursable_splits");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const handleSplitSync = () => {
      try {
        const saved = localStorage.getItem("expense_reimbursable_splits");
        setReimbursableSplits(saved ? JSON.parse(saved) : {});
      } catch (e) {}
    };
    window.addEventListener("reimbursable_splits_updated", handleSplitSync);
    return () => window.removeEventListener("reimbursable_splits_updated", handleSplitSync);
  }, []);

  const updateSplit = (txId, countOrObj) => {
    let entryToSave;
    if (typeof countOrObj === "number") {
      entryToSave = { splitCount: Math.max(1, Math.min(100, countOrObj)), customAmount: null };
    } else if (countOrObj && typeof countOrObj === "object") {
      entryToSave = {
        splitCount: Math.max(1, Math.min(100, Number(countOrObj.splitCount) || 1)),
        customAmount:
          countOrObj.customAmount !== undefined && countOrObj.customAmount !== null && countOrObj.customAmount !== ""
            ? Math.max(0, Number(countOrObj.customAmount))
            : null,
      };
    } else {
      entryToSave = { splitCount: 1, customAmount: null };
    }

    const updated = { ...reimbursableSplits, [String(txId)]: entryToSave };
    setReimbursableSplits(updated);
    try {
      localStorage.setItem("expense_reimbursable_splits", JSON.stringify(updated));
      window.dispatchEvent(new Event("reimbursable_splits_updated"));
    } catch (e) {}
  };

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

  // Always default to current month on page mount
  useEffect(() => {
    const actualCurrentMonth = dayjs().format("YYYY-MM");
    if (currentMonth !== actualCurrentMonth) {
      dispatch(setMonth(actualCurrentMonth));
    }
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    const promise = dispatch(fetchDashboardData(currentMonth));
    if (promise && typeof promise.finally === "function") {
      promise.finally(() => {
        if (isMounted) setInitialLoading(false);
      });
    } else {
      setInitialLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [currentMonth, user, dispatch]);

  const isDataLoading = loading || initialLoading;

  // Sidebar Stats & Sorted Sources
  const debitTransactions = transactions.filter(t => t.type === 'Debit');
  const creditTransactions = transactions.filter(t => t.type === 'Credit');
  const reimbursableTransactions = transactions.filter(t => Boolean(t.isReimbursable));

  const totalDebited = debitTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalCredited = creditTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalReimbursableToCollect = useMemo(() => {
    return reimbursableTransactions.reduce((sum, t) => {
      return sum + getReimbursableBreakdown(t, reimbursableSplits).toCollect;
    }, 0);
  }, [reimbursableTransactions, reimbursableSplits]);

  const totalReimbursableSpent = useMemo(() => {
    return reimbursableTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [reimbursableTransactions]);

  // Privacy Mode State (Sync with ExpenseTable Eye icon in Current Period)
  const [hideNumbers, setHideNumbers] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_hide_numbers");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleHideSync = () => {
      try {
        const saved = localStorage.getItem("expense_hide_numbers");
        setHideNumbers(saved ? JSON.parse(saved) : false);
      } catch (e) {}
    };
    window.addEventListener("expense_hide_numbers_updated", handleHideSync);
    return () => window.removeEventListener("expense_hide_numbers_updated", handleHideSync);
  }, []);

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

  const getCardDueAmount = (source, txList = []) => {
    if (!source || source.type !== 'Card') return 0;
    if (source.cardDue !== undefined && source.cardDue !== null && Number(source.cardDue) > 0) return Number(source.cardDue);
    const bal = Number(source.balance) || 0;
    if (bal < 0) return Math.abs(bal);
    if (source.cardDue !== undefined && source.cardDue !== null) return Number(source.cardDue);
    const cardDebits = txList
      .filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(source._id))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const cardCredits = txList
      .filter(t => (t.type === 'Credit' || t.type === 'Transfer') && (
        String(t.targetSourceId?._id || t.targetSourceId) === String(source._id) ||
        String(t.sourceId?._id || t.sourceId) === String(source._id)
      ))
      .reduce((sum, t) => {
        if (t.type === 'Credit' && String(t.sourceId?._id || t.sourceId) === String(source._id)) {
          return sum + (Number(t.amount) || 0);
        }
        if (t.type === 'Transfer' && String(t.targetSourceId?._id || t.targetSourceId) === String(source._id)) {
          return sum + (Number(t.amount) || 0);
        }
        return sum;
      }, 0);

    const due = cardDebits - cardCredits;
    return due > 0 ? due : 0;
  };

  const isCurrentMonth = currentMonth === dayjs().format("YYYY-MM");

  const bankSources = useMemo(() => {
    return sources.filter(s => s.type === 'Bank' || !s.type);
  }, [sources]);

  const cardSources = useMemo(() => {
    return sources.filter(s => s.type === 'Card');
  }, [sources]);

  const sortedBankSources = useMemo(() => {
    return [...bankSources].sort((a, b) => (b.balance || 0) - (a.balance || 0));
  }, [bankSources]);

  const sortedCardSources = useMemo(() => {
    return [...cardSources].sort((a, b) => {
      return getCardDueAmount(b, transactions) - getCardDueAmount(a, transactions);
    });
  }, [cardSources, transactions]);

  const totalBankBalance = sources
    .filter(s => (s.type === 'Bank' || !s.type) && !excludedSourceIds.includes(String(s._id)))
    .reduce((sum, s) => sum + (s.balance || 0), 0);

  const totalCardSpent = sources
    .filter(s => s.type === 'Card' && !excludedSourceIds.includes(String(s._id)))
    .reduce((sum, source) => sum + getCardDueAmount(source, transactions), 0);

  const totalNetBalance = totalBankBalance - totalCardSpent;

  return (
    <div className="p-4 md:p-2 w-full max-w-[1600px] mx-auto pb-20">

      {error && !isDataLoading && (
        <div className="alert alert-error shadow-lg mb-6">
          <span>{typeof error === "string" ? error : "Failed to load expense data. Please try again."}</span>
        </div>
      )}

      {isDataLoading ? (
        <div className="h-80 flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Sidebar Controls (Left) - Sticky & Scrollable (Hidden scrollbar) */}
        <div className="hidden lg:block w-72 shrink-0 space-y-4 lg:sticky lg:top-2 lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto lg:overflow-x-hidden overscroll-contain scroll-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-1 pb-8">

          {/* Bank Balances Card - Clickable to open Popup */}
          <div
            onClick={() => {
              setBankModalTypeFilter("Bank");
              setShowBankBalancesModal(true);
            }}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-primary/40"
          >
            <div className="card-body p-4 relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                  <Building2 size={14} className="text-primary" />
                  <span>Bank Balances</span>
                  {!isCurrentMonth ? (
                    <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {dayjs(currentMonth).format("MMM 'YY")} Closing
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </h3>
                <span className="text-primary bg-primary/10 p-1 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" title="View All">
                  <ExternalLink size={12} />
                </span>
              </div>

              {/* Scrollable Bank Balances List (Side arrows) */}
              <div className="w-full pt-1 border-t border-base-300/30 flex items-center gap-1">
                {/* Up Arrow Button */}
                {sortedBankSources.length > 3 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sidebarScrollRef.current?.scrollBy({ top: -38, behavior: 'smooth' });
                    }}
                    className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                    title="Scroll Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                ) : <div className="w-3 shrink-0" />}

                {/* List Container (Scrollable, 3 items height) */}
                <div
                  ref={sidebarScrollRef}
                  className="flex-1 max-h-[72px] overflow-y-auto space-y-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {sortedBankSources.map((source) => {
                    const rawAmt = source.balance || 0;
                    const isNegativeBank = rawAmt < 0;
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
                        title={isExcluded ? "Click to include in Total calculation" : "Click to exclude from Total calculation"}
                      >
                        <span className="font-semibold text-base-content/80 truncate text-xs text-left flex items-center gap-1">
                          {isExcluded && <EyeOff size={10} className="shrink-0 text-amber-500" />}
                          {source.name}
                        </span>
                        <span className={`font-mono font-extrabold text-xs shrink-0 text-right ${isExcluded ? 'text-base-content/40' : (isNegativeBank ? 'text-error' : 'text-success')}`}>
                          {hideNumbers ? "••••••••" : (rawAmt < 0 ? `-₹${Math.abs(rawAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${rawAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Down Arrow Button */}
                {sortedBankSources.length > 3 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sidebarScrollRef.current?.scrollBy({ top: 38, behavior: 'smooth' });
                    }}
                    className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                    title="Scroll Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                ) : <div className="w-3 shrink-0" />}
              </div>

              {/* Total Bank Balance Line */}
              <div className="pt-2 border-t border-base-300/40 flex justify-between items-center text-xs font-bold">
                <span className="text-[10px] uppercase font-extrabold text-base-content/60 tracking-wider">
                  {isCurrentMonth ? "Total Bank Balance" : `${dayjs(currentMonth).format("MMM 'YY")} Closing Bank Balance`}
                </span>
                <span className={`font-mono text-xs font-extrabold ${totalBankBalance < 0 ? 'text-error' : 'text-success'}`}>
                  {hideNumbers ? "••••••••" : (totalBankBalance < 0 ? `-₹${Math.abs(totalBankBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${totalBankBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                </span>
              </div>
              {cardSources.length > 0 && (
                <div className="pt-0.5 flex justify-between items-center text-[11px] font-semibold text-base-content/60">
                  <span className="text-[9.5px] uppercase font-bold text-base-content/50 tracking-wider">
                    {isCurrentMonth ? "Net (Banks - Cards)" : `Net Closing (${dayjs(currentMonth).format("MMM")})`}
                  </span>
                  <span className={`font-mono text-[11px] font-extrabold ${totalNetBalance < 0 ? 'text-error' : 'text-success'}`}>
                    {hideNumbers ? "••••••••" : (totalNetBalance < 0 ? `-₹${Math.abs(totalNetBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${totalNetBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Credit Cards Card - Dedicated Card for Credit Cards */}
          {cardSources.length > 0 && (
            <div
              onClick={() => {
                setBankModalTypeFilter("Card");
                setShowBankBalancesModal(true);
              }}
              className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-error/40"
            >
              {/* Background Icon */}
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <CreditCard size={120} className="text-error" />
              </div>

              <div className="card-body p-4 relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                    <CreditCard size={14} className="text-error" />
                    <span>Credit Cards</span>
                    {!isCurrentMonth ? (
                      <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {dayjs(currentMonth).format("MMM 'YY")} Closing
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </h3>
                  <span className="text-error bg-error/10 p-1 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" title="View All">
                    <ExternalLink size={12} />
                  </span>
                </div>

                {/* Scrollable Credit Cards Balances List */}
                <div className="w-full pt-1 border-t border-base-300/30 flex items-center gap-1">
                  {/* Up Arrow Button */}
                  {sortedCardSources.length > 3 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cardScrollRef.current?.scrollBy({ top: -38, behavior: 'smooth' });
                      }}
                      className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                      title="Scroll Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                  ) : <div className="w-3 shrink-0" />}

                  {/* List Container (Scrollable, 3 items height) */}
                  <div
                    ref={cardScrollRef}
                    className="flex-1 max-h-[72px] overflow-y-auto space-y-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {sortedCardSources.map((source) => {
                      const cardSpent = getCardDueAmount(source, transactions);
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
                          title={isExcluded ? "Click to include in Total calculation" : "Click to exclude from Total calculation"}
                        >
                          <span className="font-semibold text-base-content/80 truncate text-xs text-left flex items-center gap-1">
                            {isExcluded && <EyeOff size={10} className="shrink-0 text-amber-500" />}
                            {source.name}
                          </span>
                          <span className={`font-mono font-extrabold text-xs shrink-0 text-right ${isExcluded ? 'text-base-content/40' : 'text-error'}`}>
                            {hideNumbers ? "••••••••" : `-₹${Math.abs(cardSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Down Arrow Button */}
                  {sortedCardSources.length > 3 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cardScrollRef.current?.scrollBy({ top: 38, behavior: 'smooth' });
                      }}
                      className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                      title="Scroll Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  ) : <div className="w-3 shrink-0" />}
                </div>

                {/* Total Outstanding Due Line */}
                <div className="pt-2 border-t border-base-300/40 flex justify-between items-center text-xs font-bold">
                  <span className="text-[10px] uppercase font-extrabold text-base-content/60 tracking-wider">
                    {isCurrentMonth ? "Total Outstanding Due" : `${dayjs(currentMonth).format("MMM 'YY")} Closing Due`}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-error">
                    {hideNumbers ? "••••••••" : `-₹${totalCardSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Debited Card */}
          <div
            onClick={() => setShowTransactionModal("debit")}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-error/30"
          >
            {/* Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <TrendingDown size={120} className="text-error" />
            </div>
            <div className="card-body p-4 sm:p-5 relative z-10">
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
                {hideNumbers || !showDebit ? "••••••••" : `₹${totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
            <div className="card-body p-4 sm:p-5 relative z-10">
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
                {hideNumbers || !showCredit ? "••••••••" : `₹${totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

          {/* Total Reimbursable Card */}
          <div
            onClick={() => setShowTransactionModal("reimbursable")}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-warning/40"
          >
            {/* Background Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Handshake size={120} className="text-warning" />
            </div>
            <div className="card-body p-4 sm:p-5 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  Total Reimbursable <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-warning" />
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReimbursable(!showReimbursable);
                  }}
                  className="btn btn-xs btn-ghost btn-square opacity-50 hover:opacity-100"
                  title={showReimbursable ? "Hide Balance" : "Show Balance"}
                >
                  {showReimbursable ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="text-3xl font-bold text-warning font-mono tracking-tighter">
                {hideNumbers || !showReimbursable ? "••••••••" : `₹${totalReimbursableToCollect.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                  <span className="text-[11px] font-bold text-base-content/60 font-mono">
                    {reimbursableTransactions.length} {reimbursableTransactions.length === 1 ? 'Pending Item' : 'Pending Items'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-md opacity-80 group-hover:opacity-100 transition-opacity">
                  View Pending →
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Main Table Area (Right on desktop, Full width on mobile) */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-6 w-full min-w-0">
          {/* Mobile Financial Overview (< lg) - High Density Financial Summary */}
          <div className="block lg:hidden w-full space-y-2.5 mb-1">
            {/* Net Balance Card */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 border border-base-content/10 rounded-2xl p-3.5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/60 block">
                    {isCurrentMonth ? "Net Available Balance" : `${dayjs(currentMonth).format("MMM 'YY")} Closing Net`}
                  </span>
                  <div className={`text-2xl font-black font-mono tracking-tight ${totalNetBalance < 0 ? 'text-error' : 'text-success'}`}>
                    {hideNumbers ? "••••••••" : (totalNetBalance < 0 ? `-₹${Math.abs(totalNetBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${totalNetBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBankModalTypeFilter("all");
                      setShowBankBalancesModal(true);
                    }}
                    className="btn btn-xs btn-outline rounded-xl text-[11px] font-bold gap-1 cursor-pointer"
                  >
                    <Wallet size={12} />
                    <span>Accounts</span>
                  </button>
                </div>
              </div>

              {/* Sub-breakdown: Banks & Cards Due */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-base-content/10">
                <div
                  onClick={() => {
                    setBankModalTypeFilter("Bank");
                    setShowBankBalancesModal(true);
                  }}
                  className="bg-base-200/50 hover:bg-base-200/80 transition-colors p-2.5 rounded-xl cursor-pointer border border-base-content/5"
                >
                  <div className="flex items-center justify-between text-[10px] text-base-content/60 font-semibold mb-0.5">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} className="text-primary" /> Banks
                    </span>
                    <ExternalLink size={9} className="opacity-50" />
                  </div>
                  <div className={`text-xs font-extrabold font-mono ${totalBankBalance < 0 ? 'text-error' : 'text-success'}`}>
                    {hideNumbers ? "••••••••" : (totalBankBalance < 0 ? `-₹${Math.abs(totalBankBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${totalBankBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                  </div>
                </div>

                <div
                  onClick={() => {
                    setBankModalTypeFilter("Card");
                    setShowBankBalancesModal(true);
                  }}
                  className="bg-base-200/50 hover:bg-base-200/80 transition-colors p-2.5 rounded-xl cursor-pointer border border-base-content/5"
                >
                  <div className="flex items-center justify-between text-[10px] text-base-content/60 font-semibold mb-0.5">
                    <span className="flex items-center gap-1">
                      <CreditCard size={11} className="text-error" /> CC Dues
                    </span>
                    <ExternalLink size={9} className="opacity-50" />
                  </div>
                  <div className="text-xs font-extrabold font-mono text-error">
                    {hideNumbers ? "••••••••" : `-₹${totalCardSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                </div>
              </div>

              {/* Monthly Activity Badges: Debited, Credited, Pending (Non-clickable) */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5 select-none">
                <div
                  className="bg-error/10 border border-error/20 p-2 rounded-xl text-left"
                >
                  <div className="text-[9.5px] font-bold text-error uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    <TrendingDown size={10} /> Debited
                  </div>
                  <div className="text-[11px] font-black font-mono text-error truncate">
                    {hideNumbers || !showDebit ? "••••••" : `₹${totalDebited.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  </div>
                </div>

                <div
                  className="bg-success/10 border border-success/20 p-2 rounded-xl text-left"
                >
                  <div className="text-[9.5px] font-bold text-success uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    <TrendingUp size={10} /> Credited
                  </div>
                  <div className="text-[11px] font-black font-mono text-success truncate">
                    {hideNumbers || !showCredit ? "••••••" : `₹${totalCredited.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  </div>
                </div>

                <div
                  className="bg-warning/10 border border-warning/20 p-2 rounded-xl text-left"
                >
                  <div className="text-[9.5px] font-bold text-warning uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    <Handshake size={10} /> Pending
                  </div>
                  <div className="text-[11px] font-black font-mono text-warning truncate">
                    {hideNumbers || !showReimbursable ? "••••••" : `₹${totalReimbursableToCollect.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
    )}

      {/* Heatmap Modal */}
      {showHeatmapModal && (
        <HeatmapModal
          transactions={transactions}
          currentMonth={currentMonth}
          onClose={() => setShowHeatmapModal(false)}
        />
      )}

      {/* Debited / Credited / Reimbursable Transactions List Popup Modal */}
      {showTransactionModal && (
        <TransactionListModal
          type={showTransactionModal}
          transactions={
            showTransactionModal === "debit"
              ? debitTransactions
              : showTransactionModal === "credit"
              ? creditTransactions
              : reimbursableTransactions
          }
          currentMonth={currentMonth}
          reimbursableSplits={reimbursableSplits}
          onUpdateSplit={updateSplit}
          onClose={() => setShowTransactionModal(null)}
        />
      )}

      {/* Bank Balances & Accounts Detailed Popup Modal */}
      <BankBalancesModal
        isOpen={showBankBalancesModal}
        onClose={() => setShowBankBalancesModal(false)}
        initialTypeFilter={bankModalTypeFilter}
      />
    </div>
  );
};

const HeatmapModal = ({ transactions, currentMonth, onClose }) => {
  const dispatch = useDispatch();
  const { sources = [], categories = [] } = useSelector((state) => state.expense);
  const [mobileTab, setMobileTab] = useState("debit"); // "debit" | "credit" | "net" (phone view only)
  const [upperLimit, setUpperLimit] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_calendar_limit");
      return saved ? Number(saved) : 5000;
    } catch (e) {
      return 5000;
    }
  });

  const [limitInput, setLimitInput] = useState(String(upperLimit));
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Default selected date to Today if in currentMonth, else 1st of month (both panels open simultaneously)
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    if (dayjs().isSame(dayjs(currentMonth), "month")) {
      return todayStr;
    }
    return dayjs(currentMonth).startOf("month").format("YYYY-MM-DD");
  });

  const handleLimitSave = (newVal) => {
    const num = Math.max(100, Number(newVal) || 5000);
    setUpperLimit(num);
    setLimitInput(String(num));
    setIsEditingLimit(false);
    try {
      localStorage.setItem("expense_calendar_limit", String(num));
    } catch (e) {}
  };

  // 1. Generate all dates for current month
  const startOfMonth = dayjs(currentMonth).startOf("month");
  const endOfMonth = dayjs(currentMonth).endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

  // 2. Aggregate spending, credits and txns per day
  const dailySpending = {}; // Debits
  const dailyCredits = {};  // Credits
  const dailyDebitCount = {};
  const dailyCreditCount = {};
  const dailyTxns = {};

  transactions.forEach((t) => {
    const dateStr = dayjs(t.date).format("YYYY-MM-DD");
    if (!dailySpending[dateStr]) dailySpending[dateStr] = 0;
    if (!dailyCredits[dateStr]) dailyCredits[dateStr] = 0;
    if (!dailyDebitCount[dateStr]) dailyDebitCount[dateStr] = 0;
    if (!dailyCreditCount[dateStr]) dailyCreditCount[dateStr] = 0;
    if (!dailyTxns[dateStr]) dailyTxns[dateStr] = [];

    dailyTxns[dateStr].push(t);
    const amt = Number(t.amount || 0);
    const type = (t.type || "Debit").toLowerCase();

    if (type === "credit") {
      dailyCredits[dateStr] += amt;
      dailyCreditCount[dateStr] += 1;
    } else if (type === "debit") {
      dailySpending[dateStr] += amt;
      dailyDebitCount[dateStr] += 1;
    } else if (type === "transfer") {
      // Transfer transactions are listed in day details
    } else if (amt > 0) {
      // Default to debit if unspecified
      dailySpending[dateStr] += amt;
      dailyDebitCount[dateStr] += 1;
    }
  });

  // 3. Calendar Grid Generation (Always fixed to 42 slots / 6 rows so modal size never changes between months)
  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(startOfMonth.date(i));
  }
  while (days.length < 42) {
    days.push(null);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Quartile cutoffs based on user's upperLimit
  const q1 = Math.round(upperLimit * 0.25);
  const q2 = Math.round(upperLimit * 0.5);
  const q3 = Math.round(upperLimit * 0.75);
  const q4 = upperLimit;

  // Monthly stats
  const totalMonthSpent = Object.values(dailySpending).reduce((sum, v) => sum + v, 0);
  const totalMonthCredits = Object.values(dailyCredits).reduce((sum, v) => sum + v, 0);
  const totalNetFlow = totalMonthCredits - totalMonthSpent;
  const spendingDaysCount = Object.values(dailySpending).filter((v) => v > 0).length;

  // Color coding function with soft translucent styling
  const getDayColor = (debitAmt, creditAmt) => {
    if (debitAmt <= 0) {
      if (creditAmt > 0) {
        return {
          bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
          border: "border-emerald-500/25",
          text: "text-emerald-700 dark:text-emerald-300 font-bold",
          tier: "credit_only"
        };
      }
      return {
        bg: "bg-base-200/30 hover:bg-base-200/60",
        border: "border-base-300/40",
        text: "text-base-content/60",
        tier: "none"
      };
    }
    const pct = (debitAmt / upperLimit) * 100;
    if (pct <= 25) {
      // 0 - 25% Green
      return {
        bg: "bg-emerald-500/15 hover:bg-emerald-500/25",
        border: "border-emerald-500/30",
        text: "text-emerald-700 dark:text-emerald-300 font-bold",
        tier: "q1"
      };
    }
    if (pct <= 50) {
      // 26 - 50% Blue
      return {
        bg: "bg-blue-500/15 hover:bg-blue-500/25",
        border: "border-blue-500/30",
        text: "text-blue-700 dark:text-blue-300 font-bold",
        tier: "q2"
      };
    }
    if (pct <= 75) {
      // 51 - 75% Yellow
      return {
        bg: "bg-amber-500/15 hover:bg-amber-500/25",
        border: "border-amber-500/30",
        text: "text-amber-700 dark:text-amber-300 font-bold",
        tier: "q3"
      };
    }
    if (pct <= 100) {
      // 76 - 100% Red
      return {
        bg: "bg-rose-500/20 hover:bg-rose-500/30",
        border: "border-rose-500/35",
        text: "text-rose-700 dark:text-rose-300 font-bold",
        tier: "q4"
      };
    }
    // > 100% Over limit: Dark Red / Maroon
    return {
      bg: "bg-rose-950/40 hover:bg-rose-950/50",
      border: "border-rose-800/60",
      text: "text-rose-200 font-bold",
      tier: "over"
    };
  };

  const [infoModalTx, setInfoModalTx] = useState(null);

  const selectedTxns = selectedDateStr ? dailyTxns[selectedDateStr] || [] : [];
  const selectedDayDebit = selectedDateStr ? dailySpending[selectedDateStr] || 0 : 0;
  const selectedDayDebitCount = selectedDateStr ? dailyDebitCount[selectedDateStr] || 0 : 0;
  const selectedDayCredit = selectedDateStr ? dailyCredits[selectedDateStr] || 0 : 0;
  const selectedDayCreditCount = selectedDateStr ? dailyCreditCount[selectedDateStr] || 0 : 0;
  const selectedDayNet = selectedDayCredit - selectedDayDebit;
  const selectedDayTier = selectedDateStr ? getDayColor(selectedDayDebit, selectedDayCredit) : null;

  const formatAmtClean = (val) => {
    if (!val) return "0";
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(Math.round(val));
  };

  const formatCellAmt = (amt) => {
    if (!amt || amt === 0) return null;
    const abs = Math.abs(amt);
    if (abs >= 100000) return `${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
    return `${Math.round(abs)}`;
  };

  const mobileCells = useMemo(() => {
    const monthObj = dayjs(currentMonth);
    const firstDayIndex = monthObj.startOf("month").day(); // 0=Sun..6=Sat
    const daysInCurrMonth = monthObj.daysInMonth();
    const prevMonthObj = monthObj.subtract(1, "month");
    const daysInPrevMonth = prevMonthObj.daysInMonth();

    const cells = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      cells.push({
        dayNum,
        dateStr: prevMonthObj.date(dayNum).format("YYYY-MM-DD"),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let dayNum = 1; dayNum <= daysInCurrMonth; dayNum++) {
      cells.push({
        dayNum,
        dateStr: monthObj.date(dayNum).format("YYYY-MM-DD"),
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month
    const nextMonthObj = monthObj.add(1, "month");
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      cells.push({
        dayNum,
        dateStr: nextMonthObj.date(dayNum).format("YYYY-MM-DD"),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth]);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Mobile Phone View (Calorie Dashboard Style Calendar Modal - Only in Phone View) */}
      <div
        className="block sm:hidden w-full max-w-[360px] bg-base-100 border border-base-300/80 rounded-3xl p-4 shadow-2xl space-y-3.5 transition-all text-base-content max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-base-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Calendar size={16} />
            </span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-base-content">
                Spending Calendar
              </h3>
              <p className="text-[10px] text-base-content/60 font-medium">
                Daily cash flow & expense breakdown
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content hover:bg-base-200"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tabs: Debit, Credit, Net (Only in phone view) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-base-200/80 rounded-2xl border border-base-300/50">
          <button
            type="button"
            onClick={() => setMobileTab("debit")}
            className={`py-1.5 px-1.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              mobileTab === "debit"
                ? "bg-rose-500 text-white shadow-xs font-black"
                : "text-base-content/70 hover:text-base-content hover:bg-base-100/60"
            }`}
          >
            <div className="flex items-center gap-1">
              <TrendingDown size={13} />
              <span>Debit</span>
            </div>
            <span
              className={`text-[10px] font-mono leading-none ${
                mobileTab === "debit" ? "text-white/90 font-black" : "text-rose-500 font-bold"
              }`}
            >
              -₹{formatAmtClean(totalMonthSpent)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("credit")}
            className={`py-1.5 px-1.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              mobileTab === "credit"
                ? "bg-emerald-600 text-white shadow-xs font-black"
                : "text-base-content/70 hover:text-base-content hover:bg-base-100/60"
            }`}
          >
            <div className="flex items-center gap-1">
              <TrendingUp size={13} />
              <span>Credit</span>
            </div>
            <span
              className={`text-[10px] font-mono leading-none ${
                mobileTab === "credit" ? "text-white/90 font-black" : "text-emerald-500 font-bold"
              }`}
            >
              +₹{formatAmtClean(totalMonthCredits)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("net")}
            className={`py-1.5 px-1.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              mobileTab === "net"
                ? "bg-primary text-primary-content shadow-xs font-black"
                : "text-base-content/70 hover:text-base-content hover:bg-base-100/60"
            }`}
          >
            <div className="flex items-center gap-1">
              <ArrowUpDown size={13} />
              <span>Net</span>
            </div>
            <span
              className={`text-[10px] font-mono leading-none ${
                mobileTab === "net"
                  ? "text-primary-content/90 font-black"
                  : totalNetFlow >= 0
                  ? "text-emerald-500 font-bold"
                  : "text-rose-500 font-bold"
              }`}
            >
              {totalNetFlow >= 0 ? "+" : "-"}₹{formatAmtClean(Math.abs(totalNetFlow))}
            </span>
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, "month").format("YYYY-MM")))}
            className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/80"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-center">
            <span className="font-extrabold text-sm text-base-content tracking-tight">
              {dayjs(currentMonth).format("MMMM YYYY")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, "month").format("YYYY-MM")))}
            className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/80"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-base-content/40 tracking-wider">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {mobileCells.map((cell) => {
            const isSelected = cell.dateStr === selectedDateStr;
            const isToday = cell.dateStr === dayjs().format("YYYY-MM-DD");
            const dSpent = dailySpending[cell.dateStr] || 0;
            const dCredit = dailyCredits[cell.dateStr] || 0;
            const dNet = dCredit - dSpent;

            let amtLabel = null;
            let amtColor = "";
            if (mobileTab === "debit" && dSpent > 0) {
              amtLabel = `-₹${formatCellAmt(dSpent)}`;
              amtColor = isSelected ? "text-primary-content/90 font-black" : "text-rose-500 font-bold";
            } else if (mobileTab === "credit" && dCredit > 0) {
              amtLabel = `+₹${formatCellAmt(dCredit)}`;
              amtColor = isSelected ? "text-primary-content/90 font-black" : "text-emerald-500 font-bold";
            } else if (mobileTab === "net" && (dCredit > 0 || dSpent > 0)) {
              if (dNet > 0) {
                amtLabel = `+₹${formatCellAmt(dNet)}`;
                amtColor = isSelected ? "text-primary-content/90 font-black" : "text-emerald-500 font-bold";
              } else if (dNet < 0) {
                amtLabel = `-₹${formatCellAmt(Math.abs(dNet))}`;
                amtColor = isSelected ? "text-primary-content/90 font-black" : "text-rose-500 font-bold";
              } else {
                amtLabel = "₹0";
                amtColor = isSelected ? "text-primary-content/80 font-bold" : "text-base-content/50";
              }
            }

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => {
                  setSelectedDateStr(cell.dateStr);
                  if (!cell.isCurrentMonth) {
                    dispatch(setMonth(dayjs(cell.dateStr).format("YYYY-MM")));
                  }
                }}
                className={`relative h-11 w-full flex flex-col items-center justify-center rounded-xl text-xs transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? "bg-primary text-primary-content font-black shadow-md scale-102"
                    : isToday
                    ? "border-2 border-primary text-primary font-black bg-primary/5 hover:bg-primary/10"
                    : cell.isCurrentMonth
                    ? "text-base-content hover:bg-base-200 hover:text-primary font-semibold"
                    : "text-base-content/30 opacity-40 hover:bg-base-200/50 hover:opacity-100 font-normal"
                }`}
              >
                <span className="text-[11px] leading-tight font-sans">{cell.dayNum}</span>
                {amtLabel ? (
                  <span className={`text-[8px] font-mono leading-none tracking-tighter ${amtColor}`}>
                    {amtLabel}
                  </span>
                ) : (
                  <span className="h-[8px]"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Details & Transactions (Below Grid) */}
        <div className="bg-base-200/50 rounded-2xl p-2.5 border border-base-300/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-base-content">
                {selectedDateStr ? dayjs(selectedDateStr).format("ddd, MMM D") : "Select a day"}
              </span>
              {selectedDateStr === dayjs().format("YYYY-MM-DD") && (
                <span className="badge badge-xs badge-primary font-bold">Today</span>
              )}
            </div>
            <div className="text-[11px] font-mono font-bold">
              {mobileTab === "debit" && (
                <span className="text-rose-500 font-black">-₹{Number(selectedDayDebit || 0).toLocaleString()}</span>
              )}
              {mobileTab === "credit" && (
                <span className="text-emerald-500 font-black">+₹{Number(selectedDayCredit || 0).toLocaleString()}</span>
              )}
              {mobileTab === "net" && (
                <span className={`font-black ${selectedDayNet >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {selectedDayNet >= 0 ? "+" : "-"}₹{Math.abs(selectedDayNet).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable transactions list for the selected day */}
          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-0.5">
            {selectedTxns.length > 0 ? (
              selectedTxns.map((t) => {
                const rawType = t.type || "Debit";
                const isCredit = rawType.toLowerCase() === "credit";
                const isTrf = rawType.toLowerCase() === "transfer";

                const sourceObj = t.sourceId;
                const srcName = sourceObj?.name || (typeof sourceObj === "string" ? sourceObj : "");
                const srcStyle = getSourceTagStyle(sourceObj || srcName, sources);

                const targetObj = t.targetSourceId;
                const trgName = targetObj?.name || (typeof targetObj === "string" ? targetObj : "Bank");
                const trgStyle = getSourceTagStyle(targetObj || trgName, sources);

                const catObj = t.categoryId;
                const catName = catObj?.name || (typeof catObj === "string" ? catObj : "");
                const catStyle = getCategoryTagStyle(catObj || catName, categories);

                return (
                  <div
                    key={t._id || t.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-base-100 border border-base-300/70 text-xs gap-2"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-extrabold text-[11px] text-base-content truncate">
                        {t.description || (isCredit ? "Credit Income" : "Expense")}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap text-[9px]">
                        {srcName && (
                          <span className={`px-1.5 py-0.5 rounded font-semibold ${srcStyle.bg} ${srcStyle.text}`}>
                            {srcName}
                          </span>
                        )}
                        {isTrf && trgName && (
                          <span className={`px-1.5 py-0.5 rounded font-semibold ${trgStyle.bg} ${trgStyle.text}`}>
                            → {trgName}
                          </span>
                        )}
                        {catName && (
                          <span className={`px-1.5 py-0.5 rounded font-semibold ${catStyle.bg} ${catStyle.text}`}>
                            {catName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`font-mono font-black text-xs whitespace-nowrap ${
                          isCredit
                            ? "text-emerald-500"
                            : isTrf
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}
                      >
                        {isCredit ? "+" : isTrf ? "" : "-"}₹{Number(t.amount || 0).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInfoModalTx(t)}
                        className={`btn btn-xs btn-ghost btn-circle ${
                          t.info && t.info.trim()
                            ? "text-primary bg-primary/10 hover:bg-primary/20"
                            : "text-base-content/40 hover:text-base-content hover:bg-base-300/60"
                        }`}
                        title={t.info && t.info.trim() ? `Note: ${t.info}` : "View Notes (i)"}
                      >
                        <Info size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-3 text-center text-[11px] text-base-content/50 italic">
                No transactions on this date
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-base-200 text-xs">
          <button
            type="button"
            onClick={() => {
              const today = dayjs().format("YYYY-MM-DD");
              setSelectedDateStr(today);
              dispatch(setMonth(dayjs().format("YYYY-MM")));
            }}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-xl transition-all active:scale-95 border border-primary/20"
          >
            <RotateCcw size={11} /> Today
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>

      {/* Desktop View - Fixed Dimension Modal Container (Constant width & height across all months) */}
      <div
        className="hidden sm:flex flex-col lg:flex-row items-stretch justify-center gap-4 h-[90vh] min-h-[660px] max-h-[840px] max-w-7xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Main Calendar Panel (Left - Fixed Size & 6-Row Grid) */}
        <div className="flex-[1.4] h-full bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col justify-between text-xs animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header with Integrated Month Switcher & Totals */}
          <div className="shrink-0 p-4 sm:p-5 border-b border-base-200 bg-base-200/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs shrink-0">
                <Calendar size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-base-content leading-tight">
                    Spending & Cash Flow Calendar
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-base-content/70 flex-wrap font-medium">
                  <span>Debited: <strong className="text-rose-400 font-mono">₹{totalMonthSpent.toLocaleString()}</strong> ({spendingDaysCount} active days)</span>
                  <span>•</span>
                  <span>Credited: <strong className="text-emerald-500 font-mono">₹{totalMonthCredits.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Net: <strong className={`font-mono ${totalNetFlow >= 0 ? "text-emerald-500" : "text-rose-400"}`}>{totalNetFlow >= 0 ? "+" : "-"}₹{Math.abs(totalNetFlow).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Month Switcher & Close Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-base-100 px-2 py-1 rounded-xl border border-base-300 shadow-2xs">
                <button
                  onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
                  className="btn btn-xs btn-ghost btn-square font-bold"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-extrabold text-xs font-sans px-2 text-primary whitespace-nowrap">
                  {dayjs(currentMonth).format("MMMM YYYY")}
                </span>
                <button
                  onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
                  className="btn btn-xs btn-ghost btn-square font-bold"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="btn btn-xs sm:btn-sm btn-ghost gap-1 px-1.5 rounded-xl text-base-content/70 hover:text-base-content hover:bg-base-200/80 transition-all font-mono select-none"
                title="Close (Press Esc)"
              >
                <kbd className="kbd kbd-sm font-mono font-black text-[11px] bg-base-100 border border-base-300 shadow-2xs px-2 py-0.5 rounded-lg cursor-pointer">ESC</kbd>
              </button>
            </div>
          </div>

          {/* Daily Limit & Quartile Target Bar */}
          <div className="px-5 py-2.5 bg-base-200/40 border-b border-base-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base-content/80 text-[11px] uppercase tracking-wider">
                Daily Debit Target:
              </span>
              {isEditingLimit ? (
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold opacity-50 text-[11px]">₹</span>
                    <input
                      type="number"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      className="input input-xs input-bordered pl-6 pr-2 w-28 font-mono font-bold text-primary rounded-lg text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleLimitSave(limitInput);
                        if (e.key === "Escape") setIsEditingLimit(false);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleLimitSave(limitInput)}
                    className="btn btn-xs btn-primary rounded-lg font-bold px-2.5"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingLimit(false)}
                    className="btn btn-xs btn-ghost rounded-lg px-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setLimitInput(String(upperLimit));
                      setIsEditingLimit(true);
                    }}
                    className="badge badge-primary badge-outline font-mono font-extrabold text-xs px-2.5 py-2 cursor-pointer hover:bg-primary hover:text-primary-content transition-colors"
                    title="Click to edit daily upper limit"
                  >
                    ₹{upperLimit.toLocaleString()} <span className="text-[10px] ml-1 opacity-70">✎ Edit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-base-content/50">Presets:</span>
              {[2000, 5000, 10000, 20000, 50000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleLimitSave(preset)}
                  className={`btn btn-xs rounded-lg font-mono font-bold px-2 text-[11px] ${
                    upperLimit === preset
                      ? "btn-primary shadow-xs"
                      : "btn-ghost bg-base-100 hover:bg-base-200 text-base-content/70 border border-base-300/60"
                  }`}
                >
                  ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid Area (Fixed 6-Row Grid, Fits Entire Vertical Space) */}
          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between overflow-hidden min-h-0">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-2 text-center font-black text-xs uppercase tracking-wider text-base-content/60 mb-1.5 shrink-0">
              {weekDays.map((day) => (
                <div key={day} className="py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid - 6 Fixed Rows */}
            <div className="grid grid-cols-7 grid-rows-6 gap-2 sm:gap-2.5 flex-1 min-h-0">
              {days.map((date, idx) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-full min-h-0 rounded-2xl bg-base-200/20 border border-dashed border-base-300/20"
                    ></div>
                  );
                }

                const dateStr = date.format("YYYY-MM-DD");
                const debitAmt = dailySpending[dateStr] || 0;
                const debitCnt = dailyDebitCount[dateStr] || 0;
                const creditAmt = dailyCredits[dateStr] || 0;
                const creditCnt = dailyCreditCount[dateStr] || 0;
                const totalDayTxns = debitCnt + creditCnt;
                const isToday = dateStr === dayjs().format("YYYY-MM-DD");
                const isSelected = selectedDateStr === dateStr;

                const style = getDayColor(debitAmt, creditAmt);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-full min-h-0 rounded-2xl flex flex-col justify-between p-2 sm:p-2.5 transition-all cursor-pointer relative border ${
                      style.bg
                    } ${style.border} ${
                      isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100 scale-[1.02] z-20 shadow-xl font-bold bg-primary/5" : "hover:scale-[1.01] hover:shadow-md"
                    } ${
                      isToday ? "border-2 border-primary shadow-xs" : ""
                    }`}
                    title={`${date.format("ddd, DD MMM YYYY")}\nDebited: ₹${debitAmt.toLocaleString()} (${debitCnt} Db)\nCredited: ₹${creditAmt.toLocaleString()} (${creditCnt} Cr)`}
                  >
                    {/* Top Row: Date Number + Today Pill or Total Txns badge */}
                    <div className="flex items-center justify-between w-full leading-none">
                      <span className={`text-xs sm:text-sm font-black ${style.text}`}>
                        {date.date()}
                      </span>
                      
                      {isToday ? (
                        <span className="badge badge-xs badge-primary font-extrabold text-[8.5px] uppercase tracking-wider px-1.5 py-0.5">
                          Today
                        </span>
                      ) : totalDayTxns > 0 ? (
                        <span className="text-[9.5px] font-mono font-bold text-base-content/40">
                          {totalDayTxns} txn{totalDayTxns === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Area: Clean debited and credited amounts matching txns font size with lightened colors */}
                    <div className="w-full space-y-0.5">
                      {debitAmt > 0 && (
                        <div className="flex items-center justify-between text-[9.5px] font-mono font-extrabold text-rose-400 leading-tight">
                          <span>-₹{formatAmtClean(debitAmt)}</span>
                          {debitCnt > 1 && (
                            <span className="text-[8.5px] font-sans font-bold text-rose-400/75">{debitCnt} Db</span>
                          )}
                        </div>
                      )}

                      {creditAmt > 0 && (
                        <div className="flex items-center justify-between text-[9.5px] font-mono font-extrabold text-emerald-500 leading-tight">
                          <span>+₹{formatAmtClean(creditAmt)}</span>
                          {creditCnt > 1 && (
                            <span className="text-[8.5px] font-sans font-bold text-emerald-500/75">{creditCnt} Cr</span>
                          )}
                        </div>
                      )}

                      {debitAmt === 0 && creditAmt === 0 && (
                        <div className="text-center py-0.5">
                          <span className="text-[9.5px] text-base-content/20 font-mono">—</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dedicated Right-Side Day Detail Panel (Always Visible, Fixed Height) */}
        <div className="w-full lg:w-[420px] h-full bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col justify-between text-xs animate-in fade-in zoom-in-95 duration-200 shrink-0">
          
          {/* Right Panel Header */}
          <div className="p-4 sm:p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shadow-xs shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-base-content">
                  {selectedDateStr ? dayjs(selectedDateStr).format("DD MMMM YYYY") : "Select a Day"}
                </h4>
                <p className="text-xs text-base-content/60 font-medium">
                  {selectedDateStr ? dayjs(selectedDateStr).format("dddd") : "Click any date on calendar"}
                </p>
              </div>
            </div>
            {selectedDateStr && (
              <span className="badge badge-sm badge-neutral font-bold opacity-80">
                {selectedTxns.length} Activity
              </span>
            )}
          </div>

          {/* Right Panel Body */}
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
            
            {/* Day Summary Cards (Debited, Credited & Net Flow) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Debited Box */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-extrabold text-rose-400 uppercase tracking-wider">
                  <span>Debited</span>
                  <span className="badge badge-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">{selectedDayDebitCount} Db</span>
                </div>
                <div className="text-lg sm:text-xl font-black font-mono text-rose-400 leading-tight">
                  -₹{Number(selectedDayDebit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Credited Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-extrabold text-emerald-500 dark:text-emerald-300 uppercase tracking-wider">
                  <span>Credited</span>
                  <span className="badge badge-xs bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border border-emerald-500/30 font-bold">{selectedDayCreditCount} Cr</span>
                </div>
                <div className="text-lg sm:text-xl font-black font-mono text-emerald-500 dark:text-emerald-300 leading-tight">
                  +₹{Number(selectedDayCredit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Net Day Flow Banner */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              selectedDayNet >= 0
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/25 text-rose-400"
            }`}>
              <div className="flex items-center gap-2">
                {selectedDayNet >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-400" />}
                <span className="font-extrabold text-xs">Day Net Flow:</span>
              </div>
              <span className="font-mono font-black text-sm">
                {selectedDayNet >= 0 ? "+" : "-"}₹{Math.abs(selectedDayNet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Transactions Feed */}
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-base-content/70 uppercase tracking-wider">
                  Transactions ({selectedTxns.length})
                </span>
                <span className="text-[11px] text-base-content/50 font-medium">
                  {selectedDateStr ? dayjs(selectedDateStr).format("MMM DD") : ""}
                </span>
              </div>

              {selectedTxns.length > 0 ? (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {selectedTxns.map((t) => {
                    const rawType = t.type || "Debit";
                    const isCredit = rawType.toLowerCase() === "credit";
                    const isTrf = rawType.toLowerCase() === "transfer";
                    const isManDebit = rawType.toLowerCase() === "debit" && !t.categoryId;

                    const sourceObj = t.sourceId;
                    const srcName = sourceObj?.name || (typeof sourceObj === "string" ? sourceObj : "");
                    const srcStyle = getSourceTagStyle(sourceObj || srcName, sources);

                    const targetObj = t.targetSourceId;
                    const trgName = targetObj?.name || (typeof targetObj === "string" ? targetObj : "Bank");
                    const trgStyle = getSourceTagStyle(targetObj || trgName, sources);

                    const catObj = t.categoryId;
                    const catName = catObj?.name || (typeof catObj === "string" ? catObj : "");
                    const catStyle = getCategoryTagStyle(catObj || catName, categories);

                    const catId = catObj?._id || (typeof catObj === "string" ? catObj : "");
                    const subId = t.subCategoryId?._id || (typeof t.subCategoryId === "string" ? t.subCategoryId : "");
                    const foundCat = categories.find((c) => c._id === catId);
                    const foundSub = foundCat?.subCategories?.find((s) => s._id === subId);
                    const subName = foundSub?.name || (typeof t.subCategoryId === "object" ? t.subCategoryId?.name : (typeof t.subCategoryId === "string" && t.subCategoryId !== subId ? t.subCategoryId : ""));

                    return (
                      <div
                        key={t._id || t.id}
                        className="bg-base-200/40 hover:bg-base-200/80 transition-all p-3 rounded-2xl border border-base-300/60 space-y-2.5 hover:shadow-xs"
                      >
                        {/* Top Line: Tag Badge + Description + Amount */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Tag matching table entry style */}
                            {isCredit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                                <TrendingUp size={11} className="shrink-0 text-emerald-500" />
                                <span>+ Add Money</span>
                              </span>
                            ) : isTrf ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 shrink-0">
                                <ArrowRightLeft size={11} className="shrink-0 text-amber-500" />
                                <span>Transfer</span>
                              </span>
                            ) : isManDebit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                                <TrendingDown size={11} className="shrink-0 text-rose-400" />
                                <span>- Debit Money</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                                <TrendingDown size={11} className="shrink-0 text-rose-400" />
                                <span>Debit</span>
                              </span>
                            )}

                            <span className="font-extrabold text-xs text-base-content leading-snug truncate">
                              {t.description || (isCredit ? "Credit Income" : "Expense Transaction")}
                            </span>
                          </div>

                          <span
                            className={`font-mono font-black text-sm shrink-0 whitespace-nowrap ${
                              isCredit
                                ? "text-emerald-500 dark:text-emerald-300"
                                : isTrf
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {isCredit ? "+" : isTrf ? "" : "-"}₹{Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Bottom Line: Source, Category / Target Bank Tags & Note Icon */}
                        <div className="flex items-center justify-between gap-1 flex-wrap pt-1.5 border-t border-base-300/40 text-[11px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isCredit ? (
                              /* 1. Add Money: To Bank Tag */
                              srcName && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold ${srcStyle.bg} ${srcStyle.text} border ${srcStyle.border} shrink-0`}
                                  title={`Added to ${srcName}`}
                                >
                                  <Wallet size={11} className="shrink-0 text-emerald-500" />
                                  <span>To: {srcName}</span>
                                </span>
                              )
                            ) : isManDebit ? (
                              /* 2. Debited Money: From Bank Tag */
                              srcName && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold ${srcStyle.bg} ${srcStyle.text} border ${srcStyle.border} shrink-0`}
                                  title={`Debited from ${srcName}`}
                                >
                                  <Wallet size={11} className="shrink-0 text-rose-400" />
                                  <span>From: {srcName}</span>
                                </span>
                              )
                            ) : isTrf ? (
                              /* 3. Transfer: From Bank and To Bank */
                              <>
                                {srcName && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${srcStyle.bg} ${srcStyle.text} border ${srcStyle.border} shrink-0`}
                                    title={`From ${srcName}`}
                                  >
                                    <Wallet size={11} className="shrink-0" />
                                    <span>From: {srcName}</span>
                                  </span>
                                )}
                                {trgName && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold ${trgStyle.bg} ${trgStyle.text} border ${trgStyle.border} shrink-0`}
                                    title={`Transfer to ${trgName}`}
                                  >
                                    <ArrowRightLeft size={11} className="shrink-0 text-amber-500" />
                                    <span>To: {trgName}</span>
                                  </span>
                                )}
                              </>
                            ) : (
                              /* 4. Regular Expense: Bank tag, Category tag, Sub Category tag */
                              <>
                                {srcName && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${srcStyle.bg} ${srcStyle.text} border ${srcStyle.border} shrink-0`}
                                    title={srcName}
                                  >
                                    <Wallet size={11} className="shrink-0" />
                                    <span>{srcName}</span>
                                  </span>
                                )}
                                {catName && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border} shrink-0`}
                                    title={catName}
                                  >
                                    <Folder size={11} className="shrink-0" />
                                    <span>{catName}</span>
                                  </span>
                                )}
                                {subName && (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-base-300/50 text-base-content/70 border border-base-300 shrink-0"
                                    title={`Subcategory: ${subName}`}
                                  >
                                    <span>{subName}</span>
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {/* Note / Info Button */}
                          <button
                            type="button"
                            onClick={() => setInfoModalTx(t)}
                            className={`btn btn-xs btn-ghost btn-circle ${
                              t.info && t.info.trim()
                                ? "text-primary bg-primary/10 hover:bg-primary/20"
                                : "text-base-content/40 hover:text-base-content hover:bg-base-300/60"
                            }`}
                            title={t.info && t.info.trim() ? `Note: ${t.info}` : "Add / View Notes (i)"}
                          >
                            <Info size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs opacity-50 italic bg-base-200/30 rounded-2xl border border-dashed border-base-300">
                  No transactions recorded on this day.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel Footer */}
          <div className="p-3.5 bg-base-200/50 border-t border-base-200 text-center text-xs text-base-content/60 font-medium">
            Click any date on the calendar to inspect transactions
          </div>
        </div>
      </div>

      {/* Info / Notes Modal */}
      {infoModalTx && (
        <TransactionInfoModal
          transaction={infoModalTx}
          isOpen={Boolean(infoModalTx)}
          onClose={() => setInfoModalTx(null)}
        />
      )}
    </div>
  );
};

const TransactionListModal = ({ type, transactions, currentMonth, reimbursableSplits = {}, onUpdateSplit, onClose }) => {
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

  const [infoModalTx, setInfoModalTx] = useState(null);

  // Writable split and editable collect amounts state
  const [editingSplits, setEditingSplits] = useState({});
  const [editingAmounts, setEditingAmounts] = useState({});

  const handleSplitChange = (txId, newCount) => {
    const safeCount = Math.max(1, Math.min(100, Number(newCount) || 1));
    if (onUpdateSplit) {
      onUpdateSplit(txId, { splitCount: safeCount, customAmount: null });
    }
    setEditingSplits((prev) => {
      const next = { ...prev };
      delete next[String(txId)];
      return next;
    });
    setEditingAmounts((prev) => {
      const next = { ...prev };
      delete next[String(txId)];
      return next;
    });
  };

  const handleSplitInputChange = (txId, rawVal) => {
    setEditingSplits((prev) => ({ ...prev, [String(txId)]: rawVal }));
    const val = parseInt(rawVal, 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      if (onUpdateSplit) {
        onUpdateSplit(txId, { splitCount: val, customAmount: null });
      }
      setEditingAmounts((prev) => {
        const next = { ...prev };
        delete next[String(txId)];
        return next;
      });
    }
  };

  const handleSplitInputBlur = (txId, fallbackCount) => {
    const rawVal = editingSplits[String(txId)];
    if (rawVal !== undefined) {
      const val = parseInt(rawVal, 10);
      const safe = isNaN(val) || val < 1 ? 1 : Math.min(100, val);
      if (onUpdateSplit) {
        onUpdateSplit(txId, { splitCount: safe, customAmount: null });
      }
      setEditingSplits((prev) => {
        const next = { ...prev };
        delete next[String(txId)];
        return next;
      });
    }
  };

  const handleAmountInputChange = (txId, rawVal, totalAmount, currentSplit) => {
    setEditingAmounts((prev) => ({ ...prev, [String(txId)]: rawVal }));
    const num = parseFloat(rawVal);
    if (!isNaN(num) && num >= 0) {
      if (onUpdateSplit) {
        onUpdateSplit(txId, { splitCount: currentSplit, customAmount: Math.min(totalAmount, num) });
      }
    }
  };

  const handleAmountInputBlur = (txId, totalAmount, currentSplit) => {
    const rawVal = editingAmounts[String(txId)];
    if (rawVal !== undefined) {
      if (rawVal === "" || isNaN(parseFloat(rawVal))) {
        if (onUpdateSplit) {
          onUpdateSplit(txId, { splitCount: currentSplit, customAmount: null });
        }
      } else {
        const num = Math.min(totalAmount, Math.max(0, parseFloat(rawVal)));
        if (onUpdateSplit) {
          onUpdateSplit(txId, { splitCount: currentSplit, customAmount: num });
        }
      }
      setEditingAmounts((prev) => {
        const next = { ...prev };
        delete next[String(txId)];
        return next;
      });
    }
  };

  const handleResetAmount = (txId, currentSplit) => {
    if (onUpdateSplit) {
      onUpdateSplit(txId, { splitCount: currentSplit, customAmount: null });
    }
    setEditingAmounts((prev) => {
      const next = { ...prev };
      delete next[String(txId)];
      return next;
    });
  };

  const hasColFilters = Boolean(colFilters.date || colFilters.description || colFilters.sourceId || colFilters.categoryId);
  const clearColFilters = () => setColFilters({ date: "", description: "", sourceId: "", categoryId: "" });

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder);
    localStorage.setItem("expense_sort_order", newOrder);
  };

  const isDebit = type === "debit";
  const isReimbursable = type === "reimbursable";
  const title = isReimbursable ? "Pending Reimbursable Money" : (isDebit ? "Debited Transactions" : "Credited Transactions");
  const accentColor = isReimbursable ? "text-warning" : (isDebit ? "text-error" : "text-success");
  const bgBadge = isReimbursable
    ? "bg-warning/10 text-warning border-warning/20"
    : (isDebit ? "bg-error/10 text-error border-error/20" : "bg-success/10 text-success border-success/20");
  const Icon = isReimbursable ? Handshake : (isDebit ? TrendingDown : TrendingUp);

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

  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [filteredTransactions]);

  const totalToCollect = useMemo(() => {
    if (!isReimbursable) return totalSpent;
    return filteredTransactions.reduce((sum, t) => {
      const txId = String(t._id || t.id);
      if (editingAmounts[txId] !== undefined && editingAmounts[txId] !== "") {
        const parsed = parseFloat(editingAmounts[txId]);
        if (!isNaN(parsed)) {
          const totalAmt = Number(t.amount || 0);
          return sum + Math.min(totalAmt, Math.max(0, parsed));
        }
      }
      return sum + getReimbursableBreakdown(t, reimbursableSplits).toCollect;
    }, 0);
  }, [filteredTransactions, isReimbursable, reimbursableSplits, editingAmounts]);

  const totalMyShare = totalSpent - totalToCollect;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`bg-base-100 rounded-3xl shadow-2xl w-full ${isReimbursable ? 'max-w-6xl xl:max-w-7xl' : 'max-w-5xl xl:max-w-6xl'} max-h-[85vh] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex items-center justify-between gap-4 bg-base-200/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isReimbursable ? 'bg-warning/15 text-warning' : (isDebit ? 'bg-error/15 text-error' : 'bg-success/15 text-success')}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-lg flex items-center gap-2 whitespace-nowrap">
                <span>{title}</span>
                <span className="text-xs opacity-60 font-mono font-medium">({dayjs(currentMonth).format("MMMM YYYY")})</span>
              </h3>
              <p className="text-xs opacity-60 font-medium mt-0.5 truncate">
                {isReimbursable ? (
                  <span>Split bill among people — 1 part is your own share, remaining parts to collect.</span>
                ) : (
                  <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-end">
            {isReimbursable ? (
              <>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-base-200 border border-base-300 text-base-content/70 whitespace-nowrap hidden sm:inline-flex items-center">
                  Spent: ₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {totalMyShare > 0 && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-base-200 border border-base-300 text-base-content/70 whitespace-nowrap inline-flex items-center">
                    My Share: ₹{totalMyShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                <span className="px-3 py-1 rounded-xl text-sm font-extrabold font-mono border bg-warning/10 text-warning border-warning/30 shadow-2xs whitespace-nowrap inline-flex items-center">
                  To Collect: ₹{totalToCollect.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <span className={`px-3 py-1 rounded-xl text-sm font-extrabold font-mono border ${bgBadge} whitespace-nowrap`}>
                Total: ₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
            <button
              onClick={onClose}
              className="btn btn-xs sm:btn-sm btn-ghost gap-1 px-1.5 rounded-xl text-base-content/70 hover:text-base-content hover:bg-base-200/80 transition-all font-mono select-none shrink-0"
              title="Close (Press Esc)"
            >
              <kbd className="kbd kbd-sm font-mono font-black text-[11px] bg-base-100 border border-base-300 shadow-2xs px-2 py-0.5 rounded-lg cursor-pointer">ESC</kbd>
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
                <thead className="sticky top-0 z-20 bg-base-200/90 backdrop-blur-md text-base-content font-bold uppercase tracking-wider text-[11px] shadow-xs">
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

                    {/* Reimbursable Split Column (Only in Reimbursable Modal) */}
                    {isReimbursable && (
                      <th className="py-3 px-4 text-center min-w-[170px]">
                        <div className="flex items-center justify-center gap-1.5 text-warning font-black">
                          <Users size={12} />
                          <span>Split (People)</span>
                        </div>
                      </th>
                    )}

                    <th className={`py-3 px-4 text-right ${isReimbursable ? 'min-w-[140px]' : ''}`}>
                      {isReimbursable ? "Net To Collect" : "Amount"}
                    </th>
                    <th className="py-3 px-4 text-center">Action</th>
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

                    const breakdown = getReimbursableBreakdown(t, reimbursableSplits);
                    const txIdStr = String(t._id || t.id);
                    const editingAmountVal = editingAmounts[txIdStr];
                    const isCustom = breakdown.isCustomAmount || (editingAmountVal !== undefined && editingAmountVal !== "");
                    const currentMyShare = (() => {
                      if (editingAmountVal !== undefined && editingAmountVal !== "") {
                        const parsed = parseFloat(editingAmountVal);
                        if (!isNaN(parsed)) {
                          const col = Math.min(breakdown.total, Math.max(0, parsed));
                          return Math.max(0, Math.round((breakdown.total - col + Number.EPSILON) * 100) / 100);
                        }
                      }
                      return breakdown.myShare;
                    })();

                    return (
                      <tr key={t._id || t.id} className="hover:bg-base-200/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-base-content/70 whitespace-nowrap">
                          {dayjs(t.date).format("DD MMM YYYY")}
                        </td>
                        <td className="py-3 px-4 font-semibold text-base-content max-w-[240px] truncate" title={t.description || ""}>
                          <span>{t.description || <span className="opacity-40 italic">No description</span>}</span>
                        </td>
                        <td className="py-3 px-4">
                          {(() => {
                            if (isTrf) {
                              const trgStyle = getSourceTagStyle(targetObj || targetName, sources);
                              return (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${trgStyle.bg} ${trgStyle.text} border ${trgStyle.border}`}>
                                  <ArrowRightLeft size={12} />
                                  Transfer To {targetName}
                                </span>
                              );
                            }
                            if (catObj?.name || t.categoryName) {
                              return (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${catTagStyle.bg} ${catTagStyle.text} border ${catTagStyle.border}`}
                                >
                                  <Folder size={12} />
                                  {catObj?.name || t.categoryName}
                                </span>
                              );
                            }
                            if (t.type === 'Credit') {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <TrendingUp size={12} />
                                  Credited
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                <TrendingDown size={12} />
                                Debited
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${srcTagStyle.bg} ${srcTagStyle.text} border ${srcTagStyle.border}`}
                          >
                            <Wallet size={12} />
                            {srcObj?.name || t.sourceName || "General"}
                          </span>
                        </td>

                        {/* Reimbursable Split Controller */}
                        {isReimbursable && (
                          <td className="py-2 px-4 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <div className="inline-flex items-center gap-1 bg-base-200/90 p-1 rounded-xl border border-base-300 shadow-2xs">
                                <button
                                  type="button"
                                  disabled={breakdown.splitCount <= 1}
                                  onClick={() => handleSplitChange(t._id || t.id, breakdown.splitCount - 1)}
                                  className="btn btn-xs btn-square btn-ghost h-7 w-7 min-h-0 disabled:opacity-20 hover:bg-base-300 rounded-lg cursor-pointer text-base-content"
                                  title="Decrease people count"
                                >
                                  <Minus size={12} />
                                </button>

                                <div className="flex items-center gap-1 px-1">
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={
                                      editingSplits[String(t._id || t.id)] !== undefined
                                        ? editingSplits[String(t._id || t.id)]
                                        : breakdown.splitCount
                                    }
                                    onChange={(e) => handleSplitInputChange(t._id || t.id, e.target.value)}
                                    onBlur={() => handleSplitInputBlur(t._id || t.id, breakdown.splitCount)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                    className="input input-xs input-bordered h-7 w-12 text-center font-mono font-black text-xs rounded-lg bg-base-100 p-0 text-base-content focus:border-warning focus:ring-1 focus:ring-warning"
                                    title="Type number of people to split with"
                                  />
                                  <span className="text-[11px] font-semibold text-base-content/60 select-none">
                                    {breakdown.splitCount === 1 ? "person" : "people"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  disabled={breakdown.splitCount >= 100}
                                  onClick={() => handleSplitChange(t._id || t.id, breakdown.splitCount + 1)}
                                  className="btn btn-xs btn-square btn-ghost h-7 w-7 min-h-0 hover:bg-base-300 rounded-lg cursor-pointer text-base-content"
                                  title="Increase people count"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <span className={`text-[10px] font-mono ${isCustom ? "text-warning font-semibold" : "text-base-content/50"}`}>
                                {isCustom || breakdown.splitCount > 1
                                  ? `My share: ₹${currentMyShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : "100% collect (no self share)"}
                              </span>
                            </div>
                          </td>
                        )}

                        <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                          {isReimbursable ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className="inline-flex items-center gap-1 bg-warning/10 border border-warning/30 rounded-xl px-2 py-0.5 focus-within:ring-2 focus-within:ring-warning/40 focus-within:bg-base-100 transition-all shadow-2xs">
                                <span className="text-warning font-black text-xs font-mono select-none">+₹</span>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max={breakdown.total}
                                  value={
                                    editingAmounts[String(t._id || t.id)] !== undefined
                                      ? editingAmounts[String(t._id || t.id)]
                                      : breakdown.toCollect
                                  }
                                  onChange={(e) =>
                                    handleAmountInputChange(t._id || t.id, e.target.value, breakdown.total, breakdown.splitCount)
                                  }
                                  onBlur={() =>
                                    handleAmountInputBlur(t._id || t.id, breakdown.total, breakdown.splitCount)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") e.currentTarget.blur();
                                  }}
                                  className="w-24 text-right font-mono font-black text-sm text-warning bg-transparent border-none outline-hidden p-0 focus:text-base-content"
                                  placeholder="0.00"
                                  title="Click to edit amount to collect"
                                />
                              </div>

                              <div className="flex items-center gap-1 text-[10px] font-mono">
                                {isCustom ? (
                                  <div className="flex items-center gap-1">
                                    <span className="badge badge-warning badge-xs font-bold text-[9px] px-1 py-0.5 text-warning-content">
                                      Custom
                                    </span>
                                    <span className="text-base-content/50">
                                      of ₹{breakdown.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleResetAmount(t._id || t.id, breakdown.splitCount)}
                                      className="text-primary hover:underline font-bold text-[9px] cursor-pointer ml-0.5"
                                      title="Reset to split ratio calculation"
                                    >
                                      (Reset)
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-base-content/50 font-semibold">
                                    {breakdown.splitCount > 1
                                      ? `${breakdown.splitCount - 1}/${breakdown.splitCount} of ₹${breakdown.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      : `Full ₹${breakdown.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className={isTrf ? "text-amber-500 dark:text-amber-400" : (isDebit ? "text-error" : "text-success")}>
                              {isTrf ? "" : (t.type === 'Credit' ? "+" : "-")}₹{Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setInfoModalTx(t)}
                            className={`btn btn-xs btn-ghost btn-square relative ${
                              t.info && t.info.trim()
                                ? "text-primary bg-primary/10 hover:bg-primary/20"
                                : "text-base-content/40 hover:text-base-content hover:bg-base-300/40"
                            }`}
                            title={t.info && t.info.trim() ? `Note: ${t.info}` : "Add / View Notes (i)"}
                          >
                            <Info size={13} />
                            {t.info && t.info.trim() && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary absolute top-1 right-1"></span>
                            )}
                          </button>
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
        <div className="p-4 border-t border-base-200 bg-base-200/50 flex justify-between items-center text-xs flex-wrap gap-2">
          <span className="font-semibold text-base-content/70">
            Showing <strong className="font-mono">{filteredTransactions.length}</strong> transactions | {isReimbursable ? 'Net Pending To Collect' : (isDebit ? 'Total Debited' : 'Total Credited')}: <strong className={`font-mono font-bold ${accentColor}`}>₹{totalToCollect.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
          <button onClick={onClose} className="btn btn-sm btn-primary rounded-xl font-bold px-5 cursor-pointer">
            Close
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {infoModalTx && (
        <TransactionInfoModal
          transaction={infoModalTx}
          isOpen={Boolean(infoModalTx)}
          onClose={() => setInfoModalTx(null)}
        />
      )}
    </div>
  );
};

export default ExpTableEntry;