import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { updateSalary } from "../../services/redux/slice/ExpenseSlice";
import { Eye, EyeOff, Wallet, Banknote, Calculator, PiggyBank, Flame, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import EditSalaryModal from "./EditSalaryModal";
import { message } from "antd";

const HeaderSection = () => {
    const dispatch = useDispatch();
    const { salary, sources, transactions, categories, currentMonth } = useSelector((state) => state.expense);

    const [showSalaryModal, setShowSalaryModal] = useState(false);

    // Privacy State
    const [showBalance, setShowBalance] = useState(true);
    const headerScrollRef = useRef(null);


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

    // Calculate Global Used (only Debit transactions with a valid Category count as category spending)
    const totalUsed = transactions
        .filter(t => t.type === 'Debit' && Boolean(t.categoryId?._id || t.categoryId))
        .reduce((sum, t) => sum + t.amount, 0);
    const totalRemaining = salary - totalUsed;

    // Calculate Source Totals & Sorted Sources (Banks first by highest balance, then Cards by highest spent/money)
    const sourceTotals = sources.map(source => {
        const spent = transactions
            .filter(t => t.type === 'Debit' && (t.sourceId?._id === source._id || t.sourceId === source._id))
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...source, spent };
    });

    const sortedSources = [...sources].sort((a, b) => {
        const isABank = a.type === 'Bank';
        const isBBank = b.type === 'Bank';

        if (isABank && !isBBank) return -1;
        if (!isABank && isBBank) return 1;

        const getAmt = (s) => {
            if (s.type === 'Card') {
                const st = sourceTotals.find(item => item._id === s._id);
                return st?.spent ?? s.balance ?? 0;
            }
            return s.balance || 0;
        };

        return getAmt(b) - getAmt(a);
    });

    const totalBankBalance = sourceTotals
        .filter(s => (s.type === 'Bank' || !s.type) && !excludedSourceIds.includes(String(s._id)))
        .reduce((sum, s) => sum + (s.balance || 0), 0);

    const totalCardSpent = sourceTotals
        .filter(s => s.type === 'Card' && !excludedSourceIds.includes(String(s._id)))
        .reduce((sum, s) => sum + (s.spent || 0), 0);

    const netAssetsAfterCards = totalBankBalance - totalCardSpent;

    const breakdownSources = sourceTotals
        .filter(s => s.type === 'Bank' || s.type === 'Card')
        .slice(0, 4);

    const handleSaveSalaryModal = async (newSalary) => {
        const val = Number(newSalary) || 0;
        try {
            await dispatch(updateSalary({ month: currentMonth, salary: val })).unwrap();
            message.success(
                `Salary for ${dayjs(currentMonth).format("MMMM YYYY")} updated to ₹${val.toLocaleString("en-IN")}`
            );
        } catch (err) {
            message.error(typeof err === "string" ? err : "Failed to update salary");
            throw err;
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Summary Stats Header (DaisyUI Stats) */}
            <div className="stats shadow-sm border border-base-300 w-full bg-base-200 flex flex-col md:flex-row relative group rounded-2xl">

                {/* Privacy Toggle */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                    <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="btn btn-xs btn-ghost btn-circle opacity-40 hover:opacity-100"
                        title={showBalance ? "Hide Balances" : "Show Balances"}
                    >
                        {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>

                {/* 1. Total Assets Card (with Compact Scrollable Bank & Card Balance List - Side Arrows) */}
                <div className="stat place-items-center relative overflow-hidden p-5">
                    <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10 flex items-center gap-1">
                        <span>Total Net Assets</span>
                        {excludedSourceIds.length > 0 && (
                            <span className="text-[10px] text-amber-500 font-bold">({excludedSourceIds.length} Excluded)</span>
                        )}
                    </div>
                    <div className={`stat-value text-3xl relative z-10 ${netAssetsAfterCards < 0 ? 'text-error' : 'text-success'}`}>
                        {showBalance ? (netAssetsAfterCards < 0 ? `-₹${Math.abs(netAssetsAfterCards).toLocaleString()}` : `₹${netAssetsAfterCards.toLocaleString()}`) : "••••••••"}
                    </div>

                    {/* Net Liquid Money after Credit Card Bills */}
                    <div className="stat-desc font-medium text-[11px] relative z-10 mt-0.5">
                        {showBalance ? (
                            <span className="text-base-content/70 font-medium">
                                Banks: ₹{totalBankBalance.toLocaleString()} | Cards: <span className="text-error font-bold">-₹{totalCardSpent.toLocaleString()}</span>
                            </span>
                        ) : (
                            <span className="text-base-content/50">Net: ••••••</span>
                        )}
                    </div>

                    {/* Compact Scrollable List of Bank & Card Balances (Side arrows) */}
                    {sortedSources.length > 0 && (
                        <div className="w-full mt-2 pt-1.5 border-t border-base-300/50 relative z-10 flex items-center gap-1">
                            {sortedSources.length > 3 ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        headerScrollRef.current?.scrollBy({ top: -38, behavior: 'smooth' });
                                    }}
                                    className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                                    title="Scroll Up"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                            ) : <div className="w-3 shrink-0" />}

                            {/* List Container (Scrollable, compact height) */}
                            <div
                                ref={headerScrollRef}
                                className="flex-1 max-h-[66px] overflow-y-auto space-y-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                            >
                                {sortedSources.map((source) => {
                                    const isCard = source.type === 'Card';
                                    const rawAmt = isCard
                                        ? (sourceTotals.find(s => s._id === source._id)?.spent ?? source.balance ?? 0)
                                        : (source.balance || 0);
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
                                            title={isExcluded ? "Click to include in Total calculation" : "Click to exclude from Total calculation"}
                                        >
                                            <span className="font-semibold text-base-content/70 truncate text-[11px] text-left flex items-center gap-1">
                                                {isExcluded && <EyeOff size={10} className="shrink-0 text-amber-500" />}
                                                {source.name}
                                            </span>
                                            <span className={`font-mono font-extrabold text-[11px] shrink-0 text-right ${isExcluded ? 'text-base-content/40' : (isErrorColor ? 'text-error' : 'text-success')}`}>
                                                {showBalance
                                                    ? (isCard ? `-₹${Math.abs(rawAmt).toLocaleString()}` : (rawAmt < 0 ? `-₹${Math.abs(rawAmt).toLocaleString()}` : `₹${rawAmt.toLocaleString()}`))
                                                    : "••••"
                                                }
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {sortedSources.length > 3 ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        headerScrollRef.current?.scrollBy({ top: 38, behavior: 'smooth' });
                                    }}
                                    className="opacity-30 hover:opacity-90 transition-opacity p-0.5 text-base-content hover:scale-110 shrink-0"
                                    title="Scroll Down"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            ) : <div className="w-3 shrink-0" />}
                        </div>
                    )}

                    <Wallet className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                </div>

                {/* 2. Combined Salary & Budget Planning Stat Card */}
                {(() => {
                    const monthCategories = categories.filter(c => !c.month || c.month === currentMonth);
                    const totalBudgeted = monthCategories.reduce((acc, cat) => acc + (cat.subCategories || []).reduce((subAcc, sub) => subAcc + (Number(sub.budget) || 0), 0), 0);
                    const unbudgetedSalary = salary - totalBudgeted;
                    const isOverBudget = totalBudgeted > salary;
                    const allocatedPct = salary > 0 ? Math.min(((totalBudgeted / salary) * 100), 100) : 0;

                    return (
                        <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300 relative overflow-hidden p-5">
                            <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10 flex items-center justify-between w-full">
                                <span>Salary & Budget</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSalaryModal(true);
                                    }}
                                    className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                    title="Edit Monthly Salary or Get from Salary Slip"
                                >
                                    <Pencil size={12} />
                                </button>
                            </div>
                            <div
                                onClick={() => setShowSalaryModal(true)}
                                className="stat-value text-primary text-3xl cursor-pointer hover:opacity-80 transition-opacity relative z-10 group/sal flex items-center gap-1.5"
                                title="Click to edit monthly salary"
                            >
                                <span>{showBalance ? `₹${(Number(salary) || 0).toLocaleString()}` : "••••••••"}</span>
                                <Pencil size={14} className="opacity-0 group-hover/sal:opacity-70 transition-opacity text-primary" />
                            </div>

                            <div className="w-full mt-2 pt-2 border-t border-base-300/60 relative z-10 flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-base-content/70">Planned:</span>
                                    <span className="font-semibold text-info font-mono">
                                        {showBalance ? `₹${totalBudgeted.toLocaleString()}` : "••••"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-base-content/70">Unplanned:</span>
                                    <span className={`font-mono ${isOverBudget ? 'text-error font-bold' : 'text-success font-semibold'}`}>
                                        {showBalance
                                            ? (isOverBudget 
                                                ? `Over by ₹${(totalBudgeted - salary).toLocaleString()}` 
                                                : `₹${unbudgetedSalary.toLocaleString()}`)
                                            : "••••"
                                        }
                                    </span>
                                </div>
                                <progress
                                    className={`progress w-full h-1.5 mt-0.5 ${isOverBudget ? 'progress-error' : 'progress-info'}`}
                                    value={allocatedPct}
                                    max="100"
                                    title={`Allocated ${allocatedPct.toFixed(2)}% of Salary`}
                                ></progress>
                            </div>
                            <Banknote className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                        </div>
                    );
                })()}

                {/* 3. Dedicated Total Spent Stat Card */}
                {(() => {
                    const monthCategories = categories.filter(c => !c.month || c.month === currentMonth);
                    const totalBudgeted = monthCategories.reduce((acc, cat) => acc + (cat.subCategories || []).reduce((subAcc, sub) => subAcc + (Number(sub.budget) || 0), 0), 0);
                    const spentPctSalary = salary > 0 ? Math.min(((totalUsed / salary) * 100), 100) : 0;
                    const spentPctBudget = totalBudgeted > 0 ? Math.min(((totalUsed / totalBudgeted) * 100), 100) : 0;

                    return (
                        <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300 relative overflow-hidden p-5">
                            <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Total Spent</div>
                            <div className="stat-value text-warning text-3xl relative z-10">
                                {showBalance ? `₹${totalUsed.toLocaleString()}` : "••••••••"}
                            </div>
                            <div className="stat-desc flex flex-col items-center gap-1 w-full max-w-[170px] relative z-10 mt-2">
                                <div className="flex justify-between w-full text-[11px] font-medium">
                                    <span className="text-base-content/70">
                                        {showBalance ? `${spentPctSalary.toFixed(2)}% Salary` : "••% Salary"}
                                    </span>
                                    <span className="text-warning font-semibold">
                                        {showBalance ? `${spentPctBudget.toFixed(2)}% Budget` : "••% Budget"}
                                    </span>
                                </div>
                                <progress
                                    className="progress progress-warning w-full h-1.5"
                                    value={spentPctSalary}
                                    max="100"
                                ></progress>
                            </div>
                            <Flame className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                        </div>
                    );
                })()}

                {/* 4. Actual Remaining Stat Card (with Vertical Calculation Breakdown) */}
                {(() => {
                    const monthCategories = categories.filter(c => !c.month || c.month === currentMonth);
                    const totalBudgeted = monthCategories.reduce((acc, cat) => acc + (cat.subCategories || []).reduce((subAcc, sub) => subAcc + (Number(sub.budget) || 0), 0), 0);
                    const unbudgetedSalary = salary - totalBudgeted;

                    return (
                        <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300 relative overflow-hidden p-5">
                            <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Actual Remaining</div>
                            <div className={`stat-value text-3xl ${totalRemaining < 0 ? 'text-error' : 'text-success'} relative z-10`}>
                                {showBalance ? `₹${totalRemaining.toLocaleString()}` : "••••••••"}
                            </div>

                            {/* Vertical Calculation Breakdown: Planned - Spent + Unplanned */}
                            <div className="w-full mt-2 pt-2 border-t border-base-300/60 relative z-10 flex flex-col gap-1 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Planned:</span>
                                    <span className="font-mono text-info font-semibold">
                                        {showBalance ? `₹${totalBudgeted.toLocaleString()}` : "••••"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Spent:</span>
                                    <span className="font-mono text-error font-semibold">
                                        {showBalance ? `-₹${totalUsed.toLocaleString()}` : "••••"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Unplanned:</span>
                                    <span className={`font-mono font-semibold ${unbudgetedSalary < 0 ? 'text-error' : 'text-success'}`}>
                                        {showBalance 
                                            ? (unbudgetedSalary < 0 ? `-₹${Math.abs(unbudgetedSalary).toLocaleString()}` : `+₹${unbudgetedSalary.toLocaleString()}`)
                                            : "••••"
                                        }
                                    </span>
                                </div>
                            </div>
                            <PiggyBank className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                        </div>
                    );
                })()}

            </div>

            {/* Edit Salary & Import from Slip Modal */}
            <EditSalaryModal
                isOpen={showSalaryModal}
                onClose={() => setShowSalaryModal(false)}
                currentMonth={currentMonth}
                currentSalary={salary}
                onSaveSalary={handleSaveSalaryModal}
            />
        </div>
    );
};

export default HeaderSection;
