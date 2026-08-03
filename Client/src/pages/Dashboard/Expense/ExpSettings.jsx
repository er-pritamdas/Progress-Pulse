import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, createSource, updateSource, deleteSource, updateSalary } from '../../../services/redux/slice/ExpenseSlice';
import { TitleChanger } from '../../../utils/TitleChanger';
import { COLOR_OPTIONS, getSourceTagStyle, getCategoryTagStyle } from '../../../utils/expenseTheme';
import { Plus, Info, Trash2, Wallet, Building2, CreditCard, X, ShieldAlert, Pencil, Banknote, Check, Palette, Search, ArrowDown, ArrowUp, ArrowRightLeft, Folder, Filter } from 'lucide-react';
import { message } from 'antd';
import dayjs from 'dayjs';

function ExpSettings() {
    TitleChanger("Progress Pulse | Expense Settings");
    const dispatch = useDispatch();
    const { sources, transactions, currentMonth, salary, categories } = useSelector((state) => state.expense);

    const [salaryInput, setSalaryInput] = useState(salary || 0);

    const [isAddingSource, setIsAddingSource] = useState(false);
    const [newSourceName, setNewSourceName] = useState("");
    const [newSourceType, setNewSourceType] = useState("Bank");
    const [newSourceBalance, setNewSourceBalance] = useState("");
    const [newSourceLimit, setNewSourceLimit] = useState("");
    const [newSourceColor, setNewSourceColor] = useState("blue");

    // Edit Source State
    const [editingSource, setEditingSource] = useState(null);
    const [editSourceName, setEditSourceName] = useState("");
    const [editSourceType, setEditSourceType] = useState("Bank");
    const [editSourceBalance, setEditSourceBalance] = useState("");
    const [editSourceLimit, setEditSourceLimit] = useState("");
    const [editSourceColor, setEditSourceColor] = useState("blue");

    // History Modal State
    const [historySourceId, setHistorySourceId] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState("");
    const [historySortOrder, setHistorySortOrder] = useState(() => localStorage.getItem("expense_sort_order") || "newest");
    const [historyLimitCount, setHistoryLimitCount] = useState("all");
    const [historyColFilters, setHistoryColFilters] = useState({
        date: "",
        description: "",
        categoryId: ""
    });

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

    useEffect(() => {
        dispatch(fetchDashboardData(currentMonth));
    }, [dispatch, currentMonth]);

    useEffect(() => {
        setSalaryInput(salary || 0);
    }, [salary]);

    // Calculate totals for each source
    const sourceTotals = sources.map(source => {
        const spent = transactions
            .filter(t => t.type !== 'Credit' && (t.sourceId?._id === source._id || t.sourceId === source._id))
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...source, spent };
    });

    const totalPlannedCategoryBudgets = (categories || []).reduce((total, cat) => {
        const subSum = (cat.subCategories || []).reduce((sum, sub) => sum + (Number(sub.budget) || 0), 0);
        return total + subSum;
    }, 0);

    const handleSaveSalary = async () => {
        try {
            await dispatch(updateSalary({ month: currentMonth, salary: Number(salaryInput) })).unwrap();
            message.success("Salary updated successfully!");
        } catch (err) {
            message.error("Failed to update salary");
        }
    };

    const handleAddSource = () => {
        if (newSourceName.trim()) {
            dispatch(createSource({
                name: newSourceName.trim(),
                type: newSourceType,
                balance: newSourceType !== 'Card' ? (newSourceBalance ? Number(newSourceBalance) : 0) : 0,
                limit: newSourceType === 'Card' ? (newSourceLimit ? Number(newSourceLimit) : 0) : 0,
                color: newSourceColor
            }));
            setNewSourceName("");
            setNewSourceType("Bank");
            setNewSourceBalance("");
            setNewSourceLimit("");
            setNewSourceColor("blue");
            setIsAddingSource(false);
        }
    };

    const handleStartEdit = (source) => {
        setEditingSource(source);
        setEditSourceName(source.name);
        setEditSourceType(source.type || "Bank");
        setEditSourceBalance(source.balance !== undefined ? String(source.balance) : "0");
        setEditSourceLimit(source.limit !== undefined ? String(source.limit) : "0");
        setEditSourceColor(source.color || getSourceTagStyle(source, sources).key);
    };

    const handleSaveEdit = () => {
        if (editingSource && editSourceName.trim()) {
            dispatch(updateSource({
                id: editingSource._id,
                name: editSourceName.trim(),
                type: editSourceType,
                balance: editSourceType !== 'Card' ? (editSourceBalance ? Number(editSourceBalance) : 0) : 0,
                limit: editSourceType === 'Card' ? (editSourceLimit ? Number(editSourceLimit) : 0) : 0,
                color: editSourceColor
            }));
            setEditingSource(null);
        }
    };

    const getSourceIcon = (type) => {
        switch (type) {
            case 'Bank':
                return <Building2 size={20} className="text-primary" />;
            case 'Card':
                return <CreditCard size={20} className="text-warning" />;
            default:
                return <Wallet size={20} className="text-secondary" />;
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8 pb-20">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-base-300">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Expense Settings
                    </h1>
                    <p className="text-sm opacity-60 mt-1">Manage payment sources, bank accounts, and credit card limits</p>
                </div>

                {!isAddingSource && (
                    <button
                        onClick={() => setIsAddingSource(true)}
                        className="btn btn-primary btn-sm gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus size={16} /> Add Payment Source
                    </button>
                )}
            </div>

            {/* Add Source Form / Card */}
            {isAddingSource && (
                <div className="card bg-base-100 shadow-xl border border-primary/40 animate-in fade-in zoom-in-95 duration-200">
                    <div className="card-body p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Plus size={18} className="text-primary" /> Create New Payment Source
                            </h3>
                            <button onClick={() => setIsAddingSource(false)} className="btn btn-xs btn-ghost btn-square rounded-full">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs uppercase opacity-70">Account Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={newSourceName}
                                    onChange={(e) => setNewSourceName(e.target.value)}
                                    placeholder="e.g. HDFC Bank, ICICI Credit Card"
                                    className="input input-bordered input-sm w-full"
                                    autoFocus
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs uppercase opacity-70">Source Type</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={newSourceType}
                                    onChange={(e) => setNewSourceType(e.target.value)}
                                >
                                    <option value="Bank">Bank Account</option>
                                    <option value="Wallet">Digital Wallet / Cash</option>
                                    <option value="Card">Credit Card</option>
                                </select>
                            </div>

                            {newSourceType === 'Card' ? (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs uppercase opacity-70">Credit Card Limit (₹)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={newSourceLimit}
                                        onChange={(e) => setNewSourceLimit(e.target.value)}
                                        placeholder="e.g. 50000"
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>
                            ) : (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs uppercase opacity-70">Initial Balance (₹)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={newSourceBalance}
                                        onChange={(e) => setNewSourceBalance(e.target.value)}
                                        placeholder="0.00"
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>
                            )}

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs uppercase opacity-70 flex items-center gap-1">
                                        <Palette size={13} /> Source Tag Color
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {COLOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setNewSourceColor(opt.key)}
                                            className={`w-7 h-7 rounded-full ${opt.swatch} flex items-center justify-center transition-transform ${newSourceColor === opt.key ? 'ring-2 ring-primary scale-110 shadow-md' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                                            title={opt.label}
                                        >
                                            {newSourceColor === opt.key && <Check size={14} className="text-white drop-shadow" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAddingSource(false)} className="btn btn-sm btn-ghost">
                                Cancel
                            </button>
                            <button onClick={handleAddSource} className="btn btn-sm btn-primary px-6">
                                Save Source
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Source Modal */}
            {editingSource && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="card bg-base-100 shadow-2xl border border-warning/40 w-full max-w-md h-[540px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="shrink-0 p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Pencil size={18} className="text-warning" /> Edit Payment Source
                            </h3>
                            <button onClick={() => setEditingSource(null)} className="btn btn-xs btn-ghost btn-square rounded-full">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs uppercase opacity-70">Account Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={editSourceName}
                                    onChange={(e) => setEditSourceName(e.target.value)}
                                    placeholder="e.g. HDFC Bank, ICICI Credit Card"
                                    className="input input-bordered input-sm w-full"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs uppercase opacity-70">Source Type</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={editSourceType}
                                    onChange={(e) => setEditSourceType(e.target.value)}
                                >
                                    <option value="Bank">Bank Account</option>
                                    <option value="Wallet">Digital Wallet / Cash</option>
                                    <option value="Card">Credit Card</option>
                                </select>
                            </div>

                            {editSourceType === 'Card' ? (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs uppercase opacity-70">Credit Card Limit (₹)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={editSourceLimit}
                                        onChange={(e) => setEditSourceLimit(e.target.value)}
                                        placeholder="e.g. 50000"
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>
                            ) : (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs uppercase opacity-70">Available Balance (₹)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={editSourceBalance}
                                        onChange={(e) => setEditSourceBalance(e.target.value)}
                                        placeholder="0.00"
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>
                            )}

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs uppercase opacity-70 flex items-center gap-1">
                                        <Palette size={13} /> Source Tag Color
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {COLOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setEditSourceColor(opt.key)}
                                            className={`w-7 h-7 rounded-full ${opt.swatch} flex items-center justify-center transition-transform ${editSourceColor === opt.key ? 'ring-2 ring-primary scale-110 shadow-md' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                                            title={opt.label}
                                        >
                                            {editSourceColor === opt.key && <Check size={14} className="text-white drop-shadow" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 p-4 border-t border-base-200 bg-base-100 flex justify-end gap-3">
                            <button onClick={() => setEditingSource(null)} className="btn btn-sm btn-ghost">
                                Cancel
                            </button>
                            <button onClick={handleSaveEdit} className="btn btn-sm btn-warning px-6">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accounts & Sources Grid Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold opacity-90">Payment Sources & Accounts</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sourceTotals.map((source) => (
                        <div
                            key={source._id}
                            className="card bg-base-100 shadow-md border border-base-200 hover:border-primary/30 transition-all group"
                        >
                            <div className="card-body p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const style = getSourceTagStyle(source, sources);
                                            return (
                                                <div className={`p-2.5 rounded-xl border ${style.bg} ${style.text} ${style.border}`}>
                                                    {getSourceIcon(source.type)}
                                                </div>
                                            );
                                        })()}
                                        <div>
                                            <h3 className="card-title text-base font-bold truncate max-w-[180px]" title={source.name}>
                                                {source.name}
                                            </h3>
                                            {(() => {
                                                const style = getSourceTagStyle(source, sources);
                                                return (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${style.bg} ${style.text} border ${style.border} mt-0.5`}>
                                                        <span className={`w-2 h-2 rounded-full ${style.swatch}`} />
                                                        {source.type || 'Bank'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <div className="dropdown dropdown-end">
                                            <label tabIndex={0} className="btn btn-square btn-ghost btn-xs text-primary cursor-pointer" title="Change Source Color">
                                                <Palette size={16} />
                                            </label>
                                            <div tabIndex={0} className="dropdown-content z-[30] menu p-2 shadow-xl bg-base-100 rounded-xl border border-base-200 w-48">
                                                <span className="text-[10px] font-bold uppercase opacity-60 px-2 py-1">Tag Color</span>
                                                <div className="flex flex-wrap gap-1.5 p-1">
                                                    {COLOR_OPTIONS.map((opt) => (
                                                        <button
                                                            key={opt.key}
                                                            type="button"
                                                            onClick={() => dispatch(updateSource({ id: source._id, color: opt.key }))}
                                                            className={`w-6 h-6 rounded-full ${opt.swatch} flex items-center justify-center transition-transform hover:scale-110 ${(source.color || getSourceTagStyle(source, sources).key) === opt.key ? 'ring-2 ring-primary scale-105' : 'opacity-70'}`}
                                                            title={opt.label}
                                                        >
                                                            {(source.color || getSourceTagStyle(source, sources).key) === opt.key && <Check size={12} className="text-white drop-shadow" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleStartEdit(source)}
                                            className="btn btn-square btn-ghost btn-xs text-warning"
                                            title="Edit Payment Source"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setHistorySourceId(source._id); setShowHistoryModal(true); }}
                                            className="btn btn-square btn-ghost btn-xs text-info"
                                            title="View Transaction History"
                                        >
                                            <Info size={16} />
                                        </button>
                                        <button
                                            onClick={() => dispatch(deleteSource(source._id))}
                                            className="btn btn-square btn-ghost btn-xs text-error"
                                            title="Delete Source"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-base-200 flex justify-between items-end">
                                    <div>
                                        <span className="text-[11px] text-base-content/50 uppercase tracking-wider font-semibold block">
                                            {source.type === 'Card' 
                                                ? `Due Amount (Limit: ₹${(source.limit || 0).toLocaleString()})` 
                                                : 'Available Balance'}
                                        </span>
                                        <span className={`text-2xl font-bold font-mono ${source.type === 'Card' ? 'text-error' : 'text-success'}`}>
                                            {source.type === 'Card' 
                                                ? `-₹${(source.spent || 0).toLocaleString()}` 
                                                : `₹${(source.balance || 0).toLocaleString()}`}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => { setHistorySourceId(source._id); setShowHistoryModal(true); }}
                                        className="btn btn-xs btn-outline btn-ghost gap-1 text-[11px]"
                                    >
                                        History
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {sourceTotals.length === 0 && !isAddingSource && (
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl text-base-content/50 gap-4">
                            <ShieldAlert size={36} className="opacity-40" />
                            <p className="text-base font-medium">No Payment Sources Added Yet</p>
                            <button onClick={() => setIsAddingSource(true)} className="btn btn-primary btn-sm">
                                Create Your First Source
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Source Transaction History Modal */}
            {showHistoryModal && (() => {
                const targetSource = sources.find(s => String(s._id) === String(historySourceId));

                // Filter transactions for this source
                const sourceTxns = transactions.filter(t => {
                    const sId = String(t.sourceId?._id || t.sourceId || '');
                    const trgId = String(t.targetSourceId?._id || t.targetSourceId || '');
                    return sId === String(historySourceId) || trgId === String(historySourceId);
                });

                const getDelta = (t) => {
                    const sId = String(t.sourceId?._id || t.sourceId || '');
                    const trgId = String(t.targetSourceId?._id || t.targetSourceId || '');
                    const amt = Number(t.amount || 0);

                    if (t.type === 'Credit') return amt;
                    if (t.type === 'Debit') return -amt;
                    if (t.type === 'Transfer') {
                        if (trgId === String(historySourceId)) return amt;
                        if (sId === String(historySourceId)) return -amt;
                    }
                    return 0;
                };

                // Calculate closing balance for each transaction chronologically (oldest to newest)
                const txsAsc = [...sourceTxns].sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
                const currentBal = targetSource?.balance || 0;
                const totalDelta = txsAsc.reduce((sum, t) => sum + getDelta(t), 0);
                let runningBal = currentBal - totalDelta;

                const closingBalMap = new Map();
                txsAsc.forEach((t) => {
                    runningBal += getDelta(t);
                    closingBalMap.set(String(t._id || t.id), runningBal);
                });

                const hasHistoryColFilters = Boolean(historyColFilters.date || historyColFilters.description || historyColFilters.categoryId);
                const clearHistoryColFilters = () => setHistoryColFilters({ date: "", description: "", categoryId: "" });

                // Filter by search query + column filters
                let filteredList = sourceTxns.filter((t) => {
                    // Top search query
                    if (historySearchTerm.trim()) {
                        const query = historySearchTerm.toLowerCase();
                        const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
                        const catName = catObj?.name || t.categoryName || "";
                        const desc = t.description || "";
                        const amountStr = String(t.amount || "");
                        const dateStr = dayjs(t.date).format("DD MMM YYYY");

                        const matchesQuery = (
                            desc.toLowerCase().includes(query) ||
                            catName.toLowerCase().includes(query) ||
                            amountStr.includes(query) ||
                            dateStr.toLowerCase().includes(query)
                        );
                        if (!matchesQuery) return false;
                    }

                    // Column filters
                    if (historyColFilters.date && dayjs(t.date).format("YYYY-MM-DD") !== historyColFilters.date) return false;
                    if (historyColFilters.description && !(t.description || "").toLowerCase().includes(historyColFilters.description.toLowerCase())) return false;
                    if (historyColFilters.categoryId && String(t.categoryId?._id || t.categoryId) !== String(historyColFilters.categoryId)) return false;

                    return true;
                });

                // Sort Order
                filteredList.sort((a, b) => {
                    const timeA = new Date(a.date).getTime();
                    const timeB = new Date(b.date).getTime();
                    if (timeA !== timeB) {
                        return historySortOrder === "newest" ? timeB - timeA : timeA - timeB;
                    }
                    const updateA = new Date(a.updatedAt || a.createdAt || a.date).getTime();
                    const updateB = new Date(b.updatedAt || b.createdAt || b.date).getTime();
                    return historySortOrder === "newest" ? updateB - updateA : updateA - updateB;
                });

                if (historyLimitCount !== "all") {
                    filteredList = filteredList.slice(0, Number(historyLimitCount));
                }

                const netSum = filteredList.reduce((sum, t) => sum + getDelta(t), 0);

                return (
                    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-primary/15 text-primary">
                                        <Building2 size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg flex items-center gap-2">
                                            <span>{targetSource?.name} History</span>
                                        </h3>
                                        <p className="text-xs opacity-60 font-medium mt-0.5">
                                            Showing {filteredList.length} of {sourceTxns.length} transactions for this source
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-xl text-sm font-extrabold font-mono border bg-primary/10 text-primary border-primary/20">
                                        Current Balance: ₹{currentBal.toLocaleString()}
                                    </span>
                                    <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-ghost btn-circle rounded-full">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Controls Bar: Search + Sort Order + Limit Selector + Clear Filters */}
                            <div className="p-4 border-b border-base-200 bg-base-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search transactions..."
                                            value={historySearchTerm}
                                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                                            className="input input-sm select-bordered w-full pl-10 pr-8 bg-base-200/60 text-xs font-medium rounded-xl focus:bg-base-100 transition-colors"
                                        />
                                        {historySearchTerm && (
                                            <button
                                                onClick={() => setHistorySearchTerm("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {hasHistoryColFilters && (
                                        <button
                                            onClick={clearHistoryColFilters}
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
                                            onClick={() => setHistorySortOrder("newest")}
                                            className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${historySortOrder === "newest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                                            title="Show Newest First"
                                        >
                                            <ArrowDown size={12} /> New First
                                        </button>
                                        <button
                                            onClick={() => setHistorySortOrder("oldest")}
                                            className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${historySortOrder === "oldest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
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
                                                onClick={() => setHistoryLimitCount(val)}
                                                className={`btn btn-xs rounded-lg font-bold capitalize ${historyLimitCount === val ? "btn-neutral shadow-2xs" : "btn-ghost opacity-70"}`}
                                            >
                                                {val === "all" ? "All" : val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Transactions Table */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {filteredList.length > 0 ? (
                                    <div className="overflow-x-auto rounded-2xl border border-base-200 shadow-2xs">
                                        <table className="table table-sm w-full text-xs">
                                            <thead className="bg-base-200/70 text-base-content font-bold uppercase tracking-wider text-[11px]">
                                                <tr>
                                                    {/* Date Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>Date</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${historyColFilters.date ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Date"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <div tabIndex={0} className="dropdown-content z-[99999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 space-y-2 font-normal text-xs normal-case">
                                                                    <label className="text-[10px] font-bold text-base-content/50 uppercase block">Filter by Date</label>
                                                                    <input
                                                                        type="date"
                                                                        value={historyColFilters.date}
                                                                        onChange={(e) => setHistoryColFilters({ ...historyColFilters, date: e.target.value })}
                                                                        className="input input-xs input-bordered w-full rounded-lg font-medium"
                                                                    />
                                                                    {historyColFilters.date && (
                                                                        <button
                                                                            onClick={() => setHistoryColFilters({ ...historyColFilters, date: "" })}
                                                                            className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                                                        >
                                                                            Clear Date
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    {/* Description Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>Description</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${historyColFilters.description ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
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
                                                                            value={historyColFilters.description}
                                                                            onChange={(e) => setHistoryColFilters({ ...historyColFilters, description: e.target.value })}
                                                                            className="input input-xs input-bordered w-full pl-7 font-medium rounded-lg"
                                                                        />
                                                                    </div>
                                                                    {historyColFilters.description && (
                                                                        <button
                                                                            onClick={() => setHistoryColFilters({ ...historyColFilters, description: "" })}
                                                                            className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                                                        >
                                                                            Clear Search
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    {/* Category Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-purple-600 dark:text-purple-400">Category</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${historyColFilters.categoryId ? 'text-purple-600 bg-purple-500/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Category"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 font-medium text-xs normal-case max-h-60 overflow-y-auto overflow-x-hidden">
                                                                    <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Category</li>
                                                                    <li>
                                                                        <a onClick={() => setHistoryColFilters({ ...historyColFilters, categoryId: "" })} className={!historyColFilters.categoryId ? "font-bold text-primary" : ""}>
                                                                            All Categories
                                                                        </a>
                                                                    </li>
                                                                    {currentMonthCategories.map((c) => (
                                                                        <li key={c._id}>
                                                                            <a onClick={() => setHistoryColFilters({ ...historyColFilters, categoryId: c._id })} className={`truncate max-w-[200px] ${String(historyColFilters.categoryId) === String(c._id) ? "font-bold text-primary" : ""}`}>
                                                                                {c.name}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    <th className="py-3 px-4 text-right">Amount</th>
                                                    <th className="py-3 px-4 text-right">Closing Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-base-200/70 font-medium">
                                                {filteredList.map((t) => {
                                                    const isCredit = t.type === 'Credit';
                                                    const isTransfer = t.type === 'Transfer';
                                                    const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
                                                    const catTagStyle = getCategoryTagStyle(catObj, categories);
                                                    const closingBal = closingBalMap.get(String(t._id || t.id)) ?? 0;

                                                    return (
                                                        <tr key={t._id || t.id} className="hover:bg-base-200/40 transition-colors">
                                                            <td className="py-3 px-4 font-mono text-base-content/70 whitespace-nowrap">
                                                                {dayjs(t.date).format("DD MMM YYYY")}
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-base-content">
                                                                {t.description || <span className="opacity-40 italic">No description</span>}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {isTransfer ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                        <ArrowRightLeft size={12} />
                                                                        Transfer
                                                                    </span>
                                                                ) : (
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${catTagStyle.bg} ${catTagStyle.text} border ${catTagStyle.border}`}>
                                                                        <Folder size={12} />
                                                                        {catObj?.name || t.categoryName || "Uncategorized"}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                                                                <span className={isTransfer ? "text-amber-500" : (isCredit ? "text-success" : "text-error")}>
                                                                    {isCredit ? '+' : (isTransfer ? '⇄ ' : '-')}₹{Number(t.amount || 0).toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap text-base-content/90">
                                                                ₹{closingBal.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-sm opacity-50 italic">
                                        No transactions found for this payment source.
                                    </div>
                                )}
                            </div>

                            {/* Footer Summary */}
                            <div className="p-4 border-t border-base-200 bg-base-200/50 flex justify-between items-center text-xs">
                                <span className="font-semibold text-base-content/70">
                                    Showing <strong className="font-mono">{filteredList.length}</strong> transactions | Net Activity: <strong className="font-mono font-bold text-primary">₹{netSum.toLocaleString()}</strong>
                                </span>
                                <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default ExpSettings;

