import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { addTransaction, updateTransaction, deleteTransaction, setMonth, performUndo, performRedo } from "../../services/redux/slice/ExpenseSlice";
import { getSourceTagStyle, getCategoryTagStyle } from "../../utils/expenseTheme";
import { Trash2, Save, X, Edit2, Plus, PlusCircle, Handshake, AlertTriangle, Wallet, CreditCard, Tag, Folder, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Calendar, ArrowRightLeft, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Filter, Search, Undo2, Redo2, Eye, EyeOff, SlidersHorizontal, Info, ArrowUpRight, Zap, Layers } from "lucide-react";
import AddTransactionModal from "./AddTransactionModal";
import TransactionInfoModal from "./TransactionInfoModal";
import { evaluateMathExpression } from "../../utils/mathExpression";

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
                    {!selectedStyle && selectedItem?.sourceObj && (selectedItem?.sourceObj?.type === 'Card' ? <CreditCard size={12} className="shrink-0 text-rose-500" /> : <Wallet size={12} className="shrink-0" />)}
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
                                                {opt.sourceObj && (opt.sourceObj.type === 'Card' ? <CreditCard size={13} className="shrink-0 text-rose-500" /> : <Wallet size={13} className="shrink-0" />)}
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
    externalSetIsAddModalOpen,
    onOpenHeatmap
}) => {
    const dispatch = useDispatch();
    const { transactions, categories, sources, loading, currentMonth, undoStack = [], redoStack = [] } = useSelector((state) => state.expense);

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

    const headerRef = useRef(null);
    const bodyRef = useRef(null);
    const upperHeaderRef = useRef(null);
    const [headerStickyTop, setHeaderStickyTop] = useState(115);

    useEffect(() => {
        if (!upperHeaderRef.current) return;
        const updateStickyTop = () => {
            if (upperHeaderRef.current) {
                const h = upperHeaderRef.current.offsetHeight;
                setHeaderStickyTop(Math.max(0, h - 17));
            }
        };
        updateStickyTop();
        const ro = new ResizeObserver(updateStickyTop);
        ro.observe(upperHeaderRef.current);
        window.addEventListener("resize", updateStickyTop);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", updateStickyTop);
        };
    }, []);

    const handleBodyScroll = (e) => {
        if (headerRef.current) {
            headerRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

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

    // Day Collapsible Grouping State
    const [collapsedDays, setCollapsedDays] = useState({});

    const toggleDayCollapse = (dateKey) => {
        setCollapsedDays(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    // Header Display Settings State (Default: show only Total Txn count and Net total)
    const DEFAULT_HEADER_SETTINGS = {
        showTotalTxn: true,
        showNet: true,
        showCreditCount: false,
        showDebitCount: false,
        showCreditAmt: false,
        showDebitAmt: false,
    };

    const [headerSettings, setHeaderSettings] = useState(() => {
        try {
            const saved = localStorage.getItem("expense_header_metrics");
            if (saved) {
                return { ...DEFAULT_HEADER_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (e) {}
        return DEFAULT_HEADER_SETTINGS;
    });

    const updateHeaderSettings = (key, value) => {
        const updated = { ...headerSettings, [key]: value };
        setHeaderSettings(updated);
        try {
            localStorage.setItem("expense_header_metrics", JSON.stringify(updated));
        } catch (e) {}
    };

    // Modal Popup State for Header Display Settings
    const [showHeaderSettingsModal, setShowHeaderSettingsModal] = useState(false);

    // Modal Popup State for Transaction Info / Notes
    const [infoModalTx, setInfoModalTx] = useState(null);

    // Interactive Month & Year Dropdown Picker State
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(() => dayjs(currentMonth).year());
    const monthPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
                setIsMonthPickerOpen(false);
            }
        };
        if (isMonthPickerOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMonthPickerOpen]);

    useEffect(() => {
        if (currentMonth) {
            setPickerYear(dayjs(currentMonth).year());
        }
    }, [currentMonth]);

    // Fixed Floating Column Filter Popover State
    const [activeFilterMenu, setActiveFilterMenu] = useState(null);

    const handleToggleFilterMenu = (e, type) => {
        e.stopPropagation();
        if (activeFilterMenu?.type === type) {
            setActiveFilterMenu(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setActiveFilterMenu({
                type,
                top: rect.bottom + 6,
                left: Math.min(rect.left, window.innerWidth - 250)
            });
        }
    };

    useEffect(() => {
        const handleClose = () => setActiveFilterMenu(null);
        if (activeFilterMenu) {
            window.addEventListener("click", handleClose);
            window.addEventListener("scroll", handleClose, true);
        }
        return () => {
            window.removeEventListener("click", handleClose);
            window.removeEventListener("scroll", handleClose, true);
        };
    }, [activeFilterMenu]);
    const sortOrder = externalSortOrder !== undefined ? externalSortOrder : internalSortOrder;
    const setSortOrder = externalSetSortOrder || setInternalSortOrder;
    const rowLimit = externalRowLimit !== undefined ? externalRowLimit : internalRowLimit;
    const setRowLimit = externalSetRowLimit || setInternalRowLimit;
    const isAddModalOpen = externalIsAddModalOpen !== undefined ? externalIsAddModalOpen : internalIsAddModalOpen;
    const setIsAddModalOpen = externalSetIsAddModalOpen || setInternalIsAddModalOpen;

    const [isTableFiltersOpen, setIsTableFiltersOpen] = useState(false);

    const monthCategories = useMemo(() => {
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
    const selectedFilterCategoryObj = monthCategories.find(c => String(c._id) === String(filters.categoryId));
    const hasActiveFilters = Boolean(filters.date || filters.description || filters.sourceId || filters.categoryId || filters.subCategoryId || filters.type);
    const clearFilters = () => {
        setFilters({
            date: "",
            description: "",
            sourceId: "",
            categoryId: "",
            subCategoryId: "",
            type: ""
        });
    };

    const handleSortChange = (newOrder) => {
        setSortOrder(newOrder);
        localStorage.setItem("expense_sort_order", newOrder);
    };

    // Render Source Tag Helper
    const renderSourceTag = (t, isSmall = false) => {
        const px = isSmall ? "px-1.5 py-0.5 text-[10px] font-bold" : "px-2.5 py-1 text-xs font-semibold";
        const iconSize = isSmall ? 10 : 12;
        if (t.type === 'Credit') {
            return (
                <span className={`inline-flex items-center gap-1 ${px} rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap shrink-0 max-w-full`}>
                    <TrendingUp size={iconSize} className="shrink-0 text-emerald-500" />
                    <span className="truncate">+ Add Money</span>
                </span>
            );
        }
        if (t.type === 'Debit' && !t.categoryId) {
            return (
                <span className={`inline-flex items-center gap-1 ${px} rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 whitespace-nowrap shrink-0 max-w-full`}>
                    <TrendingDown size={iconSize} className="shrink-0 text-rose-500" />
                    <span className="truncate">- Debit Money</span>
                </span>
            );
        }
        const sourceObj = t.sourceId;
        const sourceName = sourceObj?.name || (typeof sourceObj === 'string' ? sourceObj : 'Unknown');
        const style = getSourceTagStyle(sourceObj || sourceName, sources);
        const isCard = sourceObj?.type === 'Card';
        return (
            <span className={`inline-flex items-center gap-1 ${px} rounded-md ${style.bg} ${style.text} border ${style.border} whitespace-nowrap shrink-0 max-w-[120px]`} title={sourceName}>
                {isCard ? <CreditCard size={iconSize} className="shrink-0 text-rose-500" /> : <Wallet size={iconSize} className="shrink-0" />}
                <span className="truncate">{sourceName}</span>
            </span>
        );
    };

    // Render Category Tag Helper
    const renderCategoryTag = (t, isSmall = false) => {
        const px = isSmall ? "px-1.5 py-0.5 text-[10px] font-bold" : "px-2.5 py-1 text-xs font-semibold";
        const iconSize = isSmall ? 10 : 12;
        if (t.type === 'Transfer') {
            const targetObj = t.targetSourceId;
            const targetName = targetObj?.name || (typeof targetObj === 'string' ? targetObj : 'Bank');
            const style = getSourceTagStyle(targetObj || targetName, sources);
            return (
                <span className={`inline-flex items-center gap-1 ${px} rounded-md ${style.bg} ${style.text} border ${style.border} whitespace-nowrap shrink-0 max-w-[120px]`} title={`Transfer to ${targetName}`}>
                    <ArrowRightLeft size={iconSize} className="shrink-0" />
                    <span className="truncate">To: {targetName}</span>
                </span>
            );
        }
        if (t.type === 'Credit') {
            const sourceObj = t.sourceId;
            const sourceName = sourceObj?.name || (typeof sourceObj === 'string' ? sourceObj : 'Bank');
            const style = getSourceTagStyle(sourceObj || sourceName, sources);
            return (
                <span className={`inline-flex items-center gap-1 ${px} rounded-md ${style.bg} ${style.text} border ${style.border} whitespace-nowrap shrink-0 max-w-[120px]`} title={`Added to ${sourceName}`}>
                    <Wallet size={iconSize} className="shrink-0 text-emerald-500" />
                    <span className="truncate">To: {sourceName}</span>
                </span>
            );
        }
        if (t.type === 'Debit' && !t.categoryId) {
            const sourceObj = t.sourceId;
            const sourceName = sourceObj?.name || (typeof sourceObj === 'string' ? sourceObj : 'Bank');
            const style = getSourceTagStyle(sourceObj || sourceName, sources);
            return (
                <span className={`inline-flex items-center gap-1 ${px} rounded-md ${style.bg} ${style.text} border ${style.border} whitespace-nowrap shrink-0 max-w-[120px]`} title={`Debited from ${sourceName}`}>
                    <Wallet size={iconSize} className="shrink-0 text-rose-500" />
                    <span className="truncate">From: {sourceName}</span>
                </span>
            );
        }
        const catObj = t.categoryId;
        const catName = catObj?.name || (typeof catObj === 'string' ? catObj : '-');
        const style = getCategoryTagStyle(catObj || catName, categories);
        return (
            <span className={`inline-flex items-center gap-1 ${px} rounded-md ${style.bg} ${style.text} border ${style.border} whitespace-nowrap shrink-0 max-w-[120px]`} title={catName}>
                <Tag size={iconSize} className="shrink-0" />
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
            const matchDesc = filters.description ? (
                t.description.toLowerCase().includes(filters.description.toLowerCase()) ||
                String(t.amount || "").includes(filters.description)
            ) : true;
            const matchSource = filters.sourceId ? (t.sourceId?._id === filters.sourceId || t.sourceId === filters.sourceId) : true;
            const matchCategory = filters.categoryId ? (t.categoryId?._id === filters.categoryId || t.categoryId === filters.categoryId) : true;
            const matchSub = filters.subCategoryId ? (t.subCategoryId?._id === filters.subCategoryId || t.subCategoryId === filters.subCategoryId) : true;
            const matchType = filters.type ? (
                filters.type === 'Reimbursable' ? Boolean(t.isReimbursable) : t.type === filters.type
            ) : true;
            return matchDate && matchDesc && matchSource && matchCategory && matchSub && matchType;
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

    const groupedTransactions = useMemo(() => {
        const groups = [];
        const map = new Map();

        filteredTransactions.forEach((t) => {
            const dateKey = dayjs(t.date).format("YYYY-MM-DD");
            if (!map.has(dateKey)) {
                const groupObj = {
                    dateKey,
                    dateObj: t.date,
                    transactions: [],
                    totalCredit: 0,
                    totalDebit: 0,
                    creditCount: 0,
                    debitCount: 0,
                    netAmount: 0
                };
                map.set(dateKey, groupObj);
                groups.push(groupObj);
            }
            const group = map.get(dateKey);
            group.transactions.push(t);
            const amt = Number(t.amount || 0);
            if (t.type === 'Credit') {
                group.totalCredit += amt;
                group.creditCount += 1;
                group.netAmount += amt;
            } else if (t.type === 'Debit') {
                group.totalDebit += amt;
                group.debitCount += 1;
                group.netAmount -= amt;
            }
        });

        return groups;
    }, [filteredTransactions]);

    const isAllCollapsed = groupedTransactions.length > 0 && groupedTransactions.every(g => collapsedDays[g.dateKey]);

    const toggleCollapseAll = () => {
        if (isAllCollapsed) {
            setCollapsedDays({});
        } else {
            const newMap = {};
            groupedTransactions.forEach(g => {
                newMap[g.dateKey] = true;
            });
            setCollapsedDays(newMap);
        }
    };

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

    const calculatedNewAmount = evaluateMathExpression(newData.amount);
    const calculatedEditAmount = evaluateMathExpression(editData.amount);

    // Global Keyboard Bindings:
    // 'Ctrl+Z' : Undo (up to 5 steps)
    // 'Ctrl+Y' / 'Ctrl+Shift+Z' : Redo
    // 'I' : Inline add Transaction
    // 'M' : Modal Transaction
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCtrl = isMac ? e.metaKey : e.ctrlKey;

            const activeTag = document.activeElement?.tagName?.toLowerCase();
            const isEditable = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || document.activeElement?.isContentEditable;

            if (isCtrl) {
                const key = e.key.toLowerCase();
                if ((e.shiftKey && key === 'z') || key === 'y') {
                    if (isEditable && !e.target.dataset.allowGlobalShortcuts) return;
                    e.preventDefault();
                    dispatch(performRedo());
                    return;
                } else if (key === 'z' && !e.shiftKey) {
                    if (isEditable && !e.target.dataset.allowGlobalShortcuts) return;
                    e.preventDefault();
                    dispatch(performUndo());
                    return;
                }
            }

            if (isEditable) return;

            if (e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                setIsAdding(true);
            } else if (e.key === 'm' || e.key === 'M') {
                e.preventDefault();
                setIsAddModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, setIsAdding, setIsAddModalOpen]);

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
                    String(t.subCategoryId?._id || t.subCategoryId || "") === String(sub._id)
                ))
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const rem = (subBudget - subUsed) === 0 ? 0 : (subBudget - subUsed);
            const formattedRem = rem >= 0 ? `₹${rem.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : `-₹${Math.abs(rem).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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
    // Helper to calculate card due amount
    const getCardDueAmount = (source, txList = []) => {
        if (!source || source.type !== 'Card') return 0;
        if (source.cardDue !== undefined && source.cardDue !== null && Number(source.cardDue) > 0) return Number(source.cardDue);
        const bal = Number(source.balance) || 0;
        if (bal < 0) return Math.abs(bal);
        if (source.cardDue !== undefined && source.cardDue !== null) return Number(source.cardDue);
        const cardDebits = txList
            .filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(source._id))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const cardCredits = txList
            .filter(t => (t.type === 'Credit' || t.type === 'Transfer') && (
                String(t.targetSourceId?._id || t.targetSourceId) === String(source._id) ||
                String(t.sourceId?._id || t.sourceId) === String(source._id)
            ))
            .reduce((sum, t) => {
                if (t.type === 'Credit' && String(t.sourceId?._id || t.sourceId) === String(source._id)) {
                    return sum + (Number(t.amount) || 0);
                }
                if (t.type === 'Transfer' && String(t.targetSourceId?._id || t.targetSourceId) === String(source._id)) {
                    return sum + (Number(t.amount) || 0);
                }
                return sum;
            }, 0);

        const due = cardDebits - cardCredits;
        return due > 0 ? due : 0;
    };

    const sourceOptions = [
        { value: "", label: "Select Source", disabled: true }, // Placeholder
        { value: "add_money", label: "+ Add Money", className: "text-success font-bold" },
        { value: "debit_money", label: "- Debit Money", className: "text-error font-bold" },
        { value: "divider", disabled: true },
        ...sources.map(s => {
            const isCard = s.type === 'Card';
            const cardDue = isCard ? getCardDueAmount(s, transactions) : 0;
            const amt = isCard ? cardDue : (s.balance || 0);
            const tagStyle = getSourceTagStyle(s, sources);
            const formattedAmt = isCard
                ? `Due: ₹${cardDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : (amt < 0
                    ? `-₹${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            return {
                value: s._id,
                label: `${s.name} (${formattedAmt})`,
                key: s._id,
                tagStyle,
                sourceObj: s,
                isCard
            };
        })
    ];

    const targetOptions = [
        ...sources.map(s => {
            const isCard = s.type === 'Card';
            const cardDue = isCard ? getCardDueAmount(s, transactions) : 0;
            const amt = isCard ? cardDue : (s.balance || 0);
            const tagStyle = getSourceTagStyle(s, sources);
            const formattedAmt = isCard
                ? `Due: ₹${cardDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : (amt < 0
                    ? `-₹${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            return {
                value: s._id,
                label: `${s.name} (${formattedAmt})`,
                key: s._id,
                tagStyle,
                sourceObj: s,
                isCard
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
            const formattedRem = rem >= 0 ? `₹${rem.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-₹${Math.abs(rem).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            const isCard = s.type === 'Card';
            const cardDue = isCard ? getCardDueAmount(s, transactions) : 0;
            const amt = isCard ? cardDue : (s.balance || 0);
            const tagStyle = getSourceTagStyle(s, sources);
            const formattedAmt = isCard
                ? `Due: ₹${cardDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : (amt < 0
                    ? `-₹${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            return {
                value: `bank_${s._id}`,
                label: `↔ Transfer to: ${s.name} (${formattedAmt})`,
                key: `bank_${s._id}`,
                isBank: true,
                sourceObj: s,
                tagStyle,
                isCard
            };
        })
    ];

    // --- Handlers ---

    // Add Transaction
    const handleAdd = () => {
        const parsedAmount = evaluateMathExpression(newData.amount) ?? (Number(newData.amount) || 0);
        if (!newData.description || !newData.amount || parsedAmount <= 0) {
            alert("Please fill required fields (Description and valid positive Amount)");
            return;
        }

        if (newData.isTransfer) {
            if (!newData.sourceId || !newData.targetSourceId) {
                alert("Please select both From Bank and Target Bank for transfer");
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
                amount: parsedAmount,
                type: "Transfer",
                isReimbursable: newData.isReimbursable
            }));
        } else if (newData.isAddMoney) {
            if (!newData.sourceId) {
                alert("Please select a target bank account to add money to");
                return;
            }
            dispatch(addTransaction({
                date: newData.date || new Date(),
                description: newData.description,
                sourceId: newData.sourceId,
                amount: parsedAmount,
                type: "Credit",
                isReimbursable: newData.isReimbursable
            }));
        } else if (newData.isManualDebit) {
            if (!newData.sourceId) {
                alert("Please select a bank account to debit from");
                return;
            }
            dispatch(addTransaction({
                date: newData.date || new Date(),
                description: newData.description,
                sourceId: newData.sourceId,
                amount: parsedAmount,
                type: "Debit",
                isReimbursable: newData.isReimbursable
            }));
        } else {
            if (!newData.sourceId) {
                alert("Please select a From payment source");
                return;
            }
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
                amount: parsedAmount,
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
        const isAdd = t.type === "Credit";
        const isManDebit = t.type === "Debit" && !t.categoryId;
        const isTrf = t.type === "Transfer";
        const catValue = isTrf ? `bank_${t.targetSourceId?._id || t.targetSourceId}` : (t.categoryId?._id || t.categoryId || "");
        setEditingId(t._id);
        setEditData({
            date: dayjs(t.date).format("YYYY-MM-DD"),
            description: t.description,
            sourceId: t.sourceId?._id || t.sourceId,
            targetSourceId: t.targetSourceId?._id || t.targetSourceId || "",
            categoryId: (isTrf || isAdd || isManDebit) ? "" : (t.categoryId?._id || t.categoryId || ""),
            categoryOrToVal: catValue,
            subCategoryId: (isTrf || isAdd || isManDebit) ? "" : (t.subCategoryId?._id || t.subCategoryId || ""),
            amount: t.amount,
            type: t.type || "Debit",
            isAddMoney: isAdd,
            isManualDebit: isManDebit,
            isTransfer: isTrf,
            isReimbursable: t.isReimbursable || false
        });
    };

    const saveEdit = () => {
        const parsedAmount = evaluateMathExpression(editData.amount) ?? (Number(editData.amount) || 0);
        const isAdd = editData.isAddMoney || editData.type === "Credit";
        const isManDebit = editData.isManualDebit || (editData.type === "Debit" && !editData.categoryId && !editData.isTransfer && !editData.isAddMoney);
        const isTrf = editData.isTransfer || editData.type === "Transfer";

        const srcId = typeof editData.sourceId === 'object' && editData.sourceId !== null ? editData.sourceId._id : editData.sourceId;
        const trgId = typeof editData.targetSourceId === 'object' && editData.targetSourceId !== null ? editData.targetSourceId._id : editData.targetSourceId;
        const catId = typeof editData.categoryId === 'object' && editData.categoryId !== null ? editData.categoryId._id : editData.categoryId;
        const subId = typeof editData.subCategoryId === 'object' && editData.subCategoryId !== null ? editData.subCategoryId._id : editData.subCategoryId;

        if (!editData.description || !editData.amount || parsedAmount <= 0) {
            alert("Please fill required fields (Description and valid positive Amount)");
            return;
        }

        if (isAdd) {
            if (!srcId) {
                alert("Please select a target bank account to add money to");
                return;
            }
            dispatch(updateTransaction({
                id: editingId,
                data: {
                    date: editData.date,
                    description: editData.description,
                    sourceId: srcId,
                    targetSourceId: null,
                    categoryId: null,
                    subCategoryId: null,
                    amount: parsedAmount,
                    type: "Credit",
                    isReimbursable: editData.isReimbursable
                }
            }));
        } else if (isManDebit) {
            if (!srcId) {
                alert("Please select a bank account to debit from");
                return;
            }
            dispatch(updateTransaction({
                id: editingId,
                data: {
                    date: editData.date,
                    description: editData.description,
                    sourceId: srcId,
                    targetSourceId: null,
                    categoryId: null,
                    subCategoryId: null,
                    amount: parsedAmount,
                    type: "Debit",
                    isReimbursable: editData.isReimbursable
                }
            }));
        } else if (isTrf) {
            if (!srcId || !trgId) {
                alert("Please select both From Bank and Target Bank for transfer");
                return;
            }
            if (srcId === trgId) {
                alert("From Bank and To Bank cannot be the same account");
                return;
            }
            dispatch(updateTransaction({
                id: editingId,
                data: {
                    date: editData.date,
                    description: editData.description,
                    sourceId: srcId,
                    targetSourceId: trgId,
                    categoryId: null,
                    subCategoryId: null,
                    amount: parsedAmount,
                    type: "Transfer",
                    isReimbursable: editData.isReimbursable
                }
            }));
        } else {
            if (!srcId) {
                alert("Please select a From payment source");
                return;
            }
            if (!catId) {
                alert("Please select a Category or Bank");
                return;
            }
            dispatch(updateTransaction({
                id: editingId,
                data: {
                    date: editData.date,
                    description: editData.description,
                    sourceId: srcId,
                    targetSourceId: null,
                    categoryId: catId,
                    subCategoryId: subId || null,
                    amount: parsedAmount,
                    type: "Debit",
                    isReimbursable: editData.isReimbursable
                }
            }));
        }
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


    if (loading && transactions.length === 0) {
        return (
            <div className="w-full bg-base-100 rounded-2xl shadow-lg border border-base-200 p-16 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="w-full bg-base-100 rounded-2xl shadow-lg border border-base-200 flex flex-col min-h-[500px]">

            {/* Unified Sticky Glass Header Section: Month Selector Banner + Table Column Headers */}
            <div ref={upperHeaderRef} className="sticky top-[-17px] -mt-5 pt-5 z-40 bg-base-100/90 dark:bg-base-900/90 backdrop-blur-2xl border-b border-base-200/80 shadow-md rounded-t-2xl transition-all">
                
                {/* Desktop Upper Header: Current Period Banner & Navigation Controls */}
                <div className="hidden lg:flex p-4 flex-row items-center justify-between gap-3 border-b border-base-200/50 bg-base-100/40 dark:bg-base-900/40">
                    {/* Period Header & Title */}
                    <div className="flex items-center gap-3">
                        <div
                            onClick={onOpenHeatmap}
                            className={`p-2.5 rounded-xl bg-primary/10 text-primary ${onOpenHeatmap ? 'cursor-pointer hover:bg-primary/20 transition-all hover:scale-105 shadow-xs' : ''}`}
                            title={onOpenHeatmap ? "Open Spending Calendar" : ""}
                        >
                            <Calendar size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest">
                                    Current Period
                                </h3>
                                <button
                                    onClick={toggleHideNumbers}
                                    className="btn btn-xs btn-ghost btn-circle text-base-content/60 hover:text-primary transition-colors h-5 w-5 min-h-0"
                                    title={hideNumbers ? "Show numbers on page" : "Hide all numbers (Privacy Mode)"}
                                >
                                    {hideNumbers ? <EyeOff size={13} className="text-primary font-bold" /> : <Eye size={13} />}
                                </button>
                            </div>
                            <div className="flex items-center gap-1 relative" ref={monthPickerRef}>
                                <button
                                    type="button"
                                    onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
                                    className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/70 hover:text-primary hover:bg-base-200 cursor-pointer"
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {/* Interactive Month & Year Dropdown Trigger */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPickerYear(dayjs(currentMonth).year());
                                        setIsMonthPickerOpen((prev) => !prev);
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl hover:bg-base-200 text-base-content font-sans text-xl font-extrabold tracking-wide transition-all group cursor-pointer select-none"
                                    title="Click to choose Month & Year"
                                >
                                    <span>{dayjs(currentMonth).format("MMMM YYYY")}</span>
                                    <ChevronDown size={15} className={`text-primary/70 transition-transform duration-200 ${isMonthPickerOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
                                    className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/70 hover:text-primary hover:bg-base-200 cursor-pointer"
                                    title="Next Month"
                                >
                                    <ChevronRight size={16} />
                                </button>

                                {onOpenHeatmap && (
                                    <button
                                        type="button"
                                        onClick={onOpenHeatmap}
                                        className="btn btn-xs btn-ghost btn-circle text-primary/70 hover:text-primary hover:bg-primary/10 ml-0.5 cursor-pointer"
                                        title="Open Spending Calendar Heatmap"
                                    >
                                        <ArrowUpRight size={15} />
                                    </button>
                                )}

                                {/* Interactive Month & Year Dropdown Popover */}
                                {isMonthPickerOpen && (
                                    <div className="absolute top-full left-0 mt-2 z-[999] w-72 bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-3.5 animate-in fade-in zoom-in-95 duration-150">
                                        {/* Year Selector with Side Arrows */}
                                        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-base-200">
                                            <button
                                                type="button"
                                                onClick={() => setPickerYear((y) => y - 1)}
                                                className="btn btn-xs btn-ghost btn-square rounded-lg hover:bg-base-200 cursor-pointer text-base-content/70 hover:text-primary"
                                                title="Previous Year"
                                            >
                                                <ChevronLeft size={15} />
                                            </button>

                                            <span className="font-mono font-extrabold text-sm text-base-content tracking-wider select-none">
                                                {pickerYear}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => setPickerYear((y) => y + 1)}
                                                className="btn btn-xs btn-ghost btn-square rounded-lg hover:bg-base-200 cursor-pointer text-base-content/70 hover:text-primary"
                                                title="Next Year"
                                            >
                                                <ChevronRight size={15} />
                                            </button>
                                        </div>

                                        {/* 12 Months Grid */}
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const monthDate = dayjs().year(pickerYear).month(i);
                                                const monthKey = monthDate.format("YYYY-MM");
                                                const isSelected = currentMonth === monthKey;
                                                const isCurrentActualMonth = dayjs().format("YYYY-MM") === monthKey;

                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            dispatch(setMonth(monthKey));
                                                            setIsMonthPickerOpen(false);
                                                        }}
                                                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                                            isSelected
                                                                ? "bg-primary text-primary-content shadow-xs scale-102 font-extrabold"
                                                                : isCurrentActualMonth
                                                                ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
                                                                : "hover:bg-base-200 text-base-content/80"
                                                        }`}
                                                    >
                                                        {monthDate.format("MMM")}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Quick Jump to This Month */}
                                        <div className="mt-2.5 pt-2 border-t border-base-200 flex justify-between items-center text-xs">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const thisMonth = dayjs().format("YYYY-MM");
                                                    dispatch(setMonth(thisMonth));
                                                    setPickerYear(dayjs().year());
                                                    setIsMonthPickerOpen(false);
                                                }}
                                                className="btn btn-xs btn-ghost text-primary font-bold hover:bg-primary/10 w-full cursor-pointer"
                                            >
                                                Jump to Current Month ({dayjs().format("MMM YYYY")})
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Undo & Redo Action Controls */}
                        <div className="flex items-center gap-0.5 bg-base-100 p-1 rounded-xl border border-base-200 shadow-2xs">
                            <button
                                onClick={() => dispatch(performUndo())}
                                disabled={!undoStack || undoStack.length === 0}
                                className={`btn btn-xs btn-square btn-ghost font-bold rounded-lg transition-all ${
                                    undoStack && undoStack.length > 0
                                        ? 'text-primary hover:bg-primary/10'
                                        : 'opacity-40 cursor-not-allowed text-base-content/40'
                                }`}
                                title={
                                    undoStack && undoStack.length > 0
                                        ? `Undo: ${undoStack[undoStack.length - 1]?.label} (Ctrl + Z)`
                                        : "Undo (Ctrl + Z) — No history"
                                }
                            >
                                <Undo2 size={14} />
                            </button>

                            <button
                                onClick={() => dispatch(performRedo())}
                                disabled={!redoStack || redoStack.length === 0}
                                className={`btn btn-xs btn-square btn-ghost font-bold rounded-lg transition-all ${
                                    redoStack && redoStack.length > 0
                                        ? 'text-primary hover:bg-primary/10'
                                        : 'opacity-40 cursor-not-allowed text-base-content/40'
                                }`}
                                title={
                                    redoStack && redoStack.length > 0
                                        ? `Redo: ${redoStack[redoStack.length - 1]?.label} (Ctrl + Y)`
                                        : "Redo (Ctrl + Y) — No pending redo"
                                }
                            >
                                <Redo2 size={14} />
                            </button>
                        </div>

                        {/* Primary Action Button: Add Transaction Modal */}
                        <button
                            onClick={() => {
                                if (setIsAddModalOpen) setIsAddModalOpen(true);
                                else setInternalIsAddModalOpen(true);
                            }}
                            className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-95 text-primary-content cursor-pointer"
                            title="Add Transaction (M)"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Transaction</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Upper Header (< lg) */}
                <div className="flex lg:hidden flex-col gap-2 p-3 border-b border-base-200/50 bg-base-100/40 dark:bg-base-900/40">
                    <div className="flex items-center justify-between">
                        {/* Month Selector */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
                                className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/70 hover:text-primary cursor-pointer"
                                title="Previous Month"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setPickerYear(dayjs(currentMonth).year());
                                    setIsMonthPickerOpen((prev) => !prev);
                                }}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl hover:bg-base-200 text-base-content font-sans text-sm sm:text-base font-extrabold tracking-tight cursor-pointer"
                            >
                                <span>{dayjs(currentMonth).format("MMM YYYY")}</span>
                                <ChevronDown size={13} className={`text-primary/70 transition-transform ${isMonthPickerOpen ? 'rotate-180 text-primary' : ''}`} />
                            </button>

                            <button
                                type="button"
                                onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
                                className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/70 hover:text-primary cursor-pointer"
                                title="Next Month"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Right Tools & Add Button */}
                        <div className="flex items-center gap-1">
                            {onOpenHeatmap && (
                                <button
                                    type="button"
                                    onClick={onOpenHeatmap}
                                    className="btn btn-xs btn-ghost btn-square rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                                    title="Open Spending Calendar Heatmap"
                                >
                                    <Calendar size={15} />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={toggleHideNumbers}
                                className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/60 hover:text-primary cursor-pointer"
                                title={hideNumbers ? "Show numbers" : "Hide numbers"}
                            >
                                {hideNumbers ? <EyeOff size={15} className="text-primary font-bold" /> : <Eye size={15} />}
                            </button>

                            <div className="flex items-center gap-0.5 bg-base-200/60 p-0.5 rounded-lg border border-base-content/10">
                                <button
                                    onClick={() => dispatch(performUndo())}
                                    disabled={!undoStack || undoStack.length === 0}
                                    className="btn btn-xs btn-square btn-ghost h-5 w-5 min-h-0 disabled:opacity-30 cursor-pointer"
                                    title="Undo"
                                >
                                    <Undo2 size={12} />
                                </button>
                                <button
                                    onClick={() => dispatch(performRedo())}
                                    disabled={!redoStack || redoStack.length === 0}
                                    className="btn btn-xs btn-square btn-ghost h-5 w-5 min-h-0 disabled:opacity-30 cursor-pointer"
                                    title="Redo"
                                >
                                    <Redo2 size={12} />
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    if (setIsAddModalOpen) setIsAddModalOpen(true);
                                    else setInternalIsAddModalOpen(true);
                                }}
                                className="btn btn-primary btn-xs rounded-xl font-bold gap-1 text-primary-content h-7 px-2.5 shadow-xs cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Month Picker Popover for Mobile */}
                    {isMonthPickerOpen && (
                        <div className="w-full bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-3 mt-1 animate-in fade-in zoom-in-95 duration-150">
                            {/* Year Selector with Side Arrows */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200">
                                <button
                                    type="button"
                                    onClick={() => setPickerYear((y) => y - 1)}
                                    className="btn btn-xs btn-ghost btn-square rounded-lg hover:bg-base-200 text-base-content/70 hover:text-primary cursor-pointer"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                <span className="font-mono font-extrabold text-sm text-base-content tracking-wider">
                                    {pickerYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPickerYear((y) => y + 1)}
                                    className="btn btn-xs btn-ghost btn-square rounded-lg hover:bg-base-200 text-base-content/70 hover:text-primary cursor-pointer"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>

                            {/* 12 Months Grid */}
                            <div className="grid grid-cols-4 gap-1.5">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const monthDate = dayjs().year(pickerYear).month(i);
                                    const monthKey = monthDate.format("YYYY-MM");
                                    const isSelected = currentMonth === monthKey;
                                    const isCurrentActualMonth = dayjs().format("YYYY-MM") === monthKey;

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                dispatch(setMonth(monthKey));
                                                setIsMonthPickerOpen(false);
                                            }}
                                            className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                                isSelected
                                                    ? "bg-primary text-primary-content shadow-xs font-extrabold"
                                                    : isCurrentActualMonth
                                                    ? "bg-primary/15 text-primary border border-primary/30"
                                                    : "hover:bg-base-200 text-base-content/80"
                                            }`}
                                        >
                                            {monthDate.format("MMM")}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Mobile Search & Quick Filter Toolbar */}
                    <div className="pt-2 border-t border-base-200/70 space-y-2">
                        <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                                <input
                                    type="text"
                                    value={filters.description || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Search description or amount..."
                                    className="input input-xs h-7.5 pl-8 pr-7 w-full bg-base-200/60 border border-base-300 rounded-xl text-xs focus:input-primary focus:bg-base-100 placeholder:text-base-content/40"
                                />
                                {filters.description && (
                                    <button
                                        type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, description: "" }))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-0.5 cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Mobile Sort Order Toggle */}
                            <button
                                type="button"
                                onClick={() => handleSortChange(sortOrder === "newest" ? "oldest" : "newest")}
                                className="btn btn-xs btn-square h-7.5 w-7.5 rounded-xl bg-base-200/70 hover:bg-base-200 border border-base-300 text-base-content/70 cursor-pointer shrink-0"
                                title={`Sort: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
                            >
                                {sortOrder === "newest" ? (
                                    <ArrowDown size={13} className="text-primary" />
                                ) : (
                                    <ArrowUp size={13} className="text-primary" />
                                )}
                            </button>

                            {/* Collapse / Expand All Days */}
                            {groupedTransactions.length > 0 && (
                                <button
                                    type="button"
                                    onClick={toggleCollapseAll}
                                    className="btn btn-xs btn-square h-7.5 w-7.5 rounded-xl bg-base-200/70 hover:bg-base-200 border border-base-300 text-base-content/70 cursor-pointer shrink-0"
                                    title={isAllCollapsed ? "Expand all days" : "Collapse all days"}
                                >
                                    <Layers size={13} className="text-primary" />
                                </button>
                            )}

                            {/* Clear Active Filters */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="btn btn-xs h-7.5 px-2 rounded-xl bg-error/15 hover:bg-error/25 text-error border border-error/30 text-[11px] font-bold cursor-pointer shrink-0"
                                    title="Clear All Filters"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Quick Type Filter Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 py-0.5">
                            {[
                                { id: "", label: "All" },
                                { id: "Debit", label: "Debited" },
                                { id: "Credit", label: "Credited" },
                                { id: "Transfer", label: "Transfers" },
                                { id: "Reimbursable", label: "Reimbursable" }
                            ].map(chip => {
                                const isActive = (filters.type || "") === chip.id;
                                return (
                                    <button
                                        key={chip.id}
                                        type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, type: prev.type === chip.id ? "" : chip.id }))}
                                        className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                                            isActive
                                                ? "bg-primary text-primary-content shadow-xs"
                                                : "bg-base-200/80 hover:bg-base-200 text-base-content/70 border border-base-content/5"
                                        }`}
                                    >
                                        {chip.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Lower Header: Table Column Headers with Interactive Filter Dropdowns (Desktop only) */}
                <div ref={headerRef} className="hidden lg:block overflow-x-auto overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex items-center gap-3 px-6 py-3.5 bg-base-200/60 backdrop-blur-md text-xs font-extrabold text-base-content/80 uppercase tracking-widest min-w-[980px]">
                    
                    {/* 1. Date Header + Dropdown & Sort Order Toggle */}
                    <div className="w-[160px] shrink-0 flex items-center gap-1 relative whitespace-nowrap">
                        {/* Expand / Collapse All Icon on the left of Date */}
                        {groupedTransactions.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleCollapseAll}
                                className="btn btn-xs btn-square btn-ghost text-base-content/70 hover:text-primary hover:bg-base-300/50 -ml-1 mr-0.5"
                                title={isAllCollapsed ? "Expand All Days" : "Collapse All Days"}
                            >
                                {isAllCollapsed ? <ChevronRight size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />}
                            </button>
                        )}

                        <span>Date</span>

                        {/* Sort Order Toggle Icon */}
                        <button
                            onClick={() => handleSortChange(sortOrder === "newest" ? "oldest" : "newest")}
                            className="btn btn-xs btn-square btn-ghost opacity-60 hover:opacity-100"
                            title={`Sort Order: ${sortOrder === "newest" ? "New First (Click for Old First)" : "Old First (Click for New First)"}`}
                        >
                            {sortOrder === "newest" ? <ArrowDown size={11} className="text-primary" /> : <ArrowUp size={11} className="text-primary" />}
                        </button>

                        {/* Date Filter Button */}
                        <button
                            type="button"
                            onClick={(e) => handleToggleFilterMenu(e, 'date')}
                            className={`btn btn-xs btn-square btn-ghost ${filters.date ? 'text-primary bg-primary/10' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Date"
                        >
                            <Filter size={11} />
                        </button>
                    </div>

                    {/* 2. Description Header + Dropdown */}
                    <div className="flex-1 min-w-[150px] flex items-center gap-1.5 relative whitespace-nowrap">
                        <span>Description</span>
                        <button
                            type="button"
                            onClick={(e) => handleToggleFilterMenu(e, 'description')}
                            className={`btn btn-xs btn-square btn-ghost ${filters.description ? 'text-primary bg-primary/10' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Description"
                        >
                            <Filter size={11} />
                        </button>
                    </div>

                    {/* 3. From (Account) Header + Dropdown */}
                    <div className="w-[135px] shrink-0 flex items-center gap-1.5 relative whitespace-nowrap">
                        <span className="text-blue-600 dark:text-blue-400">From</span>
                        <button
                            type="button"
                            onClick={(e) => handleToggleFilterMenu(e, 'sourceId')}
                            className={`btn btn-xs btn-square btn-ghost ${filters.sourceId ? 'text-blue-600 bg-blue-500/10' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Account / Bank"
                        >
                            <Filter size={11} />
                        </button>
                    </div>

                    {/* 4. Category / To Header + Dropdown */}
                    <div className="w-[145px] shrink-0 flex items-center gap-1.5 relative whitespace-nowrap">
                        <span className="text-purple-600 dark:text-purple-400">Category / To</span>
                        <button
                            type="button"
                            onClick={(e) => handleToggleFilterMenu(e, 'categoryId')}
                            className={`btn btn-xs btn-square btn-ghost ${filters.categoryId ? 'text-purple-600 bg-purple-500/10' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Category"
                        >
                            <Filter size={11} />
                        </button>
                    </div>

                    {/* 5. Sub Category Header + Dropdown */}
                    <div className="w-[145px] shrink-0 flex items-center gap-1.5 relative whitespace-nowrap">
                        <span className="text-amber-600 dark:text-amber-400">Sub Category</span>
                        <button
                            type="button"
                            onClick={(e) => handleToggleFilterMenu(e, 'subCategoryId')}
                            className={`btn btn-xs btn-square btn-ghost ${filters.subCategoryId ? 'text-amber-600 bg-amber-500/10' : 'opacity-40 hover:opacity-100'}`}
                            title="Filter Sub Category"
                        >
                            <Filter size={11} />
                        </button>
                    </div>

                    {/* 6. Amount & Sort Controls Header */}
                    <div className="w-[155px] shrink-0 text-right flex items-center justify-end gap-1 whitespace-nowrap">
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
                    <div className="w-[85px] shrink-0 text-center flex items-center justify-center gap-1">
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
        </div>

        {/* Scrollable Content */}
        <div ref={bodyRef} onScroll={handleBodyScroll} className="flex-1 pb-40 lg:overflow-x-auto overflow-visible">
                {(() => {
                    const renderInlineAddRow = () => (
                        <div className={`transition-all duration-300 ${isAdding ? 'bg-base-200/30 py-4 px-4 border-b border-primary/20 z-20 relative' : 'p-2 border-b border-base-200/50 flex justify-center'}`}>
                            {isAdding ? (
                                <div
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAdd();
                                        }
                                    }}
                                    className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 w-full min-w-[980px]"
                                >
                                    {/* Date & Reimbursable Toggle */}
                                    <div className="w-[160px] shrink-0 flex items-center gap-1.5">
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
                                    <input placeholder="Desc" value={newData.description} onChange={e => setNewData({ ...newData, description: e.target.value })} className="flex-1 min-w-[150px] input input-sm input-bordered focus:input-primary text-xs" autoFocus />

                                    {/* From / Action */}
                                    <div className="w-[135px] shrink-0">
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
                                    <div className="w-[145px] shrink-0">
                                        {newData.isAddMoney ? (
                                            <DaisySelect
                                                options={targetOptions}
                                                value={newData.sourceId}
                                                placeholder="Select Bank"
                                                onChange={(val) => setNewData({ ...newData, sourceId: val })}
                                                className="text-success"
                                            />
                                        ) : newData.isManualDebit ? (
                                            <DaisySelect
                                                options={targetOptions}
                                                value={newData.sourceId}
                                                placeholder="Select Bank"
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
                                                            isAddMoney: false,
                                                            isTransfer: true,
                                                            targetSourceId: trgId,
                                                            categoryId: "",
                                                            subCategoryId: ""
                                                        });
                                                    } else {
                                                        setNewData({
                                                            ...newData,
                                                            isAddMoney: false,
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
                                    <div className="w-[145px] shrink-0">
                                        <DaisySelect
                                            options={(newData.isAddMoney || newData.isManualDebit || newData.isTransfer) ? [] : getSubCatOptions(newData.categoryId)}
                                            value={newData.subCategoryId}
                                            placeholder={(newData.isAddMoney || newData.isManualDebit || newData.isTransfer) ? "—" : "SubCat"}
                                            disabled={newData.isAddMoney || newData.isManualDebit || newData.isTransfer}
                                            onChange={(val) => setNewData({ ...newData, subCategoryId: val })}
                                        />
                                    </div>

                                    {/* Amount with Real-Time Math Calculator */}
                                    <div className="w-[155px] shrink-0 flex items-center gap-1 bg-base-100 p-0.5 rounded-lg border border-base-300 focus-within:border-primary">
                                        <input
                                            type="text"
                                            placeholder="e.g. 23-8-4"
                                            value={newData.amount}
                                            onChange={e => setNewData({ ...newData, amount: e.target.value })}
                                            className="w-[85px] input input-xs border-0 focus:outline-none text-xs font-mono font-bold text-right px-1"
                                            title="Type math expression (e.g. 23-8-4, 500/2)"
                                        />
                                        <span className="font-bold text-base-content/40 text-xs select-none">=</span>
                                        <span
                                            className={`flex-1 text-right text-xs font-mono font-extrabold px-1 truncate select-none ${
                                                calculatedNewAmount !== null ? 'text-primary font-black' : 'text-base-content/40'
                                            }`}
                                            title={calculatedNewAmount !== null ? `Calculated: ₹${calculatedNewAmount.toLocaleString()}` : "0.00"}
                                        >
                                            {calculatedNewAmount !== null ? `₹${calculatedNewAmount}` : "0.00"}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-[85px] shrink-0 flex items-center justify-center gap-1">
                                        <button onClick={handleAdd} className="btn btn-sm btn-square btn-primary text-white" title="Save"><Save size={14} /></button>
                                        <button onClick={() => setIsAdding(false)} className="btn btn-sm btn-square btn-ghost text-error" title="Cancel"><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 px-2 py-1">
                                    <button
                                        onClick={() => {
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
                                            setIsAdding(true);
                                        }}
                                        className="btn btn-ghost btn-xs text-primary font-bold gap-1 hover:bg-primary/10 rounded-xl px-4"
                                    >
                                        <Plus size={15} /> Inline Add Transaction
                                    </button>
                                </div>
                            )}
                        </div>
                    );

                    return (
                        <>
                            {/* DESKTOP TABLE VIEW (>= lg) */}
                            <div className="hidden lg:block">
                                {/* Top position when sortOrder is newest */}
                                {sortOrder === "newest" && renderInlineAddRow()}

                            {/* Grouped Collapsible Rows */}
                            {groupedTransactions.map((group) => {
                                const isCollapsed = Boolean(collapsedDays[group.dateKey]);
                                const formattedGroupDate = dayjs(group.dateObj).format("ddd, MMM DD, YYYY");

                                return (
                                    <div key={group.dateKey} className="border-b border-base-200">
                                        <div
                                            onClick={() => toggleDayCollapse(group.dateKey)}
                                            className="flex items-center justify-between gap-3 px-6 py-2 bg-base-200/50 hover:bg-base-200/90 cursor-pointer select-none transition-colors min-w-[980px] whitespace-nowrap border-y border-base-300/60 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                        >
                                            {/* Left Side: Collapse Button, Date & Active Summary Metrics */}
                                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-square btn-ghost text-base-content/70 hover:bg-base-300/50 shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDayCollapse(group.dateKey);
                                                    }}
                                                    title={isCollapsed ? "Expand Day" : "Collapse Day"}
                                                >
                                                    {isCollapsed ? <ChevronRight size={15} className="text-primary" /> : <ChevronDown size={15} className="text-primary" />}
                                                </button>

                                                <span className="font-extrabold text-xs text-base-content whitespace-nowrap shrink-0">
                                                    {formattedGroupDate}
                                                </span>

                                                {headerSettings.showTotalTxn && (
                                                    <span className="badge badge-sm badge-neutral font-bold text-[10px] opacity-80 px-2 py-0.5 whitespace-nowrap shrink-0">
                                                        {group.transactions.length} {group.transactions.length === 1 ? 'transaction' : 'transactions'}
                                                    </span>
                                                )}

                                                {headerSettings.showCreditCount && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                                                        <TrendingUp size={11} /> {group.creditCount} Credit{group.creditCount === 1 ? '' : 's'}
                                                    </span>
                                                )}

                                                {headerSettings.showDebitCount && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap shrink-0">
                                                        <TrendingDown size={11} /> {group.debitCount} Debit{group.debitCount === 1 ? '' : 's'}
                                                    </span>
                                                )}

                                                {headerSettings.showCreditAmt && (
                                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono font-bold text-xs shrink-0">
                                                        <span className="text-base-content/40 text-[10px] font-sans uppercase font-semibold">Credited:</span>
                                                        <span>{hideNumbers ? "••••••••" : `+₹${group.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                                    </div>
                                                )}

                                                {headerSettings.showDebitAmt && (
                                                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono font-bold text-xs shrink-0">
                                                        <span className="text-base-content/40 text-[10px] font-sans uppercase font-semibold">Debited:</span>
                                                        <span>{hideNumbers ? "••••••••" : `-₹${group.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                                    </div>
                                                )}

                                                {headerSettings.showNet && (
                                                    <div className="flex items-center gap-1 whitespace-nowrap font-mono font-bold text-xs shrink-0">
                                                        <span className="text-base-content/50 text-[10px] font-sans uppercase font-semibold">Net:</span>
                                                        <span className={group.netAmount > 0 ? 'text-success' : (group.netAmount < 0 ? 'text-error' : 'text-base-content/60')}>
                                                            {hideNumbers
                                                                ? "••••••••"
                                                                : `${group.netAmount > 0 ? '+' : (group.netAmount < 0 ? '-' : '')}₹${Math.abs(group.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side: Header Display Setting Button Aligned with Action Column */}
                                            <div className="w-[85px] shrink-0 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowHeaderSettingsModal(true);
                                                    }}
                                                    className="btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                                                    title="Configure Day Header Display Metrics"
                                                >
                                                    <SlidersHorizontal size={13} className="text-primary" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Day Group Transactions (Visible when not collapsed) */}
                                        {!isCollapsed && (
                                            <div className="divide-y divide-base-200/60">
                                                {group.transactions.map((t) => (
                                                    <div key={t._id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-base-200/50 transition-colors group text-xs font-medium relative min-w-[980px]">
                                                        {editingId === t._id ? (
                                                            // Edit Mode (Inline Inputs)
                                                            <>
                                                                <div className="w-[160px] shrink-0 flex items-center gap-1.5">
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
                                                                <input value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="flex-1 min-w-[150px] input input-xs input-bordered" />

                                                                {/* From / Action */}
                                                                <div className="w-[135px] shrink-0">
                                                                    <DaisySelect
                                                                        options={sourceOptions}
                                                                        value={editData.isAddMoney ? "add_money" : (editData.isManualDebit ? "debit_money" : editData.sourceId)}
                                                                        placeholder="Source"
                                                                        onChange={(val) => {
                                                                            if (val === "add_money") {
                                                                                setEditData({
                                                                                    ...editData,
                                                                                    isAddMoney: true,
                                                                                    isManualDebit: false,
                                                                                    isTransfer: false,
                                                                                    type: "Credit",
                                                                                    categoryId: "",
                                                                                    subCategoryId: "",
                                                                                    targetSourceId: ""
                                                                                });
                                                                            } else if (val === "debit_money") {
                                                                                setEditData({
                                                                                    ...editData,
                                                                                    isAddMoney: false,
                                                                                    isManualDebit: true,
                                                                                    isTransfer: false,
                                                                                    type: "Debit",
                                                                                    categoryId: "",
                                                                                    subCategoryId: "",
                                                                                    targetSourceId: ""
                                                                                });
                                                                            } else {
                                                                                setEditData({
                                                                                    ...editData,
                                                                                    isAddMoney: false,
                                                                                    isManualDebit: false,
                                                                                    sourceId: val
                                                                                });
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>

                                                                {/* Target / Category */}
                                                                <div className="w-[145px] shrink-0">
                                                                    {editData.isAddMoney ? (
                                                                        <DaisySelect
                                                                            options={targetOptions}
                                                                            value={editData.sourceId}
                                                                            placeholder="Select Bank"
                                                                            onChange={(val) => setEditData({ ...editData, sourceId: val })}
                                                                            className="text-success"
                                                                        />
                                                                    ) : editData.isManualDebit ? (
                                                                        <DaisySelect
                                                                            options={targetOptions}
                                                                            value={editData.sourceId}
                                                                            placeholder="Select Bank"
                                                                            onChange={(val) => setEditData({ ...editData, sourceId: val })}
                                                                            className="text-error"
                                                                        />
                                                                    ) : (
                                                                        <DaisySelect
                                                                            options={categoryOptions}
                                                                            value={editData.isTransfer ? `bank_${editData.targetSourceId}` : editData.categoryId}
                                                                            placeholder="Category / To"
                                                                            onChange={(val) => {
                                                                                if (val.startsWith("bank_")) {
                                                                                    const trgId = val.replace("bank_", "");
                                                                                    setEditData({
                                                                                        ...editData,
                                                                                        isAddMoney: false,
                                                                                        isManualDebit: false,
                                                                                        isTransfer: true,
                                                                                        type: "Transfer",
                                                                                        targetSourceId: trgId,
                                                                                        categoryId: "",
                                                                                        subCategoryId: ""
                                                                                    });
                                                                                } else {
                                                                                    setEditData({
                                                                                        ...editData,
                                                                                        isAddMoney: false,
                                                                                        isManualDebit: false,
                                                                                        isTransfer: false,
                                                                                        type: "Debit",
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
                                                                <div className="w-[145px] shrink-0">
                                                                    <DaisySelect
                                                                        options={(editData.isAddMoney || editData.isManualDebit || editData.isTransfer) ? [] : getSubCatOptions(editData.categoryId)}
                                                                        value={editData.subCategoryId}
                                                                        placeholder={(editData.isAddMoney || editData.isManualDebit || editData.isTransfer) ? "—" : "SubCat"}
                                                                        disabled={editData.isAddMoney || editData.isManualDebit || editData.isTransfer}
                                                                        onChange={(val) => setEditData({ ...editData, subCategoryId: val })}
                                                                    />
                                                                </div>

                                                                 {/* Amount with Real-Time Math Calculator (Edit) */}
                                                                 <div className="w-[155px] shrink-0 flex items-center gap-1 bg-base-100 p-0.5 rounded-lg border border-base-300 focus-within:border-primary">
                                                                     <input
                                                                         type="text"
                                                                         placeholder="e.g. 23-8-4"
                                                                         value={editData.amount}
                                                                         onChange={e => setEditData({ ...editData, amount: e.target.value })}
                                                                         className="w-[85px] input input-xs border-0 focus:outline-none text-xs font-mono font-bold text-right px-1"
                                                                         title="Type math expression (e.g. 23-8-4, 500/2)"
                                                                     />
                                                                     <span className="font-bold text-base-content/40 text-xs select-none">=</span>
                                                                     <span
                                                                         className={`flex-1 text-right text-xs font-mono font-extrabold px-1 truncate select-none ${
                                                                             calculatedEditAmount !== null ? 'text-primary font-black' : 'text-base-content/40'
                                                                         }`}
                                                                         title={calculatedEditAmount !== null ? `Calculated: ₹${calculatedEditAmount.toLocaleString()}` : "0.00"}
                                                                     >
                                                                         {calculatedEditAmount !== null ? `₹${calculatedEditAmount}` : "0.00"}
                                                                     </span>
                                                                 </div>

                                                                <div className="w-[85px] shrink-0 flex items-center justify-center gap-1">
                                                                    <button onClick={saveEdit} className="btn btn-xs btn-square btn-success text-white"><Save size={12} /></button>
                                                                    <button onClick={() => setEditingId(null)} className="btn btn-xs btn-square btn-ghost text-error"><X size={12} /></button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            // View Mode
                                                            <>
                                                                <div className="w-[160px] shrink-0 text-base-content/60 font-medium text-xs whitespace-nowrap">{dayjs(t.date).format("ddd, MMM DD, YYYY")}</div>
                                                                <div className="flex-1 min-w-[150px] truncate">
                                                                    <div className="flex items-center gap-1">
                                                                        {t.isReimbursable && <Handshake size={12} className="text-warning shrink-0" title="Reimbursable: Need to collect money" />}
                                                                        <span className="font-bold text-base-content/80 truncate text-xs" title={t.description}>{t.description}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="w-[135px] shrink-0 truncate">
                                                                    {renderSourceTag(t)}
                                                                </div>
                                                                <div className="w-[145px] shrink-0 truncate">
                                                                    {renderCategoryTag(t)}
                                                                </div>
                                                                <div className="w-[145px] shrink-0 truncate">
                                                                    {(() => {
                                                                        const catId = t.categoryId?._id || t.categoryId;
                                                                        const subId = t.subCategoryId?._id || t.subCategoryId;
                                                                        const cat = categories.find(c => c._id === catId);
                                                                        const sub = cat?.subCategories?.find(s => s._id === subId);
                                                                        if (!sub?.name) return <span className="text-base-content/40 text-xs">—</span>;
                                                                        return (
                                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 truncate max-w-full" title={sub.name}>
                                                                                <Folder size={12} className="shrink-0 text-amber-500" />
                                                                                <span className="truncate">{sub.name}</span>
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <div className={`w-[155px] shrink-0 text-right font-bold font-mono tracking-tight text-xs whitespace-nowrap ${
                                                                    t.type === 'Transfer'
                                                                        ? 'text-amber-500 dark:text-amber-400'
                                                                        : (t.type === 'Credit' ? 'text-success' : 'text-error')
                                                                }`}>
                                                                    {hideNumbers ? "••••••••" : `${t.type === 'Transfer' ? '' : (t.type === 'Credit' ? '+' : '-')}₹${Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                                </div>

                                                                <div className="w-[85px] shrink-0 flex items-center justify-center gap-0.5 opacity-80 hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setInfoModalTx(t)}
                                                                        className={`btn btn-xs btn-ghost btn-square relative ${
                                                                            t.info && t.info.trim()
                                                                                ? "text-primary bg-primary/10 hover:bg-primary/20"
                                                                                : "text-base-content/40 hover:text-base-content hover:bg-base-300/40"
                                                                        }`}
                                                                        title={t.info && t.info.trim() ? `Note: ${t.info}` : "Add / View Notes (i)"}
                                                                    >
                                                                        <Info size={13} />
                                                                        {t.info && t.info.trim() && (
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary absolute top-1 right-1"></span>
                                                                        )}
                                                                    </button>
                                                                    <button onClick={() => startEdit(t)} className="btn btn-xs btn-ghost btn-square text-info hover:bg-info/10" title="Edit Transaction"><Edit2 size={13} /></button>
                                                                    <button onClick={() => handleDelete(t._id)} className="btn btn-xs btn-ghost btn-square text-error hover:bg-error/10" title="Delete Transaction"><Trash2 size={13} /></button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Bottom position when sortOrder is oldest */}
                            {sortOrder === "oldest" && renderInlineAddRow()}

                            {filteredTransactions.length === 0 && (
                                <div className="h-64 flex flex-col items-center justify-center text-base-content/30 italic">
                                    No transactions recorded for this period.
                                </div>
                            )}
                            </div>

                            {/* MOBILE CARD FEED VIEW (< lg) */}
                            <div className="block lg:hidden px-3 py-3 space-y-3">
                                {/* Inline Add Form (if isAdding) */}
                                {isAdding && (
                                    <div className="p-3.5 bg-base-100 rounded-2xl border-2 border-primary/40 space-y-3 shadow-md animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                                                <Plus size={14} /> Add Transaction
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setNewData({ ...newData, isReimbursable: !newData.isReimbursable })}
                                                className={`btn btn-xs rounded-xl ${newData.isReimbursable ? 'btn-warning' : 'btn-ghost opacity-60'}`}
                                                title="Mark as Reimbursable"
                                            >
                                                <Handshake size={13} />
                                                <span className="text-[10px] font-bold">Reimbursable</span>
                                            </button>
                                        </div>

                                        {/* Date & Desc */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <CallyDatePicker
                                                value={newData.date}
                                                onChange={(val) => setNewData({ ...newData, date: val })}
                                                placeholder="Select Date"
                                                size="xs"
                                                className="w-full"
                                            />
                                            <input
                                                placeholder="Description"
                                                value={newData.description}
                                                onChange={e => setNewData({ ...newData, description: e.target.value })}
                                                className="input input-xs input-bordered w-full text-xs font-semibold rounded-xl"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Source & Target */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <DaisySelect
                                                options={sourceOptions}
                                                value={newData.isAddMoney ? "add_money" : (newData.isManualDebit ? "debit_money" : newData.sourceId)}
                                                placeholder="Source Account"
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

                                            {newData.isAddMoney ? (
                                                <DaisySelect
                                                    options={targetOptions}
                                                    value={newData.sourceId}
                                                    placeholder="Select Bank"
                                                    onChange={(val) => setNewData({ ...newData, sourceId: val })}
                                                    className="text-success"
                                                />
                                            ) : newData.isManualDebit ? (
                                                <DaisySelect
                                                    options={targetOptions}
                                                    value={newData.sourceId}
                                                    placeholder="Select Bank"
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
                                                                isAddMoney: false,
                                                                isTransfer: true,
                                                                targetSourceId: trgId,
                                                                categoryId: "",
                                                                subCategoryId: ""
                                                            });
                                                        } else {
                                                            setNewData({
                                                                ...newData,
                                                                isAddMoney: false,
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

                                        {/* Subcategory (if applicable) */}
                                        {!(newData.isAddMoney || newData.isManualDebit || newData.isTransfer) && (
                                            <DaisySelect
                                                options={getSubCatOptions(newData.categoryId)}
                                                value={newData.subCategoryId}
                                                placeholder="SubCategory (optional)"
                                                onChange={(val) => setNewData({ ...newData, subCategoryId: val })}
                                            />
                                        )}

                                        {/* Amount with Live Math Preview */}
                                        <div className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-xl border border-base-300 focus-within:border-primary">
                                            <input
                                                type="text"
                                                placeholder="Amount (e.g. 500 or 250+120)"
                                                value={newData.amount}
                                                onChange={e => setNewData({ ...newData, amount: e.target.value })}
                                                className="flex-1 input input-xs border-0 focus:outline-none text-xs font-mono font-bold"
                                            />
                                            <span className="font-bold text-base-content/40 text-xs select-none">=</span>
                                            <span className={`text-right text-xs font-mono font-black truncate select-none ${
                                                calculatedNewAmount !== null ? 'text-primary' : 'text-base-content/40'
                                            }`}>
                                                {calculatedNewAmount !== null ? `₹${calculatedNewAmount}` : "0.00"}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <button type="button" onClick={handleAdd} className="btn btn-xs btn-primary font-bold flex-1 rounded-xl gap-1">
                                                <Save size={13} /> Save Transaction
                                            </button>
                                            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-xs btn-ghost text-error rounded-xl">
                                                <X size={13} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Day Accordion Cards */}
                                {groupedTransactions.map((group) => {
                                    const isCollapsed = Boolean(collapsedDays[group.dateKey]);
                                    const formattedGroupDate = dayjs(group.dateObj).format("ddd, D MMM");

                                    return (
                                        <div key={group.dateKey} className="space-y-1.5">
                                            {/* Accordion Header */}
                                            <div
                                                onClick={() => toggleDayCollapse(group.dateKey)}
                                                style={{ top: `${headerStickyTop}px` }}
                                                className="sticky z-20 flex items-center justify-between px-3 py-2 bg-base-200/95 dark:bg-base-800/95 backdrop-blur-md hover:bg-base-200 rounded-2xl cursor-pointer border border-base-content/10 transition-colors select-none shadow-xs"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="p-1 rounded-lg bg-base-100 text-primary shrink-0 shadow-2xs">
                                                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                                                    </span>
                                                    <span className="font-extrabold text-xs text-base-content truncate">
                                                        {formattedGroupDate}
                                                    </span>
                                                    <span className="badge badge-neutral badge-xs font-bold text-[9px] px-1.5 py-0.5 opacity-80 shrink-0">
                                                        {group.transactions.length}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold shrink-0">
                                                    <span className="text-[9.5px] uppercase font-semibold text-base-content/40 font-sans">Net:</span>
                                                    <span className={group.netAmount > 0 ? 'text-success' : (group.netAmount < 0 ? 'text-error' : 'text-base-content/60')}>
                                                        {hideNumbers
                                                            ? "••••••"
                                                            : `${group.netAmount > 0 ? '+' : (group.netAmount < 0 ? '-' : '')}₹${Math.abs(group.netAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Transaction Items */}
                                            {!isCollapsed && (
                                                <div className="space-y-1.5 pl-1">
                                                    {group.transactions.map((t) => (
                                                        <React.Fragment key={t._id}>
                                                            {editingId === t._id ? (
                                                                <div className="p-3 bg-base-100 rounded-2xl border-2 border-primary/30 space-y-2.5 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                                                                            <Edit2 size={12} /> Edit Transaction
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditData({ ...editData, isReimbursable: !editData.isReimbursable })}
                                                                            className={`btn btn-xs rounded-xl ${editData.isReimbursable ? 'btn-warning' : 'btn-ghost opacity-50'}`}
                                                                            title="Reimbursable"
                                                                        >
                                                                            <Handshake size={12} />
                                                                            <span className="text-[10px]">Reimbursable</span>
                                                                        </button>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        <CallyDatePicker
                                                                            value={editData.date}
                                                                            onChange={(val) => setEditData({ ...editData, date: val })}
                                                                            placeholder="Date"
                                                                            size="xs"
                                                                            className="w-full"
                                                                        />
                                                                        <input
                                                                            placeholder="Description"
                                                                            value={editData.description}
                                                                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                                            className="input input-xs input-bordered w-full text-xs font-semibold rounded-xl"
                                                                        />
                                                                    </div>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        <DaisySelect
                                                                            options={sourceOptions}
                                                                            value={editData.isAddMoney ? "add_money" : (editData.isManualDebit ? "debit_money" : editData.sourceId)}
                                                                            placeholder="Source Account"
                                                                            onChange={(val) => {
                                                                                if (val === "add_money") {
                                                                                    setEditData({
                                                                                        ...editData,
                                                                                        isAddMoney: true,
                                                                                        isManualDebit: false,
                                                                                        isTransfer: false,
                                                                                        type: "Credit",
                                                                                        categoryId: "",
                                                                                        subCategoryId: "",
                                                                                        targetSourceId: ""
                                                                                    });
                                                                                } else if (val === "debit_money") {
                                                                                    setEditData({
                                                                                        ...editData,
                                                                                        isAddMoney: false,
                                                                                        isManualDebit: true,
                                                                                        isTransfer: false,
                                                                                        type: "Debit",
                                                                                        categoryId: "",
                                                                                        subCategoryId: "",
                                                                                        targetSourceId: ""
                                                                                    });
                                                                                } else {
                                                                                    setEditData({
                                                                                        ...editData,
                                                                                        isAddMoney: false,
                                                                                        isManualDebit: false,
                                                                                        sourceId: val
                                                                                    });
                                                                                }
                                                                            }}
                                                                        />

                                                                        {editData.isAddMoney ? (
                                                                            <DaisySelect
                                                                                options={targetOptions}
                                                                                value={editData.sourceId}
                                                                                placeholder="Select Bank"
                                                                                onChange={(val) => setEditData({ ...editData, sourceId: val })}
                                                                                className="text-success"
                                                                            />
                                                                        ) : editData.isManualDebit ? (
                                                                            <DaisySelect
                                                                                options={targetOptions}
                                                                                value={editData.sourceId}
                                                                                placeholder="Select Bank"
                                                                                onChange={(val) => setEditData({ ...editData, sourceId: val })}
                                                                                className="text-error"
                                                                            />
                                                                        ) : (
                                                                            <DaisySelect
                                                                                options={categoryOptions}
                                                                                value={editData.isTransfer ? `bank_${editData.targetSourceId}` : editData.categoryId}
                                                                                placeholder="Category / To"
                                                                                onChange={(val) => {
                                                                                    if (val.startsWith("bank_")) {
                                                                                        const trgId = val.replace("bank_", "");
                                                                                        setEditData({
                                                                                            ...editData,
                                                                                            isAddMoney: false,
                                                                                            isManualDebit: false,
                                                                                            isTransfer: true,
                                                                                            type: "Transfer",
                                                                                            targetSourceId: trgId,
                                                                                            categoryId: "",
                                                                                            subCategoryId: ""
                                                                                        });
                                                                                    } else {
                                                                                        setEditData({
                                                                                            ...editData,
                                                                                            isAddMoney: false,
                                                                                            isManualDebit: false,
                                                                                            isTransfer: false,
                                                                                            type: "Debit",
                                                                                            targetSourceId: "",
                                                                                            categoryId: val,
                                                                                            subCategoryId: ""
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    {!(editData.isAddMoney || editData.isManualDebit || editData.isTransfer) && (
                                                                        <DaisySelect
                                                                            options={getSubCatOptions(editData.categoryId)}
                                                                            value={editData.subCategoryId}
                                                                            placeholder="SubCategory"
                                                                            onChange={(val) => setEditData({ ...editData, subCategoryId: val })}
                                                                        />
                                                                    )}

                                                                    <div className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-xl border border-base-300 focus-within:border-primary">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Amount (e.g. 50+20)"
                                                                            value={editData.amount}
                                                                            onChange={e => setEditData({ ...editData, amount: e.target.value })}
                                                                            className="flex-1 input input-xs border-0 focus:outline-none text-xs font-mono font-bold"
                                                                        />
                                                                        <span className="font-bold text-base-content/40 text-xs select-none">=</span>
                                                                        <span className={`text-right text-xs font-mono font-black truncate select-none ${
                                                                            calculatedEditAmount !== null ? 'text-primary' : 'text-base-content/40'
                                                                        }`}>
                                                                            {calculatedEditAmount !== null ? `₹${calculatedEditAmount}` : "0.00"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 pt-1">
                                                                        <button type="button" onClick={saveEdit} className="btn btn-xs btn-primary font-bold flex-1 rounded-xl gap-1">
                                                                            <Save size={13} /> Save Changes
                                                                        </button>
                                                                        <button type="button" onClick={() => setEditingId(null)} className="btn btn-xs btn-ghost text-error rounded-xl">
                                                                            <X size={13} /> Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 bg-base-100 rounded-2xl border border-base-content/10 hover:border-base-content/20 transition-all shadow-2xs space-y-2">
                                                                    {/* Row 1 (Top): Bank Name (or Bank 1 → Bank 2 for Transfer) & Reimbursable Pill */}
                                                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                                                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                                                            {t.type === 'Transfer' ? (
                                                                                (() => {
                                                                                    const srcObj = t.sourceId;
                                                                                    const srcName = srcObj?.name || (typeof srcObj === 'string' ? srcObj : 'Bank');
                                                                                    const srcStyle = getSourceTagStyle(srcObj || srcName, sources);
                                                                                    const isSrcCard = srcObj?.type === 'Card';

                                                                                    const trgObj = t.targetSourceId;
                                                                                    const trgName = trgObj?.name || (typeof trgObj === 'string' ? trgObj : 'Bank');
                                                                                    const trgStyle = getSourceTagStyle(trgObj || trgName, sources);
                                                                                    const isTrgCard = trgObj?.type === 'Card';

                                                                                    return (
                                                                                        <div className="flex items-center gap-1 min-w-0 flex-wrap">
                                                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${srcStyle.bg} ${srcStyle.text} border ${srcStyle.border} max-w-[130px] truncate`} title={srcName}>
                                                                                                {isSrcCard ? <CreditCard size={10} className="shrink-0 text-rose-500" /> : <Wallet size={10} className="shrink-0" />}
                                                                                                <span className="truncate">{srcName}</span>
                                                                                            </span>
                                                                                            <ArrowRightLeft size={10} className="text-amber-500 shrink-0 mx-0.5" />
                                                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${trgStyle.bg} ${trgStyle.text} border ${trgStyle.border} max-w-[130px] truncate`} title={trgName}>
                                                                                                {isTrgCard ? <CreditCard size={10} className="shrink-0 text-rose-500" /> : <Wallet size={10} className="shrink-0" />}
                                                                                                <span className="truncate">{trgName}</span>
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })()
                                                                            ) : (
                                                                                (() => {
                                                                                    const srcObj = t.sourceId;
                                                                                    const srcName = srcObj?.name || (typeof srcObj === 'string' ? srcObj : 'Bank');
                                                                                    const srcStyle = getSourceTagStyle(srcObj || srcName, sources);
                                                                                    const isCard = srcObj?.type === 'Card';

                                                                                    return (
                                                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${srcStyle.bg} ${srcStyle.text} border ${srcStyle.border} max-w-[160px] truncate`} title={srcName}>
                                                                                            {isCard ? <CreditCard size={10} className="shrink-0 text-rose-500" /> : <Wallet size={10} className="shrink-0" />}
                                                                                            <span className="truncate">{srcName}</span>
                                                                                        </span>
                                                                                    );
                                                                                })()
                                                                            )}
                                                                        </div>

                                                                        {/* Reimbursable Pill */}
                                                                        {t.isReimbursable && (
                                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-warning/15 text-warning border border-warning/20 shrink-0" title="Reimbursable: Need to collect money">
                                                                                <Handshake size={10} />
                                                                                <span>Reimbursable</span>
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Row 2 (Middle): Desc and Amt */}
                                                                    <div className="flex items-center justify-between gap-3 min-w-0 py-0.5">
                                                                        <div className="text-sm font-bold text-base-content leading-snug break-words flex-1 min-w-0" title={t.description}>
                                                                            {t.description || "—"}
                                                                        </div>
                                                                        <div className={`font-mono font-black text-base tracking-tight shrink-0 whitespace-nowrap ${
                                                                            t.type === 'Transfer'
                                                                                ? 'text-amber-500 dark:text-amber-400'
                                                                                : (t.type === 'Credit' ? 'text-success' : 'text-error')
                                                                        }`}>
                                                                            {hideNumbers ? "••••••••" : `${t.type === 'Transfer' ? '' : (t.type === 'Credit' ? '+' : '-')}₹${Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                                        </div>
                                                                    </div>

                                                                    {/* Row 3 (Bottom): Category and Sub Category + 3 Action Icons */}
                                                                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-base-content/5">
                                                                        {/* Left: Category and Sub Category */}
                                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                                                            {/* Category Tag */}
                                                                            {(() => {
                                                                                if (!t.categoryId) return null;
                                                                                const catObj = t.categoryId;
                                                                                const catName = catObj?.name || (typeof catObj === 'string' ? catObj : 'Uncategorized');
                                                                                const style = getCategoryTagStyle(catObj || catName, categories);

                                                                                return (
                                                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${style.bg} ${style.text} border ${style.border} max-w-[130px] truncate shrink-0`} title={catName}>
                                                                                        <Tag size={10} className="shrink-0" />
                                                                                        <span className="truncate">{catName}</span>
                                                                                    </span>
                                                                                );
                                                                            })()}

                                                                            {/* Sub Category Tag */}
                                                                            {(() => {
                                                                                const catId = t.categoryId?._id || t.categoryId;
                                                                                const subId = t.subCategoryId?._id || t.subCategoryId;
                                                                                const cat = categories.find(c => c._id === catId);
                                                                                const sub = cat?.subCategories?.find(s => s._id === subId);
                                                                                if (!sub?.name) return null;
                                                                                return (
                                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 max-w-[120px] truncate shrink-0" title={sub.name}>
                                                                                        <Folder size={10} className="shrink-0 text-amber-500" />
                                                                                        <span className="truncate">{sub.name}</span>
                                                                                    </span>
                                                                                );
                                                                            })()}
                                                                        </div>

                                                                        {/* Right: 3 Action Icons (Info, Edit, Delete) */}
                                                                        <div className="flex items-center gap-1 shrink-0 pl-1.5">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setInfoModalTx(t)}
                                                                                className={`btn btn-xs btn-ghost btn-square h-6.5 w-6.5 min-h-0 rounded-lg relative ${
                                                                                    t.info && t.info.trim()
                                                                                        ? "text-primary bg-primary/10 hover:bg-primary/20"
                                                                                        : "text-base-content/40 hover:text-base-content hover:bg-base-200"
                                                                                }`}
                                                                                title={t.info && t.info.trim() ? `Note: ${t.info}` : "Add / View Notes"}
                                                                            >
                                                                                <Info size={13} />
                                                                                {t.info && t.info.trim() && (
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary absolute top-0.5 right-0.5"></span>
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => startEdit(t)}
                                                                                className="btn btn-xs btn-ghost btn-square h-6.5 w-6.5 min-h-0 text-info hover:bg-info/10 rounded-lg"
                                                                                title="Edit Transaction"
                                                                            >
                                                                                <Edit2 size={12} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDelete(t._id)}
                                                                                className="btn btn-xs btn-ghost btn-square h-6.5 w-6.5 min-h-0 text-error hover:bg-error/10 rounded-lg"
                                                                                title="Delete Transaction"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Mobile Empty State */}
                                {filteredTransactions.length === 0 && (
                                    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-base-100/50 rounded-2xl border border-dashed border-base-300">
                                        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-base-content/40">
                                            <Wallet size={22} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm text-base-content/80">No transactions found</h4>
                                            <p className="text-xs text-base-content/50">
                                                {hasActiveFilters
                                                    ? "Try adjusting your search or filters."
                                                    : `No transactions recorded for ${dayjs(currentMonth).format("MMMM YYYY")}.`}
                                            </p>
                                        </div>
                                        {hasActiveFilters ? (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="btn btn-xs btn-outline rounded-xl text-xs gap-1 font-bold"
                                            >
                                                <X size={12} /> Clear Filters
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (setIsAddModalOpen) setIsAddModalOpen(true);
                                                    else setInternalIsAddModalOpen(true);
                                                }}
                                                className="btn btn-xs btn-primary rounded-xl text-xs gap-1 font-bold"
                                            >
                                                <Plus size={13} /> Add Transaction
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
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

            {/* Fixed Floating Column Filter Popover */}
            {activeFilterMenu && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ top: `${activeFilterMenu.top}px`, left: `${activeFilterMenu.left}px` }}
                    className="fixed z-[999999] bg-base-100 p-3 rounded-2xl shadow-2xl border border-base-300 animate-in fade-in zoom-in-95 duration-150 font-normal text-xs normal-case"
                >
                    {activeFilterMenu.type === 'date' && (
                        <div className="w-52 space-y-2">
                            <label className="text-[10px] font-bold text-base-content/50 uppercase block">Filter by Date</label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="input input-xs input-bordered w-full rounded-lg font-medium"
                            />
                            {filters.date && (
                                <button
                                    onClick={() => { setFilters({ ...filters, date: "" }); setActiveFilterMenu(null); }}
                                    className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                >
                                    Clear Date
                                </button>
                            )}
                        </div>
                    )}

                    {activeFilterMenu.type === 'description' && (
                        <div className="w-56 space-y-2">
                            <label className="text-[10px] font-bold text-base-content/50 uppercase block">Search Description</label>
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Search text..."
                                    value={filters.description}
                                    onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                                    className="input input-xs input-bordered w-full pl-7 font-medium rounded-lg"
                                    autoFocus
                                />
                            </div>
                            {filters.description && (
                                <button
                                    onClick={() => { setFilters({ ...filters, description: "" }); setActiveFilterMenu(null); }}
                                    className="text-[10px] text-error font-bold hover:underline block text-right w-full"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}

                    {activeFilterMenu.type === 'sourceId' && (
                        <ul className="menu p-1.5 w-64 font-medium text-xs max-h-60 overflow-y-auto">
                            <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Account</li>
                            <li>
                                <a onClick={() => { setFilters({ ...filters, sourceId: "" }); setActiveFilterMenu(null); }} className={!filters.sourceId ? "font-bold text-primary" : ""}>
                                    All Accounts
                                </a>
                            </li>
                            {sources.map((s) => {
                                const isCard = s.type === 'Card';
                                const cardDue = isCard ? getCardDueAmount(s, transactions) : 0;
                                const amt = isCard ? cardDue : (s.balance || 0);
                                const formattedAmt = isCard
                                    ? `Due: ₹${cardDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    : (amt < 0 ? `-₹${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                                return (
                                    <li key={s._id}>
                                        <a onClick={() => { setFilters({ ...filters, sourceId: s._id }); setActiveFilterMenu(null); }} className={`flex items-center justify-between gap-2 ${String(filters.sourceId) === String(s._id) ? "font-bold text-primary" : ""}`}>
                                            <span className="truncate">{s.name}</span>
                                            <span className={`text-[10px] font-mono font-bold shrink-0 ${isCard ? 'text-error' : (amt < 0 ? 'text-error' : 'text-success')}`}>{formattedAmt}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {activeFilterMenu.type === 'categoryId' && (
                        <ul className="menu p-1.5 w-56 font-medium text-xs max-h-60 overflow-y-auto">
                            <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Category</li>
                            <li>
                                <a onClick={() => { setFilters({ ...filters, categoryId: "", subCategoryId: "" }); setActiveFilterMenu(null); }} className={!filters.categoryId ? "font-bold text-primary" : ""}>
                                    All Categories
                                </a>
                            </li>
                            {monthCategories.map((c) => (
                                <li key={c._id}>
                                    <a onClick={() => { setFilters({ ...filters, categoryId: c._id, subCategoryId: "" }); setActiveFilterMenu(null); }} className={`truncate max-w-[200px] ${String(filters.categoryId) === String(c._id) ? "font-bold text-primary" : ""}`}>
                                        {c.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    {activeFilterMenu.type === 'subCategoryId' && (
                        <ul className="menu p-1.5 w-56 font-medium text-xs max-h-60 overflow-y-auto">
                            <li className="menu-title text-[10px] uppercase font-bold text-base-content/50">Filter Sub Category</li>
                            <li>
                                <a onClick={() => { setFilters({ ...filters, subCategoryId: "" }); setActiveFilterMenu(null); }} className={!filters.subCategoryId ? "font-bold text-primary" : ""}>
                                    All Sub Categories
                                </a>
                            </li>
                            {(filters.categoryId
                                ? getSubCatOptions(filters.categoryId)
                                : categories.flatMap(c => getSubCatOptions(c._id))
                            ).map((sub) => (
                                <li key={sub.value}>
                                    <a onClick={() => { setFilters({ ...filters, subCategoryId: sub.value }); setActiveFilterMenu(null); }} className={String(filters.subCategoryId) === String(sub.value) ? "font-bold text-primary" : ""}>
                                        {sub.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Header Display Customization Modal Popup with Live Visualization Preview */}
            {showHeaderSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-5 relative overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-base-200 pb-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <SlidersHorizontal size={20} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-base-content">
                                        Day Header Display Settings
                                    </h3>
                                    <p className="text-xs text-base-content/60">
                                        Select which metrics to display on day headers. See the live preview update below.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHeaderSettingsModal(false)}
                                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Live Header Visualization Preview Box */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-base-content/70 px-1">
                                <span className="flex items-center gap-1.5">
                                    <Eye size={14} className="text-primary" /> Live Header Visualization
                                </span>
                                <span className="text-[10px] text-base-content/40 uppercase tracking-wider font-semibold">Single Line View</span>
                            </div>

                            {/* Live Interactive Sample Header Row (No Scrollbar) */}
                            <div className="p-3.5 bg-base-200/80 border border-primary/30 rounded-2xl shadow-inner overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <div className="flex items-center gap-4 whitespace-nowrap">
                                    <button type="button" className="btn btn-xs btn-square btn-ghost text-base-content/70 shrink-0">
                                        <ChevronDown size={15} className="text-primary" />
                                    </button>

                                    <span className="font-extrabold text-xs text-base-content whitespace-nowrap shrink-0">
                                        Sun, Aug 15, 2026
                                    </span>

                                    {headerSettings.showTotalTxn && (
                                        <span className="badge badge-sm badge-neutral font-bold text-[10px] opacity-90 px-2.5 py-1 whitespace-nowrap shrink-0">
                                            3 transactions
                                        </span>
                                    )}

                                    {headerSettings.showCreditCount && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap shrink-0">
                                            <TrendingUp size={11} /> 1 Credit
                                        </span>
                                    )}

                                    {headerSettings.showDebitCount && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 whitespace-nowrap shrink-0">
                                            <TrendingDown size={11} /> 2 Debits
                                        </span>
                                    )}

                                    {headerSettings.showCreditAmt && (
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono font-bold text-xs shrink-0">
                                            <span className="text-base-content/40 text-[10px] font-sans uppercase font-semibold">Credited:</span>
                                            <span>+₹5,000.00</span>
                                        </div>
                                    )}

                                    {headerSettings.showDebitAmt && (
                                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono font-bold text-xs shrink-0">
                                            <span className="text-base-content/40 text-[10px] font-sans uppercase font-semibold">Debited:</span>
                                            <span>-₹2,200.00</span>
                                        </div>
                                    )}

                                    {headerSettings.showNet && (
                                        <div className="flex items-center gap-1 whitespace-nowrap font-mono font-bold text-xs shrink-0">
                                            <span className="text-base-content/50 text-[10px] font-sans uppercase font-semibold">Net:</span>
                                            <span className="text-success">+₹2,800.00</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Metric Selection Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                            <div
                                onClick={() => updateHeaderSettings("showTotalTxn", !headerSettings.showTotalTxn)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                    headerSettings.showTotalTxn
                                        ? 'border-primary/50 bg-primary/10 shadow-xs'
                                        : 'border-base-200 bg-base-100 hover:border-base-300 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-primary pointer-events-none"
                                        checked={headerSettings.showTotalTxn}
                                        readOnly
                                    />
                                    <span className="text-xs font-bold text-base-content">Total Transactions</span>
                                </div>
                                <span className="badge badge-xs badge-neutral">3 txn</span>
                            </div>

                            <div
                                onClick={() => updateHeaderSettings("showNet", !headerSettings.showNet)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                    headerSettings.showNet
                                        ? 'border-primary/50 bg-primary/10 shadow-xs'
                                        : 'border-base-200 bg-base-100 hover:border-base-300 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-primary pointer-events-none"
                                        checked={headerSettings.showNet}
                                        readOnly
                                    />
                                    <span className="text-xs font-bold text-base-content">Net Total Amount</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-success">+₹2,800</span>
                            </div>

                            <div
                                onClick={() => updateHeaderSettings("showCreditAmt", !headerSettings.showCreditAmt)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                    headerSettings.showCreditAmt
                                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs'
                                        : 'border-base-200 bg-base-100 hover:border-base-300 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-success pointer-events-none"
                                        checked={headerSettings.showCreditAmt}
                                        readOnly
                                    />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Total Credited Amount</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-emerald-500">+₹5,000</span>
                            </div>

                            <div
                                onClick={() => updateHeaderSettings("showDebitAmt", !headerSettings.showDebitAmt)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                    headerSettings.showDebitAmt
                                        ? 'border-rose-500/50 bg-rose-500/10 shadow-xs'
                                        : 'border-base-200 bg-base-100 hover:border-base-300 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-error pointer-events-none"
                                        checked={headerSettings.showDebitAmt}
                                        readOnly
                                    />
                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Total Debited Amount</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-rose-500">-₹2,200</span>
                            </div>

                            <div
                                onClick={() => updateHeaderSettings("showCreditCount", !headerSettings.showCreditCount)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                    headerSettings.showCreditCount
                                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs'
                                        : 'border-base-200 bg-base-100 hover:border-base-300 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-success pointer-events-none"
                                        checked={headerSettings.showCreditCount}
                                        readOnly
                                    />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Credit Count</span>
                                </div>
                                <span className="badge badge-xs badge-success text-white font-bold">1 Cr</span>
                            </div>

                            <div
                                onClick={() => updateHeaderSettings("showDebitCount", !headerSettings.showDebitCount)}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                    headerSettings.showDebitCount
                                        ? 'border-rose-500/50 bg-rose-500/10 shadow-xs'
                                        : 'border-base-200 bg-base-100 hover:border-base-300 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-error pointer-events-none"
                                        checked={headerSettings.showDebitCount}
                                        readOnly
                                    />
                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Debit Count</span>
                                </div>
                                <span className="badge badge-xs badge-error text-white font-bold">2 Dr</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-base-200 pt-3.5">
                            <button
                                onClick={() => {
                                    setHeaderSettings(DEFAULT_HEADER_SETTINGS);
                                    try {
                                        localStorage.setItem("expense_header_metrics", JSON.stringify(DEFAULT_HEADER_SETTINGS));
                                    } catch (e) {}
                                }}
                                className="btn btn-sm btn-ghost text-xs font-bold text-base-content/60 hover:text-base-content"
                            >
                                Reset Defaults
                            </button>

                            <button
                                onClick={() => setShowHeaderSettingsModal(false)}
                                className="btn btn-sm btn-primary rounded-xl font-bold px-6 shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Info / Notes Modal */}
            {infoModalTx && (
                <TransactionInfoModal
                    transaction={infoModalTx}
                    isOpen={Boolean(infoModalTx)}
                    onClose={() => setInfoModalTx(null)}
                />
            )}
        </div>
    );
};

export default ExpenseTable;
