import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { Trash2, Edit2, Plus, X, Save, Info, Home, Utensils, Car, Zap, HeartPulse, Gamepad2, ShoppingBag, PiggyBank, Folder, GripVertical, Palette, Check, Search, ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { addSubCategory, updateSubCategory, deleteSubCategory, deleteCategory, updateCategory, reorderSubCategories, setLocalSubCategoriesOrder } from "../../services/redux/slice/ExpenseSlice";
import { COLOR_OPTIONS, getCategoryTagStyle, getSourceTagStyle } from "../../utils/expenseTheme";

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
        badgeBg: style.badgeBg,
        swatch: style.swatch
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
    const { transactions, categories, sources, currentMonth } = useSelector((state) => state.expense);

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

    // Category History Modal Search, Sort, Limit & Column Filters State
    const [catSearchTerm, setCatSearchTerm] = useState("");
    const [catSortOrder, setCatSortOrder] = useState("newest");
    const [catLimitCount, setCatLimitCount] = useState("all");
    const [catColFilters, setCatColFilters] = useState({ date: "", description: "", subCategoryId: "", sourceId: "" });

    // Subcategory History Modal Search, Sort, Limit & Column Filters State
    const [subSearchTerm, setSubSearchTerm] = useState("");
    const [subSortOrder, setSubSortOrder] = useState("newest");
    const [subRowLimit, setSubRowLimit] = useState("all");
    const [subColFilters, setSubColFilters] = useState({ date: "", description: "", sourceId: "" });

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
                                        <td className="py-3 px-4 text-right font-mono font-bold text-sm text-rose-500 dark:text-rose-400">
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
                            <span className="font-mono text-sm font-bold text-rose-500 dark:text-rose-400">₹{totalUsed.toLocaleString()}</span>
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

            {/* Subcategory Level History Modal */}
            {showHistoryModal && (() => {
                const selectedSub = (category.subCategories || []).find(s => s._id === historySubId);
                const subTxns = transactions.filter(t => t.type !== 'Credit' && (
                    t.subCategoryId?._id === historySubId ||
                    t.subCategoryId === historySubId
                ));

                const hasSubColFilters = Boolean(subColFilters.date || subColFilters.description || subColFilters.sourceId);
                const clearSubColFilters = () => setSubColFilters({ date: "", description: "", sourceId: "" });

                let filteredList = subTxns.filter(t => {
                    // Top search
                    if (subSearchTerm.trim()) {
                        const query = subSearchTerm.toLowerCase();
                        const desc = t.description || "";
                        const srcName = t.sourceId?.name || sources.find(s => String(s._id) === String(t.sourceId?._id || t.sourceId))?.name || "";
                        const amountStr = String(t.amount || "");
                        const dateStr = dayjs(t.date).format("DD MMM YYYY");

                        const matchesQuery = (
                            desc.toLowerCase().includes(query) ||
                            srcName.toLowerCase().includes(query) ||
                            amountStr.includes(query) ||
                            dateStr.toLowerCase().includes(query)
                        );
                        if (!matchesQuery) return false;
                    }

                    // Column filters
                    if (subColFilters.date && dayjs(t.date).format("YYYY-MM-DD") !== subColFilters.date) return false;
                    if (subColFilters.description && !(t.description || "").toLowerCase().includes(subColFilters.description.toLowerCase())) return false;
                    if (subColFilters.sourceId && String(t.sourceId?._id || t.sourceId) !== String(subColFilters.sourceId)) return false;

                    return true;
                });

                filteredList.sort((a, b) => {
                    const timeA = new Date(a.date).getTime();
                    const timeB = new Date(b.date).getTime();
                    if (timeA !== timeB) {
                        return subSortOrder === "newest" ? timeB - timeA : timeA - timeB;
                    }
                    return 0;
                });

                if (subRowLimit !== "all") {
                    filteredList = filteredList.slice(0, Number(subRowLimit));
                }

                const totalSubSpent = filteredList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

                return (
                    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-2xl bg-base-200 border ${theme.border} ${theme.text}`}>
                                        {theme.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg flex items-center gap-2">
                                            <span>{selectedSub?.name || "Subcategory"} Transactions</span>
                                        </h3>
                                        <p className="text-xs opacity-60 font-medium mt-0.5">
                                            Showing {filteredList.length} of {subTxns.length} logged expenses under {category.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-xl text-sm font-extrabold font-mono border bg-error/10 text-error border-error/20">
                                        Total Spent: ₹{totalSubSpent.toLocaleString()}
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
                                            placeholder="Search subcategory expenses..."
                                            value={subSearchTerm}
                                            onChange={(e) => setSubSearchTerm(e.target.value)}
                                            className="input input-sm select-bordered w-full pl-10 pr-8 bg-base-200/60 text-xs font-medium rounded-xl focus:bg-base-100 transition-colors"
                                        />
                                        {subSearchTerm && (
                                            <button
                                                onClick={() => setSubSearchTerm("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {hasSubColFilters && (
                                        <button
                                            onClick={clearSubColFilters}
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
                                            onClick={() => setSubSortOrder("newest")}
                                            className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${subSortOrder === "newest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                                            title="Show Newest First"
                                        >
                                            <ArrowDown size={12} /> New First
                                        </button>
                                        <button
                                            onClick={() => setSubSortOrder("oldest")}
                                            className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${subSortOrder === "oldest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
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
                                                onClick={() => setSubRowLimit(val)}
                                                className={`btn btn-xs rounded-lg font-bold capitalize ${subRowLimit === val ? "btn-neutral shadow-2xs" : "btn-ghost opacity-70"}`}
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
                                                                    className={`btn btn-xs btn-square btn-ghost ${subColFilters.date ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Date"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <div tabIndex={0} className="dropdown-content z-[99999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 space-y-2 font-normal text-xs normal-case">
                                                                    <label className="text-[10px] font-bold text-base-content/50 uppercase block">Filter by Date</label>
                                                                    <input
                                                                        type="date"
                                                                        value={subColFilters.date}
                                                                        onChange={(e) => setSubColFilters({ ...subColFilters, date: e.target.value })}
                                                                        className="input input-xs input-bordered w-full rounded-lg font-medium"
                                                                    />
                                                                    {subColFilters.date && (
                                                                        <button
                                                                            onClick={() => setSubColFilters({ ...subColFilters, date: "" })}
                                                                            className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                                                        >
                                                                            Clear Date
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    <th className="py-3 px-4">Subcategory</th>

                                                    {/* Description Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>Description</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${subColFilters.description ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
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
                                                                            value={subColFilters.description}
                                                                            onChange={(e) => setSubColFilters({ ...subColFilters, description: e.target.value })}
                                                                            className="input input-xs input-bordered w-full pl-7 font-medium rounded-lg"
                                                                        />
                                                                    </div>
                                                                    {subColFilters.description && (
                                                                        <button
                                                                            onClick={() => setSubColFilters({ ...subColFilters, description: "" })}
                                                                            className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                                                        >
                                                                            Clear Search
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    {/* Payment Source Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-blue-600 dark:text-blue-400">Payment Source</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${subColFilters.sourceId ? 'text-blue-600 bg-blue-500/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Payment Source"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 font-medium text-xs normal-case max-h-56 overflow-y-auto">
                                                                    <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Account</li>
                                                                    <li>
                                                                        <a onClick={() => setSubColFilters({ ...subColFilters, sourceId: "" })} className={!subColFilters.sourceId ? "font-bold text-primary" : ""}>
                                                                            All Accounts
                                                                        </a>
                                                                    </li>
                                                                    {sources.map((s) => (
                                                                        <li key={s._id}>
                                                                            <a onClick={() => setSubColFilters({ ...subColFilters, sourceId: s._id })} className={String(subColFilters.sourceId) === String(s._id) ? "font-bold text-primary" : ""}>
                                                                                {s.name}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    <th className="py-3 px-4 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-base-200/70 font-medium">
                                                {filteredList.map((t) => {
                                                    const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
                                                    const srcTagStyle = getSourceTagStyle(srcObj);

                                                    return (
                                                        <tr key={t._id || t.id} className="hover:bg-base-200/40 transition-colors">
                                                            <td className="py-3 px-4 font-mono text-base-content/70 whitespace-nowrap">
                                                                {dayjs(t.date).format("DD MMM YYYY")}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                                                                    <Folder size={12} />
                                                                    {selectedSub?.name || "Subcategory"}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-base-content">
                                                                {t.description || <span className="opacity-40 italic">No description</span>}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {srcObj ? (
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${srcTagStyle.bg} ${srcTagStyle.text} border ${srcTagStyle.border}`}>
                                                                        <Wallet size={12} />
                                                                        {srcObj.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="opacity-30">—</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap text-error">
                                                                -₹{Number(t.amount || 0).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-sm opacity-50 italic">
                                        No transactions found for {selectedSub?.name || "this subcategory"}.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-base-200 bg-base-200/50 flex justify-between items-center text-xs">
                                <span className="font-semibold text-base-content/70">
                                    Total Spent in {selectedSub?.name}: <strong className="font-mono font-bold text-error">₹{totalSubSpent.toLocaleString()}</strong>
                                </span>
                                <button onClick={() => setShowHistoryModal(false)} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Category Level History Modal */}
            {showCategoryHistoryModal && (() => {
                const catTxns = transactions.filter(t => t.type !== 'Credit' && (
                    t.categoryId?._id === category._id ||
                    t.categoryId === category._id ||
                    (category.subCategories || []).some(s => s._id === (t.subCategoryId?._id || t.subCategoryId))
                ));

                const hasCatColFilters = Boolean(catColFilters.date || catColFilters.description || catColFilters.subCategoryId || catColFilters.sourceId);
                const clearCatColFilters = () => setCatColFilters({ date: "", description: "", subCategoryId: "", sourceId: "" });

                let filteredList = catTxns.filter(t => {
                    // Top search
                    if (catSearchTerm.trim()) {
                        const query = catSearchTerm.toLowerCase();
                        const subName = t.subCategoryId?.name || category.subCategories?.find(s => s._id === (t.subCategoryId?._id || t.subCategoryId))?.name || "";
                        const desc = t.description || "";
                        const amountStr = String(t.amount || "");
                        const dateStr = dayjs(t.date).format("DD MMM YYYY");

                        const matchesQuery = (
                            desc.toLowerCase().includes(query) ||
                            subName.toLowerCase().includes(query) ||
                            amountStr.includes(query) ||
                            dateStr.toLowerCase().includes(query)
                        );
                        if (!matchesQuery) return false;
                    }

                    // Column filters
                    if (catColFilters.date && dayjs(t.date).format("YYYY-MM-DD") !== catColFilters.date) return false;
                    if (catColFilters.description && !(t.description || "").toLowerCase().includes(catColFilters.description.toLowerCase())) return false;
                    if (catColFilters.subCategoryId && String(t.subCategoryId?._id || t.subCategoryId) !== String(catColFilters.subCategoryId)) return false;
                    if (catColFilters.sourceId && String(t.sourceId?._id || t.sourceId) !== String(catColFilters.sourceId)) return false;

                    return true;
                });

                filteredList.sort((a, b) => {
                    const timeA = new Date(a.date).getTime();
                    const timeB = new Date(b.date).getTime();
                    if (timeA !== timeB) {
                        return catSortOrder === "newest" ? timeB - timeA : timeA - timeB;
                    }
                    return 0;
                });

                if (catLimitCount !== "all") {
                    filteredList = filteredList.slice(0, Number(catLimitCount));
                }

                const totalCategorySpent = filteredList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

                return (
                    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-2xl bg-base-200 border ${theme.border} ${theme.text}`}>
                                        {theme.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg flex items-center gap-2">
                                            <span>{category.name} Transactions</span>
                                        </h3>
                                        <p className="text-xs opacity-60 font-medium mt-0.5">
                                            Showing {filteredList.length} of {catTxns.length} logged expenses for this category
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-xl text-sm font-extrabold font-mono border bg-error/10 text-error border-error/20">
                                        Total Spent: ₹{totalCategorySpent.toLocaleString()}
                                    </span>
                                    <button onClick={() => setShowCategoryHistoryModal(false)} className="btn btn-sm btn-ghost btn-circle rounded-full">
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
                                            placeholder="Search category expenses..."
                                            value={catSearchTerm}
                                            onChange={(e) => setCatSearchTerm(e.target.value)}
                                            className="input input-sm select-bordered w-full pl-10 pr-8 bg-base-200/60 text-xs font-medium rounded-xl focus:bg-base-100 transition-colors"
                                        />
                                        {catSearchTerm && (
                                            <button
                                                onClick={() => setCatSearchTerm("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {hasCatColFilters && (
                                        <button
                                            onClick={clearCatColFilters}
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
                                            onClick={() => setCatSortOrder("newest")}
                                            className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${catSortOrder === "newest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                                            title="Show Newest First"
                                        >
                                            <ArrowDown size={12} /> New First
                                        </button>
                                        <button
                                            onClick={() => setCatSortOrder("oldest")}
                                            className={`join-item btn btn-xs rounded-lg font-bold gap-1 ${catSortOrder === "oldest" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
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
                                                onClick={() => setCatLimitCount(val)}
                                                className={`btn btn-xs rounded-lg font-bold capitalize ${catLimitCount === val ? "btn-neutral shadow-2xs" : "btn-ghost opacity-70"}`}
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
                                                                    className={`btn btn-xs btn-square btn-ghost ${catColFilters.date ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Date"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <div tabIndex={0} className="dropdown-content z-[99999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 space-y-2 font-normal text-xs normal-case">
                                                                    <label className="text-[10px] font-bold text-base-content/50 uppercase block">Filter by Date</label>
                                                                    <input
                                                                        type="date"
                                                                        value={catColFilters.date}
                                                                        onChange={(e) => setCatColFilters({ ...catColFilters, date: e.target.value })}
                                                                        className="input input-xs input-bordered w-full rounded-lg font-medium"
                                                                    />
                                                                    {catColFilters.date && (
                                                                        <button
                                                                            onClick={() => setCatColFilters({ ...catColFilters, date: "" })}
                                                                            className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                                                        >
                                                                            Clear Date
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    {/* Subcategory Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>Subcategory</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${catColFilters.subCategoryId ? 'text-amber-600 bg-amber-500/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Subcategory"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 font-medium text-xs normal-case max-h-60 overflow-y-auto">
                                                                    <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Subcategory</li>
                                                                    <li>
                                                                        <a onClick={() => setCatColFilters({ ...catColFilters, subCategoryId: "" })} className={!catColFilters.subCategoryId ? "font-bold text-primary" : ""}>
                                                                            All Subcategories
                                                                        </a>
                                                                    </li>
                                                                    {(category.subCategories || []).map((sub) => (
                                                                        <li key={sub._id}>
                                                                            <a onClick={() => setCatColFilters({ ...catColFilters, subCategoryId: sub._id })} className={String(catColFilters.subCategoryId) === String(sub._id) ? "font-bold text-primary" : ""}>
                                                                                {sub.name}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
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
                                                                    className={`btn btn-xs btn-square btn-ghost ${catColFilters.description ? 'text-primary bg-primary/15' : 'opacity-40 hover:opacity-100'}`}
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
                                                                            value={catColFilters.description}
                                                                            onChange={(e) => setCatColFilters({ ...catColFilters, description: e.target.value })}
                                                                            className="input input-xs input-bordered w-full pl-7 font-medium rounded-lg"
                                                                        />
                                                                    </div>
                                                                    {catColFilters.description && (
                                                                        <button
                                                                            onClick={() => setCatColFilters({ ...catColFilters, description: "" })}
                                                                            className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                                                        >
                                                                            Clear Search
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    {/* Payment Source Header Filter */}
                                                    <th className="py-3 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-blue-600 dark:text-blue-400">Payment Source</span>
                                                            <div className="dropdown dropdown-bottom">
                                                                <button
                                                                    tabIndex={0}
                                                                    className={`btn btn-xs btn-square btn-ghost ${catColFilters.sourceId ? 'text-blue-600 bg-blue-500/15' : 'opacity-40 hover:opacity-100'}`}
                                                                    title="Filter Payment Source"
                                                                >
                                                                    <Filter size={11} />
                                                                </button>
                                                                <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 font-medium text-xs normal-case max-h-56 overflow-y-auto">
                                                                    <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Account</li>
                                                                    <li>
                                                                        <a onClick={() => setCatColFilters({ ...catColFilters, sourceId: "" })} className={!catColFilters.sourceId ? "font-bold text-primary" : ""}>
                                                                            All Accounts
                                                                        </a>
                                                                    </li>
                                                                    {sources.map((s) => (
                                                                        <li key={s._id}>
                                                                            <a onClick={() => setCatColFilters({ ...catColFilters, sourceId: s._id })} className={String(catColFilters.sourceId) === String(s._id) ? "font-bold text-primary" : ""}>
                                                                                {s.name}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    <th className="py-3 px-4 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-base-200/70 font-medium">
                                                {filteredList.map((t) => {
                                                    const subName = t.subCategoryId?.name || category.subCategories?.find(s => s._id === t.subCategoryId)?.name || "General";
                                                    const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
                                                    const srcTagStyle = getSourceTagStyle(srcObj);

                                                    return (
                                                        <tr key={t._id || t.id} className="hover:bg-base-200/40 transition-colors">
                                                            <td className="py-3 px-4 font-mono text-base-content/70 whitespace-nowrap">
                                                                {dayjs(t.date).format("DD MMM YYYY")}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                                                                    <Folder size={12} />
                                                                    {subName}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-base-content">
                                                                {t.description || <span className="opacity-40 italic">No description</span>}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {srcObj ? (
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${srcTagStyle.bg} ${srcTagStyle.text} border ${srcTagStyle.border}`}>
                                                                        <Wallet size={12} />
                                                                        {srcObj.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="opacity-30">—</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap text-error">
                                                                -₹{Number(t.amount || 0).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-sm opacity-50 italic">
                                        No transactions found for {category.name}.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-base-200 bg-base-200/50 flex justify-between items-center text-xs">
                                <span className="font-semibold text-base-content/70">
                                    Total Spent in {category.name}: <strong className="font-mono font-bold text-error">₹{totalCategorySpent.toLocaleString()}</strong>
                                </span>
                                <button onClick={() => setShowCategoryHistoryModal(false)} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CategoryCard;
