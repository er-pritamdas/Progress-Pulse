import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, createSource, updateSource, deleteSource, updateSalary } from '../../../services/redux/slice/ExpenseSlice';
import { TitleChanger } from '../../../utils/TitleChanger';
import { COLOR_OPTIONS, getSourceTagStyle } from '../../../utils/expenseTheme';
import { Plus, Info, Trash2, Wallet, Building2, CreditCard, X, ShieldAlert, Pencil, Banknote, Check, Palette } from 'lucide-react';
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
            {showHistoryModal && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-base-200 rounded-3xl shadow-2xl w-full max-w-2xl h-[580px] flex flex-col justify-between overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="shrink-0 p-4 border-b border-base-300 flex justify-between items-center bg-base-100">
                            <div>
                                <h3 className="font-bold text-lg">
                                    {sources.find(s => s._id === historySourceId)?.name} Transaction History
                                </h3>
                                <p className="text-xs opacity-50">Log of debits and credits for this source</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-ghost btn-square rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content - Table */}
                        <div className="overflow-y-auto p-0 flex-1">
                            <table className="table table-xs table-pin-rows w-full">
                                <thead>
                                    <tr className="bg-base-100">
                                        <th className="bg-base-300/50">Date</th>
                                        <th className="bg-base-300/50">Description</th>
                                        <th className="bg-base-300/50">Category</th>
                                        <th className="bg-base-300/50 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.filter(t => (t.sourceId?._id === historySourceId || t.sourceId === historySourceId)).length > 0 ? (
                                        transactions
                                            .filter(t => (t.sourceId?._id === historySourceId || t.sourceId === historySourceId))
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map(t => (
                                                <tr key={t._id} className="hover:bg-base-100/60 border-b border-base-300/30">
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
                                            <td colSpan="4" className="text-center py-16 flex flex-col items-center justify-center opacity-40 gap-2">
                                                <Info size={32} />
                                                <span>No transactions recorded for this payment source</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-base-300 bg-base-100 flex justify-between items-center text-xs">
                            <span className="opacity-70">
                                Net Activity: <span className="font-mono font-bold text-base-content">
                                    ₹{transactions.filter(t => (t.sourceId?._id === historySourceId || t.sourceId === historySourceId))
                                        .reduce((acc, t) => acc + (t.type === 'Credit' ? t.amount : -t.amount), 0)
                                        .toLocaleString()}
                                </span>
                            </span>
                            <button onClick={() => setShowHistoryModal(false)} className="btn btn-xs btn-ghost">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpSettings;

