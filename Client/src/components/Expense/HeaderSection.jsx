import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { setMonth, updateSalary, createSource, deleteSource, fetchDashboardData } from "../../services/redux/slice/ExpenseSlice";
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

const HeaderSection = () => {
    const dispatch = useDispatch();
    const { currentMonth, salary, sources, transactions, categories } = useSelector((state) => state.expense);

    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [tempSalary, setTempSalary] = useState(salary);
    const [newSourceName, setNewSourceName] = useState("");
    const [newSourceType, setNewSourceType] = useState("Bank");
    const [newSourceBalance, setNewSourceBalance] = useState("");
    const [isAddingSource, setIsAddingSource] = useState(false);

    // Privacy State
    const [showBalance, setShowBalance] = useState(true);

    // Sync tempSalary when salary updates from store
    useEffect(() => {
        setTempSalary(salary);
    }, [salary]);

    // Calculate Global Used
    const totalUsed = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalRemaining = salary - totalUsed;
    const usedPercentage = salary > 0 ? ((totalUsed / salary) * 100).toFixed(2) : 0;

    // Calculate Source Totals
    const sourceTotals = sources.map(source => {
        const spent = transactions
            .filter(t => t.sourceId?._id === source._id || t.sourceId === source._id)
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...source, spent };
    });

    const totalSpentSources = sourceTotals.reduce((sum, s) => sum + s.spent, 0);


    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        dispatch(setMonth(newMonth));
        dispatch(fetchDashboardData(newMonth));
    };

    const handleSalarySubmit = () => {
        dispatch(updateSalary({ month: currentMonth, salary: Number(tempSalary) }));
        setIsEditingSalary(false);
    };

    const handleAddSource = () => {
        if (newSourceName.trim()) {
            dispatch(createSource({
                name: newSourceName,
                type: newSourceType,
                balance: newSourceBalance ? Number(newSourceBalance) : 0
            }));
            setNewSourceName("");
            setNewSourceType("Bank");
            setNewSourceBalance("");
            setIsAddingSource(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full">

            {/* Top Row: Month & Summary Stats */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* Left: Month Selector & Add Source */}
                <div className="flex flex-col md:flex-row xl:flex-col gap-4 min-w-[250px]">
                    {/* Month Selector */}
                    <div className="card bg-base-200 shadow-sm border border-base-300">
                        <div className="card-body p-4 flex flex-row items-center justify-between">
                            <h2 className="card-title text-base font-medium opacity-70">Period</h2>
                            <input
                                type="month"
                                value={currentMonth}
                                onChange={handleMonthChange}
                                className="input input-sm input-ghost font-semibold text-lg focus:outline-none focus:bg-transparent px-0 text-right w-full max-w-[150px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Financial Summary (DaisyUI Stats) */}
                <div className="stats shadow-sm border border-base-300 w-full bg-base-200 flex flex-col md:flex-row relative group">

                    {/* Privacy Toggle (Absolute top-right of stats block) */}
                    <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="btn btn-xs btn-ghost btn-circle absolute top-2 right-2 z-10 opacity-30 hover:opacity-100"
                        title={showBalance ? "Hide Balances" : "Show Balances"}
                    >
                        {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>

                    {/* Salary Stat */}
                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs">Total Salary</div>
                        {isEditingSalary ? (
                            <input
                                type="number"
                                value={tempSalary}
                                onChange={(e) => setTempSalary(e.target.value)}
                                onBlur={handleSalarySubmit}
                                onKeyDown={(e) => e.key === 'Enter' && handleSalarySubmit()}
                                autoFocus
                                className="input input-xs input-bordered w-full max-w-[120px] text-center mt-1"
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingSalary(true)}
                                className="stat-value text-primary text-3xl cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {showBalance ? `₹${salary?.toLocaleString()}` : "••••••••"}
                            </div>
                        )}
                        <div className="stat-desc">Monthly Income</div>
                    </div>

                    {/* Planned Budget Stat */}
                    {(() => {
                        const totalBudgeted = categories.reduce((acc, cat) => acc + cat.subCategories.reduce((subAcc, sub) => subAcc + sub.budget, 0), 0);
                        const isOverBudget = totalBudgeted > salary;
                        const budgetPct = salary > 0 ? ((totalBudgeted / salary) * 100) : 0;

                        return (
                            <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300">
                                <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs">Planned Budget</div>
                                <div className={`stat-value text-3xl ${isOverBudget ? 'text-error' : 'text-info'}`}>
                                    {showBalance ? `₹${totalBudgeted.toLocaleString()}` : "••••••••"}
                                </div>
                                <div className="stat-desc flex flex-col items-center gap-1 w-full max-w-[150px]">
                                    <span className={`${isOverBudget ? 'text-error font-bold' : ''}`}>
                                        {showBalance
                                            ? (isOverBudget ? `Over by ₹${(totalBudgeted - salary).toLocaleString()}` : `${budgetPct.toFixed(0)}% of Salary`)
                                            : "••% of Salary"
                                        }
                                    </span>
                                    <progress
                                        className={`progress w-full h-1.5 ${isOverBudget ? 'progress-error' : 'progress-info'}`}
                                        value={budgetPct}
                                        max="100"
                                    ></progress>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Actual Remaining Stat */}
                    <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300">
                        <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs">Actual Remaining</div>
                        <div className={`stat-value text-3xl ${totalRemaining < 0 ? 'text-error' : 'text-success'}`}>
                            {showBalance ? `₹${totalRemaining.toLocaleString()}` : "••••••••"}
                        </div>
                        <div className="stat-desc text-success font-medium">Net Savings Available</div>
                    </div>

                </div>
            </div>

            {/* Money Sources Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-base-content opacity-80 pl-1">Accounts & Sources</h3>

                    {/* Add Source Toggle */}
                    {!isAddingSource && (
                        <button
                            onClick={() => setIsAddingSource(true)}
                            className="btn btn-xs btn-ghost gap-2 text-primary"
                        >
                            <Plus size={14} /> Add Source
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                    {/* Add Source Input Card */}
                    {isAddingSource && (
                        <div className="card bg-base-200 border border-primary border-dashed shadow-sm">
                            <div className="card-body p-4 flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={newSourceName}
                                    onChange={(e) => setNewSourceName(e.target.value)}
                                    placeholder="Name"
                                    className="input input-sm input-bordered w-full"
                                    autoFocus
                                />
                                <select
                                    className="select select-sm select-bordered w-full text-xs"
                                    onChange={(e) => {
                                        setNewSourceType(e.target.value);
                                    }}
                                    value={newSourceType}
                                >
                                    <option value="Bank">Bank</option>
                                    <option value="Wallet">Wallet</option>
                                    <option value="Card">Card</option>
                                </select>

                                {newSourceType !== 'Card' && (
                                    <input
                                        type="number"
                                        value={newSourceBalance}
                                        onChange={(e) => setNewSourceBalance(e.target.value)}
                                        placeholder="Initial Balance"
                                        className="input input-sm input-bordered w-full"
                                    />
                                )}

                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAddingSource(false)} className="btn btn-xs btn-ghost">Cancel</button>
                                    <button onClick={handleAddSource} className="btn btn-xs btn-primary">Save</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Source Cards */}
                    {sourceTotals.map((source) => (
                        <div key={source._id} className="card bg-base-100 shadow-sm border border-base-200 hover:border-base-300 transition-all group">
                            <div className="card-body p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="card-title text-sm font-semibold opacity-90 truncate" title={source.name}>{source.name}</span>
                                        <span className="text-[10px] opacity-50 uppercase tracking-widest">{source.type || 'Bank'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* We could add individual toggles here, but master toggle is cleaner for now */}
                                        <button
                                            onClick={() => dispatch(deleteSource(source._id))}
                                            className="btn btn-square btn-ghost btn-xs text-error"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-base-content/50 uppercase tracking-widest font-semibold">
                                        {source.type === 'Card' ? 'Spent' : 'Balance'}
                                    </span>
                                    <span className={`text-xl font-bold ${source.type === 'Card' ? 'text-error' : 'text-success'}`}>
                                        {showBalance
                                            ? `₹${(source.type === 'Card' ? source.spent : source.balance)?.toLocaleString() || 0}`
                                            : "••••••"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeaderSection;
