
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { setMonth, updateSalary, createSource, deleteSource, fetchDashboardData } from "../../services/redux/slice/ExpenseSlice";
import { Plus, X, Eye, EyeOff, Info, Trash2, Wallet, Banknote, Calculator, PiggyBank } from "lucide-react";

const HeaderSection = () => {
    const dispatch = useDispatch();
    const { currentMonth, salary, sources, transactions, categories } = useSelector((state) => state.expense);

    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [tempSalary, setTempSalary] = useState(salary);
    const [newSourceName, setNewSourceName] = useState("");
    const [newSourceType, setNewSourceType] = useState("Bank");
    const [newSourceBalance, setNewSourceBalance] = useState("");

    // History Modal State
    const [historySourceId, setHistorySourceId] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
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
    const totalBankBalance = sourceTotals.filter(s => s.type === 'Bank').reduce((sum, s) => sum + s.balance, 0);


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

                {/* Left: Month Selector & Add Source - REMOVED as per request */}

                {/* Right: Financial Summary (DaisyUI Stats) */}
                <div className="stats shadow-sm border border-base-300 w-full bg-base-200 flex flex-col md:flex-row relative group">

                    {/* Privacy Toggle (Absolute top-right of stats block) */}
                    {/* Header Controls (Month & Privacy) */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                        {/* Month Picker REMOVED - Using Global Slider instead */}

                        {/* Privacy Toggle */}
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="btn btn-xs btn-ghost btn-circle opacity-30 hover:opacity-100"
                            title={showBalance ? "Hide Balances" : "Show Balances"}
                        >
                            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>

                    {/* Total Bank Balance Stat */}
                    <div className="stat place-items-center relative overflow-hidden">
                        <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Total Assets</div>
                        <div className="stat-value text-success text-3xl relative z-10">
                            {showBalance ? `₹${totalBankBalance.toLocaleString()} ` : "••••••••"}
                        </div>
                        <div className="stat-desc relative z-10">Bank Accounts Only</div>
                        <Wallet className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                    </div>

                    {/* Salary Stat */}
                    <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300 relative overflow-hidden">
                        <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Total Salary</div>
                        {isEditingSalary ? (
                            <input
                                type="number"
                                value={tempSalary}
                                onChange={(e) => setTempSalary(e.target.value)}
                                onBlur={handleSalarySubmit}
                                onKeyDown={(e) => e.key === 'Enter' && handleSalarySubmit()}
                                autoFocus
                                className="input input-xs input-bordered w-full max-w-[120px] text-center mt-1 relative z-10"
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingSalary(true)}
                                className="stat-value text-primary text-3xl cursor-pointer hover:opacity-80 transition-opacity relative z-10"
                            >
                                {showBalance ? `₹${salary?.toLocaleString()} ` : "••••••••"}
                            </div>
                        )}
                        <div className="stat-desc text-warning font-semibold relative z-10">₹{totalUsed.toLocaleString()} Used</div>
                        <Banknote className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                    </div>

                    {/* Planned Budget Stat */}
                    {(() => {
                        const totalBudgeted = categories.reduce((acc, cat) => acc + cat.subCategories.reduce((subAcc, sub) => subAcc + sub.budget, 0), 0);
                        const isOverBudget = totalBudgeted > salary;
                        const budgetPct = salary > 0 ? ((totalBudgeted / salary) * 100) : 0;

                        return (
                            <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300 relative overflow-hidden">
                                <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Planned Budget</div>
                                <div className={`stat-value text-3xl ${isOverBudget ? 'text-error' : 'text-info'} relative z-10`}>
                                    {showBalance ? `₹${totalBudgeted.toLocaleString()} ` : "••••••••"}
                                </div>
                                <div className="stat-desc flex flex-col items-center gap-1 w-full max-w-[150px] relative z-10">
                                    <span className={`${isOverBudget ? 'text-error font-bold' : ''}`}>
                                        {showBalance
                                            ? (isOverBudget ? `Over by ₹${(totalBudgeted - salary).toLocaleString()} ` : `${budgetPct.toFixed(0)}% of Salary`)
                                            : "••% of Salary"
                                        }
                                    </span>
                                    <progress
                                        className={`progress w-full h-1.5 ${isOverBudget ? 'progress-error' : 'progress-info'}`}
                                        value={budgetPct}
                                        max="100"
                                    ></progress>
                                </div>
                                <Calculator className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
                            </div>
                        );
                    })()}

                    {/* Actual Remaining Stat */}
                    <div className="stat place-items-center border-t md:border-t-0 md:border-l border-base-300 relative overflow-hidden">
                        <div className="stat-title text-base-content/60 font-medium uppercase tracking-wide text-xs relative z-10">Actual Remaining</div>
                        <div className={`stat-value text-3xl ${totalRemaining < 0 ? 'text-error' : 'text-success'} relative z-10`}>
                            {showBalance ? `₹${totalRemaining.toLocaleString()} ` : "••••••••"}
                        </div>
                        <div className="stat-desc text-success font-medium relative z-10">Net Savings Available</div>
                        <PiggyBank className="absolute -bottom-4 -right-4 w-24 h-24 text-base-content/5 rotate-12 -z-0" />
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
                                        <button
                                            onClick={() => { setHistorySourceId(source._id); setShowHistoryModal(true); }}
                                            className="btn btn-square btn-ghost btn-xs text-info"
                                            title="View History"
                                        >
                                            <Info size={12} />
                                        </button>
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
                                            ? `₹${(source.type === 'Card' ? source.spent : source.balance)?.toLocaleString() || 0} `
                                            : "••••••"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* History Modal */}
            {
                showHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-base-200">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                                <div>
                                    <h3 className="font-bold text-lg">{sources.find(s => s._id === historySourceId)?.name} History</h3>
                                    <p className="text-xs opacity-50">Transaction Log</p>
                                </div>
                                <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-ghost btn-square rounded-full hover:bg-base-300"><X size={20} /></button>
                            </div>

                            {/* Modal Content - Table */}
                            <div className="overflow-y-auto p-0 flex-1">
                                <table className="table table-xs table-pin-rows w-full">
                                    <thead>
                                        <tr className="bg-base-100">
                                            <th className="bg-base-200/50">Date</th>
                                            <th className="bg-base-200/50">Description</th>
                                            <th className="bg-base-200/50">Category</th>
                                            <th className="bg-base-200/50 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.filter(t => (t.sourceId?._id === historySourceId || t.sourceId === historySourceId)).length > 0 ? (
                                            transactions
                                                .filter(t => (t.sourceId?._id === historySourceId || t.sourceId === historySourceId))
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .map(t => (
                                                    <tr key={t._id} className="hover:bg-base-100/50 border-b border-base-100 last:border-0">
                                                        <td className="whitespace-nowrap font-mono opacity-70">{new Date(t.date).toLocaleDateString()}</td>
                                                        <td className="font-medium">{t.description}</td>
                                                        <td>{t.categoryId?.name || <span className="opacity-30">—</span>}</td>
                                                        <td className={`text-right font-mono font-bold ${t.type === 'Credit' ? 'text-success' : 'text-error'}`}>
                                                            {t.type === 'Credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 flex flex-col items-center justify-center opacity-40 gap-2">
                                                    <Info size={32} />
                                                    <span>No transactions found for this source</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 border-t border-base-200 bg-base-100 flex justify-between items-center text-xs opacity-50">
                                <span>
                                    Net Change: <span className="font-mono">
                                        ₹{transactions.filter(t => (t.sourceId?._id === historySourceId || t.sourceId === historySourceId))
                                            .reduce((acc, t) => acc + (t.type === 'Credit' ? t.amount : -t.amount), 0)
                                            .toLocaleString()}
                                    </span>
                                </span>
                                <button onClick={() => setShowHistoryModal(false)} className="btn btn-xs btn-ghost">Close</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default HeaderSection;
