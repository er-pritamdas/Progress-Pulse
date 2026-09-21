import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, createSource, updateSource, deleteSource, updateSalary } from '../../../services/redux/slice/ExpenseSlice';
import { TitleChanger } from '../../../utils/TitleChanger';
import { COLOR_OPTIONS, getSourceTagStyle, getCategoryTagStyle } from '../../../utils/expenseTheme';
import {
    Plus, Info, Trash2, Wallet, Building2, CreditCard, X, ShieldAlert, Pencil,
    Banknote, Check, Palette, Search, ArrowDown, ArrowUp, ArrowRightLeft, Folder,
    Filter, TrendingUp, TrendingDown, Eye, EyeOff, ChevronRight, History, Layers,
    Clock, AlertTriangle
} from 'lucide-react';
import { message } from 'antd';
import dayjs from 'dayjs';

function ExpSettings() {
    TitleChanger("Progress Pulse | Expense Sources");
    const dispatch = useDispatch();
    const { sources, transactions, currentMonth, salary, categories, loading, error } = useSelector((state) => state.expense);
    const [initialLoading, setInitialLoading] = useState(true);

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

    // Privacy State (synced with expense_hide_numbers across the app)
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

    const toggleHideNumbers = () => {
        const nextVal = !hideNumbers;
        setHideNumbers(nextVal);
        try {
            localStorage.setItem("expense_hide_numbers", JSON.stringify(nextVal));
            window.dispatchEvent(new Event("expense_hide_numbers_updated"));
        } catch (e) {}
    };

    // Mobile Phone-Specific States
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
    const [quickColorSourceId, setQuickColorSourceId] = useState(null);
    const [deleteConfirmSource, setDeleteConfirmSource] = useState(null);
    const [mobileHistoryFilterType, setMobileHistoryFilterType] = useState("all");

    // History Modal State
    const [historySourceId, setHistorySourceId] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState("");
    const [historySortOrder, setHistorySortOrder] = useState(() => localStorage.getItem("expense_sort_order") || "newest");
    const [historyLimitCount, setHistoryLimitCount] = useState("10");
    const [historyColFilters, setHistoryColFilters] = useState({
        date: "",
        description: "",
        categoryId: ""
    });

    const currentMonthCategories = useMemo(() => {
        const raw = categories || [];
        const seen = new Set();
        return raw.filter(c => {
            if (!c.name) return false;
            const key = c.name.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [categories]);

    useEffect(() => {
        let isMounted = true;
        setInitialLoading(true);
        const promise = dispatch(fetchDashboardData('all'));
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
    }, [dispatch]);

    const isDataLoading = loading || initialLoading;

    useEffect(() => {
        setSalaryInput(salary || 0);
    }, [salary]);

    // Calculate all-time totals for each payment source (including Credit Cards)
    const sourceTotals = sources.map(source => {
        const isCard = source.type === 'Card';

        const cardDebits = transactions
            .filter(t => t.type === 'Debit' && (t.sourceId?._id === source._id || t.sourceId === source._id))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const cardCredits = transactions
            .filter(t => (t.type === 'Credit' || t.type === 'Transfer') && (
                t.targetSourceId?._id === source._id || t.targetSourceId === source._id ||
                t.sourceId?._id === source._id || t.sourceId === source._id
            ))
            .reduce((sum, t) => {
                if (t.type === 'Credit' && (t.sourceId?._id === source._id || t.sourceId === source._id)) return sum + (t.amount || 0);
                if (t.type === 'Transfer' && (t.targetSourceId?._id === source._id || t.targetSourceId === source._id)) return sum + (t.amount || 0);
                return sum;
            }, 0);

        const dueAmount = cardDebits - cardCredits;
        const spent = isCard ? (dueAmount > 0 ? dueAmount : 0) : cardDebits;
        return { ...source, spent };
    });

    const totalBankBalance = sourceTotals
        .filter(s => s.type === 'Bank' || !s.type)
        .reduce((sum, s) => sum + (s.balance || 0), 0);

    const totalCardSpent = sourceTotals
        .filter(s => s.type === 'Card')
        .reduce((sum, s) => sum + (s.spent || 0), 0);

    const totalWalletBalance = sourceTotals
        .filter(s => s.type === 'Wallet')
        .reduce((sum, s) => sum + (s.balance || 0), 0);

    const totalNetAssets = (totalBankBalance + totalWalletBalance) - totalCardSpent;

    const bankCount = sourceTotals.filter(s => s.type === 'Bank' || !s.type).length;
    const cardCount = sourceTotals.filter(s => s.type === 'Card').length;
    const walletCount = sourceTotals.filter(s => s.type === 'Wallet').length;

    const filteredSources = useMemo(() => {
        if (selectedTypeFilter === "all") return sourceTotals;
        if (selectedTypeFilter === "Bank") return sourceTotals.filter(s => s.type === 'Bank' || !s.type);
        return sourceTotals.filter(s => s.type === selectedTypeFilter);
    }, [sourceTotals, selectedTypeFilter]);

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
        <div className="px-0 sm:px-3 md:p-6 lg:p-8 py-0 md:py-6 w-full max-w-[1600px] mx-auto space-y-3.5 md:space-y-8 pb-24">
            {/* Desktop Header (md and up: 100% original & untouched) */}
            <div className="hidden md:flex justify-between items-center pb-4 border-b border-base-300">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Expense Sources
                    </h1>
                    <p className="text-sm opacity-60 mt-1">Manage payment sources, bank accounts, and credit card limits</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleHideNumbers}
                        className="btn btn-sm btn-ghost btn-square rounded-xl text-base-content/60 hover:text-primary"
                        title={hideNumbers ? "Show numbers" : "Hide numbers (Privacy Mode)"}
                    >
                        {hideNumbers ? <EyeOff size={16} className="text-primary font-bold" /> : <Eye size={16} />}
                    </button>

                    {!isAddingSource && (
                        <button
                            onClick={() => setIsAddingSource(true)}
                            disabled={isDataLoading}
                            className="btn btn-primary btn-sm gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus size={16} /> Add Payment Source
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile-Only Sticky Glass Header Section */}
            <div className="md:hidden sticky top-[-17px] -mt-2 pt-2 z-40 bg-base-100/90 dark:bg-base-900/90 backdrop-blur-2xl border-b border-base-200/80 shadow-md -mx-2 px-2">
                <div className="flex items-center justify-between py-2.5 px-1.5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Building2 size={18} />
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold text-base-content leading-tight">
                                Expense <span className="text-primary font-black">Sources</span>
                            </h1>
                            <p className="text-[10px] text-base-content/50 font-medium">
                                {sourceTotals.length} Accounts & Cards
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={toggleHideNumbers}
                            className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/60 hover:text-primary cursor-pointer"
                            title={hideNumbers ? "Show numbers" : "Hide numbers (Privacy Mode)"}
                        >
                            {hideNumbers ? <EyeOff size={15} className="text-primary font-bold" /> : <Eye size={15} />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAddingSource(true)}
                            className="btn btn-primary btn-xs rounded-xl font-bold gap-1 text-primary-content h-7.5 px-3 shadow-xs cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && !isDataLoading && (
                <div className="alert alert-error shadow-lg">
                    <span>{typeof error === "string" ? error : "Failed to load payment sources and expense settings."}</span>
                </div>
            )}

            {isDataLoading ? (
                <div className="h-80 flex items-center justify-center py-16">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <>
                    {/* Add Source Form / Card - Desktop (md and up) */}
                    {isAddingSource && (
                        <div className="hidden md:block card bg-base-100 shadow-xl border border-primary/40 animate-in fade-in zoom-in-95 duration-200">
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

                    {/* Add Source Drawer - Mobile (md:hidden) */}
                    {isAddingSource && (
                        <div className="md:hidden fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
                            <div className="bg-base-100 rounded-t-3xl border-t border-base-300 w-full max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom duration-250">
                                {/* Grab handle */}
                                <div className="w-12 h-1.5 bg-base-content/20 rounded-full mx-auto" />

                                <div className="flex justify-between items-center pb-2 border-b border-base-200">
                                    <h3 className="text-base font-extrabold flex items-center gap-2 text-base-content">
                                        <Plus size={18} className="text-primary" /> Add Payment Source
                                    </h3>
                                    <button
                                        onClick={() => setIsAddingSource(false)}
                                        className="btn btn-xs btn-ghost btn-circle"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Type selector: 3 segmented buttons with icons */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-base-content/60 uppercase">Account Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { type: "Bank", label: "Bank", icon: <Building2 size={16} /> },
                                            { type: "Card", label: "Credit Card", icon: <CreditCard size={16} /> },
                                            { type: "Wallet", label: "Wallet/Cash", icon: <Wallet size={16} /> }
                                        ].map(item => (
                                            <button
                                                key={item.type}
                                                type="button"
                                                onClick={() => setNewSourceType(item.type)}
                                                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                                    newSourceType === item.type 
                                                        ? 'bg-primary text-primary-content border-primary shadow-xs' 
                                                        : 'bg-base-200/50 hover:bg-base-200 border-base-300/60 text-base-content/70'
                                                }`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Account Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-base-content/60 uppercase">Account Name</label>
                                    <input
                                        type="text"
                                        value={newSourceName}
                                        onChange={(e) => setNewSourceName(e.target.value)}
                                        placeholder="e.g. HDFC Bank, ICICI Amazon Pay"
                                        className="input input-bordered w-full rounded-2xl text-sm font-semibold h-11"
                                        autoFocus
                                    />
                                </div>

                                {/* Initial Balance or Credit Card Limit */}
                                {newSourceType === 'Card' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-base-content/60 uppercase">Credit Card Limit (₹)</label>
                                        <input
                                            type="number"
                                            value={newSourceLimit}
                                            onChange={(e) => setNewSourceLimit(e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="input input-bordered w-full rounded-2xl text-sm font-mono font-bold h-11"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-base-content/60 uppercase">Current Balance (₹)</label>
                                        <input
                                            type="number"
                                            value={newSourceBalance}
                                            onChange={(e) => setNewSourceBalance(e.target.value)}
                                            placeholder="0.00"
                                            className="input input-bordered w-full rounded-2xl text-sm font-mono font-bold h-11"
                                        />
                                    </div>
                                )}

                                {/* Tag Color */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-base-content/60 uppercase flex items-center gap-1">
                                        <Palette size={13} /> Tag Color
                                    </label>
                                    <div className="flex flex-wrap gap-2.5 pt-1">
                                        {COLOR_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => setNewSourceColor(opt.key)}
                                                className={`w-8 h-8 rounded-full ${opt.swatch} flex items-center justify-center transition-transform cursor-pointer ${
                                                    newSourceColor === opt.key ? 'ring-2 ring-primary scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                                                }`}
                                                title={opt.label}
                                            >
                                                {newSourceColor === opt.key && <Check size={14} className="text-white drop-shadow" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="grid grid-cols-2 gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingSource(false)}
                                        className="btn btn-ghost rounded-2xl font-bold h-11"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddSource}
                                        disabled={!newSourceName.trim()}
                                        className="btn btn-primary rounded-2xl font-bold text-primary-content h-11"
                                    >
                                        Save Source
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

            {/* Edit Source Modal - Desktop (md and up) */}
            {editingSource && (
                <div className="hidden md:flex fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md items-center justify-center p-4">
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

            {/* Edit Source Drawer - Mobile (md:hidden) */}
            {editingSource && (
                <div className="md:hidden fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="bg-base-100 rounded-t-3xl border-t border-base-300 w-full max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom duration-250">
                        {/* Grab handle */}
                        <div className="w-12 h-1.5 bg-base-content/20 rounded-full mx-auto" />

                        <div className="flex justify-between items-center pb-2 border-b border-base-200">
                            <h3 className="text-base font-extrabold flex items-center gap-2 text-warning">
                                <Pencil size={18} /> Edit Payment Source
                            </h3>
                            <button
                                onClick={() => setEditingSource(null)}
                                className="btn btn-xs btn-ghost btn-circle"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Type selector */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-base-content/60 uppercase">Account Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { type: "Bank", label: "Bank", icon: <Building2 size={16} /> },
                                    { type: "Card", label: "Credit Card", icon: <CreditCard size={16} /> },
                                    { type: "Wallet", label: "Wallet/Cash", icon: <Wallet size={16} /> }
                                ].map(item => (
                                    <button
                                        key={item.type}
                                        type="button"
                                        onClick={() => setEditSourceType(item.type)}
                                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                            editSourceType === item.type 
                                                ? 'bg-warning text-warning-content border-warning shadow-xs font-black' 
                                                : 'bg-base-200/50 hover:bg-base-200 border-base-300/60 text-base-content/70'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Name */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-base-content/60 uppercase">Account Name</label>
                            <input
                                type="text"
                                value={editSourceName}
                                onChange={(e) => setEditSourceName(e.target.value)}
                                placeholder="e.g. HDFC Bank, ICICI Credit Card"
                                className="input input-bordered w-full rounded-2xl text-sm font-semibold h-11"
                            />
                        </div>

                        {/* Initial Balance or Credit Card Limit */}
                        {editSourceType === 'Card' ? (
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-base-content/60 uppercase">Credit Card Limit (₹)</label>
                                <input
                                    type="number"
                                    value={editSourceLimit}
                                    onChange={(e) => setEditSourceLimit(e.target.value)}
                                    placeholder="e.g. 50000"
                                    className="input input-bordered w-full rounded-2xl text-sm font-mono font-bold h-11"
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-base-content/60 uppercase">Available Balance (₹)</label>
                                <input
                                    type="number"
                                    value={editSourceBalance}
                                    onChange={(e) => setEditSourceBalance(e.target.value)}
                                    placeholder="0.00"
                                    className="input input-bordered w-full rounded-2xl text-sm font-mono font-bold h-11"
                                />
                            </div>
                        )}

                        {/* Tag Color */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-base-content/60 uppercase flex items-center gap-1">
                                <Palette size={13} /> Tag Color
                            </label>
                            <div className="flex flex-wrap gap-2.5 pt-1">
                                {COLOR_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setEditSourceColor(opt.key)}
                                        className={`w-8 h-8 rounded-full ${opt.swatch} flex items-center justify-center transition-transform cursor-pointer ${
                                            editSourceColor === opt.key ? 'ring-2 ring-warning scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                                        }`}
                                        title={opt.label}
                                    >
                                        {editSourceColor === opt.key && <Check size={14} className="text-white drop-shadow" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setEditingSource(null)}
                                className="btn btn-ghost rounded-2xl font-bold h-11"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={!editSourceName.trim()}
                                className="btn btn-warning rounded-2xl font-bold h-11"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MOBILE-ONLY SOURCES SECTION (md:hidden)                                  */}
            {/* ========================================================================= */}
            <div className="md:hidden space-y-3 w-full">
                {/* 1. Quick Overview Card */}
                <div className="bg-gradient-to-br from-base-200/90 via-base-200/60 to-base-300/40 p-3.5 sm:p-4 rounded-2xl border border-base-content/10 shadow-xs space-y-3 w-full">
                    <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-base-content/60 uppercase tracking-wider flex items-center gap-1">
                            <Wallet size={12} className="text-primary" /> Net Available Assets
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {sourceTotals.length} Sources
                        </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                        <span className={`text-2xl font-black font-mono tracking-tight ${totalNetAssets < 0 ? 'text-rose-500' : 'text-primary'}`}>
                            {hideNumbers 
                                ? "••••••••" 
                                : (totalNetAssets < 0 ? `-₹${Math.abs(totalNetAssets).toLocaleString()}` : `₹${totalNetAssets.toLocaleString()}`)
                            }
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-base-content/10">
                        <div className="bg-base-100/80 p-2.5 rounded-2xl border border-base-content/5 shadow-2xs">
                            <div className="flex items-center justify-between text-[10px] text-base-content/60 font-semibold mb-0.5">
                                <span className="flex items-center gap-1">
                                    <Building2 size={11} className="text-primary" /> Banks
                                </span>
                                <span className="text-[9.5px] opacity-50">{bankCount}</span>
                            </div>
                            <span className="font-mono text-xs font-black text-emerald-500">
                                {hideNumbers ? "••••" : `₹${totalBankBalance.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="bg-base-100/80 p-2.5 rounded-2xl border border-base-content/5 shadow-2xs">
                            <div className="flex items-center justify-between text-[10px] text-base-content/60 font-semibold mb-0.5">
                                <span className="flex items-center gap-1">
                                    <CreditCard size={11} className="text-warning" /> Cards Due
                                </span>
                                <span className="text-[9.5px] opacity-50">{cardCount}</span>
                            </div>
                            <span className="font-mono text-xs font-black text-rose-500">
                                {hideNumbers ? "••••" : `-₹${totalCardSpent.toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold w-full">
                    {[
                        { id: "all", label: "All", count: sourceTotals.length },
                        { id: "Bank", label: "Banks", count: bankCount },
                        { id: "Card", label: "Cards", count: cardCount },
                        ...(walletCount > 0 ? [{ id: "Wallet", label: "Wallets", count: walletCount }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedTypeFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                selectedTypeFilter === tab.id
                                    ? "bg-primary text-primary-content border-primary shadow-xs font-extrabold"
                                    : "bg-base-200/70 hover:bg-base-200 border-base-300/70 text-base-content/70"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                selectedTypeFilter === tab.id
                                    ? "bg-primary-content/20 text-primary-content"
                                    : "bg-base-300 text-base-content/60"
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 3. Mobile Source Cards List */}
                <div className="space-y-3 w-full">
                    {filteredSources.map((source) => {
                        const style = getSourceTagStyle(source, sources);
                        const isCard = source.type === 'Card';
                        const sourceTxnCount = transactions.filter(t => (
                            t.sourceId?._id === source._id || t.sourceId === source._id ||
                            t.targetSourceId?._id === source._id || t.targetSourceId === source._id
                        )).length;

                        return (
                            <div
                                key={source._id}
                                className={`bg-base-100 rounded-2xl border ${style.border || "border-base-content/10"} shadow-2xs p-3.5 sm:p-4 flex flex-col gap-3 relative overflow-hidden w-full transition-all`}
                            >
                                {/* Upper Header Row: Icon + Title/Type + Action Icons */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`p-2.5 rounded-2xl border ${style.bg} ${style.text} ${style.border} shrink-0 shadow-2xs`}>
                                            {getSourceIcon(source.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-extrabold text-sm text-base-content truncate tracking-tight" title={source.name}>
                                                {source.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${style.bg} ${style.text} border ${style.border}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${style.swatch}`} />
                                                    {source.type || 'Bank'}
                                                </span>
                                                {isCard && (source.limit || 0) > 0 && (
                                                    <span className="text-[10px] text-base-content/50 font-mono font-semibold">
                                                        Limit: ₹{(source.limit || 0).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Palette, Edit, Delete */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setQuickColorSourceId(quickColorSourceId === source._id ? null : source._id)}
                                            className={`btn btn-xs btn-ghost btn-square rounded-xl ${quickColorSourceId === source._id ? 'text-primary bg-primary/10' : 'text-base-content/60'}`}
                                            title="Change Color"
                                        >
                                            <Palette size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(source)}
                                            className="btn btn-xs btn-ghost btn-square rounded-xl text-warning"
                                            title="Edit Account"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirmSource(source)}
                                            className="btn btn-xs btn-ghost btn-square rounded-xl text-error"
                                            title="Delete Account"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Color Swatch Picker Tray (Toggled) */}
                                {quickColorSourceId === source._id && (
                                    <div className="flex items-center gap-2 p-2.5 bg-base-200/60 rounded-2xl border border-base-300/60 overflow-x-auto no-scrollbar animate-in fade-in duration-150">
                                        <span className="text-[10px] font-bold text-base-content/60 uppercase shrink-0">Tag Color:</span>
                                        <div className="flex items-center gap-2">
                                            {COLOR_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    type="button"
                                                    onClick={() => {
                                                        dispatch(updateSource({ id: source._id, color: opt.key }));
                                                        setQuickColorSourceId(null);
                                                    }}
                                                    className={`w-7 h-7 rounded-full ${opt.swatch} shrink-0 flex items-center justify-center transition-transform cursor-pointer ${
                                                        (source.color || style.key) === opt.key ? 'ring-2 ring-primary scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                                                    }`}
                                                    title={opt.label}
                                                >
                                                    {(source.color || style.key) === opt.key && <Check size={13} className="text-white drop-shadow" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Balance & History Section */}
                                <div className="pt-2.5 border-t border-base-200/80 flex items-end justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] text-base-content/50 uppercase tracking-wider font-bold block mb-0.5">
                                            {isCard ? 'Due Amount' : 'Available Balance'}
                                        </span>
                                        <span className={`text-xl font-black font-mono tracking-tight ${isCard ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {hideNumbers 
                                                ? "••••••"
                                                : (isCard
                                                    ? `-₹${(source.spent || 0).toLocaleString()}`
                                                    : `₹${(source.balance || 0).toLocaleString()}`
                                                )
                                            }
                                        </span>
                                    </div>

                                    {/* History Button */}
                                    <button
                                        type="button"
                                        onClick={() => { setHistorySourceId(source._id); setShowHistoryModal(true); }}
                                        className="btn btn-xs btn-ghost border border-base-200 hover:border-primary/40 rounded-xl gap-1.5 font-bold text-xs px-2.5 h-8 bg-base-200/40 cursor-pointer"
                                    >
                                        <History size={13} className="text-primary" />
                                        <span>History</span>
                                        <span className="badge badge-xs badge-neutral font-mono font-bold text-[9.5px]">
                                            {sourceTxnCount}
                                        </span>
                                    </button>
                                </div>

                                {/* Credit Card Utilization Bar */}
                                {isCard && (source.limit || 0) > 0 && (() => {
                                    const spent = source.spent || 0;
                                    const limit = source.limit || 0;
                                    const avail = Math.max(0, limit - spent);
                                    const pct = Math.min(100, Math.round((spent / limit) * 100));
                                    const isHighUsage = pct > 80;

                                    return (
                                        <div className="space-y-1 bg-base-200/40 p-2.5 rounded-2xl border border-base-200/60">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-base-content/60">
                                                    Available: <strong className="font-mono text-base-content">
                                                        {hideNumbers ? "••••" : `₹${avail.toLocaleString()}`}
                                                    </strong>
                                                </span>
                                                <span className={isHighUsage ? 'text-error font-extrabold' : 'text-primary'}>
                                                    {hideNumbers ? "••%" : `${pct}% used`}
                                                </span>
                                            </div>
                                            <progress
                                                className={`progress w-full h-1.5 ${isHighUsage ? 'progress-error' : 'progress-primary'}`}
                                                value={pct}
                                                max="100"
                                            />
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })}

                    {filteredSources.length === 0 && (
                        <div className="py-12 px-4 text-center border-2 border-dashed border-base-300 rounded-3xl text-base-content/50 space-y-2 bg-base-100/50">
                            <ShieldAlert size={32} className="mx-auto opacity-40 text-primary" />
                            <p className="font-bold text-sm text-base-content/80">No {selectedTypeFilter === 'all' ? 'payment sources' : selectedTypeFilter + ' accounts'} found</p>
                            <p className="text-xs">Tap Add above to add your first payment source</p>
                            <button
                                type="button"
                                onClick={() => setIsAddingSource(true)}
                                className="btn btn-primary btn-xs rounded-xl font-bold mt-2"
                            >
                                <Plus size={13} /> Add Source
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP-ONLY ACCOUNTS & SOURCES GRID (hidden md:block)                    */}
            {/* ========================================================================= */}
            <div className="hidden md:block space-y-4">
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
                                            onClick={() => setDeleteConfirmSource(source)}
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
                                            {hideNumbers 
                                                ? "••••••••"
                                                : (source.type === 'Card' 
                                                    ? `-₹${(source.spent || 0).toLocaleString()}` 
                                                    : `₹${(source.balance || 0).toLocaleString()}`
                                                )
                                            }
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

            {/* Delete Confirmation Modal (Mobile & Desktop) */}
            {deleteConfirmSource && (
                <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-base-100 rounded-3xl p-5 border border-base-300 shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 text-error">
                            <div className="p-3 rounded-2xl bg-error/15 text-error">
                                <Trash2 size={22} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base text-base-content">Delete Source?</h3>
                                <p className="text-xs text-base-content/60 mt-0.5">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-xs text-base-content/70">
                            Are you sure you want to delete <strong className="text-base-content font-bold">{deleteConfirmSource.name}</strong>?
                        </p>
                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmSource(null)}
                                className="btn btn-sm btn-ghost rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(deleteSource(deleteConfirmSource._id));
                                    setDeleteConfirmSource(null);
                                    message.success(`Deleted ${deleteConfirmSource.name}`);
                                }}
                                className="btn btn-sm btn-error text-white font-bold rounded-xl px-4"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )}

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

                // Canonical comparator for transactions in ascending chronological order
                const compareTransactionsAsc = (a, b) => {
                    const timeA = new Date(a.date).getTime();
                    const timeB = new Date(b.date).getTime();
                    if (timeA !== timeB) return timeA - timeB;

                    const createA = new Date(a.createdAt || a.updatedAt || a.date).getTime();
                    const createB = new Date(b.createdAt || b.updatedAt || b.date).getTime();
                    if (createA !== createB) return createA - createB;

                    return String(a._id || a.id || '').localeCompare(String(b._id || b.id || ''));
                };

                // Calculate closing balance for each transaction chronologically (oldest to newest)
                const txsAsc = [...sourceTxns].sort(compareTransactionsAsc);
                const currentBal = Number(targetSource?.balance || 0);
                const totalDelta = txsAsc.reduce((sum, t) => sum + getDelta(t), 0);
                let runningBal = currentBal - totalDelta;

                const closingBalMap = new Map();
                txsAsc.forEach((t) => {
                    runningBal += getDelta(t);
                    const roundedBal = Math.round((runningBal + Number.EPSILON) * 100) / 100;
                    closingBalMap.set(String(t._id || t.id), roundedBal);
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

                // Sort Order strictly consistent with the chronological sequence
                filteredList.sort((a, b) => {
                    return historySortOrder === "newest"
                        ? compareTransactionsAsc(b, a)
                        : compareTransactionsAsc(a, b);
                });

                if (historyLimitCount !== "all") {
                    filteredList = filteredList.slice(0, Number(historyLimitCount));
                }

                const netSum = filteredList.reduce((sum, t) => sum + getDelta(t), 0);

                const mobileFilteredList = mobileHistoryFilterType === "all"
                    ? filteredList
                    : filteredList.filter(t => t.type === mobileHistoryFilterType);

                return (
                    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 md:p-4">
                        {/* Desktop Container (hidden md:flex: 100% original & untouched) */}
                        <div className="hidden md:flex bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
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
                                        Current Balance: {hideNumbers ? "••••••••" : `₹${currentBal.toLocaleString()}`}
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
                                            <thead className="sticky top-0 z-20 bg-base-200/90 backdrop-blur-md text-base-content font-bold uppercase tracking-wider text-[11px] shadow-xs">
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
                                                                {(() => {
                                                                    if (isTransfer) {
                                                                        const isFromThisBank = String(t.sourceId?._id || t.sourceId) === String(targetSource?._id);
                                                                        const targetObj = sources.find(s => String(s._id) === String(t.targetSourceId?._id || t.targetSourceId));
                                                                        const targetName = targetObj?.name || t.targetSourceName || "Bank";
                                                                        const sourceObj = sources.find(s => String(s._id) === String(t.sourceId?._id || t.sourceId));
                                                                        const sourceName = sourceObj?.name || t.sourceName || "Bank";
                                                                        const transferLabel = isFromThisBank ? `Transfer To ${targetName}` : `Transfer From ${sourceName}`;

                                                                        return (
                                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                                <ArrowRightLeft size={12} />
                                                                                {transferLabel}
                                                                            </span>
                                                                        );
                                                                    }

                                                                    const hasCategory = Boolean(catObj?.name || t.categoryName);
                                                                    if (hasCategory) {
                                                                        return (
                                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${catTagStyle.bg} ${catTagStyle.text} border ${catTagStyle.border}`}>
                                                                                <Folder size={12} />
                                                                                {catObj?.name || t.categoryName}
                                                                            </span>
                                                                        );
                                                                    }

                                                                    if (isCredit) {
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
                                                            <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                                                                <span className={isTransfer ? "text-amber-500" : (isCredit ? "text-success" : "text-error")}>
                                                                    {hideNumbers ? "••••" : (isCredit ? '+' : (isTransfer ? (getDelta(t) >= 0 ? '+⇄ ' : '-⇄ ') : '-')) + (hideNumbers ? "" : `₹${Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`)}
                                                                </span>
                                                            </td>
                                                            <td className={`py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap ${closingBal < 0 ? 'text-rose-500' : 'text-base-content/90'}`}>
                                                                {hideNumbers ? "••••" : (closingBal < 0
                                                                    ? `-₹${Math.abs(closingBal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                                                    : `₹${closingBal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`)}
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
                                    Showing <strong className="font-mono">{filteredList.length}</strong> transactions | Net Activity: <strong className="font-mono font-bold text-primary">{hideNumbers ? "••••" : `₹${netSum.toLocaleString()}`}</strong>
                                </span>
                                <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Mobile Dedicated History Bottom Sheet (md:hidden) */}
                        <div className="md:hidden bg-base-100 rounded-t-3xl border-t border-base-300 w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250 fixed bottom-0 left-0 right-0">
                            {/* Grab handle */}
                            <div className="w-12 h-1.5 bg-base-content/20 rounded-full mx-auto my-2.5 shrink-0" />

                            {/* Header */}
                            <div className="px-4 py-2.5 border-b border-base-200 flex justify-between items-center bg-base-200/40 shrink-0">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="p-2 rounded-xl bg-primary/15 text-primary shrink-0">
                                        {getSourceIcon(targetSource?.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-extrabold text-sm text-base-content truncate">
                                            {targetSource?.name} History
                                        </h3>
                                        <span className="text-[10px] text-base-content/50 font-medium">
                                            {mobileFilteredList.length} of {sourceTxns.length} transactions
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="btn btn-xs btn-ghost btn-circle shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Sticky Quick Balance & Search Bar */}
                            <div className="p-3 border-b border-base-200 bg-base-100/90 space-y-2.5 shrink-0">
                                {/* Balance strip */}
                                <div className="flex items-center justify-between bg-base-200/60 p-2.5 rounded-2xl border border-base-300/60 text-xs">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-base-content/50 block">Current Balance</span>
                                        <span className="font-mono font-black text-sm text-primary">
                                            {hideNumbers ? "••••••••" : `₹${currentBal.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase font-bold text-base-content/50 block">Net Activity</span>
                                        <span className={`font-mono font-black text-sm ${netSum < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {hideNumbers ? "••••" : (netSum < 0 ? `-₹${Math.abs(netSum).toLocaleString()}` : `+₹${netSum.toLocaleString()}`)}
                                        </span>
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search history..."
                                        value={historySearchTerm}
                                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                                        className="input input-xs input-bordered w-full pl-8 pr-7 h-9 rounded-xl text-xs font-medium"
                                    />
                                    {historySearchTerm && (
                                        <button
                                            onClick={() => setHistorySearchTerm("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* Quick Filters & Sort */}
                                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                                    {/* Type pills */}
                                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] font-bold">
                                        {[
                                            { id: "all", label: "All" },
                                            { id: "Debit", label: "Debits" },
                                            { id: "Credit", label: "Credits" },
                                            { id: "Transfer", label: "Transfers" }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => setMobileHistoryFilterType(f.id)}
                                                className={`px-2 py-1 rounded-lg border text-[10.5px] transition-all cursor-pointer ${
                                                    mobileHistoryFilterType === f.id
                                                        ? "bg-primary text-primary-content border-primary font-black"
                                                        : "bg-base-200/50 hover:bg-base-200 border-base-300 text-base-content/70"
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Sort Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setHistorySortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                                        className="btn btn-xs btn-ghost border border-base-300 rounded-lg gap-1 text-[10.5px] font-bold shrink-0 h-7 px-2"
                                        title={historySortOrder === "newest" ? "Showing Newest First" : "Showing Oldest First"}
                                    >
                                        {historySortOrder === "newest" ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                                        <span>{historySortOrder === "newest" ? "Newest" : "Oldest"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Transactions Mobile Feed */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {mobileFilteredList.length > 0 ? (
                                    mobileFilteredList.map((t) => {
                                        const isCredit = t.type === 'Credit';
                                        const isTransfer = t.type === 'Transfer';
                                        const catObj = categories.find((c) => String(c._id) === String(t.categoryId?._id || t.categoryId));
                                        const catTagStyle = getCategoryTagStyle(catObj, categories);
                                        const closingBal = closingBalMap.get(String(t._id || t.id)) ?? 0;
                                        const hasCategory = Boolean(catObj?.name || t.categoryName);

                                        const isFromThisBank = isTransfer && String(t.sourceId?._id || t.sourceId) === String(targetSource?._id);
                                        const targetObj = isTransfer ? sources.find(s => String(s._id) === String(t.targetSourceId?._id || t.targetSourceId)) : null;
                                        const targetName = targetObj?.name || t.targetSourceName || "Bank";
                                        const sourceObj = isTransfer ? sources.find(s => String(s._id) === String(t.sourceId?._id || t.sourceId)) : null;
                                        const sourceName = sourceObj?.name || t.sourceName || "Bank";
                                        const transferLabel = isFromThisBank ? `To ${targetName}` : `From ${sourceName}`;

                                        return (
                                            <div
                                                key={t._id || t.id}
                                                className="p-3 bg-base-100 rounded-2xl border border-base-200/90 shadow-2xs space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-mono text-base-content/60 font-semibold">
                                                        {dayjs(t.date).format("DD MMM YYYY")}
                                                    </span>

                                                    {isTransfer ? (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                            <ArrowRightLeft size={10} />
                                                            {transferLabel}
                                                        </span>
                                                    ) : hasCategory ? (
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold ${catTagStyle.bg} ${catTagStyle.text} border ${catTagStyle.border}`}>
                                                            <Folder size={10} />
                                                            {catObj?.name || t.categoryName}
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                                                            isCredit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                        }`}>
                                                            {isCredit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                            {isCredit ? 'Credited' : 'Debited'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-xs font-bold text-base-content truncate flex-1">
                                                        {t.description || <span className="opacity-40 italic font-normal">No description</span>}
                                                    </p>

                                                    <span className={`text-sm font-mono font-black shrink-0 ${isTransfer ? 'text-amber-500' : (isCredit ? 'text-success' : 'text-error')}`}>
                                                        {hideNumbers 
                                                            ? "••••" 
                                                            : `${isCredit ? '+' : (isTransfer ? (getDelta(t) >= 0 ? '+⇄ ' : '-⇄ ') : '-')}₹${Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-base-200/60 text-base-content/50">
                                                    <span>Closing Balance</span>
                                                    <span className={`font-bold ${closingBal < 0 ? 'text-rose-500' : 'text-base-content/80'}`}>
                                                        {hideNumbers 
                                                            ? "••••" 
                                                            : (closingBal < 0
                                                                ? `-₹${Math.abs(closingBal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                                                : `₹${closingBal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                                            )
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-xs opacity-50 italic">
                                        No transactions found for this filter.
                                    </div>
                                )}
                            </div>

                            {/* Mobile Sticky Footer */}
                            <div className="p-3 border-t border-base-200 bg-base-100 flex items-center justify-between shrink-0">
                                <span className="text-[11px] font-semibold text-base-content/70">
                                    <strong className="font-mono">{mobileFilteredList.length}</strong> transactions
                                </span>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="btn btn-sm btn-primary rounded-xl font-bold px-5"
                                >
                                    Done
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

