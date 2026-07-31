import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { Trash2, Edit2, Plus, X, Save, Info, Home, Utensils, Car, Zap, HeartPulse, Gamepad2, ShoppingBag, PiggyBank, Folder, GripVertical, Palette, Check } from "lucide-react";
import { addSubCategory, updateSubCategory, deleteSubCategory, deleteCategory, updateCategory, reorderSubCategories, setLocalSubCategoriesOrder } from "../../services/redux/slice/ExpenseSlice";
import { COLOR_OPTIONS, getCategoryTagStyle } from "../../utils/expenseTheme";

// Helper to determine category icon and accent styling based on category
const getCategoryTheme = (category = {}, categoriesList = []) => {
    const style = getCategoryTagStyle(category, categoriesList);
    const lower = (category.name || "").toLowerCase();
    let icon = <Folder size={20} />;
    if (lower.includes("house") || lower.includes("home") || lower.includes("rent")) icon = <Home size={20} />;
    else if (lower.includes("food") || lower.includes("dine") || lower.includes("eat") || lower.includes("grocery")) icon = <Utensils size={20} />;
    else if (lower.includes("travel") || lower.includes("transport") || lower.includes("fuel") || lower.includes("car")) icon = <Car size={20} />;
    else if (lower.includes("bill") || lower.includes("utility") || lower.includes("electricity") || lower.includes("recharge")) icon = <Zap size={20} />;
    else if (lower.includes("health") || lower.includes("medical") || lower.includes("doctor")) icon = <HeartPulse size={20} />;
    else if (lower.includes("game") || lower.includes("fun") || lower.includes("entertain") || lower.includes("movie")) icon = <Gamepad2 size={20} />;
    else if (lower.includes("shop") || lower.includes("cloth") || lower.includes("personal")) icon = <ShoppingBag size={20} />;
    else if (lower.includes("save") || lower.includes("invest") || lower.includes("fund")) icon = <PiggyBank size={20} />;

    return {
        icon,
        bg: style.bg,
        border: style.border,
        text: style.text,
        style
    };
};

// Helper to determine Used Percentage color based on user specified ranges:
// 0 to 25: Blue
// 26 to 50: Green
// 51 to 75 (50-75): Yellow
// 76 to 100 (75-100): Orange
// > 100: Red
const getUsedPercentageColor = (pct) => {
    if (pct > 100) {
        return {
            text: "text-red-500 font-bold",
            progress: "progress-error [&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500"
        };
    }
    if (pct > 75) {
        return {
            text: "text-orange-500 font-bold",
            progress: "[&::-webkit-progress-value]:bg-orange-500 [&::-moz-progress-bar]:bg-orange-500"
        };
    }
    if (pct > 50) {
        return {
            text: "text-yellow-500 font-bold",
            progress: "progress-warning [&::-webkit-progress-value]:bg-yellow-500 [&::-moz-progress-bar]:bg-yellow-500"
        };
    }
    if (pct > 25) {
        return {
            text: "text-emerald-500 font-bold",
            progress: "progress-success [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
        };
    }
    return {
        text: "text-blue-500 font-bold",
        progress: "progress-info [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
    };
};

const CategoryCard = ({ category }) => {
    const dispatch = useDispatch();
    const { transactions, categories, currentMonth } = useSelector((state) => state.expense);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(category.name);

    // SubCategory Editing State
    const [editingSubId, setEditingSubId] = useState(null);
    const [tempSubName, setTempSubName] = useState("");
    const [tempSubBudget, setTempSubBudget] = useState(0);

    // Adding SubCategory State
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");
    const [newSubBudget, setNewSubBudget] = useState("");

    // History Modal State
    const [historySubId, setHistorySubId] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showCategoryHistoryModal, setShowCategoryHistoryModal] = useState(false);

    // Drag state
    const [draggedSubIndex, setDraggedSubIndex] = useState(null);

    const theme = getCategoryTheme(category, categories);

    // Calculations
    const subCategoryStats = (category.subCategories || []).map(sub => {
        const used = transactions
            .filter(t => t.type !== 'Credit' && (t.subCategoryId?._id === sub._id || t.subCategoryId === sub._id || (t.categoryId === category._id && t.description?.includes(sub.name))))
            .reduce((sum, t) => sum + t.amount, 0);

        const subBudget = Number(sub.budget) || 0;
        return {
            ...sub,
            budget: subBudget,
            used,
            remaining: subBudget - used
        };
    });

    const totalBudget = subCategoryStats.reduce((sum, s) => sum + s.budget, 0);
    const totalUsed = subCategoryStats.reduce((sum, s) => sum + s.used, 0);
    const totalRemaining = totalBudget - totalUsed;
    const totalPercentage = totalBudget > 0 ? Number(((totalUsed / totalBudget) * 100).toFixed(0)) : 0;

    // Handlers
    const handleUpdateCategoryName = () => {
        if (newTitle !== category.name) {
            dispatch(updateCategory({ id: category._id, name: newTitle }));
        }
        setIsEditingTitle(false);
    };

    const handleAddSubCategory = () => {
        if (newSubName && newSubBudget) {
            dispatch(addSubCategory({
                categoryId: category._id,
                name: newSubName,
                budget: Number(newSubBudget),
                month: currentMonth
            }));
            setNewSubName("");
            setNewSubBudget("");
            setIsAddingSub(false);
        }
    };

    const handleSaveSubEdit = (subId) => {
        dispatch(updateSubCategory({
            categoryId: category._id,
            subId,
            name: tempSubName,
            budget: Number(tempSubBudget)
        }));
        setEditingSubId(null);
    };

    return (
        <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 hover:border-base-300 h-full flex flex-col overflow-hidden">
            {/* Top Accent Bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${theme.bg} ${theme.text}`} />

            <div className="card-body p-0 flex flex-col justify-between flex-1">
                {/* 1. Header: Icon, Category Name, and Budget Allotted */}
                <div className="p-4 border-b border-base-200 bg-base-100/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="input input-sm input-bordered font-bold"
                                    autoFocus
                                />
                                <button onClick={handleUpdateCategoryName} className="btn btn-xs btn-square btn-success">
                                    <Save size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 min-w-0 cursor-pointer" onDoubleClick={() => setIsEditingTitle(true)}>
                                <div className={`p-2.5 rounded-xl bg-base-200 border ${theme.border} ${theme.text} shadow-sm shrink-0`}>
                                    {theme.icon}
                                </div>
                                <div>
                                    <h2 className="card-title text-lg font-bold truncate tracking-tight">{category.name}</h2>
                                    <span className="text-xs opacity-50 font-medium">{subCategoryStats.length} Subcategories</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-base-200 pt-2 sm:pt-0">
                        {/* Total Category Budget Allotted Badge */}
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Budget Allotted</span>
                            <span className="font-mono text-base font-extrabold text-primary">
                                ₹{totalBudget.toLocaleString()}
                            </span>
                        </div>

                        {/* Category Actions: Info, Color & Edit Dropdown */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowCategoryHistoryModal(true)}
                                className="btn btn-ghost btn-xs btn-square opacity-70 hover:opacity-100 rounded-lg text-info"
                                title={`View all ${category.name} transactions`}
                            >
                                <Info size={16} />
                            </button>

                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-xs btn-square opacity-70 hover:opacity-100 rounded-lg text-primary cursor-pointer" title="Change Category Tag Color">
                                    <Palette size={16} />
                                </label>
                                <div tabIndex={0} className="dropdown-content z-[30] menu p-2 shadow-xl bg-base-100 rounded-xl border border-base-200 w-48">
                                    <span className="text-[10px] font-bold uppercase opacity-60 px-2 py-1">Tag Color</span>
                                    <div className="flex flex-wrap gap-1.5 p-1">
                                        {COLOR_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => dispatch(updateCategory({ id: category._id, color: opt.key }))}
                                                className={`w-6 h-6 rounded-full ${opt.swatch} flex items-center justify-center transition-transform hover:scale-110 ${(category.color || theme.style?.key) === opt.key ? 'ring-2 ring-primary scale-105' : 'opacity-70'}`}
                                                title={opt.label}
                                            >
                                                {(category.color || theme.style?.key) === opt.key && <Check size={12} className="text-white drop-shadow" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-xs btn-square opacity-50 hover:opacity-100 rounded-lg">
                                    <Edit2 size={15} />
                                </label>
                                <ul tabIndex={0} className="dropdown-content z-[10] menu p-1.5 shadow-xl bg-base-100 rounded-xl w-36 border border-base-200 text-xs">
                                    <li><a onClick={() => setIsEditingTitle(true)}><Edit2 size={13} /> Rename</a></li>
                                    <li><a onClick={() => dispatch(deleteCategory(category._id))} className="text-error"><Trash2 size={13} /> Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Subcategories Table Section */}
                <div className="flex-1 overflow-x-auto w-full">
                    <table className="table table-sm w-full border-collapse">
                        <thead>
                            <tr className="bg-base-200/60 text-base-content/70 text-xs uppercase tracking-wider border-b border-base-200">
                                <th className="py-2.5 px-2 text-center w-8"></th>
                                <th className="py-2.5 px-4 text-left font-bold">Subcategory</th>
                                <th className="py-2.5 px-4 text-right font-bold">Budget Allotted</th>
                                <th className="py-2.5 px-4 text-right font-bold">Used</th>
                                <th className="py-2.5 px-4 text-right font-bold">Remaining</th>
                                <th className="py-2.5 px-4 text-center font-bold">% Used</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-200/50">
                            {subCategoryStats.map((sub, idx) => {
                                const pct = sub.budget > 0 ? Number(((sub.used / sub.budget) * 100).toFixed(0)) : 0;

                                return (
                                    <tr
                                        key={sub._id}
                                        draggable={!editingSubId}
                                        onDragStart={(e) => {
                                            setDraggedSubIndex(idx);
                                            e.dataTransfer.effectAllowed = "move";
                                            e.dataTransfer.setData("text/plain", idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                            if (draggedSubIndex === null || draggedSubIndex === idx) return;

                                            const updated = [...subCategoryStats];
                                            const [moved] = updated.splice(draggedSubIndex, 1);
                                            updated.splice(idx, 0, moved);
                                            setDraggedSubIndex(idx);

                                            dispatch(setLocalSubCategoriesOrder({
                                                categoryId: category._id,
                                                subCategories: updated
                                            }));
                                        }}
                                        onDragEnd={() => {
                                            if (draggedSubIndex !== null) {
                                                const subCategoryIds = (category.subCategories || []).map(s => s._id);
                                                dispatch(reorderSubCategories({ categoryId: category._id, subCategoryIds }));
                                                setDraggedSubIndex(null);
                                            }
                                        }}
                                        className={`hover:bg-base-200/40 transition-colors group/row ${draggedSubIndex === idx ? 'opacity-40 bg-primary/5' : ''}`}
                                    >
                                        {/* Drag Handle */}
                                        <td className="py-3 px-2 text-center text-base-content/30 hover:text-primary cursor-grab active:cursor-grabbing w-8 select-none">
                                            <GripVertical size={16} />
                                        </td>

                                        {/* Subcategory Name & Actions */}
                                        <td className="py-3 px-4 text-left font-semibold text-sm relative">
                                            {editingSubId === sub._id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        value={tempSubName}
                                                        onChange={(e) => setTempSubName(e.target.value)}
                                                        className="input input-xs input-bordered w-full"
                                                        placeholder="Name"
                                                    />
                                                    <button onClick={() => handleSaveSubEdit(sub._id)} className="btn btn-xs btn-square btn-success">
                                                        <Save size={12} />
                                                    </button>
                                                    <button onClick={() => setEditingSubId(null)} className="btn btn-xs btn-square btn-ghost">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="truncate max-w-[160px]" title={sub.name}>{sub.name}</span>

                                                    {/* Static Row Actions (No Column Shifting) */}
                                                    <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setHistorySubId(sub._id); setShowHistoryModal(true); }}
                                                            className="btn btn-xs btn-ghost btn-square text-info"
                                                            title="View History"
                                                        >
                                                            <Info size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingSubId(sub._id);
                                                                setTempSubName(sub.name);
                                                                setTempSubBudget(sub.budget);
                                                            }}
                                                            className="btn btn-xs btn-ghost btn-square text-warning"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => dispatch(deleteSubCategory({ categoryId: category._id, subId: sub._id }))}
                                                            className="btn btn-xs btn-ghost btn-square text-error"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Budget Allotted */}
                                        <td className="py-3 px-4 text-right font-mono font-medium text-sm">
                                            {editingSubId === sub._id ? (
                                                <input
                                                    type="number"
                                                    value={tempSubBudget}
                                                    onChange={(e) => setTempSubBudget(e.target.value)}
                                                    className="input input-xs input-bordered w-20 text-right"
                                                />
                                            ) : (
                                                `₹${sub.budget.toLocaleString()}`
                                            )}
                                        </td>

                                        {/* Used */}
                                        <td className="py-3 px-4 text-right font-mono font-medium text-sm text-warning">
                                            ₹{sub.used.toLocaleString()}
                                        </td>

                                        {/* Remaining */}
                                        <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${sub.remaining < 0 ? 'text-error' : 'text-success'}`}>
                                            {sub.remaining >= 0 ? `+₹${sub.remaining.toLocaleString()}` : `-₹${Math.abs(sub.remaining).toLocaleString()}`}
                                        </td>

                                        {/* Percentage Used */}
                                        <td className="py-3 px-4 text-center min-w-[120px]">
                                            {(() => {
                                                const pctColor = getUsedPercentageColor(pct);
                                                return (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`font-mono text-xs ${pctColor.text}`}>
                                                            {pct}%
                                                        </span>
                                                        <progress
                                                            className={`progress w-16 h-1.5 ${pctColor.progress}`}
                                                            value={pct}
                                                            max="100"
                                                        ></progress>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })}

                            {subCategoryStats.length === 0 && !isAddingSub && (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 border-b border-base-200 opacity-40 text-xs font-medium">
                                        No Sub-Categories added yet. Click "+ Add Subcategory" below.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Inline Add Subcategory Builder */}
                    {isAddingSub ? (
                        <div className="p-3 border-t border-primary/30 bg-primary/5 space-y-2 animate-in fade-in duration-150">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    className="input input-xs input-bordered w-full sm:w-1/2 text-xs"
                                    placeholder="Subcategory Name (e.g. Electricity Bill)"
                                    value={newSubName}
                                    onChange={(e) => setNewSubName(e.target.value)}
                                    autoFocus
                                />
                                <input
                                    type="number"
                                    className="input input-xs input-bordered w-full sm:w-1/2 text-xs font-mono"
                                    placeholder="Budget Allotted (₹)"
                                    value={newSubBudget}
                                    onChange={(e) => setNewSubBudget(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAddingSub(false)} className="btn btn-xs btn-ghost">Cancel</button>
                                <button onClick={handleAddSubCategory} className="btn btn-xs btn-primary px-4">Save Subcategory</button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 border-t border-base-200">
                            <button
                                onClick={() => setIsAddingSub(true)}
                                className="btn btn-xs btn-ghost btn-block border-dashed border-base-300 text-base-content/60 hover:bg-base-200 hover:text-primary transition-all h-8 text-xs font-medium"
                            >
                                <Plus size={14} className="mr-1" /> Add Subcategory
                            </button>
                        </div>
                    )}
                </div>

                {/* Card Footer Summary */}
                <div className="bg-base-200/70 p-3 text-xs flex justify-between items-center border-t border-base-200 font-semibold rounded-b-xl">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="opacity-50 text-[10px] uppercase font-bold">Total Spent</span>
                            <span className="font-mono text-sm text-warning">₹{totalUsed.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="opacity-50 text-[10px] uppercase font-bold">Total Remaining</span>
                            <span className={`font-mono text-sm ${totalRemaining < 0 ? 'text-error' : 'text-success'}`}>
                                {totalRemaining >= 0 ? `+₹${totalRemaining.toLocaleString()}` : `-₹${Math.abs(totalRemaining).toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="opacity-50 text-[10px] uppercase font-bold">Overall Progress</span>
                        <span className={`font-mono text-sm ${getUsedPercentageColor(totalPercentage).text}`}>
                            {totalPercentage}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Subcategory History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-2xl h-[580px] flex flex-col justify-between overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="shrink-0 p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                            <div>
                                <h3 className="font-bold text-lg">{category.subCategories.find(s => s._id === historySubId)?.name} History</h3>
                                <p className="text-xs opacity-50">Logged Transactions</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-ghost btn-square rounded-full">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
                            <table className="table table-xs table-pin-rows w-full">
                                <thead>
                                    <tr className="bg-base-200/50">
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Payment Source</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.filter(t => (t.subCategoryId?._id === historySubId || t.subCategoryId === historySubId)).length > 0 ? (
                                        transactions
                                            .filter(t => (t.subCategoryId?._id === historySubId || t.subCategoryId === historySubId))
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map(t => (
                                                <tr key={t._id} className="hover:bg-base-200/40 border-b border-base-200/40">
                                                    <td className="whitespace-nowrap font-mono opacity-70">{new Date(t.date).toLocaleDateString()}</td>
                                                    <td className="font-medium">{t.description || "Expense Transaction"}</td>
                                                    <td>{t.sourceId?.name || <span className="opacity-30">-</span>}</td>
                                                    <td className="text-right font-mono font-bold text-error">-₹{t.amount.toLocaleString()}</td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-12 flex flex-col items-center justify-center opacity-40 gap-2">
                                                <Info size={32} />
                                                <span>No transactions found for this item</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 p-3 border-t border-base-200 bg-base-100 flex justify-between items-center text-xs opacity-60">
                            <span>Total Spent: ₹{transactions.filter(t => (t.subCategoryId?._id === historySubId || t.subCategoryId === historySubId)).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
                            <button onClick={() => setShowHistoryModal(false)} className="btn btn-xs btn-ghost">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Level History Modal */}
            {showCategoryHistoryModal && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-3xl h-[620px] flex flex-col justify-between overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="shrink-0 p-4 border-b border-base-200 flex justify-between items-center bg-base-200/60">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-base-200 border ${theme.border} ${theme.text}`}>
                                    {theme.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{category.name} Transactions</h3>
                                    <p className="text-xs opacity-60">All logged expenses for this category</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCategoryHistoryModal(false)} className="btn btn-sm btn-ghost btn-square rounded-full">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
                            <table className="table table-xs table-pin-rows w-full">
                                <thead>
                                    <tr className="bg-base-200/50 text-xs">
                                        <th>Date</th>
                                        <th>Subcategory</th>
                                        <th>Description</th>
                                        <th>Payment Source</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const catTxns = transactions
                                            .filter(t => t.type !== 'Credit' && (
                                                t.categoryId?._id === category._id ||
                                                t.categoryId === category._id ||
                                                (category.subCategories || []).some(s => s._id === (t.subCategoryId?._id || t.subCategoryId))
                                            ))
                                            .sort((a, b) => new Date(b.date) - new Date(a.date));

                                        if (catTxns.length > 0) {
                                            return catTxns.map(t => {
                                                const subName = t.subCategoryId?.name || category.subCategories?.find(s => s._id === t.subCategoryId)?.name || "-";
                                                return (
                                                    <tr key={t._id} className="hover:bg-base-200/40 border-b border-base-200/40">
                                                        <td className="whitespace-nowrap font-mono opacity-70 text-xs">{dayjs(t.date).format("ddd, MMM DD, YYYY")}</td>
                                                        <td className="font-semibold text-primary/80">{subName}</td>
                                                        <td className="font-medium">{t.description || "Expense Transaction"}</td>
                                                        <td>{t.sourceId?.name || <span className="opacity-30">-</span>}</td>
                                                        <td className="text-right font-mono font-bold text-error">-₹{t.amount.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            });
                                        }
                                        return (
                                            <tr>
                                                <td colSpan="5" className="text-center py-12 flex flex-col items-center justify-center opacity-40 gap-2">
                                                    <Info size={32} />
                                                    <span>No transactions found for {category.name}</span>
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 p-4 border-t border-base-200 bg-base-100 flex justify-between items-center text-xs font-semibold">
                            <span className="opacity-70">
                                Total Spent in {category.name}: <strong className="font-mono text-sm text-error">₹{totalUsed.toLocaleString()}</strong>
                            </span>
                            <button onClick={() => setShowCategoryHistoryModal(false)} className="btn btn-xs btn-ghost">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryCard;
