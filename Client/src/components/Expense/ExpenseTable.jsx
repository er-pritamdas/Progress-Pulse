import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { addTransaction, updateTransaction, deleteTransaction } from "../../services/redux/slice/ExpenseSlice";
import { getSourceTagStyle, getCategoryTagStyle } from "../../utils/expenseTheme";
import { Trash2, Save, X, Edit2, Plus, Handshake, AlertTriangle, Wallet, Tag, Folder, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Calendar, ArrowRightLeft, Sparkles, ChevronDown, Filter, Search } from "lucide-react";
import AddTransactionModal from "./AddTransactionModal";

// Helper Component for DaisyUI Dropdown
const DaisySelect = ({ value, onChange, options, placeholder, disabled, className }) => {
    const selectedItem = options.find(o => o.value === value);
    // Handle special "Add Money" label if selected
    const displayLabel = value === "add_money" ? "+ Add Money" : (value === "debit_money" ? "- Debit Money" : (selectedItem ? selectedItem.label : placeholder));
    const isSpecialSelected = value === "add_money" || value === "debit_money";
    const selectedStyle = selectedItem?.tagStyle;

    return (
        <div className={`dropdown dropdown-bottom dropdown-end w-full ${className || ''}`}>
            <div
                tabIndex={0}
                role="button"
                className={`btn btn-xs w-full justify-between font-medium text-xs border transition-all
                    ${disabled ? 'btn-disabled opacity-50' : ''}
                    ${isSpecialSelected
                        ? (value === "add_money" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold" : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 font-bold")
                        : (selectedStyle ? `${selectedStyle.bg} ${selectedStyle.text} border ${selectedStyle.border}` : "border-base-300 bg-base-100 hover:border-primary")}`}
            >
                <span className="truncate flex items-center gap-1.5 font-bold">
                    {selectedStyle && <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedStyle.swatch}`}></span>}
                    {!selectedStyle && selectedItem?.catObj && <Folder size={12} className="shrink-0" />}
                    {!selectedStyle && selectedItem?.sourceObj && <Wallet size={12} className="shrink-0" />}
                    {selectedItem?.isBank && <ArrowRightLeft size={12} className="shrink-0 text-amber-500" />}
                    <span className="truncate">{displayLabel}</span>
                </span>
                <span className="opacity-50 scale-75 shrink-0">▼</span>
            </div>
            {!disabled && (
                <ul tabIndex={0} className="dropdown-content z-[9999] p-1.5 shadow-2xl bg-base-100 backdrop-blur-md rounded-2xl w-72 max-h-60 overflow-y-auto overflow-x-hidden border border-base-200 text-xs flex flex-col flex-nowrap gap-1">
                    {options.map((opt, idx) => {
                        if (opt.disabled) {
                            if (opt.value === "divider") return <div key={`div-${idx}`} className="divider my-0.5 py-0 h-px"></div>;
                            return <li key={opt.key || idx} className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider px-2 py-1 list-none block w-full">{opt.label}</li>;
                        }

                        const isSelected = opt.value === value;
                        const optStyle = opt.tagStyle;

                        return (
                            <li key={opt.key || opt.value || idx} className="list-none block w-full">
                                <a
                                    className={`rounded-xl py-2 px-2.5 flex items-center justify-between font-semibold transition-all cursor-pointer w-full ${
                                        optStyle
                                            ? `${optStyle.bg} ${optStyle.text} border ${optStyle.border}`
                                            : "hover:bg-base-200"
                                    } ${isSelected ? "ring-2 ring-primary ring-offset-1 font-extrabold" : ""}`}
                                    onClick={(e) => {
                                        if (opt.value !== "divider") {
                                            onChange(opt.value);
                                            e.currentTarget.closest('.dropdown')?.removeAttribute('open');
                                            document.activeElement?.blur();
                                        }
                                    }}
                                >
                                    <span className="truncate flex items-center gap-2 max-w-full">
                                        {optStyle ? (
                                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${optStyle.swatch}`}></span>
                                        ) : (
                                            <>
                                                {opt.catObj && <Folder size={13} className="shrink-0" />}
                                                {opt.sourceObj && <Wallet size={13} className="shrink-0" />}
                                                {opt.isBank && <ArrowRightLeft size={13} className="shrink-0 text-amber-500" />}
                                            </>
                                        )}
                                        <span className="truncate">{opt.label}</span>
                                    </span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// Helper Component for Cally Calendar Dropdown Date Picker
const CallyDatePicker = ({ value, onChange, placeholder = "Select Date", className = "", size = "xs", showClear = false, onClear }) => {
    const formattedDisplay = value ? dayjs(value).format("MMM DD, YYYY") : placeholder;

    return (
        <div className={`dropdown dropdown-bottom ${className || ''}`}>
            <div
                tabIndex={0}
                role="button"
                className={`btn btn-${size} btn-outline border-base-300 w-full justify-between font-medium text-xs bg-base-100 normal-case`}
            >
                <span className="truncate flex items-center gap-1.5">
                    <Calendar size={13} className="shrink-0 text-primary/70" />
                    <span className="truncate">{formattedDisplay}</span>
                </span>
                <span className="flex items-center gap-1">
                    {showClear && value && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClear) onClear();
                                document.activeElement?.blur();
                            }}
                            className="text-error hover:scale-125 transition-transform font-bold text-sm px-0.5"
                            title="Clear Date"
                        >
                            ×
                        </span>
                    )}
                    <span className="opacity-50 text-[10px]">▼</span>
                </span>
            </div>
            <div tabIndex={0} className="dropdown-content z-[9999] bg-base-100 rounded-2xl shadow-2xl p-2 border border-base-200 mt-1 animate-in fade-in zoom-in-95 duration-150">
                <calendar-date
                    class="cally"
                    value={value || undefined}
                    onchange={(e) => {
                        if (e.target.value) {
                            onChange(e.target.value);
                            e.currentTarget.closest('.dropdown')?.removeAttribute('open');
                            document.activeElement?.blur();
                        }
                    }}
                >
                    <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <calendar-month></calendar-month>
                </calendar-date>
            </div>
        </div>
    );
};

const ExpenseTable = ({
    externalFilters,
    externalSetFilters,
    externalSortOrder,
    externalSetSortOrder,
    externalRowLimit,
    externalSetRowLimit,
    externalIsAddModalOpen,
    externalSetIsAddModalOpen
}) => {
    const dispatch = useDispatch();
    const { transactions, categories, sources, loading, currentMonth } = useSelector((state) => state.expense);

    // Fallback internal states
    const [internalSortOrder, setInternalSortOrder] = useState(() => {
        return localStorage.getItem("expense_sort_order") || "newest";
    });
    const [internalRowLimit, setInternalRowLimit] = useState("all");
    const [internalIsAddModalOpen, setInternalIsAddModalOpen] = useState(false);
    const [internalFilters, setInternalFilters] = useState({
        date: "",
        description: "",
        sourceId: "",
        categoryId: "",
        subCategoryId: ""
    });

    const filters = externalFilters || internalFilters;
    const setFilters = externalSetFilters || setInternalFilters;
    const sortOrder = externalSortOrder !== undefined ? externalSortOrder : internalSortOrder;
    const setSortOrder = externalSetSortOrder || setInternalSortOrder;
    const rowLimit = externalRowLimit !== undefined ? externalRowLimit : internalRowLimit;
    const setRowLimit = externalSetRowLimit || setInternalRowLimit;
    const isAddModalOpen = externalIsAddModalOpen !== undefined ? externalIsAddModalOpen : internalIsAddModalOpen;
    const setIsAddModalOpen = externalSetIsAddModalOpen || setInternalIsAddModalOpen;

    const [isTableFiltersOpen, setIsTableFiltersOpen] = useState(false);

    const monthCategories = categories.filter(c => !c.month || c.month === currentMonth);
    const selectedFilterCategoryObj = monthCategories.find(c => String(c._id) === String(filters.categoryId));
    const hasActiveFilters = Boolean(filters.date || filters.description || filters.sourceId || filters.categoryId || filters.subCategoryId);
    const clearFilters = () => {
        setFilters({
            date: "",
            description: "",
            sourceId: "",
            categoryId: "",
            subCategoryId: ""
        });
    };

    const handleSortChange = (newOrder) => {
        setSortOrder(newOrder);
        localStorage.setItem("expense_sort_order", newOrder);
    };

    // Render Source Tag Helper
    const renderSourceTag = (t) => {
        const sourceObj = t.sourceId;
        const sourceName = sourceObj?.name || (typeof sourceObj === 'string' ? sourceObj : 'Unknown');
        const style = getSourceTagStyle(sourceObj || sourceName, sources);
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${style.bg} ${style.text} border ${style.border} truncate max-w-full`} title={sourceName}>
                <Wallet size={12} className="shrink-0" />
                <span className="truncate">{sourceName}</span>
            </span>
        );
    };

    // Render Category Tag Helper
    const renderCategoryTag = (t) => {
        if (t.type === 'Transfer') {
            const targetObj = t.targetSourceId;
            const targetName = targetObj?.name || (typeof targetObj === 'string' ? targetObj : 'Bank');
            const style = getSourceTagStyle(targetObj || targetName, sources);
            return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${style.bg} ${style.text} border ${style.border} truncate max-w-full`} title={`Transfer to ${targetName}`}>
                    <ArrowRightLeft size={12} className="shrink-0" />
                    <span className="truncate">To: {targetName}</span>
                </span>
            );
        }
        if (t.type === 'Credit') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 truncate max-w-full">
                    <TrendingUp size={12} className="shrink-0 text-emerald-500" />
                    <span className="truncate">+ Add Money</span>
                </span>
            );
        }
        if (t.type === 'Debit' && !t.categoryId) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 truncate max-w-full">
                    <TrendingDown size={12} className="shrink-0 text-rose-500" />
                    <span className="truncate">- Debit Money</span>
                </span>
            );
        }
        const catObj = t.categoryId;
        const catName = catObj?.name || (typeof catObj === 'string' ? catObj : 'Uncategorized');
        const style = getCategoryTagStyle(catObj || catName, categories);
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${style.bg} ${style.text} border ${style.border} truncate max-w-full`} title={catName}>
                <Tag size={12} className="shrink-0" />
                <span className="truncate">{catName}</span>
            </span>
        );
    };

    // Editing State
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Delete Modal State
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const filteredTransactions = (() => {
        let list = transactions.filter(t => {
            const matchDate = filters.date ? dayjs(t.date).format("YYYY-MM-DD") === filters.date : true;
            const matchDesc = filters.description ? t.description.toLowerCase().includes(filters.description.toLowerCase()) : true;
            const matchSource = filters.sourceId ? (t.sourceId?._id === filters.sourceId || t.sourceId === filters.sourceId) : true;
            const matchCategory = filters.categoryId ? (t.categoryId?._id === filters.categoryId || t.categoryId === filters.categoryId) : true;
            const matchSub = filters.subCategoryId ? (t.subCategoryId?._id === filters.subCategoryId || t.subCategoryId === filters.subCategoryId) : true;
            return matchDate && matchDesc && matchSource && matchCategory && matchSub;
        });

        list.sort((a, b) => {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();

            if (timeA !== timeB) {
                return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
            }

            // Tie-breaker for identical dates based on updated/created timestamp
            const updateA = new Date(a.updatedAt || a.createdAt || a.date).getTime();
            const updateB = new Date(b.updatedAt || b.createdAt || b.date).getTime();

            return sortOrder === "newest" ? updateB - updateA : updateA - updateB;
        });

        if (rowLimit !== "all") {
            list = list.slice(0, Number(rowLimit));
        }

        return list;
    })();

    // Adding State
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        date: dayjs().format("YYYY-MM-DD"),
        description: "",
        sourceId: "", // ID
        targetSourceId: "", // ID
        categoryId: "", // ID
        subCategoryId: "", // ID
        amount: "",
        isAddMoney: false,
        isManualDebit: false,
        isTransfer: false,
        isReimbursable: false
    });

    // Categories filtered for currentMonth
    const currentMonthCategories = categories.filter(c => !c.month || c.month === currentMonth);

    // Helper to get Subcategories for a selected category
    const getSubCats = (catId) => {
        const cat = currentMonthCategories.find(c => c._id === catId);
        return cat ? cat.subCategories : [];
    };

    // Transactions filtered by currentMonth for budget remaining calculation
    const currentMonthTxns = transactions.filter(t => {
        if (!currentMonth || !t.date) return true;
        return dayjs(t.date).format("YYYY-MM") === currentMonth;
    });

    // Helper to get formatted Subcategory options with remaining budget & parent category style
    const getSubCatOptions = (catId) => {
        const cat = currentMonthCategories.find(c => c._id === catId);
        if (!cat || !cat.subCategories) return [];
        const catTagStyle = getCategoryTagStyle(cat, currentMonthCategories);
        return cat.subCategories.map(sub => {
            const subBudget = Number(sub.budget) || 0;
            const subUsed = currentMonthTxns
                .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (
                    t.subCategoryId?._id === sub._id ||
                    t.subCategoryId === sub._id ||
                    (t.categoryId === cat._id && t.description?.includes(sub.name))
                ))
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const rem = subBudget - subUsed;
            const formattedRem = rem >= 0 ? `₹${rem.toLocaleString()}` : `-₹${Math.abs(rem).toLocaleString()}`;
            return {
                value: sub._id,
                label: `${sub.name} (${formattedRem} Left)`,
                key: sub._id,
                tagStyle: catTagStyle,
                catObj: cat
            };
        });
    };

    // --- Options Builders ---
    const sourceOptions = [
        { value: "", label: "Select Source", disabled: true }, // Placeholder
        { value: "add_money", label: "+ Add Money", className: "text-success font-bold" },
        { value: "debit_money", label: "- Debit Money", className: "text-error font-bold" },
        { value: "divider", disabled: true },
        ...sources.map(s => {
            const amt = s.type === 'Card' && !s.balance && s.limit ? s.limit : (s.balance || 0);
            const tagStyle = getSourceTagStyle(s, sources);
            return {
                value: s._id,
                label: `${s.name} (₹${amt.toLocaleString()})`,
                key: s._id,
                tagStyle,
                sourceObj: s
            };
        })
    ];

    const editSourceOptions = sources.map(s => {
        const amt = s.type === 'Card' && !s.balance && s.limit ? s.limit : (s.balance || 0);
        const tagStyle = getSourceTagStyle(s, sources);
        return {
            value: s._id,
            label: `${s.name} (₹${amt.toLocaleString()})`,
            key: s._id,
            tagStyle,
            sourceObj: s
        };
    });

    const targetOptions = [
        ...sources.filter(s => s.type !== 'Card').map(s => {
            const tagStyle = getSourceTagStyle(s, sources);
            return {
                value: s._id,
                label: `${s.name} (₹${(s.balance || 0).toLocaleString()})`,
                key: s._id,
                tagStyle,
                sourceObj: s
            };
        })
    ];

    const categoryOptions = [
        { value: "header_cats", label: "── Expense Categories ──", disabled: true },
        ...currentMonthCategories.map(c => {
            const catBudget = (c.subCategories || []).reduce((sum, sub) => sum + (Number(sub.budget) || 0), 0);
            const catUsed = currentMonthTxns
                .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (t.categoryId?._id === c._id || t.categoryId === c._id))
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const rem = catBudget - catUsed;
            const formattedRem = rem >= 0 ? `₹${rem.toLocaleString()}` : `-₹${Math.abs(rem).toLocaleString()}`;
            const tagStyle = getCategoryTagStyle(c, currentMonthCategories);
            return {
                value: c._id,
                label: `${c.name} (${formattedRem} Left)`,
                key: c._id,
                tagStyle,
                catObj: c
            };
        }),
        { value: "divider", key: "divider_cats", disabled: true },
        { value: "header_banks", label: "── Transfer to Bank ──", disabled: true },
        ...sources.map(s => {
            const amt = s.type === 'Card' && !s.balance && s.limit ? s.limit : (s.balance || 0);
            const tagStyle = getSourceTagStyle(s, sources);
            return {
                value: `bank_${s._id}`,
                label: `↔ Transfer to: ${s.name} (₹${amt.toLocaleString()})`,
                key: `bank_${s._id}`,
                isBank: true,
                sourceObj: s,
                tagStyle
            };
        })
    ];

    // --- Handlers ---

    // Add Transaction
    const handleAdd = () => {
        if (!newData.description || !newData.sourceId || !newData.amount) {
            alert("Please fill required fields (Description, From Source, Amount)");
            return;
        }

        if (newData.isTransfer) {
            if (!newData.targetSourceId) {
                alert("Please select a target bank to transfer to");
                return;
            }
            if (newData.sourceId === newData.targetSourceId) {
                alert("From Bank and To Bank cannot be the same account");
                return;
            }
            dispatch(addTransaction({
                date: newData.date || new Date(),
                description: newData.description,
                sourceId: newData.sourceId,
                targetSourceId: newData.targetSourceId,
                amount: Number(newData.amount),
                type: "Transfer",
                isReimbursable: newData.isReimbursable
            }));
        } else if (newData.isAddMoney) {
            dispatch(addTransaction({
                date: newData.date || new Date(),
                description: newData.description,
                sourceId: newData.sourceId,
                amount: Number(newData.amount),
                type: "Credit",
                isReimbursable: newData.isReimbursable
            }));
        } else if (newData.isManualDebit) {
            dispatch(addTransaction({
                date: newData.date || new Date(),
                description: newData.description,
                sourceId: newData.sourceId,
                amount: Number(newData.amount),
                type: "Debit",
                isReimbursable: newData.isReimbursable
            }));
        } else {
            if (!newData.categoryId) {
                alert("Please select a Category or Bank");
                return;
            }
            dispatch(addTransaction({
                date: newData.date || new Date(),
                description: newData.description,
                sourceId: newData.sourceId,
                categoryId: newData.categoryId,
                subCategoryId: newData.subCategoryId || undefined,
                amount: Number(newData.amount),
                type: "Debit",
                isReimbursable: newData.isReimbursable
            }));
        }

        // Reset form
        setNewData({
            date: dayjs().format("YYYY-MM-DD"),
            description: "",
            sourceId: "",
            targetSourceId: "",
            categoryId: "",
            subCategoryId: "",
            amount: "",
            isAddMoney: false,
            isManualDebit: false,
            isTransfer: false,
            isReimbursable: false
        });
        setIsAdding(false);
    };

    // Edit Transaction
    const startEdit = (t) => {
        const isTrf = t.type === "Transfer";
        const catValue = isTrf ? `bank_${t.targetSourceId?._id || t.targetSourceId}` : (t.categoryId?._id || t.categoryId || "");
        setEditingId(t._id);
        setEditData({
            date: dayjs(t.date).format("YYYY-MM-DD"),
            description: t.description,
            sourceId: t.sourceId?._id || t.sourceId,
            targetSourceId: t.targetSourceId?._id || t.targetSourceId || "",
            categoryId: isTrf ? "" : (t.categoryId?._id || t.categoryId || ""),
            categoryOrToVal: catValue,
            subCategoryId: t.subCategoryId?._id || t.subCategoryId || "",
            amount: t.amount,
            type: t.type || "Debit",
            isTransfer: isTrf,
            isReimbursable: t.isReimbursable || false
        });
    };

    const saveEdit = () => {
        const isTrf = editData.isTransfer || editData.type === "Transfer";
        const srcId = typeof editData.sourceId === 'object' && editData.sourceId !== null ? editData.sourceId._id : editData.sourceId;
        const trgId = typeof editData.targetSourceId === 'object' && editData.targetSourceId !== null ? editData.targetSourceId._id : editData.targetSourceId;
        const catId = typeof editData.categoryId === 'object' && editData.categoryId !== null ? editData.categoryId._id : editData.categoryId;
        const subId = typeof editData.subCategoryId === 'object' && editData.subCategoryId !== null ? editData.subCategoryId._id : editData.subCategoryId;

        dispatch(updateTransaction({
            id: editingId,
            data: {
                date: editData.date,
                description: editData.description,
                sourceId: srcId,
                targetSourceId: isTrf ? trgId : null,
                categoryId: isTrf ? null : catId,
                subCategoryId: isTrf ? null : subId,
                amount: Number(editData.amount),
                type: isTrf ? "Transfer" : (editData.type || "Debit"),
                isReimbursable: editData.isReimbursable
            }
        }));
        setEditingId(null);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteTransaction(deleteId));
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteId(null);
    };


    if (loading && transactions.length === 0) return <div className="p-8 text-center opacity-50">Loading transactions...</div>;

    return (
        <div className="w-full bg-base-100 rounded-2xl shadow-lg border border-base-200 flex flex-col min-h-[500px]">

            {/* Sticky Header Section: Table Column Headers with Interactive Filter Dropdowns */}
            <div className="sticky top-0 z-30 bg-base-100 rounded-t-2xl shadow-sm backdrop-blur-md">
                
                {/* Table Header Row with Column Filter Dropdowns */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-base-200/90 border-b border-base-200 text-xs font-extrabold text-base-content/70 uppercase tracking-widest items-center">
                    
                    {/* 1. Date Header + Dropdown & Sort Order Toggle */}
                    <div className="col-span-2 flex items-center gap-1 relative">
                        <span>Date</span>

                        {/* Sort Order Toggle Icon */}
                        <button
                            onClick={() => handleSortChange(sortOrder === "newest" ? "oldest" : "newest")}
                            className="btn btn-xs btn-square btn-ghost opacity-60 hover:opacity-100"
                            title={`Sort Order: ${sortOrder === "newest" ? "New First (Click for Old First)" : "Old First (Click for New First)"}`}
                        >
                            {sortOrder === "newest" ? <ArrowDown size={11} className="text-primary" /> : <ArrowUp size={11} className="text-primary" />}
                        </button>

                        {/* Date Filter Dropdown */}
                        <div className="dropdown dropdown-bottom">
                            <button
                                tabIndex={0}
                                className={`btn btn-xs btn-square btn-ghost ${filters.date ? 'text-primary bg-primary/10' : 'opacity-40 hover:opacity-100'}`}
                                title="Filter Date"
                            >
                                <Filter size={11} />
                            </button>
                            <div tabIndex={0} className="dropdown-content z-[9999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 space-y-2 font-normal text-xs normal-case">
                                <label className="text-[10px] font-bold text-base-content/50 uppercase block">Filter by Date</label>
                                <input
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                    className="input input-xs input-bordered w-full rounded-lg font-medium"
                                />
                                {filters.date && (
                                    <button
                                        onClick={() => setFilters({ ...filters, date: "" })}
                                        className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                    >
                                        Clear Date
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Description Header + Dropdown */}
                    <div className="col-span-2 flex items-center gap-1.5 relative">
                        <span>Description</span>
                        <div className="dropdown dropdown-bottom">
                            <button
                                tabIndex={0}
                                className={`btn btn-xs btn-square btn-ghost ${filters.description ? 'text-primary bg-primary/10' : 'opacity-40 hover:opacity-100'}`}
                                title="Filter Description"
                            >
                                <Filter size={11} />
                            </button>
                            <div tabIndex={0} className="dropdown-content z-[9999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 space-y-2 font-normal text-xs normal-case">
                                <label className="text-[10px] font-bold text-base-content/50 uppercase block">Search Description</label>
                                <div className="relative">
                                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                                    <input
                                        type="text"
                                        placeholder="Search text..."
                                        value={filters.description}
                                        onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                                        className="input input-xs input-bordered w-full pl-7 font-medium rounded-lg"
                                    />
                                </div>
                                {filters.description && (
                                    <button
                                        onClick={() => setFilters({ ...filters, description: "" })}
                                        className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. From (Account) Header + Dropdown */}
                    <div className="col-span-2 flex items-center gap-1.5 relative">
                        <span className="text-blue-600 dark:text-blue-400">From</span>
                        <div className="dropdown dropdown-bottom">
                            <button
                                tabIndex={0}
                                className={`btn btn-xs btn-square btn-ghost ${filters.sourceId ? 'text-blue-600 bg-blue-500/10' : 'opacity-40 hover:opacity-100'}`}
                                title="Filter Account / Bank"
                            >
                                <Filter size={11} />
                            </button>
                            <ul tabIndex={0} className="dropdown-content z-[9999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-52 mt-1 font-medium text-xs normal-case max-h-56 overflow-y-auto">
                                <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Account</li>
                                <li>
                                    <a onClick={() => setFilters({ ...filters, sourceId: "" })} className={!filters.sourceId ? "font-bold text-primary" : ""}>
                                        All Accounts
                                    </a>
                                </li>
                                {sources.map((s) => (
                                    <li key={s._id}>
                                        <a onClick={() => setFilters({ ...filters, sourceId: s._id })} className={String(filters.sourceId) === String(s._id) ? "font-bold text-primary" : ""}>
                                            {s.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 4. Category / To Header + Dropdown */}
                    <div className="col-span-2 flex items-center gap-1.5 relative">
                        <span className="text-purple-600 dark:text-purple-400">Category / To</span>
                        <div className="dropdown dropdown-bottom">
                            <button
                                tabIndex={0}
                                className={`btn btn-xs btn-square btn-ghost ${filters.categoryId ? 'text-purple-600 bg-purple-500/10' : 'opacity-40 hover:opacity-100'}`}
                                title="Filter Category"
                            >
                                <Filter size={11} />
                            </button>
                            <ul tabIndex={0} className="dropdown-content z-[9999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 font-medium text-xs normal-case max-h-60 overflow-y-auto">
                                <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Category</li>
                                <li>
                                    <a onClick={() => setFilters({ ...filters, categoryId: "", subCategoryId: "" })} className={!filters.categoryId ? "font-bold text-primary" : ""}>
                                        All Categories
                                    </a>
                                </li>
                                {monthCategories.map((c) => (
                                    <li key={c._id}>
                                        <a onClick={() => setFilters({ ...filters, categoryId: c._id, subCategoryId: "" })} className={String(filters.categoryId) === String(c._id) ? "font-bold text-primary" : ""}>
                                            {c.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 5. Sub Category Header + Dropdown */}
                    <div className="col-span-2 flex items-center gap-1.5 relative">
                        <span className="text-amber-600 dark:text-amber-400">Sub Category</span>
                        <div className="dropdown dropdown-bottom">
                            <button
                                tabIndex={0}
                                className={`btn btn-xs btn-square btn-ghost ${filters.subCategoryId ? 'text-amber-600 bg-amber-500/10' : 'opacity-40 hover:opacity-100'}`}
                                title="Filter Sub Category"
                            >
                                <Filter size={11} />
                            </button>
                            <ul tabIndex={0} className="dropdown-content z-[9999] menu p-1.5 bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-56 mt-1 font-medium text-xs normal-case max-h-60 overflow-y-auto">
                                <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Sub Category</li>
                                <li>
                                    <a onClick={() => setFilters({ ...filters, subCategoryId: "" })} className={!filters.subCategoryId ? "font-bold text-primary" : ""}>
                                        All Sub Categories
                                    </a>
                                </li>
                                {(filters.categoryId
                                    ? getSubCatOptions(filters.categoryId)
                                    : categories.flatMap(c => getSubCatOptions(c._id))
                                ).map((sub) => (
                                    <li key={sub.value}>
                                        <a onClick={() => setFilters({ ...filters, subCategoryId: sub.value })} className={String(filters.subCategoryId) === String(sub.value) ? "font-bold text-primary" : ""}>
                                            {sub.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 6. Amount & Sort Controls Header */}
                    <div className="col-span-1 text-right flex items-center justify-end gap-1">
                        <span>Amount</span>
                        <button
                            onClick={() => handleSortChange(sortOrder === "newest" ? "oldest" : "newest")}
                            className="btn btn-xs btn-square btn-ghost opacity-60 hover:opacity-100"
                            title={`Sort Order: ${sortOrder === "newest" ? "New First" : "Old First"}`}
                        >
                            {sortOrder === "newest" ? <ArrowDown size={12} className="text-primary" /> : <ArrowUp size={12} className="text-primary" />}
                        </button>
                    </div>

                    {/* 7. Action Header & Reset All */}
                    <div className="col-span-1 text-center flex items-center justify-center gap-1">
                        <span>Action</span>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="btn btn-xs btn-circle btn-ghost text-error"
                                title="Reset All Filters"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 pb-40">
                {(() => {
                    const renderInlineAddRow = () => (
                        <div className={`transition-all duration-300 ${isAdding ? 'bg-base-200/30 py-4 px-4 border-b border-primary/20 z-20 relative' : 'p-2 border-b border-base-200/50 flex justify-center'}`}>
                            {isAdding ? (
                                <div className="grid grid-cols-12 gap-2 items-center animate-in fade-in slide-in-from-top-2 w-full">
                                    {/* Date & Reimbursable Toggle */}
                                    <div className="col-span-2 flex items-center gap-1">
                                        <button
                                            onClick={() => setNewData({ ...newData, isReimbursable: !newData.isReimbursable })}
                                            className={`btn btn-xs btn-square ${newData.isReimbursable ? 'btn-warning' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                                            title="Need to collect money? (Mark as Reimbursable)"
                                        >
                                            <Handshake size={14} />
                                        </button>
                                        <CallyDatePicker
                                            value={newData.date}
                                            onChange={(val) => setNewData({ ...newData, date: val })}
                                            placeholder="Select Date"
                                            size="sm"
                                            className="w-full"
                                        />
                                    </div>
                                    <input placeholder="Desc" value={newData.description} onChange={e => setNewData({ ...newData, description: e.target.value })} className="col-span-2 input input-sm input-bordered focus:input-primary w-full text-xs" autoFocus />

                                    {/* From / Action */}
                                    <div className="col-span-2">
                                        <DaisySelect
                                            options={sourceOptions}
                                            value={newData.isAddMoney ? "add_money" : (newData.isManualDebit ? "debit_money" : newData.sourceId)}
                                            placeholder="Source"
                                            onChange={(val) => {
                                                if (val === "add_money") {
                                                    setNewData({ ...newData, isAddMoney: true, isManualDebit: false, sourceId: "", categoryId: "", subCategoryId: "" });
                                                } else if (val === "debit_money") {
                                                    setNewData({ ...newData, isAddMoney: false, isManualDebit: true, sourceId: "", categoryId: "", subCategoryId: "" });
                                                } else {
                                                    setNewData({ ...newData, isAddMoney: false, isManualDebit: false, sourceId: val });
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Target / Category */}
                                    <div className="col-span-2">
                                        {newData.isAddMoney ? (
                                            <DaisySelect
                                                options={targetOptions}
                                                value={newData.sourceId}
                                                placeholder="Target"
                                                onChange={(val) => setNewData({ ...newData, sourceId: val })}
                                                className="text-success"
                                            />
                                        ) : newData.isManualDebit ? (
                                            <DaisySelect
                                                options={targetOptions}
                                                value={newData.sourceId}
                                                placeholder="Debit From"
                                                onChange={(val) => setNewData({ ...newData, sourceId: val })}
                                                className="text-error"
                                            />
                                        ) : (
                                            <DaisySelect
                                                options={categoryOptions}
                                                value={newData.isTransfer ? `bank_${newData.targetSourceId}` : newData.categoryId}
                                                placeholder="Category / To"
                                                onChange={(val) => {
                                                    if (val.startsWith("bank_")) {
                                                        const trgId = val.replace("bank_", "");
                                                        setNewData({
                                                            ...newData,
                                                            isTransfer: true,
                                                            targetSourceId: trgId,
                                                            categoryId: "",
                                                            subCategoryId: ""
                                                        });
                                                    } else {
                                                        setNewData({
                                                            ...newData,
                                                            isTransfer: false,
                                                            targetSourceId: "",
                                                            categoryId: val,
                                                            subCategoryId: ""
                                                        });
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Sub Cat */}
                                    <div className="col-span-2">
                                        <DaisySelect
                                            options={(newData.isAddMoney || newData.isManualDebit || newData.isTransfer) ? [] : getSubCatOptions(newData.categoryId)}
                                            value={newData.subCategoryId}
                                            placeholder={(newData.isAddMoney || newData.isManualDebit || newData.isTransfer) ? "—" : "SubCat"}
                                            disabled={newData.isAddMoney || newData.isManualDebit || newData.isTransfer}
                                            onChange={(val) => setNewData({ ...newData, subCategoryId: val })}
                                        />
                                    </div>

                                    {/* Amount */}
                                    <input type="number" placeholder="0.00" value={newData.amount} onChange={e => setNewData({ ...newData, amount: e.target.value })} className="col-span-1 input input-sm input-bordered focus:input-primary w-full text-xs text-right" />

                                    {/* Actions */}
                                    <div className="col-span-1 flex items-center justify-center gap-1">
                                        <button onClick={handleAdd} className="btn btn-sm btn-square btn-primary text-white" title="Save"><Save size={14} /></button>
                                        <button onClick={() => setIsAdding(false)} className="btn btn-sm btn-square btn-ghost text-error" title="Cancel"><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 px-2 py-1">
                                    <button onClick={() => setIsAdding(true)} className="btn btn-ghost btn-xs text-primary font-bold gap-1 hover:bg-primary/10 rounded-xl px-4">
                                        <Plus size={15} /> + Inline Add Transaction
                                    </button>
                                </div>
                            )}
                        </div>
                    );

                    return (
                        <>
                            {/* Top position when sortOrder is newest */}
                            {sortOrder === "newest" && renderInlineAddRow()}

                            {/* Rows */}
                            {filteredTransactions.map(t => (
                                <div key={t._id} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors group items-center text-sm relative">
                                    {editingId === t._id ? (
                                        // Edit Mode (Inline Inputs)
                                        <>
                                            <div className="col-span-2 flex items-center gap-1">
                                                <button
                                                    onClick={() => setEditData({ ...editData, isReimbursable: !editData.isReimbursable })}
                                                    className={`btn btn-xs btn-square ${editData.isReimbursable ? 'btn-warning' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                                                    title="Need to collect money? (Mark as Reimbursable)"
                                                >
                                                    <Handshake size={14} />
                                                </button>
                                                <CallyDatePicker
                                                    value={editData.date}
                                                    onChange={(val) => setEditData({ ...editData, date: val })}
                                                    placeholder="Select Date"
                                                    size="xs"
                                                    className="w-full"
                                                />
                                            </div>
                                            <input value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="col-span-2 input input-xs input-bordered" />

                                            <div className="col-span-2">
                                                <DaisySelect
                                                    options={editSourceOptions}
                                                    value={editData.sourceId}
                                                    placeholder="Source"
                                                    onChange={(val) => setEditData({ ...editData, sourceId: val })}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <DaisySelect
                                                    options={categoryOptions}
                                                    value={editData.isTransfer ? `bank_${editData.targetSourceId}` : editData.categoryId}
                                                    placeholder="Category / To"
                                                    onChange={(val) => {
                                                        if (val.startsWith("bank_")) {
                                                            const trgId = val.replace("bank_", "");
                                                            setEditData({
                                                                ...editData,
                                                                isTransfer: true,
                                                                type: "Transfer",
                                                                targetSourceId: trgId,
                                                                categoryId: "",
                                                                subCategoryId: ""
                                                            });
                                                        } else {
                                                            setEditData({
                                                                ...editData,
                                                                isTransfer: false,
                                                                type: "Debit",
                                                                targetSourceId: "",
                                                                categoryId: val,
                                                                subCategoryId: ""
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <DaisySelect
                                                    options={editData.isTransfer ? [] : getSubCatOptions(editData.categoryId)}
                                                    value={editData.subCategoryId}
                                                    placeholder={editData.isTransfer ? "—" : "SubCat"}
                                                    disabled={editData.isTransfer}
                                                    onChange={(val) => setEditData({ ...editData, subCategoryId: val })}
                                                />
                                            </div>

                                            <input type="number" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} className="col-span-1 input input-sm input-bordered w-full text-right" />

                                            <div className="col-span-1 flex items-center justify-center gap-1">
                                                <button onClick={saveEdit} className="btn btn-xs btn-square btn-success text-white"><Save size={12} /></button>
                                                <button onClick={() => setEditingId(null)} className="btn btn-xs btn-square btn-ghost text-error"><X size={12} /></button>
                                            </div>
                                        </>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="col-span-2 text-base-content/60 font-medium text-xs">{dayjs(t.date).format("ddd, MMM DD, YYYY")}</div>
                                            <div className="col-span-2">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        {t.isReimbursable && <Handshake size={12} className="text-warning" title="Reimbursable: Need to collect money" />}
                                                        <span className="font-bold text-base-content/80 truncate text-xs" title={t.description}>{t.description}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                {renderSourceTag(t)}
                                            </div>
                                            <div className="col-span-2">
                                                {renderCategoryTag(t)}
                                            </div>
                                            <div className="col-span-2">
                                                {(() => {
                                                    const catId = t.categoryId?._id || t.categoryId;
                                                    const subId = t.subCategoryId?._id || t.subCategoryId;
                                                    const cat = categories.find(c => c._id === catId);
                                                    const sub = cat?.subCategories?.find(s => s._id === subId);
                                                    if (!sub?.name) return <span className="text-base-content/40 text-xs">—</span>;
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 truncate max-w-full" title={sub.name}>
                                                            <Folder size={11} className="shrink-0 text-amber-500" />
                                                            <span className="truncate">{sub.name}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className={`col-span-1 text-right font-bold font-mono tracking-tight ${
                                                t.type === 'Transfer'
                                                    ? 'text-amber-500 dark:text-amber-400'
                                                    : (t.type === 'Credit' ? 'text-success' : 'text-error')
                                            }`}>
                                                {t.type === 'Transfer' ? '' : (t.type === 'Credit' ? '+' : '-')}₹{Number(t.amount || 0).toLocaleString()}
                                            </div>

                                            <div className="col-span-1 flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(t)} className="btn btn-xs btn-ghost btn-square text-info hover:bg-info/10" title="Edit Transaction"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(t._id)} className="btn btn-xs btn-ghost btn-square text-error hover:bg-error/10" title="Delete Transaction"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Bottom position when sortOrder is oldest */}
                            {sortOrder === "oldest" && renderInlineAddRow()}

                            {filteredTransactions.length === 0 && (
                                <div className="h-64 flex flex-col items-center justify-center text-base-content/30 italic">
                                    No transactions recorded for this period.
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-base-200 rounded-3xl shadow-2xl w-full max-w-sm h-[260px] flex flex-col justify-between overflow-hidden border border-base-300 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <div className="mx-auto mb-3 p-3 bg-error/10 rounded-full text-error w-fit">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-base-content mb-1">Delete Transaction?</h3>
                            <p className="text-sm text-base-content/60">
                                Are you sure you want to delete this transaction? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center pt-2">
                            <button onClick={cancelDelete} className="btn btn-sm btn-soft btn-warning flex-1 rounded-xl">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="btn btn-sm btn-soft btn-secondary flex-1 rounded-xl">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default ExpenseTable;
