import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { Trash2, Edit2, Plus, X, Save, Info, Home, Utensils, Car, Zap, HeartPulse, Gamepad2, ShoppingBag, PiggyBank, Folder, GripVertical, Palette, Check, Search, ArrowDown, ArrowUp, Wallet, Filter, ChevronDown, ChevronUp, Layers } from "lucide-react";
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

const CategoryCard = ({ category, isAllCollapsed }) => {
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
    const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);

    useEffect(() => {
        if (typeof isAllCollapsed === "boolean") {
            setIsMobileCollapsed(isAllCollapsed);
        }
    }, [isAllCollapsed]);

    // History Modal State & Mobile Drawer Animation
    const [historySubId, setHistorySubId] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [isClosingSubModal, setIsClosingSubModal] = useState(false);
    const [subTouchStartY, setSubTouchStartY] = useState(null);
    const [subTouchStartTime, setSubTouchStartTime] = useState(0);
    const [subDragY, setSubDragY] = useState(0);
    const [isSubDragging, setIsSubDragging] = useState(false);

    const [showCategoryHistoryModal, setShowCategoryHistoryModal] = useState(false);
    const [isClosingCatModal, setIsClosingCatModal] = useState(false);
    const [catTouchStartY, setCatTouchStartY] = useState(null);
    const [catTouchStartTime, setCatTouchStartTime] = useState(0);
    const [catDragY, setCatDragY] = useState(0);
    const [isCatDragging, setIsCatDragging] = useState(false);

    const handleCloseSubModal = () => {
        setIsClosingSubModal(true);
        setTimeout(() => {
            setShowHistoryModal(false);
            setIsClosingSubModal(false);
            setSubDragY(0);
            setIsSubDragging(false);
        }, 220);
    };

    const handleCloseCatModal = () => {
        setIsClosingCatModal(true);
        setTimeout(() => {
            setShowCategoryHistoryModal(false);
            setIsClosingCatModal(false);
            setCatDragY(0);
            setIsCatDragging(false);
        }, 220);
    };

    const onSubTouchStart = (e) => {
        setSubTouchStartY(e.touches[0].clientY);
        setSubTouchStartTime(Date.now());
        setIsSubDragging(true);
    };

    const onSubTouchMove = (e) => {
        if (subTouchStartY === null) return;
        const diff = e.touches[0].clientY - subTouchStartY;
        if (diff > 0) {
            setSubDragY(diff);
        } else {
            setSubDragY(0);
        }
    };

    const onSubTouchEnd = () => {
        if (subTouchStartY === null) return;
        const elapsed = Date.now() - subTouchStartTime;
        const isQuickFlick = elapsed < 300 && subDragY > 40;
        if (subDragY > 90 || isQuickFlick) {
            handleCloseSubModal();
        } else {
            setSubDragY(0);
        }
        setSubTouchStartY(null);
        setIsSubDragging(false);
    };

    const onCatTouchStart = (e) => {
        setCatTouchStartY(e.touches[0].clientY);
        setCatTouchStartTime(Date.now());
        setIsCatDragging(true);
    };

    const onCatTouchMove = (e) => {
        if (catTouchStartY === null) return;
        const diff = e.touches[0].clientY - catTouchStartY;
        if (diff > 0) {
            setCatDragY(diff);
        } else {
            setCatDragY(0);
        }
    };

    const onCatTouchEnd = () => {
        if (catTouchStartY === null) return;
        const elapsed = Date.now() - catTouchStartTime;
        const isQuickFlick = elapsed < 300 && catDragY > 40;
        if (catDragY > 90 || isQuickFlick) {
            handleCloseCatModal();
        } else {
            setCatDragY(0);
        }
        setCatTouchStartY(null);
        setIsCatDragging(false);
    };

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

    const theme = getCategoryTheme(category, categories);

    // Calculations
    const subCategoryStats = (category.subCategories || []).map(sub => {
        const used = transactions
            .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (
                String(t.subCategoryId?._id || t.subCategoryId || "") === String(sub._id)
            ))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

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
    const totalPercentage = totalBudget > 0 ? Number(((totalUsed / totalBudget) * 100).toFixed(2)) : 0;

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
        <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border-y sm:border border-base-200 hover:border-base-300 rounded-none sm:rounded-2xl h-full flex flex-col overflow-hidden w-full">
            {/* Top Accent Bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${theme.bg} ${theme.text}`} />

            <div className="card-body p-0 flex flex-col justify-between flex-1">
                {/* 1. Desktop Header (md and up: 100% original & untouched) */}
                <div className="hidden md:flex p-4 border-b border-base-200 bg-base-100/70 justify-between items-center gap-3">
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

                    <div className="flex items-center gap-3 justify-end border-base-200">
                        {/* Total Category Budget Allotted Badge */}
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Budget Allotted</span>
                            <span className="font-mono text-base font-extrabold text-primary">
                                {hideNumbers ? "••••••" : `₹${totalBudget.toLocaleString()}`}
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

                {/* 1. Mobile Header (Phone Only: Full width, icons on extreme right side) */}
                <div className="md:hidden px-3.5 py-3 border-b border-base-200 bg-base-100/90 flex items-center justify-between gap-2">
                    {/* Left: Icon + Title */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-1.5 w-full">
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="input input-xs input-bordered font-bold flex-1 text-xs"
                                    autoFocus
                                />
                                <button onClick={handleUpdateCategoryName} className="btn btn-xs btn-square btn-success">
                                    <Save size={12} />
                                </button>
                                <button onClick={() => setIsEditingTitle(false)} className="btn btn-xs btn-square btn-ghost">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                                <div className={`p-2 rounded-xl bg-base-200/80 border ${theme.border} ${theme.text} shadow-2xs shrink-0`}>
                                    {React.cloneElement(theme.icon, { size: 16 })}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-black text-base-content truncate tracking-tight">{category.name}</h2>
                                    <span className="text-[10px] text-base-content/50 font-medium block">
                                        {subCategoryStats.length} {subCategoryStats.length === 1 ? 'Subcategory' : 'Subcategories'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Extreme Right: Action Icons */}
                    {!isEditingTitle && (
                        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                            {/* Info History */}
                            <button
                                type="button"
                                onClick={() => setShowCategoryHistoryModal(true)}
                                className="btn btn-ghost btn-xs btn-square text-info hover:bg-info/10 rounded-lg h-7 w-7"
                                title="View History"
                            >
                                <Info size={15} />
                            </button>

                            {/* Color Palette */}
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-xs btn-square text-primary hover:bg-primary/10 rounded-lg h-7 w-7 cursor-pointer" title="Tag Color">
                                    <Palette size={15} />
                                </label>
                                <div tabIndex={0} className="dropdown-content z-[30] menu p-2 shadow-2xl bg-base-100 rounded-xl border border-base-200 w-44">
                                    <span className="text-[10px] font-bold uppercase opacity-60 px-2 py-1">Tag Color</span>
                                    <div className="flex flex-wrap gap-1.5 p-1">
                                        {COLOR_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => dispatch(updateCategory({ id: category._id, color: opt.key }))}
                                                className={`w-6 h-6 rounded-full ${opt.swatch} flex items-center justify-center ${(category.color || theme.style?.key) === opt.key ? 'ring-2 ring-primary scale-105' : 'opacity-70'}`}
                                            >
                                                {(category.color || theme.style?.key) === opt.key && <Check size={11} className="text-white drop-shadow" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Edit / Rename / Delete */}
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-xs btn-square opacity-60 hover:opacity-100 rounded-lg h-7 w-7">
                                    <Edit2 size={14} />
                                </label>
                                <ul tabIndex={0} className="dropdown-content z-[20] menu p-1.5 shadow-2xl bg-base-100 rounded-xl w-32 border border-base-200 text-xs">
                                    <li><a onClick={() => setIsEditingTitle(true)}><Edit2 size={12} /> Rename</a></li>
                                    <li><a onClick={() => dispatch(deleteCategory(category._id))} className="text-error"><Trash2 size={12} /> Delete</a></li>
                                </ul>
                            </div>

                            {/* Add Subcategory Quick Action */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileCollapsed(false);
                                    setIsAddingSub(true);
                                }}
                                className="btn btn-xs btn-primary rounded-lg font-bold h-7 px-2 ml-1 shadow-2xs gap-0.5"
                                title="Add Subcategory"
                            >
                                <Plus size={13} />
                                <span className="text-[11px]">Add</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Under-Header Summary Strip (Replaces Card Footer, Clickable to Collapse/Expand) */}
                <div
                    onClick={() => setIsMobileCollapsed(prev => !prev)}
                    className="md:hidden px-3.5 py-2.5 bg-base-200/40 hover:bg-base-200/60 active:bg-base-200/80 transition-colors border-b border-base-200 flex items-center justify-between cursor-pointer select-none"
                    title={isMobileCollapsed ? "Expand Subcategories" : "Collapse Subcategories"}
                >
                    <div className="flex flex-col">
                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-base-content/50">Budget Allotted</span>
                        <span className="font-mono text-xs font-black text-base-content/80">
                            {hideNumbers ? "••••••" : `₹${totalBudget.toLocaleString()}`}
                        </span>
                    </div>

                    {/* Center Collapse Indicator */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-base-content/50 bg-base-100/60 px-2 py-0.5 rounded-lg border border-base-200/80 shadow-2xs">
                        <span>{isMobileCollapsed ? "Expand" : "Collapse"}</span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isMobileCollapsed ? '-rotate-90 text-primary' : 'rotate-0'}`} />
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-base-content/50">Total Remaining</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-xs font-black ${totalRemaining < 0 ? 'text-error' : 'text-success'}`}>
                                {hideNumbers ? "••••••" : (totalRemaining >= 0 ? `+₹${totalRemaining.toLocaleString()}` : `-₹${Math.abs(totalRemaining).toLocaleString()}`)}
                            </span>
                            <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                totalRemaining < 0 
                                    ? 'bg-error/15 text-error' 
                                    : 'bg-success/15 text-success'
                            }`}>
                                {hideNumbers ? "••%" : (totalBudget > 0 ? `${Math.max(0, Math.min(100, Math.round((totalRemaining / totalBudget) * 100)))}%` : '0%')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Subcategories Table Section (No scrollbars, compact table-xs size) */}
                <div className="hidden md:block flex-1 overflow-x-auto w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <table className="table table-xs w-full border-collapse">
                        <thead>
                            <tr className="bg-base-200/60 text-base-content/70 text-[10px] uppercase tracking-wider border-b border-base-200">
                                <th className="py-1.5 px-1 text-center w-6"></th>
                                <th className="py-1.5 px-2 text-left font-bold">Subcategory</th>
                                <th className="py-1.5 px-2 text-right font-bold whitespace-nowrap">Budget Allotted</th>
                                <th className="py-1.5 px-2 text-right font-bold whitespace-nowrap">Used</th>
                                <th className="py-1.5 px-2 text-right font-bold whitespace-nowrap">Remaining</th>
                                <th className="py-1.5 px-2 text-center font-bold whitespace-nowrap">% Used</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-200/50">
                            {subCategoryStats.map((sub, idx) => {
                                const pct = sub.budget > 0 ? Number(((sub.used / sub.budget) * 100).toFixed(2)) : 0;

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
                                        <td className="py-1.5 px-1 text-center text-base-content/30 hover:text-primary cursor-grab active:cursor-grabbing w-6 select-none">
                                            <GripVertical size={14} />
                                        </td>

                                        {/* Subcategory Name & Actions */}
                                        <td className="py-1.5 px-2 text-left font-semibold text-xs relative">
                                            {editingSubId === sub._id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        value={tempSubName}
                                                        onChange={(e) => setTempSubName(e.target.value)}
                                                        className="input input-xs input-bordered w-full text-xs"
                                                        placeholder="Name"
                                                    />
                                                    <button onClick={() => handleSaveSubEdit(sub._id)} className="btn btn-xs btn-square btn-success">
                                                        <Save size={11} />
                                                    </button>
                                                    <button onClick={() => setEditingSubId(null)} className="btn btn-xs btn-square btn-ghost">
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <span className="truncate max-w-[130px] text-xs font-semibold" title={sub.name}>{sub.name}</span>

                                                    {/* Static Row Actions */}
                                                    <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setHistorySubId(sub._id); setShowHistoryModal(true); }}
                                                            className="btn btn-xs btn-ghost btn-square p-0.5 w-5 h-5 min-h-0 text-info"
                                                            title="View History"
                                                        >
                                                            <Info size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingSubId(sub._id);
                                                                setTempSubName(sub.name);
                                                                setTempSubBudget(sub.budget);
                                                            }}
                                                            className="btn btn-xs btn-ghost btn-square p-0.5 w-5 h-5 min-h-0 text-warning"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => dispatch(deleteSubCategory({ categoryId: category._id, subId: sub._id }))}
                                                            className="btn btn-xs btn-ghost btn-square p-0.5 w-5 h-5 min-h-0 text-error"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Budget Allotted */}
                                        <td className="py-1.5 px-2 text-right font-mono font-medium text-xs whitespace-nowrap">
                                            {editingSubId === sub._id ? (
                                                <input
                                                    type="number"
                                                    value={tempSubBudget}
                                                    onChange={(e) => setTempSubBudget(e.target.value)}
                                                    className="input input-xs input-bordered w-16 text-right font-mono text-xs"
                                                />
                                            ) : (
                                                hideNumbers ? "••••" : `₹${sub.budget.toLocaleString()}`
                                            )}
                                        </td>

                                        {/* Used */}
                                        <td className="py-1.5 px-2 text-right font-mono font-bold text-xs text-rose-500 dark:text-rose-400 whitespace-nowrap">
                                            {hideNumbers ? "••••" : `₹${sub.used.toLocaleString()}`}
                                        </td>

                                        {/* Remaining */}
                                        <td className={`py-1.5 px-2 text-right font-mono font-bold text-xs whitespace-nowrap ${sub.remaining < 0 ? 'text-error' : 'text-success'}`}>
                                            {hideNumbers ? "••••" : (sub.remaining >= 0 ? `+₹${sub.remaining.toLocaleString()}` : `-₹${Math.abs(sub.remaining).toLocaleString()}`)}
                                        </td>

                                        {/* Percentage Used */}
                                        <td className="py-1.5 px-2 text-center min-w-[90px] whitespace-nowrap">
                                            {(() => {
                                                const pctColor = getUsedPercentageColor(pct);
                                                return (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className={`font-mono text-[10px] font-semibold ${pctColor.text}`}>
                                                            {pct.toFixed(2)}%
                                                        </span>
                                                        <progress
                                                            className={`progress w-12 h-1 ${pctColor.progress}`}
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
                                    <td colSpan="6" className="text-center py-4 border-b border-base-200 opacity-40 text-[11px] font-medium">
                                        No Sub-Categories added yet. Click "+ Add Subcategory" below.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Inline Add Subcategory Builder */}
                    {isAddingSub ? (
                        <div className="p-2 border-t border-primary/30 bg-primary/5 space-y-2 animate-in fade-in duration-150">
                            <div className="flex flex-col sm:flex-row gap-1.5">
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
                            <div className="flex justify-end gap-1.5">
                                <button onClick={() => setIsAddingSub(false)} className="btn btn-xs btn-ghost">Cancel</button>
                                <button onClick={handleAddSubCategory} className="btn btn-xs btn-primary px-3">Save Subcategory</button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-1.5 border-t border-base-200">
                            <button
                                onClick={() => setIsAddingSub(true)}
                                className="btn btn-xs btn-ghost btn-block border-dashed border-base-300 text-base-content/60 hover:bg-base-200 hover:text-primary transition-all h-7 text-xs font-medium"
                            >
                                <Plus size={13} className="mr-1" /> Add Subcategory
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* 2. PHONE VIEW (< md) - PIGGY BANK SUB-CATEGORIES FEED                      */}
                {/* ========================================================================= */}
                {!isMobileCollapsed && (
                    <div className="md:hidden flex-1 p-3 space-y-2.5 w-full">
                        <div className="space-y-2.5">
                            {/* Subcategories List */}
                            {subCategoryStats.map((sub) => {
                                const remainingPct = sub.budget > 0 
                                    ? Math.max(0, Math.min(100, (sub.remaining / sub.budget) * 100)) 
                                    : 0;
                                const utilizedPct = sub.budget > 0 
                                ? Math.min(100, (sub.used / sub.budget) * 100) 
                                : 0;
                            const isOverspent = sub.remaining < 0;

                            // Dynamic water color based on remaining %
                            let waterStyle = "from-cyan-600 via-sky-500 to-teal-400 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)]";
                            let textWaterColor = "text-cyan-500 dark:text-cyan-400";
                            if (isOverspent || remainingPct <= 0) {
                                waterStyle = "from-rose-600 via-rose-500 to-red-400";
                                textWaterColor = "text-error";
                            } else if (remainingPct <= 25) {
                                waterStyle = "from-rose-600 via-rose-500 to-orange-400 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)]";
                                textWaterColor = "text-rose-500";
                            } else if (remainingPct <= 50) {
                                waterStyle = "from-amber-600 via-amber-500 to-yellow-400 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)]";
                                textWaterColor = "text-amber-500";
                            }

                            return (
                                <React.Fragment key={sub._id}>
                                    {editingSubId === sub._id ? (
                                        <div className="p-3 bg-base-100 rounded-2xl border-2 border-primary/40 space-y-2 shadow-xs animate-in fade-in">
                                            <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                                                <Edit2 size={12} /> Edit Subcategory
                                            </div>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                <input
                                                    className="input input-xs input-bordered w-full text-xs font-semibold rounded-lg"
                                                    value={tempSubName}
                                                    onChange={(e) => setTempSubName(e.target.value)}
                                                    placeholder="Subcategory Name"
                                                    autoFocus
                                                />
                                                <input
                                                    type="number"
                                                    className="input input-xs input-bordered w-full text-xs font-mono font-bold rounded-lg"
                                                    value={tempSubBudget}
                                                    onChange={(e) => setTempSubBudget(e.target.value)}
                                                    placeholder="Budget (₹)"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-1.5 pt-0.5">
                                                <button onClick={() => setEditingSubId(null)} className="btn btn-xs btn-ghost rounded-lg">Cancel</button>
                                                <button onClick={() => handleSaveSubEdit(sub._id)} className="btn btn-xs btn-primary rounded-lg font-bold">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-base-100/90 dark:bg-base-900/60 hover:bg-base-200/50 border border-base-200 dark:border-base-content/10 rounded-2xl flex items-center gap-3.5 transition-all shadow-xs">
                                            {/* 🐷 PIGGY BANK REPRESENTATION */}
                                            <div className="flex flex-col items-center gap-1 shrink-0 select-none w-14">
                                                <div className="relative pt-2 pb-0.5 flex justify-center">
                                                    {/* Floating Coin above slot if healthy */}
                                                    {!isOverspent && remainingPct > 0 && (
                                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                                                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-amber-600/60 shadow-xs flex items-center justify-center">
                                                                <span className="text-[7.5px] font-black text-amber-950">₹</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Scalable Piggy Bank Graphic */}
                                                    <div className="relative w-13 h-12 flex items-center justify-center">
                                                        <svg
                                                            viewBox="0 0 40 34"
                                                            className="w-full h-full drop-shadow-xs"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <defs>
                                                                <clipPath id={`piggy-clip-${sub._id}`}>
                                                                    <path
                                                                        d="M31 7.5C29.2 7.5 27.5 8.8 26.5 10C23 8.2 13 8.5 9.5 14C8 16.5 8 18 10 20.5V26.5C10 27.3 10.7 28 11.5 28H14.5C15.3 28 16 27.3 16 26.5V25H22V26.5C22 27.3 22.7 28 23.5 28H26.5C27.3 28 28 27.3 28 26.5V23.5C29.5 22.5 30.5 21 31 19.5H33C34.1 19.5 35 18.6 35 17.5V14.5C35 13.4 34.1 12.5 33 12.5H31.5C31.5 11 31.2 9.5 31 7.5Z"
                                                                    />
                                                                </clipPath>
                                                                <linearGradient id={`piggy-fill-grad-${sub._id}`} x1="0" y1="1" x2="0" y2="0">
                                                                    {isOverspent || remainingPct <= 0 ? (
                                                                        <>
                                                                            <stop offset="0%" stopColor="#f43f5e" />
                                                                            <stop offset="100%" stopColor="#e11d48" />
                                                                        </>
                                                                    ) : remainingPct <= 25 ? (
                                                                        <>
                                                                            <stop offset="0%" stopColor="#f43f5e" />
                                                                            <stop offset="100%" stopColor="#fb923c" />
                                                                        </>
                                                                    ) : remainingPct <= 50 ? (
                                                                        <>
                                                                            <stop offset="0%" stopColor="#f59e0b" />
                                                                            <stop offset="100%" stopColor="#fde047" />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <stop offset="0%" stopColor="#10b981" />
                                                                            <stop offset="60%" stopColor="#14b8a6" />
                                                                            <stop offset="100%" stopColor="#38bdf8" />
                                                                        </>
                                                                    )}
                                                                </linearGradient>
                                                            </defs>

                                                            {/* Inside the Piggy Clip */}
                                                            <g clipPath={`url(#piggy-clip-${sub._id})`}>
                                                                {/* Empty Piggy Belly Background */}
                                                                <rect x="0" y="0" width="40" height="34" className="fill-base-200 dark:fill-base-800/80" />

                                                                {/* Dynamic Savings Level Fill */}
                                                                {remainingPct > 0 ? (
                                                                    <rect
                                                                        x="0"
                                                                        y={28 - (20 * (remainingPct / 100))}
                                                                        width="40"
                                                                        height={20 * (remainingPct / 100) + 4}
                                                                        fill={`url(#piggy-fill-grad-${sub._id})`}
                                                                        className="transition-all duration-700 ease-out"
                                                                    />
                                                                ) : isOverspent ? (
                                                                    <rect x="0" y="24" width="40" height="6" fill="#f43f5e" />
                                                                ) : null}

                                                                {/* Surface highlight line */}
                                                                {remainingPct > 5 && remainingPct < 96 && (
                                                                    <line
                                                                        x1="8"
                                                                        y1={28 - (20 * (remainingPct / 100))}
                                                                        x2="32"
                                                                        y2={28 - (20 * (remainingPct / 100))}
                                                                        stroke="rgba(255,255,255,0.7)"
                                                                        strokeWidth="1"
                                                                        strokeLinecap="round"
                                                                    />
                                                                )}

                                                                {/* Sparkle inside belly when > 50% full */}
                                                                {remainingPct > 50 && (
                                                                    <circle cx="18" cy={25 - (10 * (remainingPct / 100))} r="1.2" fill="white" opacity="0.6" className="animate-pulse" />
                                                                )}
                                                            </g>

                                                            {/* Piggy Outline Path */}
                                                            <path
                                                                d="M31 7.5C29.2 7.5 27.5 8.8 26.5 10C23 8.2 13 8.5 9.5 14C8 16.5 8 18 10 20.5V26.5C10 27.3 10.7 28 11.5 28H14.5C15.3 28 16 27.3 16 26.5V25H22V26.5C22 27.3 22.7 28 23.5 28H26.5C27.3 28 28 27.3 28 26.5V23.5C29.5 22.5 30.5 21 31 19.5H33C34.1 19.5 35 18.6 35 17.5V14.5C35 13.4 34.1 12.5 33 12.5H31.5C31.5 11 31.2 9.5 31 7.5Z"
                                                                stroke="currentColor"
                                                                strokeWidth="1.4"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className={isOverspent ? "text-error" : "text-base-content/40 dark:text-white/40"}
                                                            />

                                                            {/* Curly Tail */}
                                                            <path
                                                                d="M9 16C7 15.5 6 16.5 6 17.5C6 18.5 7.5 18.5 7.8 17.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.2"
                                                                strokeLinecap="round"
                                                                className={isOverspent ? "text-error" : "text-base-content/40 dark:text-white/40"}
                                                            />

                                                            {/* Ear Fold Line */}
                                                            <path
                                                                d="M26.5 10C27.5 11.5 28.5 12 30 11.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1"
                                                                strokeLinecap="round"
                                                                className="text-base-content/30 dark:text-white/30"
                                                            />

                                                            {/* Eye */}
                                                            {isOverspent ? (
                                                                <path
                                                                    d="M24.5 12.5L26.5 14.5M26.5 12.5L24.5 14.5"
                                                                    stroke="#f43f5e"
                                                                    strokeWidth="1.2"
                                                                    strokeLinecap="round"
                                                                />
                                                            ) : (
                                                                <circle cx="25.5" cy="13.5" r="1" className="fill-base-content/80 dark:fill-white/90" />
                                                            )}

                                                            {/* Snout Nostril */}
                                                            <circle cx="33" cy="15.5" r="0.6" className="fill-base-content/50 dark:fill-white/60" />

                                                            {/* Coin Slot on Top */}
                                                            <line
                                                                x1="16"
                                                                y1="9.2"
                                                                x2="22"
                                                                y2="9.2"
                                                                stroke="currentColor"
                                                                strokeWidth="1.6"
                                                                strokeLinecap="round"
                                                                className={isOverspent ? "text-error" : "text-base-content/70 dark:text-white/80"}
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Percentage In Piggy Badge */}
                                                <span className={`text-[10px] font-mono font-bold ${textWaterColor}`}>
                                                    {isOverspent ? '0%' : `${remainingPct.toFixed(0)}%`}
                                                </span>
                                            </div>

                                            {/* Subcategory Details Column */}
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                {/* Top: Name + Actions */}
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs font-black text-base-content truncate tracking-tight" title={sub.name}>
                                                        {sub.name}
                                                    </span>

                                                    <div className="flex items-center gap-0.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setHistorySubId(sub._id);
                                                                setShowHistoryModal(true);
                                                            }}
                                                            className="btn btn-xs btn-ghost btn-square h-6 w-6 min-h-0 text-info hover:bg-info/10 rounded-lg"
                                                            title="View Transactions"
                                                        >
                                                            <Info size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingSubId(sub._id);
                                                                setTempSubName(sub.name);
                                                                setTempSubBudget(sub.budget);
                                                            }}
                                                            className="btn btn-xs btn-ghost btn-square h-6 w-6 min-h-0 text-warning hover:bg-warning/10 rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => dispatch(deleteSubCategory({ categoryId: category._id, subId: sub._id }))}
                                                            className="btn btn-xs btn-ghost btn-square h-6 w-6 min-h-0 text-error hover:bg-error/10 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Piggy Balance Remaining (Hero metric) */}
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-[9.5px] uppercase font-bold text-base-content/50 flex items-center gap-1">
                                                        <PiggyBank size={11} className="text-primary" /> In Piggy:
                                                    </span>
                                                    <span className={`font-mono text-sm font-black ${isOverspent ? 'text-error' : 'text-success'}`}>
                                                        {hideNumbers 
                                                            ? "••••••"
                                                            : (isOverspent 
                                                                ? `-₹${Math.abs(sub.remaining).toLocaleString()} over` 
                                                                : `+₹${sub.remaining.toLocaleString()} left`
                                                            )
                                                        }
                                                    </span>
                                                </div>

                                                {/* Budget & Utilized from top */}
                                                <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-base-content/5 text-base-content/60 font-medium">
                                                    <span>Budget: <strong className="font-mono text-base-content/80">{hideNumbers ? "••••" : `₹${sub.budget.toLocaleString()}`}</strong></span>
                                                    <span>Utilized: <strong className="font-mono text-rose-500/90">{hideNumbers ? "••••" : `₹${sub.used.toLocaleString()}`}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {subCategoryStats.length === 0 && !isAddingSub && (
                            <div className="text-center py-6 px-3 border border-dashed border-base-300 rounded-2xl text-base-content/50 text-xs space-y-1">
                                <p className="font-semibold">No subcategories yet.</p>
                                <p className="text-[10.5px]">Add one to start filling your piggy bank with savings!</p>
                            </div>
                        )}

                        {/* Mobile Inline Add Subcategory */}
                        {isAddingSub ? (
                            <div className="p-3 bg-primary/5 border border-primary/30 rounded-2xl space-y-2 animate-in fade-in">
                                <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                                    <Plus size={12} /> Add Subcategory
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <input
                                        className="input input-xs input-bordered w-full text-xs font-semibold rounded-lg"
                                        placeholder="Subcategory Name (e.g. WiFi Bill)"
                                        value={newSubName}
                                        onChange={(e) => setNewSubName(e.target.value)}
                                        autoFocus
                                    />
                                    <input
                                        type="number"
                                        className="input input-xs input-bordered w-full text-xs font-mono font-bold rounded-lg"
                                        placeholder="Budget Allotted (₹)"
                                        value={newSubBudget}
                                        onChange={(e) => setNewSubBudget(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-1.5 pt-0.5">
                                    <button onClick={() => setIsAddingSub(false)} className="btn btn-xs btn-ghost rounded-lg">Cancel</button>
                                    <button onClick={handleAddSubCategory} className="btn btn-xs btn-primary rounded-lg font-bold">Save</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddingSub(true)}
                                className="btn btn-xs btn-ghost btn-block border-dashed border-base-300 text-base-content/60 hover:bg-base-200 hover:text-primary transition-all h-8 text-xs font-medium rounded-xl"
                            >
                                <Plus size={13} className="mr-1" /> Add Subcategory
                            </button>
                        )}
                    </div>
                </div>
            )}

                {/* Card Footer Summary - Desktop Only */}
                <div className="hidden md:flex bg-base-200/70 p-3 text-xs justify-between items-center border-t border-base-200 font-semibold rounded-b-xl">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="opacity-50 text-[10px] uppercase font-bold">Total Spent</span>
                            <span className="font-mono text-sm font-bold text-rose-500 dark:text-rose-400">
                                {hideNumbers ? "••••••" : `₹${totalUsed.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="opacity-50 text-[10px] uppercase font-bold">Total Remaining</span>
                            <span className={`font-mono text-sm ${totalRemaining < 0 ? 'text-error' : 'text-success'}`}>
                                {hideNumbers ? "••••••" : (totalRemaining >= 0 ? `+₹${totalRemaining.toLocaleString()}` : `-₹${Math.abs(totalRemaining).toLocaleString()}`)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="opacity-50 text-[10px] uppercase font-bold">Overall Progress</span>
                        <span className={`font-mono text-sm ${getUsedPercentageColor(totalPercentage).text}`}>
                            {totalPercentage.toFixed(2)}%
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
                    <div
                        className={`fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
                            isClosingSubModal ? "opacity-0 pointer-events-none" : "opacity-100 animate-in fade-in duration-200"
                        }`}
                        style={{
                            backgroundColor: isSubDragging
                                ? `rgba(0, 0, 0, ${Math.max(0.15, 0.6 * (1 - subDragY / 500))})`
                                : undefined
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                handleCloseSubModal();
                            }
                        }}
                    >
                        <div
                            style={
                                isSubDragging || subDragY > 0
                                    ? { transform: `translateY(${subDragY}px)`, transition: 'none' }
                                    : { transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)' }
                            }
                            className={`bg-base-100 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden border border-base-300 ${
                                isClosingSubModal
                                    ? "mobile-drawer-slide-down md:animate-out md:fade-out md:zoom-out-95 duration-200"
                                    : (isSubDragging ? "" : "mobile-drawer-slide-up md:animate-in md:fade-in md:zoom-in-95 duration-200")
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Desktop Modal Header (hidden md:flex) */}
                            <div className="hidden md:flex p-5 border-b border-base-200 justify-between items-center bg-base-200/50">
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
                                    <button onClick={handleCloseSubModal} className="btn btn-sm btn-ghost btn-circle rounded-full">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Modal Drag Handle & Header (md:hidden) */}
                            <div
                                onTouchStart={onSubTouchStart}
                                onTouchMove={onSubTouchMove}
                                onTouchEnd={onSubTouchEnd}
                                className="md:hidden border-b border-base-200 bg-base-200/60 select-none touch-none cursor-grab active:cursor-grabbing"
                            >
                                {/* Top Grab Pill */}
                                <div className="pt-3 pb-1.5 px-4 flex justify-center items-center">
                                    <div className={`h-1.5 rounded-full transition-all duration-150 ${isSubDragging ? "w-16 bg-primary" : "w-12 bg-base-content/30"}`} />
                                </div>

                                <div className="px-3.5 pb-3.5 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`p-2 rounded-xl bg-base-100 border ${theme.border} ${theme.text} shrink-0`}>
                                                {React.cloneElement(theme.icon, { size: 16 })}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-sm text-base-content truncate">
                                                    {selectedSub?.name || "Subcategory"}
                                                </h3>
                                                <span className="text-[10px] opacity-60 font-medium block truncate">
                                                    {filteredList.length} of {subTxns.length} expenses • {category.name}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCloseSubModal}
                                            className="btn btn-xs btn-ghost btn-circle rounded-full shrink-0 text-base-content/60"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-base-100 border border-base-200/80 shadow-2xs">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Total Spent</span>
                                        <span className="font-mono text-xs font-black text-error">
                                            -₹{totalSubSpent.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Controls Bar (hidden md:flex) */}
                            <div className="hidden md:flex p-4 border-b border-base-200 bg-base-100 flex-row gap-3 items-center justify-between">
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

                            {/* Mobile Controls Bar (md:hidden) */}
                            <div className="md:hidden p-3 border-b border-base-200 bg-base-100 space-y-2">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search expenses..."
                                        value={subSearchTerm}
                                        onChange={(e) => setSubSearchTerm(e.target.value)}
                                        className="input input-xs h-8 select-bordered w-full pl-8 pr-7 bg-base-200/60 text-xs font-medium rounded-xl focus:bg-base-100 transition-colors"
                                    />
                                    {subSearchTerm && (
                                        <button
                                            onClick={() => setSubSearchTerm("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                                    <button
                                        onClick={() => setSubSortOrder(subSortOrder === "newest" ? "oldest" : "newest")}
                                        className="btn btn-xs rounded-lg font-bold gap-1 bg-base-200/80 border border-base-300 text-base-content/80 shrink-0 h-6.5 text-[10.5px]"
                                    >
                                        {subSortOrder === "newest" ? <ArrowDown size={11} className="text-primary" /> : <ArrowUp size={11} className="text-primary" />}
                                        <span>{subSortOrder === "newest" ? "Newest" : "Oldest"}</span>
                                    </button>

                                    {["10", "20", "all"].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setSubRowLimit(val)}
                                            className={`btn btn-xs rounded-lg font-bold shrink-0 h-6.5 text-[10.5px] ${subRowLimit === val ? "btn-neutral shadow-2xs" : "bg-base-200/60 border border-base-300 text-base-content/70"}`}
                                        >
                                            {val === "all" ? "All" : `${val}`}
                                        </button>
                                    ))}

                                    {hasSubColFilters && (
                                        <button
                                            onClick={clearSubColFilters}
                                            className="btn btn-xs btn-ghost border border-error/30 text-error hover:bg-error/10 rounded-lg font-bold gap-1 shrink-0 h-6.5 text-[10px]"
                                        >
                                            <X size={10} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Transactions Table & Mobile Feed */}
                            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 bg-base-200/25 sm:bg-transparent">
                                {filteredList.length > 0 ? (
                                    <>
                                        {/* Mobile Card Feed (< md) */}
                                        <div className="md:hidden space-y-2.5">
                                            {filteredList.map((t) => {
                                                const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
                                                const srcTagStyle = getSourceTagStyle(srcObj);

                                                return (
                                                    <div key={t._id || t.id} className="p-3.5 bg-base-100 rounded-2xl border border-base-content/15 dark:border-base-content/20 shadow-xs space-y-2.5 hover:border-base-content/30 transition-all">
                                                        <div className="flex items-start justify-between gap-2.5">
                                                            <span className="font-bold text-xs text-base-content leading-snug break-words flex-1">
                                                                {t.description || <span className="opacity-40 italic">No description</span>}
                                                            </span>
                                                            <span className="font-mono font-black text-sm text-error shrink-0">
                                                                -₹{Number(t.amount || 0).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-base-content/10 text-base-content/60">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                                                                    <Folder size={9} />
                                                                    <span>{selectedSub?.name || "Subcategory"}</span>
                                                                </span>
                                                                {srcObj && (
                                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold ${srcTagStyle.bg} ${srcTagStyle.text} border ${srcTagStyle.border}`}>
                                                                        <Wallet size={9} />
                                                                        <span>{srcObj.name}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="font-mono opacity-60 shrink-0">
                                                                {dayjs(t.date).format("DD MMM YYYY")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Desktop Table (hidden md:block) - 100% ORIGINAL */}
                                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-base-200 shadow-2xs">
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
                                </>
                            ) : (
                                <div className="p-12 text-center text-sm opacity-50 italic">
                                    No transactions found for {selectedSub?.name || "this subcategory"}.
                                </div>
                            )}
                        </div>

                        {/* Desktop Modal Footer (hidden md:flex) */}
                        <div className="hidden md:flex p-4 border-t border-base-200 bg-base-200/50 justify-between items-center text-xs">
                            <span className="font-semibold text-base-content/70">
                                Total Spent in {selectedSub?.name}: <strong className="font-mono font-bold text-error">₹{totalSubSpent.toLocaleString()}</strong>
                            </span>
                            <button onClick={handleCloseSubModal} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
                                Close
                            </button>
                        </div>

                        {/* Mobile Modal Footer (md:flex) */}
                        <div className="md:hidden p-3 border-t border-base-200 bg-base-100 flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                                <span className="text-[9.5px] uppercase font-bold text-base-content/50">Total</span>
                                <span className="font-mono text-xs font-black text-error">
                                    -₹{totalSubSpent.toLocaleString()}
                                </span>
                            </div>
                            <button onClick={handleCloseSubModal} className="btn btn-sm btn-primary rounded-xl font-bold px-6">
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
                    <div
                        className={`fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
                            isClosingCatModal ? "opacity-0 pointer-events-none" : "opacity-100 animate-in fade-in duration-200"
                        }`}
                        style={{
                            backgroundColor: isCatDragging
                                ? `rgba(0, 0, 0, ${Math.max(0.15, 0.6 * (1 - catDragY / 500))})`
                                : undefined
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                handleCloseCatModal();
                            }
                        }}
                    >
                        <div
                            style={
                                isCatDragging || catDragY > 0
                                    ? { transform: `translateY(${catDragY}px)`, transition: 'none' }
                                    : { transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)' }
                            }
                            className={`bg-base-100 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden border border-base-300 ${
                                isClosingCatModal
                                    ? "mobile-drawer-slide-down md:animate-out md:fade-out md:zoom-out-95 duration-200"
                                    : (isCatDragging ? "" : "mobile-drawer-slide-up md:animate-in md:fade-in md:zoom-in-95 duration-200")
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Desktop Modal Header (hidden md:flex) */}
                            <div className="hidden md:flex p-5 border-b border-base-200 justify-between items-center bg-base-200/50">
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
                                    <button onClick={handleCloseCatModal} className="btn btn-sm btn-ghost btn-circle rounded-full">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Modal Drag Handle & Header (md:hidden) */}
                            <div
                                onTouchStart={onCatTouchStart}
                                onTouchMove={onCatTouchMove}
                                onTouchEnd={onCatTouchEnd}
                                className="md:hidden border-b border-base-200 bg-base-200/60 select-none touch-none cursor-grab active:cursor-grabbing"
                            >
                                {/* Top Grab Pill */}
                                <div className="pt-3 pb-1.5 px-4 flex justify-center items-center">
                                    <div className={`h-1.5 rounded-full transition-all duration-150 ${isCatDragging ? "w-16 bg-primary" : "w-12 bg-base-content/30"}`} />
                                </div>

                                <div className="px-3.5 pb-3.5 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`p-2 rounded-xl bg-base-100 border ${theme.border} ${theme.text} shrink-0`}>
                                                {React.cloneElement(theme.icon, { size: 16 })}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-sm text-base-content truncate">
                                                    {category.name}
                                                </h3>
                                                <span className="text-[10px] opacity-60 font-medium block truncate">
                                                    {filteredList.length} of {catTxns.length} expenses
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCloseCatModal}
                                            className="btn btn-xs btn-ghost btn-circle rounded-full shrink-0 text-base-content/60"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-base-100 border border-base-200/80 shadow-2xs">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Total Spent</span>
                                        <span className="font-mono text-xs font-black text-error">
                                            -₹{totalCategorySpent.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Controls Bar (hidden md:flex) */}
                            <div className="hidden md:flex p-4 border-b border-base-200 bg-base-100 flex-row gap-3 items-center justify-between">
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

                            {/* Mobile Controls Bar (md:hidden) */}
                            <div className="md:hidden p-3 border-b border-base-200 bg-base-100 space-y-2">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search expenses..."
                                        value={catSearchTerm}
                                        onChange={(e) => setCatSearchTerm(e.target.value)}
                                        className="input input-xs h-8 select-bordered w-full pl-8 pr-7 bg-base-200/60 text-xs font-medium rounded-xl focus:bg-base-100 transition-colors"
                                    />
                                    {catSearchTerm && (
                                        <button
                                            onClick={() => setCatSearchTerm("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                                    <button
                                        onClick={() => setCatSortOrder(catSortOrder === "newest" ? "oldest" : "newest")}
                                        className="btn btn-xs rounded-lg font-bold gap-1 bg-base-200/80 border border-base-300 text-base-content/80 shrink-0 h-6.5 text-[10.5px]"
                                    >
                                        {catSortOrder === "newest" ? <ArrowDown size={11} className="text-primary" /> : <ArrowUp size={11} className="text-primary" />}
                                        <span>{catSortOrder === "newest" ? "Newest" : "Oldest"}</span>
                                    </button>

                                    {["10", "20", "all"].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setCatLimitCount(val)}
                                            className={`btn btn-xs rounded-lg font-bold shrink-0 h-6.5 text-[10.5px] ${catLimitCount === val ? "btn-neutral shadow-2xs" : "bg-base-200/60 border border-base-300 text-base-content/70"}`}
                                        >
                                            {val === "all" ? "All" : `${val}`}
                                        </button>
                                    ))}

                                    {/* Subcategory Dropdown Filter for Mobile */}
                                    <div className="dropdown dropdown-bottom">
                                        <button
                                            tabIndex={0}
                                            className={`btn btn-xs rounded-lg font-bold gap-1 shrink-0 h-6.5 text-[10.5px] ${catColFilters.subCategoryId ? 'btn-warning text-warning-content' : 'bg-base-200/60 border border-base-300 text-base-content/70'}`}
                                        >
                                            <Filter size={10} />
                                            <span>
                                                {catColFilters.subCategoryId ? (category.subCategories?.find(s => s._id === catColFilters.subCategoryId)?.name || "Sub") : "Subcategory"}
                                            </span>
                                        </button>
                                        <ul tabIndex={0} className="dropdown-content z-[99999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 font-medium text-xs normal-case max-h-56 overflow-y-auto">
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

                                    {hasCatColFilters && (
                                        <button
                                            onClick={clearCatColFilters}
                                            className="btn btn-xs btn-ghost border border-error/30 text-error hover:bg-error/10 rounded-lg font-bold gap-1 shrink-0 h-6.5 text-[10px]"
                                        >
                                            <X size={10} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Transactions Table & Mobile Feed */}
                            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 bg-base-200/25 sm:bg-transparent">
                                {filteredList.length > 0 ? (
                                    <>
                                        {/* Mobile Card Feed (< md) */}
                                        <div className="md:hidden space-y-2.5">
                                            {filteredList.map((t) => {
                                                const subName = t.subCategoryId?.name || category.subCategories?.find(s => s._id === (t.subCategoryId?._id || t.subCategoryId))?.name || "General";
                                                const srcObj = sources.find((s) => String(s._id) === String(t.sourceId?._id || t.sourceId));
                                                const srcTagStyle = getSourceTagStyle(srcObj);

                                                return (
                                                    <div key={t._id || t.id} className="p-3.5 bg-base-100 rounded-2xl border border-base-content/15 dark:border-base-content/20 shadow-xs space-y-2.5 hover:border-base-content/30 transition-all">
                                                        <div className="flex items-start justify-between gap-2.5">
                                                            <span className="font-bold text-xs text-base-content leading-snug break-words flex-1">
                                                                {t.description || <span className="opacity-40 italic">No description</span>}
                                                            </span>
                                                            <span className="font-mono font-black text-sm text-error shrink-0">
                                                                -₹{Number(t.amount || 0).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-base-content/10 text-base-content/60">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                                                                    <Folder size={9} />
                                                                    <span>{subName}</span>
                                                                </span>
                                                                {srcObj && (
                                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold ${srcTagStyle.bg} ${srcTagStyle.text} border ${srcTagStyle.border}`}>
                                                                        <Wallet size={9} />
                                                                        <span>{srcObj.name}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="font-mono opacity-60 shrink-0">
                                                                {dayjs(t.date).format("DD MMM YYYY")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Desktop Table (hidden md:block) - 100% ORIGINAL */}
                                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-base-200 shadow-2xs">
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
                                    </>
                                ) : (
                                    <div className="p-12 text-center text-sm opacity-50 italic">
                                        No transactions found for {category.name}.
                                    </div>
                                )}
                            </div>

                            {/* Desktop Modal Footer (hidden md:flex) */}
                            <div className="hidden md:flex p-4 border-t border-base-200 bg-base-200/50 justify-between items-center text-xs">
                                <span className="font-semibold text-base-content/70">
                                    Total Spent in {category.name}: <strong className="font-mono font-bold text-error">₹{totalCategorySpent.toLocaleString()}</strong>
                                </span>
                                <button onClick={handleCloseCatModal} className="btn btn-sm btn-primary rounded-xl font-bold px-5">
                                    Close
                                </button>
                            </div>

                            {/* Mobile Modal Footer (md:flex) */}
                            <div className="md:hidden p-3 border-t border-base-200 bg-base-100 flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[9.5px] uppercase font-bold text-base-content/50">Total</span>
                                    <span className="font-mono text-xs font-black text-error">
                                        -₹{totalCategorySpent.toLocaleString()}
                                    </span>
                                </div>
                                <button onClick={handleCloseCatModal} className="btn btn-sm btn-primary rounded-xl font-bold px-6">
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
