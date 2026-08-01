
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSalary } from "../../services/redux/slice/ExpenseSlice";
import { Eye, EyeOff, Wallet, Banknote, Calculator, PiggyBank, Flame } from "lucide-react";

const HeaderSection = () => {
    const dispatch = useDispatch();
    const { salary, sources, transactions, categories, currentMonth } = useSelector((state) => state.expense);

    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [tempSalary, setTempSalary] = useState(salary);

    // Privacy State
    const [showBalance, setShowBalance] = useState(true);

    // Sync tempSalary when salary updates from store
    useEffect(() => {
        setTempSalary(salary);
    }, [salary]);

    // Calculate Global Used
    const totalUsed = transactions
        .filter(t => t.type !== 'Credit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalRemaining = salary - totalUsed;

    // Calculate Source Totals
    const sourceTotals = sources.map(source => {
        const spent = transactions
            .filter(t => t.type !== 'Credit' && (t.sourceId?._id === source._id || t.sourceId === source._id))
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...source, spent };
    });

    const totalBankBalance = sourceTotals.filter(s => s.type === 'Bank').reduce((sum, s) => sum + s.balance, 0);
    const totalCardSpent = sourceTotals.filter(s => s.type === 'Card').reduce((sum, s) => sum + s.spent, 0);
    const netAssetsAfterCards = totalBankBalance - totalCardSpent;

    const breakdownSources = sourceTotals
        .filter(s => s.type === 'Bank' || s.type === 'Card')
        .slice(0, 4);

    const handleSalarySubmit = () => {
        if (tempSalary !== salary) {
            dispatch(updateSalary({ month: currentMonth, salary: Number(tempSalary) }));
        }
        setIsEditingSalary(false);
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

                {/* 1. Total Assets Card (with Max 4 Banks & Cards Breakdown & Net Assets Calculation) */}
                <div className="stat place-items-center relative overflow-hidden p-5">
                    <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Total Assets</div>
                    <div className="stat-value text-success text-3xl relative z-10">
                        {showBalance ? `₹${totalBankBalance.toLocaleString()}` : "••••••••"}
                    </div>

                    {/* Net Liquid Money after Credit Card Bills */}
                    <div className="stat-desc font-medium text-[11px] relative z-10 mt-0.5">
                        {showBalance ? (
                            <span className={netAssetsAfterCards < 0 ? "text-error font-semibold" : "text-info font-medium"}>
                                Net: ₹{netAssetsAfterCards.toLocaleString()} (After CC Bills)
                            </span>
                        ) : (
                            <span className="text-base-content/50">Net: ••••••</span>
                        )}
                    </div>
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
                            <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Salary & Budget</div>
                            {isEditingSalary ? (
                                <input
                                    type="number"
                                    value={tempSalary}
                                    onChange={(e) => setTempSalary(e.target.value)}
                                    onBlur={handleSalarySubmit}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSalarySubmit()}
                                    autoFocus
                                    className="input input-xs input-bordered w-full max-w-[120px] text-center mt-1 relative z-10 font-mono font-bold"
                                />
                            ) : (
                                <div
                                    onClick={() => setIsEditingSalary(true)}
                                    className="stat-value text-primary text-3xl cursor-pointer hover:opacity-80 transition-opacity relative z-10"
                                    title="Click to edit monthly salary"
                                >
                                    {showBalance ? `₹${salary?.toLocaleString()}` : "••••••••"}
                                </div>
                            )}

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
                                    title={`Allocated ${allocatedPct.toFixed(0)}% of Salary`}
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
                                        {showBalance ? `${spentPctSalary.toFixed(0)}% Salary` : "••% Salary"}
                                    </span>
                                    <span className="text-warning font-semibold">
                                        {showBalance ? `${spentPctBudget.toFixed(0)}% Budget` : "••% Budget"}
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
        </div>
    );
};

export default HeaderSection;
