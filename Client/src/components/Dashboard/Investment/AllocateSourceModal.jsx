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
  ChevronLeft,
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
  { id: "in_plan", label: "In Plan", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
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
      } else {
        // On desktop, auto-select first source. On mobile, start with null so user sees the list first.
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
          setSelectedSource((prev) => prev || allSources[0] || null);
        } else {
          setSelectedSource(null);
        }
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

  // Helper to determine if a source is selected / allocated to currentPlan
  const isSourceInCurrentPlan = (sourceItem) => {
    if (!sourceItem || !currentPlan) return false;
    if (currentPlan.allocations && sourceItem.id in currentPlan.allocations) {
      return true;
    }
    // Backward compatibility fallback for legacy ID lists
    if (!currentPlan.allocations || Object.keys(currentPlan.allocations).length === 0) {
      if (sourceItem.sourceType === "bank" && (currentPlan.selectedBanks || []).includes(sourceItem.id)) return true;
      if (sourceItem.sourceType === "stock" && (currentPlan.selectedStocks || []).includes(sourceItem.id)) return true;
      if (sourceItem.sourceType === "mf" && (currentPlan.selectedMfs || []).includes(sourceItem.id)) return true;
      if (sourceItem.sourceType === "fd" && (currentPlan.selectedFds || []).includes(sourceItem.id)) return true;
      if (sourceItem.sourceType === "rd" && (currentPlan.selectedRds || []).includes(sourceItem.id)) return true;
      if (sourceItem.sourceType === "pf" && currentPlan.includePf && sourceItem.id === "source-pf-balance") return true;
    }
    return false;
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    // On phone view, clicking a tab/category must always show the list of sources, never jump to the first item
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSelectedSource(null);
      return;
    }
    if (catId === "in_plan") {
      const firstInPlan = allSources.find((s) => isSourceInCurrentPlan(s));
      if (firstInPlan) {
        setSelectedSource(firstInPlan);
      }
    } else if (catId !== "all") {
      const firstInCat = allSources.find((s) => s.sourceType === catId);
      if (firstInCat && selectedSource?.sourceType !== catId) {
        setSelectedSource(firstInCat);
      }
    }
  };

  // When in_plan category is active and currentPlan changes, ensure selectedSource is in plan (desktop only)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (selectedCategory === "in_plan") {
      if (!selectedSource || !isSourceInCurrentPlan(selectedSource)) {
        const firstInPlan = allSources.find((s) => isSourceInCurrentPlan(s));
        setSelectedSource(firstInPlan || null);
      }
    }
  }, [selectedCategory, currentPlan?.id, allSources]);

  // When selectedSource or currentPlan changes, populate its existing allocation for currentPlan if any
  useEffect(() => {
    if (!selectedSource || !currentPlan) return;
    const planAlloc = currentPlan.allocations?.[selectedSource.id];
    const totalVal = Number(selectedSource.holdingValue) || 0;
    const stats = getSourceStats(selectedSource, currentPlan.id);

    if (planAlloc) {
      const p = planAlloc.percent !== undefined ? Number(planAlloc.percent) : 100;
      // Autocalculated: Total Valuation x Allotment %
      const amt = (totalVal * p) / 100;
      setAllotPercent(Math.min(stats.maxAllowedPct, Math.max(0, p)));
      setAllotAmount(Math.min(stats.maxAllowedAmt, Math.max(0, amt)));
      if (selectedSource.sourceType === "stock") {
        setAllotShares(
          planAlloc.shares !== undefined
            ? Math.min(stats.maxAllowedShares, Number(planAlloc.shares))
            : Math.min(stats.maxAllowedShares, Math.round((selectedSource.holdingQty || 1) * (p / 100)))
        );
      }
    } else {
      // Default: Allocate remaining available amount
      const defaultPct = stats.maxAllowedPct;
      const defaultAmt = stats.maxAllowedAmt;
      setAllotPercent(defaultPct);
      setAllotAmount(defaultAmt);
      if (selectedSource.sourceType === "stock") {
        setAllotShares(stats.maxAllowedShares);
      }
    }
  }, [selectedSource?.id, currentPlan?.id]);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return ASSET_CATEGORIES;
    const q = categorySearchQuery.toLowerCase().trim();
    return ASSET_CATEGORIES.filter((c) => c.label.toLowerCase().includes(q));
  }, [categorySearchQuery]);

  // Filter Sources for Middle Panel (dynamically respects In Plan category for currentPlan)
  const filteredSources = useMemo(() => {
    let list = allSources;
    if (selectedCategory === "in_plan") {
      list = list.filter((s) => isSourceInCurrentPlan(s));
    } else if (selectedCategory !== "all") {
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
  }, [allSources, selectedCategory, searchQuery, currentPlan]);

  // Compute stats across all goals for a source
  const getSourceStats = (sourceItem, currentGoalId) => {
    if (!sourceItem) {
      return {
        totalVal: 0,
        breakdown: [],
        totalAllotted: 0,
        allottedToOtherGoals: 0,
        otherGoalsPercent: 0,
        maxAllowedAmt: 0,
        maxAllowedPct: 0,
        maxAllowedShares: 0,
        remainingAmt: 0,
        remainingPct: 0,
        globalFreeAmt: 0,
        globalFreePct: 0,
        currentGoalAllotted: 0,
        currentGoalPercent: 0,
        currentGoalShares: 0,
        isAllottedToCurrentGoal: false,
      };
    }

    const totalVal = Number(sourceItem.holdingValue) || 0;
    const totalShares = Number(sourceItem.holdingQty) || 1;
    const breakdown = [];
    let totalAllotted = 0;
    let currentGoalAllotted = 0;
    let currentGoalPercent = 0;
    let currentGoalShares = 0;
    let isAllottedToCurrentGoal = false;

    let otherGoalsAmount = 0;
    let otherGoalsPercent = 0;
    let otherGoalsShares = 0;

    goals.forEach((g) => {
      const hasAlloc = Boolean(g.allocations && sourceItem.id in g.allocations);
      const isCurrent = g.id === currentGoalId;

      if (hasAlloc) {
        const alloc = g.allocations[sourceItem.id];
        const pct = Math.max(0, Math.min(100, Math.round((Number(alloc.percent) ?? 0) * 10) / 10));
        // Autocalculated: Total Valuation x Allotment %
        const amt = (totalVal * pct) / 100;
        const shares = alloc.shares !== undefined ? Number(alloc.shares) : Math.round(totalShares * (pct / 100));

        breakdown.push({
          goalId: g.id,
          goalTitle: g.title,
          goalIcon: g.icon || "🎯",
          amount: amt,
          percent: pct,
          shares,
        });

        totalAllotted += amt;

        if (isCurrent) {
          currentGoalAllotted = amt;
          currentGoalPercent = pct;
          currentGoalShares = shares;
          isAllottedToCurrentGoal = true;
        } else {
          otherGoalsAmount += amt;
          otherGoalsPercent += pct;
          otherGoalsShares += shares;
        }
      } else if (
        // Only fallback to legacy ID lists if this goal doesn't have an allocations map
        (!g.allocations || Object.keys(g.allocations).length === 0) &&
        ((sourceItem.sourceType === "bank" && (g.selectedBanks || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "stock" && (g.selectedStocks || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "mf" && (g.selectedMfs || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "fd" && (g.selectedFds || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "rd" && (g.selectedRds || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "pf" && g.includePf && sourceItem.id === "source-pf-balance"))
      ) {
        const fallbackPct = sourceItem.sourceType === "pf" ? (g.pfAllocatedPercent || 50) : 100;
        const fallbackAmt = (totalVal * fallbackPct) / 100;
        const fallbackShares = Math.round(totalShares * (fallbackPct / 100));

        breakdown.push({
          goalId: g.id,
          goalTitle: g.title,
          goalIcon: g.icon || "🎯",
          amount: fallbackAmt,
          percent: fallbackPct,
          shares: fallbackShares,
        });

        totalAllotted += fallbackAmt;

        if (isCurrent) {
          currentGoalAllotted = fallbackAmt;
          currentGoalPercent = fallbackPct;
          currentGoalShares = fallbackShares;
          isAllottedToCurrentGoal = true;
        } else {
          otherGoalsAmount += fallbackAmt;
          otherGoalsPercent += fallbackPct;
          otherGoalsShares += fallbackShares;
        }
      }
    });

    // The maximum that can be allocated to currentGoalId:
    // It can take whatever other goals haven't taken: (100 - otherGoalsPercent)
    const maxAllowedPct = Math.max(0, Math.min(100, Math.round((100 - otherGoalsPercent) * 10) / 10));
    const maxAllowedAmt = Math.max(0, Math.min(totalVal, totalVal - otherGoalsAmount));
    const maxAllowedShares = Math.max(0, Math.min(totalShares, totalShares - otherGoalsShares));

    // Global free / unallocated pool across ALL goals
    const globalFreeAmt = Math.max(0, totalVal - totalAllotted);
    const globalFreePct = totalVal > 0 ? Math.max(0, Math.round((globalFreeAmt / totalVal) * 1000) / 10) : 100;

    return {
      totalVal,
      breakdown,
      totalAllotted,
      allottedToOtherGoals: otherGoalsAmount,
      otherGoalsPercent,
      maxAllowedAmt,
      maxAllowedPct,
      maxAllowedShares,
      remainingAmt: maxAllowedAmt,
      remainingPct: maxAllowedPct,
      globalFreeAmt,
      globalFreePct,
      currentGoalAllotted,
      currentGoalPercent,
      currentGoalShares,
      isAllottedToCurrentGoal,
    };
  };

  const currentStats = useMemo(() => {
    return getSourceStats(selectedSource, currentPlan?.id);
  }, [selectedSource, currentPlan, goals]);

  // Handlers for changing percent / amount - strictly clamped to what is left!
  const handlePercentChange = (pct) => {
    const maxPct = currentStats.maxAllowedPct;
    const p = Math.max(0, Math.min(maxPct, Number(pct) || 0));
    setAllotPercent(p);
    const totalVal = Number(selectedSource?.holdingValue) || 0;
    const calcAmt = Math.min(currentStats.maxAllowedAmt, (totalVal * p) / 100);
    setAllotAmount(calcAmt);
    if (selectedSource?.sourceType === "stock") {
      const shares = Math.min(
        currentStats.maxAllowedShares,
        Math.round((selectedSource.holdingQty || 1) * (p / 100))
      );
      setAllotShares(shares);
    }
  };

  const handleAmountChange = (amt) => {
    const maxAmt = currentStats.maxAllowedAmt;
    const val = Math.max(0, Math.min(maxAmt, Number(amt) || 0));
    setAllotAmount(val);
    const totalVal = Number(selectedSource?.holdingValue) || 1;
    const p = Math.min(currentStats.maxAllowedPct, Math.round((val / totalVal) * 1000) / 10);
    setAllotPercent(p);
    if (selectedSource?.sourceType === "stock") {
      const shares = Math.min(
        currentStats.maxAllowedShares,
        Math.round((selectedSource.holdingQty || 1) * (p / 100))
      );
      setAllotShares(shares);
    }
  };

  const handleSharesChange = (sh) => {
    if (!selectedSource || selectedSource.sourceType !== "stock") return;
    const maxShares = currentStats.maxAllowedShares;
    const clampedShares = Math.max(0, Math.min(maxShares, Number(sh) || 0));
    setAllotShares(clampedShares);
    const totalShares = selectedSource.holdingQty || 1;
    const p = Math.min(currentStats.maxAllowedPct, Math.round((clampedShares / totalShares) * 1000) / 10);
    setAllotPercent(p);
    const buyPrice = Number(selectedSource.bFShare || selectedSource.bShare || selectedSource.sharePrice || 0);
    setAllotAmount(Math.min(currentStats.maxAllowedAmt, clampedShares * buyPrice));
  };

  const handleSave = () => {
    if (!selectedSource || !currentPlan) return;
    const maxPct = currentStats.maxAllowedPct;
    const maxAmt = currentStats.maxAllowedAmt;

    // Strict validation: cannot allocate more than what is left
    if (allotPercent > maxPct + 0.01 || allotAmount > maxAmt + 1) {
      showNotification(
        "error",
        `Cannot allocate more than available. Max left: ${maxPct}% (${formatINRCompact(maxAmt)})`
      );
      return;
    }

    const totalVal = Number(selectedSource.holdingValue) || 0;
    const finalPercent = Math.max(0, Math.min(maxPct, Number(allotPercent) || 0));
    // Autocalculated: Total Valuation x Allotment %
    const finalAmount = (totalVal * finalPercent) / 100;
    const finalShares =
      selectedSource.sourceType === "stock"
        ? Math.max(0, Math.min(currentStats.maxAllowedShares, Number(allotShares) || 0))
        : undefined;

    const isUpdate = currentStats.isAllottedToCurrentGoal;
    onSaveAllocation(currentPlan.id, selectedSource, {
      percent: finalPercent,
      amount: finalAmount,
      shares: finalShares,
    });

    showNotification(
      "success",
      `${selectedSource.displayName} ${
        isUpdate ? "updated in" : "added to"
      } ${currentPlan.title} (${finalPercent}% • ${formatINRCompact(finalAmount)})`
    );
  };

  const handleRemove = () => {
    if (!selectedSource || !currentPlan) return;
    onRemoveAllocation(currentPlan.id, selectedSource.id, selectedSource.sourceType);
    showNotification(
      "info",
      `${selectedSource.displayName} removed from ${currentPlan.title}`
    );
  };

  if (!isOpen || !currentPlan) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex items-stretch justify-center gap-3 sm:gap-4 max-w-[1440px] w-full h-[92dvh] sm:h-[680px]">
        {/* ================================================================ */}
        {/* 1. LEFT POPUP: ASSET CATEGORIES (Exact replica of Food Logging)  */}
        {/* ================================================================ */}
        <div className="hidden md:flex bg-base-100 rounded-3xl border border-base-300 shadow-2xl h-full w-60 sm:w-68 flex-col overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-200">
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
                  : cat.id === "in_plan"
                  ? allSources.filter((s) => isSourceInCurrentPlan(s)).length
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
              Active:{" "}
              <span className="font-bold text-primary">
                {selectedCategory === "in_plan"
                  ? `In Plan (${currentPlan?.title || "Active"})`
                  : ASSET_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
              </span>
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
        <div className="bg-base-200 rounded-t-3xl sm:rounded-3xl flex-1 h-full border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 min-w-0 max-w-5xl">
          {/* Mobile Drag Pill */}
          <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 shrink-0 bg-base-100">
            <div className="w-10 h-1 rounded-full bg-base-content/20" />
          </div>

          {/* Main Modal Header */}
          <div className="p-2.5 sm:p-4 border-b border-base-300 flex justify-between items-center shrink-0 bg-base-100 gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">{currentPlan.icon || "🎯"}</span>
              <div className="min-w-0">
                {/* Line 1: Heading */}
                <h3 className="font-extrabold text-sm sm:text-base text-base-content truncate leading-tight whitespace-nowrap">
                  Add Sources to {currentPlan.title}
                </h3>
                {/* Line 2: Target Badge + Guidance */}
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-base-content/60 mt-1 whitespace-nowrap truncate">
                  <span className="badge badge-xs sm:badge-sm font-bold bg-primary text-primary-content shrink-0 font-mono whitespace-nowrap">
                    Target: {formatINRCompact(currentPlan.targetAmount)}
                  </span>
                  <span className="text-base-content/30 text-[10px] hidden xs:inline">•</span>
                  <span className="text-[10.5px] sm:text-xs text-base-content/60 font-medium truncate hidden xs:inline whitespace-nowrap">
                    Choose an asset to allocate funds
                  </span>
                </div>
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
                  <span className="font-semibold max-w-[120px] xs:max-w-[200px] sm:max-w-[340px] truncate">
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
          <div className="p-2.5 sm:p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden">
              {/* ---------------------------------------------------------- */}
              {/* MIDDLE COLUMN: SEARCH & ASSETS LIST (6 cols)               */}
              {/* ---------------------------------------------------------- */}
              <div className={`${selectedSource ? "hidden md:flex" : "flex"} md:col-span-6 flex-col gap-2.5 sm:gap-3 h-full min-h-0 overflow-hidden`}>
                {/* Mobile Category Carousel (Phone View Only) */}
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                  {ASSET_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    const count =
                      cat.id === "all"
                        ? allSources.length
                        : cat.id === "in_plan"
                        ? allSources.filter((s) => isSourceInCurrentPlan(s)).length
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
                        className={`btn btn-xs rounded-xl px-2.5 h-7 min-h-0 font-bold text-[11px] gap-1.5 shrink-0 whitespace-nowrap transition-all ${
                          isSelected
                            ? "btn-primary shadow-xs"
                            : "btn-ghost bg-base-100 border border-base-300 text-base-content/70 hover:text-base-content"
                        }`}
                      >
                        <span className={isSelected ? "text-primary-content" : cat.color}>
                          <IconComp size={13} />
                        </span>
                        <span>{cat.label}</span>
                        <span
                          className={`badge badge-xs font-mono font-bold ${
                            isSelected ? "bg-primary-content/20 text-primary-content" : "bg-base-200 text-base-content/60"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

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
                  <div className="flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-base-300 text-xs shrink-0 bg-base-100 whitespace-nowrap gap-2">
                    <span className="text-base-content/80 flex items-center gap-1.5 font-semibold min-w-0 truncate">
                      <Layers size={13} className="text-primary shrink-0" />
                      <span className="truncate">
                        Showing:{" "}
                        <span className="font-bold text-primary">
                          {selectedCategory === "in_plan"
                            ? `In Plan (${currentPlan?.title || "Active"})`
                            : ASSET_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                        </span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="btn btn-ghost btn-xs text-[10px] text-primary hover:underline h-5 min-h-0 px-1.5 rounded-md font-semibold shrink-0"
                    >
                      Show All
                    </button>
                  </div>
                )}

                {/* Source Items List */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-2xl p-1.5 sm:p-2 border border-base-300 space-y-1.5 custom-scrollbar">
                  {filteredSources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Coins size={32} className="opacity-30 mb-2" />
                      <p className="text-sm font-bold opacity-70">
                        {selectedCategory === "in_plan"
                          ? `No sources selected for ${currentPlan?.title || "this plan"} yet.`
                          : "No investment sources found."}
                      </p>
                      <p className="text-xs opacity-50 mt-0.5 max-w-xs">
                        {selectedCategory === "in_plan"
                          ? "Switch to All Sources or another category on the left to allot assets to this planner."
                          : "Try searching or clearing the category filter."}
                      </p>
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
                          className={`p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center border ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                              : "bg-base-200/50 hover:bg-base-200 border-base-300/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
                            <CompanyLogo
                              name={
                                item.sourceType === "stock"
                                  ? item.name
                                  : item.sourceType === "mf"
                                  ? item.amc
                                  : item.bankName || "Bank"
                              }
                              size="w-7 h-7 sm:w-8 sm:h-8"
                              type={
                                item.sourceType === "stock"
                                  ? "stock"
                                  : item.sourceType === "mf"
                                  ? "mf"
                                  : "bank"
                              }
                            />
                            <div className="overflow-hidden text-left min-w-0 flex-1">
                              <div className="font-extrabold text-xs text-base-content truncate whitespace-nowrap leading-tight">
                                {item.displayName}
                              </div>
                              <div className="text-[10px] text-base-content/50 font-semibold flex items-center gap-1 mt-0.5 whitespace-nowrap truncate leading-tight">
                                <span className="truncate">
                                  {item.sourceType === "bank"
                                    ? item.accountType ? `${item.accountType} Account` : "Liquid Balance"
                                    : item.sourceType === "stock"
                                    ? `${item.holdingQty} shares`
                                    : item.sourceType === "mf"
                                    ? `${(item.availableUnits ?? item.activeUnits ?? 0).toFixed(2)} units`
                                    : item.sourceType === "fd"
                                    ? `${item.interestRate}% Interest`
                                    : item.sourceType === "rd"
                                    ? `${item.interestRate}% Interest`
                                    : "EPF"}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-base-content/70 shrink-0">
                                  {formatINRCompact(item.holdingValue)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2 whitespace-nowrap">
                            <div className="text-right shrink-0 font-mono whitespace-nowrap">
                              <div className="font-black text-xs text-base-content whitespace-nowrap">
                                Left: {formatINRCompact(stats.maxAllowedAmt)}
                              </div>
                              <div className="mt-0.5 whitespace-nowrap">
                                {isAllottedHere ? (
                                  <span
                                    className={`badge badge-xs font-bold whitespace-nowrap ${
                                      stats.currentGoalPercent === 0
                                        ? "bg-base-200 text-base-content/60 border border-base-300"
                                        : "bg-primary text-primary-content"
                                    }`}
                                  >
                                    In Plan ({stats.currentGoalPercent}%)
                                  </span>
                                ) : stats.maxAllowedPct < 100 ? (
                                  <span
                                    className={`badge badge-xs font-semibold whitespace-nowrap ${
                                      stats.maxAllowedPct === 0
                                        ? "badge-error badge-soft text-error font-bold"
                                        : "bg-base-300 text-base-content/70"
                                    }`}
                                  >
                                    {stats.maxAllowedPct === 0 ? "0% Left" : `${stats.maxAllowedPct}% left`}
                                  </span>
                                ) : (
                                  <span className="badge badge-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/20 whitespace-nowrap">
                                    100% Free
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={15} className="md:hidden text-base-content/40 shrink-0" />
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
              <div className={`${selectedSource ? "flex" : "hidden md:flex"} md:col-span-6 bg-base-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-base-300 flex-col justify-between h-full min-h-0 overflow-hidden`}>
                {/* Mobile Only: Back to Sources Navigation Header */}
                <div className="md:hidden flex items-center justify-between pb-1.5 mb-1.5 border-b border-base-300 shrink-0 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost gap-1 font-bold text-base-content/80 hover:text-base-content px-1.5 -ml-1 shrink-0 whitespace-nowrap"
                    onClick={() => setSelectedSource(null)}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <span className="text-[11px] font-bold text-primary truncate max-w-[170px] xs:max-w-[220px] text-right whitespace-nowrap">
                    {selectedSource?.displayName || "Configure Allotment"}
                  </span>
                </div>

                {/* Target Goal / Planner Dropdown Selector */}
                <div className="bg-base-200/60 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border border-base-300 flex items-center justify-between gap-2 shrink-0 mb-1.5 sm:mb-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-base sm:text-xl shrink-0">{currentPlan?.icon || "🎯"}</span>
                    <div className="min-w-0 truncate">
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-primary block leading-tight whitespace-nowrap truncate">
                        Target Goal
                      </span>
                      <span className="text-xs font-bold text-base-content truncate block whitespace-nowrap max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                        {currentPlan?.title || "Select Planner"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-36 xs:w-44 sm:w-56">
                    <select
                      value={currentPlan?.id || ""}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="select select-xs sm:select-sm select-bordered w-full rounded-xl bg-base-100 font-bold text-[11px] sm:text-xs text-base-content focus:border-primary focus:outline-none shadow-xs truncate"
                    >
                      {goals.map((g) => {
                        const isAlloc =
                          Boolean(g.allocations && selectedSource?.id in g.allocations) ||
                          (selectedSource?.sourceType === "bank" && (g.selectedBanks || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "stock" && (g.selectedStocks || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "mf" && (g.selectedMfs || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "fd" && (g.selectedFds || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "rd" && (g.selectedRds || []).includes(selectedSource?.id)) ||
                          (selectedSource?.sourceType === "pf" && g.includePf);

                        const allocPct = g.allocations?.[selectedSource?.id]?.percent;
                        const pctText = allocPct !== undefined ? ` • ${allocPct}%` : isAlloc ? " • Allocated" : "";

                        return (
                          <option key={g.id} value={g.id} className="text-xs font-medium py-1">
                            {g.icon || "🎯"} {g.title} ({formatINRCompact(g.targetAmount)}){pctText}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {selectedSource ? (
                  <div className="space-y-1.5 sm:space-y-3 flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5">
                    {/* Selected Source Header Banner */}
                    <div className="bg-base-200/60 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-base-300 flex items-center justify-between gap-2.5 shrink-0 whitespace-nowrap">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
                        <CompanyLogo
                          name={
                            selectedSource.sourceType === "stock"
                              ? selectedSource.name
                              : selectedSource.sourceType === "mf"
                              ? selectedSource.amc
                              : selectedSource.bankName || "Bank"
                          }
                          size="w-8 h-8 sm:w-10 sm:h-10"
                          type={
                            selectedSource.sourceType === "stock"
                              ? "stock"
                              : selectedSource.sourceType === "mf"
                              ? "mf"
                              : "bank"
                          }
                        />
                        <div className="overflow-hidden min-w-0 flex-1">
                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-primary block leading-tight whitespace-nowrap">
                            Selected Source
                          </span>
                          <h4 className="font-extrabold text-xs sm:text-sm text-base-content truncate whitespace-nowrap leading-tight">
                            {selectedSource.displayName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-base-content/60 font-semibold whitespace-nowrap truncate leading-tight mt-0.5">
                            <span className="whitespace-nowrap">
                              <span className="hidden sm:inline">Total Value: </span>
                              <span className="sm:hidden">Val: </span>
                              <span className="hidden sm:inline font-mono">{formatINR(selectedSource.holdingValue)}</span>
                              <span className="sm:hidden font-mono">{formatINRCompact(selectedSource.holdingValue)}</span>
                            </span>
                            {selectedSource.sourceType === "stock" && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-mono font-bold whitespace-nowrap truncate">
                                  {selectedSource.holdingQty || 0} shares
                                </span>
                              </>
                            )}
                            {selectedSource.sourceType === "mf" && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-mono font-bold whitespace-nowrap truncate">
                                  {(selectedSource.availableUnits ?? selectedSource.activeUnits ?? 0).toFixed(2)} units
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-xs sm:badge-sm font-bold uppercase tracking-wider bg-base-100 border-base-300 text-[9px] sm:text-[10px] shrink-0 whitespace-nowrap">
                        {selectedSource.sourceType.toUpperCase()}
                      </span>
                    </div>

                    {/* Allotment Across All Plans Breakdown Card */}
                    <div className="bg-base-200/50 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-base-300 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs whitespace-nowrap gap-2">
                        <span className="font-extrabold text-[11px] sm:text-xs text-base-content/80 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                          <SlidersHorizontal size={13} className="text-primary shrink-0" />
                          <span className="hidden sm:inline">Source Allocation Status</span>
                          <span className="sm:hidden">Allocation</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap text-[10px] sm:text-[11px]">
                          <span className="text-base-content/50 font-bold uppercase tracking-wider hidden xs:inline">
                            Left:
                          </span>
                          <span
                            className={`font-mono font-bold whitespace-nowrap ${
                              currentStats.maxAllowedPct === 0 ? "text-error" : "text-primary"
                            }`}
                          >
                            <span className="hidden sm:inline">{formatINR(currentStats.maxAllowedAmt)}</span>
                            <span className="sm:hidden">{formatINRCompact(currentStats.maxAllowedAmt)}</span>
                            {" "}({currentStats.maxAllowedPct}%)
                          </span>
                        </div>
                      </div>

                      {/* Visual Multi-color Progress Distribution Bar */}
                      <div className="w-full bg-base-300/80 rounded-full h-2 sm:h-2.5 overflow-hidden flex">
                        {currentStats.breakdown
                          .filter((b) => b.percent > 0)
                          .map((b) => (
                            <div
                              key={b.goalId}
                              className={`h-full transition-all ${
                                b.goalId === currentPlan.id ? "bg-primary" : "bg-purple-500/70"
                              }`}
                              style={{ width: `${b.percent}%` }}
                              title={`${b.goalTitle}: ${b.percent}% (${formatINR(b.amount)})`}
                            />
                          ))}
                      </div>

                      {/* Distribution Items */}
                      <div className="space-y-1 pt-0.5 max-h-20 sm:max-h-40 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {currentStats.breakdown.length === 0 ? (
                          <div className="text-[11px] text-base-content/50 italic flex items-center gap-1 whitespace-nowrap">
                            <Info size={12} className="shrink-0" />
                            <span className="truncate">This asset is not yet allotted to any life plan.</span>
                          </div>
                        ) : (
                          currentStats.breakdown.map((b) => (
                            <div
                              key={b.goalId}
                              className={`flex items-center justify-between text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-mono whitespace-nowrap ${
                                b.goalId === currentPlan.id
                                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                  : "bg-base-100 text-base-content/70 border border-base-300"
                              }`}
                            >
                              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 overflow-hidden">
                                <span className="shrink-0 text-xs sm:text-sm">{b.goalIcon}</span>
                                <span className="font-sans font-extrabold truncate whitespace-nowrap text-[11px] sm:text-xs">
                                  {b.goalTitle}
                                  {b.goalId === currentPlan.id ? " (This Plan)" : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2 whitespace-nowrap">
                                <span className={`text-[11px] sm:text-xs whitespace-nowrap ${b.percent === 0 ? "text-base-content/40 font-bold" : "font-bold"}`}>
                                  <span className="hidden sm:inline">{formatINR(b.amount)}</span>
                                  <span className="sm:hidden">{formatINRCompact(b.amount)}</span>
                                </span>
                                <span
                                  className={`badge badge-xs font-bold font-mono px-1.5 sm:px-2 py-0.5 whitespace-nowrap ${
                                    b.percent === 0
                                      ? "bg-base-200 text-base-content/50"
                                      : b.goalId === currentPlan.id
                                      ? "badge-primary"
                                      : "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                                  }`}
                                >
                                  {b.percent}%
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Allotment Input Controls for Current Plan */}
                    <div className="bg-base-200/60 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-base-300 space-y-2 sm:space-y-2.5">
                      <div className="flex items-center justify-between whitespace-nowrap gap-2">
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-base-content/80 truncate whitespace-nowrap max-w-[120px] xs:max-w-[180px] sm:max-w-none">
                          Allot to {currentPlan.title}
                        </span>

                        {/* Mode Toggle */}
                        <div className="join rounded-xl bg-base-100 p-0.5 border border-base-300 shrink-0 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setAllotmentMode("percent")}
                            className={`join-item btn btn-xs h-6 min-h-0 rounded-lg font-bold text-[10px] whitespace-nowrap px-2 ${
                              allotmentMode === "percent"
                                ? "btn-primary text-primary-content shadow-xs"
                                : "btn-ghost text-base-content/60"
                            }`}
                          >
                            <Percent size={11} className="shrink-0" />
                            <span className="hidden sm:inline">Percentage</span>
                            <span className="sm:hidden">Percent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllotmentMode("amount")}
                            className={`join-item btn btn-xs h-6 min-h-0 rounded-lg font-bold text-[10px] whitespace-nowrap px-2 ${
                              allotmentMode === "amount"
                                ? "btn-primary text-primary-content shadow-xs"
                                : "btn-ghost text-base-content/60"
                            }`}
                          >
                            <Coins size={11} className="shrink-0" />
                            <span className="hidden sm:inline">Fixed INR</span>
                            <span className="sm:hidden">Amount</span>
                          </button>
                        </div>
                      </div>

                      {/* Percentage Mode Controls - Clamped to maxAllowedPct */}
                      {allotmentMode === "percent" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <input
                              type="range"
                              min="0"
                              max={currentStats.maxAllowedPct}
                              value={allotPercent}
                              disabled={currentStats.maxAllowedPct === 0}
                              onChange={(e) => handlePercentChange(e.target.value)}
                              className="range range-primary range-xs flex-1 disabled:opacity-30"
                            />
                            <div className="w-14 sm:w-16 shrink-0">
                              <input
                                type="number"
                                min="0"
                                max={currentStats.maxAllowedPct}
                                value={allotPercent}
                                disabled={currentStats.maxAllowedPct === 0}
                                onChange={(e) => handlePercentChange(e.target.value)}
                                className="input input-xs input-bordered w-full font-mono font-bold text-center bg-base-100 rounded-lg disabled:opacity-50"
                              />
                            </div>
                            <span className="text-xs font-bold font-mono shrink-0">%</span>
                          </div>

                          {/* Quick Percentage Presets - single-line horizontal scrollable, no wrap */}
                          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-0.5 whitespace-nowrap">
                            {[0, 25, 50, 75, 100]
                              .filter((pct) => pct <= currentStats.maxAllowedPct)
                              .map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => handlePercentChange(pct)}
                                  className={`btn btn-xs h-6 min-h-0 font-bold font-mono rounded-lg px-2 shrink-0 whitespace-nowrap ${
                                    allotPercent === pct ? "btn-primary shadow-xs" : "btn-ghost bg-base-100 border border-base-300/60"
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            {currentStats.maxAllowedPct > 0 &&
                              ![0, 25, 50, 75, 100].includes(currentStats.maxAllowedPct) && (
                                <button
                                  type="button"
                                  onClick={() => handlePercentChange(currentStats.maxAllowedPct)}
                                  className="btn btn-xs h-6 min-h-0 btn-outline btn-primary font-bold font-mono rounded-lg px-2 shrink-0 whitespace-nowrap"
                                  title="Allot exact remaining unallocated share"
                                >
                                  Left ({currentStats.maxAllowedPct}%)
                                </button>
                              )}
                          </div>

                          {currentStats.maxAllowedPct === 0 && (
                            <div className="text-[10px] sm:text-[11px] text-error flex items-center gap-1.5 font-medium pt-0.5 whitespace-nowrap truncate">
                              <AlertCircle size={13} className="shrink-0" />
                              <span className="truncate">Fully allocated to other planners (0% left).</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Amount Mode Controls - Clamped to maxAllowedAmt */
                        <div className="space-y-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs opacity-50">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={currentStats.maxAllowedAmt}
                              value={Math.round(allotAmount)}
                              disabled={currentStats.maxAllowedAmt === 0}
                              onChange={(e) => handleAmountChange(e.target.value)}
                              className="input input-sm input-bordered w-full pl-7 rounded-xl font-mono font-bold text-xs bg-base-100 disabled:opacity-50"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] whitespace-nowrap gap-1">
                            <span className="text-base-content/50 font-medium truncate whitespace-nowrap">
                              Max Left:{" "}
                              <strong className="text-base-content font-mono">
                                <span className="hidden sm:inline">{formatINR(currentStats.maxAllowedAmt)}</span>
                                <span className="sm:hidden">{formatINRCompact(currentStats.maxAllowedAmt)}</span>
                              </strong>
                            </span>
                            {currentStats.maxAllowedAmt > 0 && (
                              <button
                                type="button"
                                onClick={() => handleAmountChange(currentStats.maxAllowedAmt)}
                                className="btn btn-xs btn-ghost text-primary text-[10px] font-bold hover:underline p-0 h-auto min-h-0 shrink-0 whitespace-nowrap"
                              >
                                Fill Max ({formatINRCompact(currentStats.maxAllowedAmt)})
                              </button>
                            )}
                          </div>

                          {currentStats.maxAllowedAmt === 0 && (
                            <div className="text-[10px] sm:text-[11px] text-error flex items-center gap-1.5 font-medium pt-0.5 whitespace-nowrap truncate">
                              <AlertCircle size={13} className="shrink-0" />
                              <span className="truncate">Fully allocated to other planners (0 INR left).</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* If Stock: Shares Counter - Clamped to maxAllowedShares */}
                      {selectedSource.sourceType === "stock" && (
                        <div className="pt-2 border-t border-base-300 flex items-center justify-between gap-1.5 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-base-content/70 whitespace-nowrap shrink-0">
                            Shares:
                          </span>
                          <div className="join border border-base-300 rounded-lg overflow-hidden shrink-0">
                            <button
                              type="button"
                              disabled={allotShares <= 0}
                              onClick={() => handleSharesChange(allotShares - 1)}
                              className="join-item btn btn-xs btn-neutral px-2 font-bold disabled:opacity-30"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={currentStats.maxAllowedShares}
                              value={allotShares}
                              disabled={currentStats.maxAllowedShares === 0}
                              onChange={(e) => handleSharesChange(e.target.value)}
                              className="join-item input input-xs text-center font-bold font-mono w-12 sm:w-14 bg-base-100 focus:outline-none disabled:opacity-50"
                            />
                            <button
                              type="button"
                              disabled={allotShares >= currentStats.maxAllowedShares}
                              onClick={() => handleSharesChange(allotShares + 1)}
                              className="join-item btn btn-xs btn-neutral px-2 font-bold disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] font-mono text-base-content/50 whitespace-nowrap truncate text-right">
                            <span className="hidden sm:inline">Max </span>{currentStats.maxAllowedShares}/{selectedSource.holdingQty} left
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Live Calculation Preview Badge */}
                    <div className="bg-primary/10 border border-primary/20 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between text-xs whitespace-nowrap gap-2">
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-primary/70 block truncate whitespace-nowrap">
                          Allocating to {currentPlan.title}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5 whitespace-nowrap">
                          <span className="font-black text-primary font-mono text-xs sm:text-sm whitespace-nowrap">
                            <span className="hidden sm:inline">{formatINR(allotAmount)}</span>
                            <span className="sm:hidden">{formatINRCompact(allotAmount)}</span>
                          </span>
                          <span className="text-[10px] text-base-content/60 font-mono">
                            ({allotPercent}%)
                          </span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] sm:text-[11px] shrink-0 whitespace-nowrap">
                        <span className="text-base-content/50 block text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">
                          Remaining Left
                        </span>
                        <span className="font-bold text-base-content whitespace-nowrap mt-0.5 block">
                          <span className="hidden sm:inline">{formatINR(Math.max(0, currentStats.maxAllowedAmt - allotAmount))}</span>
                          <span className="sm:hidden">{formatINRCompact(Math.max(0, currentStats.maxAllowedAmt - allotAmount))}</span>
                          <span className="text-[10px] text-base-content/60 ml-1">
                            ({Math.max(0, Math.round((currentStats.maxAllowedPct - allotPercent) * 10) / 10)}%)
                          </span>
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
                  <div className="pt-2 sm:pt-3 border-t border-base-300 flex items-center gap-2 shrink-0 whitespace-nowrap">
                    {currentStats.isAllottedToCurrentGoal && (
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="btn btn-sm btn-error btn-outline rounded-xl font-bold gap-1 text-xs shrink-0 whitespace-nowrap px-2.5 sm:px-3"
                      >
                        <Trash2 size={13} className="shrink-0" />
                        <span>Remove</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={currentStats.maxAllowedPct === 0 && !currentStats.isAllottedToCurrentGoal}
                      className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 text-xs flex-1 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-40 whitespace-nowrap overflow-hidden"
                    >
                      <Plus size={15} className="shrink-0" />
                      <span className="truncate whitespace-nowrap">
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
