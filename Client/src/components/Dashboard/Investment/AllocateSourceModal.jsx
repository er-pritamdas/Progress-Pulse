import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers,
  Search,
  Check,
  Sparkles,
  TrendingUp,
  PieChart,
  Landmark,
  PiggyBank,
  ShieldCheck,
  X,
  Plus,
  Percent,
  Coins,
  ChevronRight,
  Info,
  CheckCheck,
  AlertCircle,
  Clock,
  Building2,
  Trash2,
  SlidersHorizontal,
  CheckCircle2,
  Target,
} from "lucide-react";
import CompanyLogo from "./CompanyLogo";

// ----------------------------------------------------------------------
// Currency Formatting Helpers
// ----------------------------------------------------------------------
const formatINR = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatINRCompact = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

// ----------------------------------------------------------------------
// Categories Configuration (Exact replica of Food Logging categories)
// ----------------------------------------------------------------------
const ASSET_CATEGORIES = [
  { id: "all", label: "All Sources", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "bank", label: "Bank Accounts", icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "stock", label: "Held Stocks", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "mf", label: "Mutual Funds", icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "fd", label: "Fixed Deposits", icon: Landmark, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "rd", label: "Recurring Deposits", icon: PiggyBank, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "pf", label: "Provident Fund", icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
];

export default function AllocateSourceModal({
  isOpen,
  onClose,
  activePlan,
  goals = [],
  bankAccounts = [],
  heldStocks = [],
  holdingMutualFunds = [],
  activeFixedDeposits = [],
  activeRecurringDeposits = [],
  pfSource,
  initialSelectedSource = null,
  onSaveAllocation,
  onRemoveAllocation,
}) {
  // Planner/Goal selection state - defaults to activePlan?.id
  const [selectedPlanId, setSelectedPlanId] = useState(activePlan?.id || "");

  // Update selectedPlanId whenever modal opens or activePlan changes
  useEffect(() => {
    if (isOpen && activePlan?.id) {
      setSelectedPlanId(activePlan.id);
    }
  }, [isOpen, activePlan?.id]);

  // Derived currentPlan matching selectedPlanId or activePlan
  const currentPlan = useMemo(() => {
    return goals.find((g) => g.id === selectedPlanId) || activePlan;
  }, [goals, selectedPlanId, activePlan]);

  // Master List of All Available Sources
  const allSources = useMemo(() => {
    // Defensively ensure only mutual funds with positive available units are included
    const activeMutualFunds = (holdingMutualFunds || []).filter(
      (m) => (m.availableUnits ?? m.activeUnits ?? 0) > 0.0001 && Number(m.holdingValue) > 0
    );

    const list = [
      ...bankAccounts,
      ...heldStocks,
      ...activeMutualFunds,
      ...activeFixedDeposits,
      ...activeRecurringDeposits,
    ];
    if (pfSource && pfSource.balance > 0) {
      list.push(pfSource);
    }
    return list;
  }, [bankAccounts, heldStocks, holdingMutualFunds, activeFixedDeposits, activeRecurringDeposits, pfSource]);

  // Category state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Search & Item selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState(() => {
    if (initialSelectedSource) {
      return initialSelectedSource;
    }
    return null;
  });

  // Allotment Mode: "percent" | "amount"
  const [allotmentMode, setAllotmentMode] = useState("percent");
  const [allotPercent, setAllotPercent] = useState(100);
  const [allotAmount, setAllotAmount] = useState(0);
  const [allotShares, setAllotShares] = useState(1);
  const [topNotification, setTopNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  const showNotification = (type, message) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setTopNotification({ type, message });
    notificationTimerRef.current = setTimeout(() => {
      setTopNotification(null);
    }, 3500);
  };

  // Lock body scroll and sync selectedSource on modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialSelectedSource) {
        const matched = allSources.find((s) => s.id === initialSelectedSource.id) || initialSelectedSource;
        setSelectedSource(matched);
        setSelectedCategory("all");
      } else if (!selectedSource && allSources.length > 0) {
        setSelectedSource(allSources[0]);
        setSelectedCategory("all");
      }
    } else {
      document.body.style.overflow = "";
      setTopNotification(null);
    }
    return () => {
      document.body.style.overflow = "";
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, [isOpen, initialSelectedSource, allSources]);

  // Auto-scroll middle list to selected source
  useEffect(() => {
    if (isOpen && selectedSource?.id) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`source-item-${selectedSource.id}`);
        if (el) {
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedSource?.id]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    if (catId !== "all") {
      const firstInCat = allSources.find((s) => s.sourceType === catId);
      if (firstInCat && selectedSource?.sourceType !== catId) {
        setSelectedSource(firstInCat);
      }
    }
  };

  // When selectedSource or currentPlan changes, populate its existing allocation for currentPlan if any
  useEffect(() => {
    if (!selectedSource || !currentPlan) return;
    const planAlloc = currentPlan.allocations?.[selectedSource.id];
    const totalVal = Number(selectedSource.holdingValue) || 0;

    if (planAlloc) {
      setAllotPercent(Number(planAlloc.percent) || 100);
      setAllotAmount(Number(planAlloc.amount) || totalVal);
      if (selectedSource.sourceType === "stock") {
        setAllotShares(planAlloc.shares !== undefined ? Number(planAlloc.shares) : (selectedSource.holdingQty || 1));
      }
    } else {
      // Default: Allocate remaining available amount or 100%
      const stats = getSourceStats(selectedSource, currentPlan.id);
      const defaultPct = stats.remainingPct > 0 ? stats.remainingPct : 100;
      const defaultAmt = (totalVal * defaultPct) / 100;
      setAllotPercent(defaultPct);
      setAllotAmount(defaultAmt);
      if (selectedSource.sourceType === "stock") {
        const remainingShares = Math.max(1, Math.round((selectedSource.holdingQty || 1) * (defaultPct / 100)));
        setAllotShares(remainingShares);
      }
    }
  }, [selectedSource?.id, currentPlan?.id]);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return ASSET_CATEGORIES;
    const q = categorySearchQuery.toLowerCase().trim();
    return ASSET_CATEGORIES.filter((c) => c.label.toLowerCase().includes(q));
  }, [categorySearchQuery]);

  // Filter Sources for Middle Panel
  const filteredSources = useMemo(() => {
    let list = allSources;
    if (selectedCategory !== "all") {
      list = list.filter((s) => s.sourceType === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const name = (s.displayName || s.name || s.schemeName || s.bankName || "").toLowerCase();
        const amc = (s.amc || "").toLowerCase();
        const platform = (s.platform || "").toLowerCase();
        return name.includes(q) || amc.includes(q) || platform.includes(q);
      });
    }
    return list;
  }, [allSources, selectedCategory, searchQuery]);

  // Compute stats across all goals for a source
  const getSourceStats = (sourceItem, currentGoalId) => {
    if (!sourceItem) {
      return { totalVal: 0, breakdown: [], totalAllotted: 0, remainingAmt: 0, remainingPct: 0 };
    }
    const totalVal = Number(sourceItem.holdingValue) || 0;
    const breakdown = [];
    let totalAllotted = 0;
    let currentGoalAllotted = 0;
    let currentGoalPercent = 0;
    let currentGoalShares = 0;

    goals.forEach((g) => {
      const alloc = g.allocations?.[sourceItem.id];
      if (alloc && alloc.amount > 0) {
        breakdown.push({
          goalId: g.id,
          goalTitle: g.title,
          goalIcon: g.icon || "🎯",
          amount: alloc.amount,
          percent: alloc.percent,
          shares: alloc.shares,
        });
        totalAllotted += alloc.amount;
        if (g.id === currentGoalId) {
          currentGoalAllotted = alloc.amount;
          currentGoalPercent = alloc.percent;
          currentGoalShares = alloc.shares;
        }
      } else if (
        // Fallback for legacy ID lists
        (sourceItem.sourceType === "bank" && (g.selectedBanks || []).includes(sourceItem.id)) ||
        (sourceItem.sourceType === "stock" && (g.selectedStocks || []).includes(sourceItem.id)) ||
        (sourceItem.sourceType === "mf" && (g.selectedMfs || []).includes(sourceItem.id)) ||
        (sourceItem.sourceType === "fd" && (g.selectedFds || []).includes(sourceItem.id)) ||
        (sourceItem.sourceType === "rd" && (g.selectedRds || []).includes(sourceItem.id)) ||
        (sourceItem.sourceType === "pf" && g.includePf && sourceItem.id === "source-pf-balance")
      ) {
        const fallbackPct = sourceItem.sourceType === "pf" ? (g.pfAllocatedPercent || 50) : 100;
        const fallbackAmt = (totalVal * fallbackPct) / 100;
        breakdown.push({
          goalId: g.id,
          goalTitle: g.title,
          goalIcon: g.icon || "🎯",
          amount: fallbackAmt,
          percent: fallbackPct,
        });
        totalAllotted += fallbackAmt;
        if (g.id === currentGoalId) {
          currentGoalAllotted = fallbackAmt;
          currentGoalPercent = fallbackPct;
        }
      }
    });

    // Remaining excluding current goal so user can re-allocate full available share
    const allottedToOtherGoals = totalAllotted - currentGoalAllotted;
    const remainingAmt = Math.max(0, totalVal - allottedToOtherGoals);
    const remainingPct = totalVal > 0 ? (remainingAmt / totalVal) * 100 : 100;

    return {
      totalVal,
      breakdown,
      totalAllotted,
      allottedToOtherGoals,
      remainingAmt,
      remainingPct: Math.round(remainingPct * 10) / 10,
      currentGoalAllotted,
      currentGoalPercent,
      currentGoalShares,
      isAllottedToCurrentGoal: currentGoalAllotted > 0,
    };
  };

  const currentStats = useMemo(() => {
    return getSourceStats(selectedSource, currentPlan?.id);
  }, [selectedSource, currentPlan, goals]);

  // Handlers for changing percent / amount
  const handlePercentChange = (pct) => {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    setAllotPercent(p);
    const totalVal = Number(selectedSource?.holdingValue) || 0;
    const calcAmt = (totalVal * p) / 100;
    setAllotAmount(calcAmt);
    if (selectedSource?.sourceType === "stock") {
      const shares = Math.round((selectedSource.holdingQty || 1) * (p / 100));
      setAllotShares(shares);
    }
  };

  const handleAmountChange = (amt) => {
    const val = Math.max(0, Number(amt) || 0);
    setAllotAmount(val);
    const totalVal = Number(selectedSource?.holdingValue) || 1;
    const p = Math.min(100, Math.round((val / totalVal) * 1000) / 10);
    setAllotPercent(p);
    if (selectedSource?.sourceType === "stock") {
      const shares = Math.round((selectedSource.holdingQty || 1) * (p / 100));
      setAllotShares(shares);
    }
  };

  const handleSharesChange = (sh) => {
    if (!selectedSource || selectedSource.sourceType !== "stock") return;
    const totalShares = selectedSource.holdingQty || 1;
    const clampedShares = Math.max(1, Math.min(totalShares, Number(sh) || 1));
    setAllotShares(clampedShares);
    const p = Math.round((clampedShares / totalShares) * 1000) / 10;
    setAllotPercent(p);
    const buyPrice = Number(selectedSource.bFShare || selectedSource.bShare || selectedSource.sharePrice || 0);
    setAllotAmount(clampedShares * buyPrice);
  };

  const handleSave = () => {
    if (!selectedSource || !currentPlan) return;
    const isUpdate = currentStats.isAllottedToCurrentGoal;
    onSaveAllocation(currentPlan.id, selectedSource, {
      percent: allotPercent,
      amount: allotAmount,
      shares: selectedSource.sourceType === "stock" ? allotShares : undefined,
    });
    showNotification(
      "success",
      `${selectedSource.displayName} ${
        isUpdate ? "updated in" : "added to"
      } ${currentPlan.title} (${allotPercent}% • ${formatINRCompact(allotAmount)})`
    );
  };

  const handleRemove = () => {
    if (!selectedSource || !currentPlan) return;
    onRemoveAllocation(currentPlan.id, selectedSource.id, selectedSource.sourceType);
    showNotification(
      "info",
      `${selectedSource.displayName} removed from ${currentPlan.title}`
    );
    const totalVal = Number(selectedSource.holdingValue) || 0;
    setAllotPercent(100);
    setAllotAmount(totalVal);
    if (selectedSource.sourceType === "stock") {
      setAllotShares(selectedSource.holdingQty || 1);
    }
  };

  if (!isOpen || !currentPlan) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-x-auto">
      <div className="flex items-stretch justify-center gap-3 sm:gap-4 max-w-[1440px] w-full h-[680px]">
        {/* ================================================================ */}
        {/* 1. LEFT POPUP: ASSET CATEGORIES (Exact replica of Food Logging)  */}
        {/* ================================================================ */}
        <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl h-[680px] w-60 sm:w-68 flex flex-col overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-base-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Layers size={17} className="text-primary" />
              <h4 className="font-bold text-sm text-base-content leading-tight">Categories</h4>
            </div>
            <span className="badge badge-sm badge-ghost font-mono opacity-70">
              {allSources.length} Sources
            </span>
          </div>

          {/* Search inside Categories */}
          <div className="p-2.5 border-b border-base-200 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" size={13} />
              <input
                type="text"
                className="input input-xs input-bordered w-full pl-8 rounded-lg text-xs bg-transparent"
                placeholder="Filter categories..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredCategories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? allSources.length
                  : cat.id === "bank"
                  ? bankAccounts.length
                  : cat.id === "stock"
                  ? heldStocks.length
                  : cat.id === "mf"
                  ? (holdingMutualFunds || []).filter((m) => (m.availableUnits ?? m.activeUnits ?? 0) > 0.0001 && Number(m.holdingValue) > 0).length
                  : cat.id === "fd"
                  ? activeFixedDeposits.length
                  : cat.id === "rd"
                  ? activeRecurringDeposits.length
                  : pfSource?.balance > 0
                  ? 1
                  : 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/20"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-200/50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <span className={`shrink-0 ${cat.color}`}>
                      <IconComp size={15} />
                    </span>
                    <span className="truncate text-xs">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="badge badge-xs font-mono font-bold bg-base-200">
                      {count}
                    </span>
                    {isSelected && <Check size={14} className="text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Status Footer */}
          <div className="p-3 border-t border-base-200 text-[11px] text-base-content/70 flex items-center justify-between shrink-0 bg-base-200/40">
            <span className="truncate max-w-[160px]">
              Active: <span className="font-bold text-primary">{ASSET_CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
            </span>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => handleCategoryClick("all")}
                className="btn btn-ghost btn-xs text-[10px] text-primary hover:underline px-1 h-5 min-h-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. MAIN POPUP: MIDDLE (LIST) & RIGHT (ALLOTMENT CONTROLS)        */}
        {/* ================================================================ */}
        <div className="bg-base-200 rounded-3xl flex-1 h-[680px] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-0 max-w-5xl">
          {/* Main Modal Header */}
          <div className="p-4 border-b border-base-300 flex justify-between items-center shrink-0 bg-base-100 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">{currentPlan.icon || "🎯"}</span>
              <div className="min-w-0">
                <h3 className="font-extrabold text-base text-base-content flex items-center gap-2 leading-tight">
                  <span className="truncate">Add Sources to {currentPlan.title}</span>
                  <span className="badge badge-sm font-bold bg-primary text-primary-content shrink-0">
                    Target: {formatINRCompact(currentPlan.targetAmount)}
                  </span>
                </h3>
                <p className="text-xs text-base-content/60 truncate">
                  Pick an investment source from the list and choose how much money or percentage to allot
                </p>
              </div>
            </div>

            {/* Right side of Header: In-header Notification Banner + Close Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              {topNotification && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs animate-in fade-in slide-in-from-right-4 duration-250 ${
                    topNotification.type === "info"
                      ? "bg-base-200 text-base-content border-base-300"
                      : topNotification.type === "error"
                      ? "bg-error/15 text-error border-error/30"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {topNotification.type === "info" ? (
                    <Info size={15} className="shrink-0 text-primary" />
                  ) : topNotification.type === "error" ? (
                    <AlertCircle size={15} className="shrink-0 text-error" />
                  ) : (
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  )}
                  <span className="font-semibold max-w-[240px] sm:max-w-[340px] truncate">
                    {topNotification.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
                      setTopNotification(null);
                    }}
                    className="ml-1 hover:opacity-75 cursor-pointer text-xs p-0.5 text-base-content/50 hover:text-base-content"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={onClose}
                title="Close modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Body Grid */}
          <div className="p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
              {/* ---------------------------------------------------------- */}
              {/* MIDDLE COLUMN: SEARCH & ASSETS LIST (6 cols)               */}
              {/* ---------------------------------------------------------- */}
              <div className="md:col-span-6 flex flex-col gap-3 h-full min-h-0 overflow-hidden">
                {/* Search Bar */}
                <div className="relative shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={15} />
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full pl-9 rounded-xl text-xs bg-base-100"
                    placeholder="Search stocks, mutual funds, banks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Active Category Filter Tag if not All */}
                {selectedCategory !== "all" && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-base-300 text-xs shrink-0 bg-base-100">
                    <span className="text-base-content/80 flex items-center gap-1.5 font-semibold">
                      <Layers size={13} className="text-primary" />
                      Showing: <span className="font-bold text-primary">{ASSET_CATEGORIES.find((c) => c.id === selectedCategory)?.label}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="btn btn-ghost btn-xs text-[10px] text-primary hover:underline h-5 min-h-0 px-1.5 rounded-md font-semibold"
                    >
                      Show All
                    </button>
                  </div>
                )}

                {/* Source Items List */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-2xl p-2 border border-base-300 space-y-1.5 custom-scrollbar">
                  {filteredSources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Coins size={32} className="opacity-30 mb-2" />
                      <p className="text-sm font-bold opacity-70">No investment sources found.</p>
                      <p className="text-xs opacity-50 mt-0.5">Try searching or clearing the category filter.</p>
                    </div>
                  ) : (
                    filteredSources.map((item) => {
                      const isSelected = selectedSource?.id === item.id;
                      const stats = getSourceStats(item, currentPlan.id);
                      const isAllottedHere = stats.isAllottedToCurrentGoal;

                      return (
                        <div
                          key={`${item.sourceType}-${item.id}`}
                          id={`source-item-${item.id}`}
                          onClick={() => setSelectedSource(item)}
                          className={`p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center border ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                              : "bg-base-200/50 hover:bg-base-200 border-base-300/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <CompanyLogo
                              name={
                                item.sourceType === "stock"
                                  ? item.name
                                  : item.sourceType === "mf"
                                  ? item.amc
                                  : item.bankName || "Bank"
                              }
                              size="w-8 h-8"
                              type={
                                item.sourceType === "stock"
                                  ? "stock"
                                  : item.sourceType === "mf"
                                  ? "mf"
                                  : "bank"
                              }
                            />
                            <div className="overflow-hidden text-left">
                              <div className="font-extrabold text-xs text-base-content truncate max-w-[180px] leading-tight">
                                {item.displayName}
                              </div>
                              <div className="text-[10px] text-base-content/50 font-semibold flex items-center gap-1.5 mt-0.5">
                                <span>
                                  {item.sourceType === "bank"
                                    ? item.accountType ? `${item.accountType} Account` : "Liquid Balance"
                                    : item.sourceType === "stock"
                                    ? `${item.holdingQty} shares`
                                    : item.sourceType === "mf"
                                    ? `${(item.availableUnits ?? item.activeUnits ?? 0).toFixed(2)} units • ${item.category || "Equity"}`
                                    : item.sourceType === "fd"
                                    ? `${item.interestRate}% Interest`
                                    : item.sourceType === "rd"
                                    ? `${item.interestRate}% Interest`
                                    : "EPF"}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-base-content/70">
                                  Total: {formatINRCompact(item.holdingValue)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-mono">
                            <div className="font-black text-xs text-base-content">
                              Left: {formatINRCompact(stats.remainingAmt)}
                            </div>
                            <div className="mt-0.5">
                              {isAllottedHere ? (
                                <span className="badge badge-xs bg-primary text-primary-content font-bold">
                                  In Plan ({stats.currentGoalPercent}%)
                                </span>
                              ) : stats.remainingPct < 100 ? (
                                <span className="badge badge-xs bg-base-300 text-base-content/70 font-semibold">
                                  {stats.remainingPct}% unallotted
                                </span>
                              ) : (
                                <span className="badge badge-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/20">
                                  100% Free
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* RIGHT COLUMN: ALLOTMENT CONTROLS & LIVE STATS (6 cols)     */}
              {/* ---------------------------------------------------------- */}
              <div className="md:col-span-6 bg-base-100 rounded-2xl p-4 border border-base-300 flex flex-col justify-between h-full min-h-0 overflow-hidden">
                {/* Target Goal / Planner Dropdown Selector */}
                <div className="bg-base-200/60 p-3 rounded-2xl border border-base-300 flex items-center justify-between gap-2.5 shrink-0 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{currentPlan?.icon || "🎯"}</span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block leading-tight">
                        Target Goal / Planner
                      </span>
                      <span className="text-xs font-bold text-base-content truncate block">
                        {currentPlan?.title || "Select Planner"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-44 sm:w-56">
                    <select
                      value={currentPlan?.id || ""}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="select select-sm select-bordered w-full rounded-xl bg-base-100 font-bold text-xs text-base-content focus:border-primary focus:outline-none shadow-xs"
                    >
                      {goals.map((g) => {
                        const isAlloc =
                          (g.allocations?.[selectedSource?.id]?.amount > 0) ||
                          (selectedSource?.sourceType === "bank" && (g.selectedBanks || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "stock" && (g.selectedStocks || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "mf" && (g.selectedMfs || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "fd" && (g.selectedFds || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "rd" && (g.selectedRds || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "pf" && g.includePf);

                        return (
                          <option key={g.id} value={g.id} className="text-xs font-medium py-1">
                            {g.icon || "🎯"} {g.title} ({formatINRCompact(g.targetAmount)}){isAlloc ? " • Allocated" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {selectedSource ? (
                  <div className="space-y-3 flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5">
                    {/* Selected Source Header Banner */}
                    <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-300 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <CompanyLogo
                          name={
                            selectedSource.sourceType === "stock"
                              ? selectedSource.name
                              : selectedSource.sourceType === "mf"
                              ? selectedSource.amc
                              : selectedSource.bankName || "Bank"
                          }
                          size="w-10 h-10"
                          type={
                            selectedSource.sourceType === "stock"
                              ? "stock"
                              : selectedSource.sourceType === "mf"
                              ? "mf"
                              : "bank"
                          }
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                            Selected Source
                          </span>
                          <h4 className="font-extrabold text-sm text-base-content truncate leading-tight">
                            {selectedSource.displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-base-content/60 font-semibold flex-wrap">
                            <span>Total Value: {formatINR(selectedSource.holdingValue)}</span>
                            {selectedSource.sourceType === "mf" && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-mono font-bold">
                                  {(selectedSource.availableUnits ?? selectedSource.activeUnits ?? 0).toFixed(3)} Units Available
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-sm font-bold uppercase tracking-wider bg-base-100 border-base-300 text-[10px]">
                        {selectedSource.sourceType.toUpperCase()}
                      </span>
                    </div>

                    {/* Allotment Across All Plans Breakdown Card (Exact user requirement!) */}
                    <div className="bg-base-200/50 p-3.5 rounded-2xl border border-base-300 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-base-content/80 flex items-center gap-1.5">
                          <SlidersHorizontal size={13} className="text-primary" />
                          Source Allocation Status
                        </span>
                        <span className="font-mono text-[11px] font-bold text-primary">
                          Available: {formatINR(currentStats.remainingAmt)} ({currentStats.remainingPct}%)
                        </span>
                      </div>

                      {/* Visual Multi-color Progress Distribution Bar */}
                      <div className="w-full bg-base-300/80 rounded-full h-2 overflow-hidden flex">
                        {currentStats.breakdown.map((b) => (
                          <div
                            key={b.goalId}
                            className={`h-full ${
                              b.goalId === currentPlan.id ? "bg-primary" : "bg-purple-500/70"
                            }`}
                            style={{ width: `${b.percent}%` }}
                            title={`${b.goalTitle}: ${b.percent}% (${formatINR(b.amount)})`}
                          />
                        ))}
                      </div>

                      {/* Distribution Items */}
                      <div className="space-y-1.5 pt-1">
                        {currentStats.breakdown.length === 0 ? (
                          <div className="text-[11px] text-base-content/50 italic flex items-center gap-1">
                            <Info size={12} />
                            <span>This asset is not yet allotted to any life plan.</span>
                          </div>
                        ) : (
                          currentStats.breakdown.map((b) => (
                            <div
                              key={b.goalId}
                              className={`flex items-center justify-between text-xs px-2.5 py-1 rounded-xl font-mono ${
                                b.goalId === currentPlan.id
                                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                  : "bg-base-100 text-base-content/70 border border-base-300"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{b.goalIcon}</span>
                                <span className="font-sans font-extrabold truncate max-w-[140px]">
                                  {b.goalTitle}
                                  {b.goalId === currentPlan.id ? " (This Plan)" : ""}
                                </span>
                              </div>
                              <span>
                                {formatINR(b.amount)} ({b.percent}%)
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Allotment Input Controls for Current Plan */}
                    <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-base-content/80">
                          Allot to {currentPlan.title}
                        </span>

                        {/* Mode Toggle */}
                        <div className="join rounded-xl bg-base-100 p-0.5 border border-base-300">
                          <button
                            type="button"
                            onClick={() => setAllotmentMode("percent")}
                            className={`join-item btn btn-xs h-6 min-h-0 rounded-lg font-bold text-[10px] ${
                              allotmentMode === "percent"
                                ? "btn-primary text-primary-content shadow-xs"
                                : "btn-ghost text-base-content/60"
                            }`}
                          >
                            <Percent size={11} /> Percentage
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllotmentMode("amount")}
                            className={`join-item btn btn-xs h-6 min-h-0 rounded-lg font-bold text-[10px] ${
                              allotmentMode === "amount"
                                ? "btn-primary text-primary-content shadow-xs"
                                : "btn-ghost text-base-content/60"
                            }`}
                          >
                            <Coins size={11} /> Fixed INR
                          </button>
                        </div>
                      </div>

                      {/* Percentage Mode Controls */}
                      {allotmentMode === "percent" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={allotPercent}
                              onChange={(e) => handlePercentChange(e.target.value)}
                              className="range range-primary range-xs flex-1"
                            />
                            <div className="w-16 shrink-0">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={allotPercent}
                                onChange={(e) => handlePercentChange(e.target.value)}
                                className="input input-xs input-bordered w-full font-mono font-bold text-center bg-base-100 rounded-lg"
                              />
                            </div>
                            <span className="text-xs font-bold font-mono">%</span>
                          </div>

                          {/* Quick Percentage Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handlePercentChange(pct)}
                                className={`btn btn-xs h-6 min-h-0 font-bold font-mono rounded-lg ${
                                  allotPercent === pct ? "btn-primary shadow-xs" : "btn-ghost bg-base-100"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                            {currentStats.remainingPct > 0 && currentStats.remainingPct < 100 && (
                              <button
                                type="button"
                                onClick={() => handlePercentChange(currentStats.remainingPct)}
                                className="btn btn-xs h-6 min-h-0 btn-outline btn-primary font-bold font-mono rounded-lg"
                                title="Allot exact remaining unallocated share"
                              >
                                Allot Left ({currentStats.remainingPct}%)
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Amount Mode Controls */
                        <div className="space-y-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs opacity-50">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              max={selectedSource.holdingValue}
                              value={Math.round(allotAmount)}
                              onChange={(e) => handleAmountChange(e.target.value)}
                              className="input input-sm input-bordered w-full pl-7 rounded-xl font-mono font-bold text-xs bg-base-100"
                            />
                          </div>

                          {currentStats.remainingAmt > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAmountChange(currentStats.remainingAmt)}
                              className="btn btn-xs btn-ghost text-primary text-[10px] font-bold hover:underline"
                            >
                              Fill remaining available: {formatINR(currentStats.remainingAmt)}
                            </button>
                          )}
                        </div>
                      )}

                      {/* If Stock: Shares Counter */}
                      {selectedSource.sourceType === "stock" && (
                        <div className="pt-2 border-t border-base-300 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-base-content/70">
                            Shares Allocation:
                          </span>
                          <div className="join border border-base-300 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleSharesChange(allotShares - 1)}
                              className="join-item btn btn-xs btn-neutral px-2 font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={selectedSource.holdingQty || 1}
                              value={allotShares}
                              onChange={(e) => handleSharesChange(e.target.value)}
                              className="join-item input input-xs text-center font-bold font-mono w-14 bg-base-100 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSharesChange(allotShares + 1)}
                              className="join-item btn btn-xs btn-neutral px-2 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] font-mono text-base-content/50">
                            of {selectedSource.holdingQty} shares
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Live Calculation Preview Badge */}
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary/70 block">
                          Allocating to {currentPlan.title}
                        </span>
                        <span className="font-black text-primary font-mono text-sm">
                          {formatINR(allotAmount)}
                        </span>
                        <span className="text-[10px] text-base-content/60 font-mono ml-1.5">
                          ({allotPercent}%)
                        </span>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-base-content/50 block">Remaining Left:</span>
                        <span className="font-bold text-base-content">
                          {formatINR(Math.max(0, currentStats.remainingAmt - (currentStats.isAllottedToCurrentGoal ? 0 : allotAmount)))}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
                    <Coins size={36} className="text-base-content/30" />
                    <h4 className="font-extrabold text-sm text-base-content">No Source Selected</h4>
                    <p className="text-xs text-base-content/50 max-w-xs">
                      Click any stock, mutual fund, FD, RD, or PF from the middle list to configure its allotment for <strong>{currentPlan.title}</strong>.
                    </p>
                  </div>
                )}

                {/* Footer Action Buttons */}
                {selectedSource && (
                  <div className="pt-3 border-t border-base-300 flex items-center gap-2 shrink-0">
                    {currentStats.isAllottedToCurrentGoal && (
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="btn btn-sm btn-error btn-outline rounded-xl font-bold gap-1 text-xs"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSave}
                      className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 text-xs flex-1 shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>
                        {currentStats.isAllottedToCurrentGoal
                          ? "Update Allotment"
                          : `Add to ${currentPlan.title}`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
