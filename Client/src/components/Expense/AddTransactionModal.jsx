import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { addTransaction } from "../../services/redux/slice/ExpenseSlice";
import { getSourceTagStyle, getCategoryTagStyle } from "../../utils/expenseTheme";
import {
  X,
  Save,
  Handshake,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Folder,
  Tag,
  CheckCircle2,
  PlusCircle,
  Wallet,
  Layers,
  Sparkles,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building2
} from "lucide-react";
import { message } from "antd";
import { evaluateMathExpression } from "../../utils/mathExpression";

const AddTransactionModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { categories, sources, currentMonth, transactions } = useSelector((state) => state.expense);

  // Form State
  const [transactionType, setTransactionType] = useState("Debit"); // "Debit" | "DebitMoney" | "Credit" | "Transfer"
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [viewMonth, setViewMonth] = useState(dayjs().format("YYYY-MM-DD"));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [targetSourceId, setTargetSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset / Sync viewMonth when opening modal
  useEffect(() => {
    if (isOpen) {
      const todayStr = dayjs().format("YYYY-MM-DD");
      setDate(todayStr);
      setViewMonth(todayStr);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const calculatedAmount = evaluateMathExpression(amount);

  // Selected Month based strictly on chosen transaction date (defaults to currentMonth)
  const selectedMonth = useMemo(() => {
    return date ? dayjs(date).format("YYYY-MM") : (currentMonth || dayjs().format("YYYY-MM"));
  }, [date, currentMonth]);

  // Filter Categories for the Selected Month
  const selectedMonthCategories = useMemo(() => {
    return categories.filter(c => !c.month || c.month === selectedMonth);
  }, [categories, selectedMonth]);

  // Transactions in selected month for accurate budget & spent calculations
  const selectedMonthTxns = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      return dayjs(t.date).format("YYYY-MM") === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // Card due amount calculation across transactions & source balance
  const getCardDueAmount = (source) => {
    if (!source || source.type !== 'Card') return 0;
    if (source.cardDue !== undefined && source.cardDue !== null && Number(source.cardDue) > 0) {
      return Number(source.cardDue);
    }
    const bal = Number(source.balance) || 0;
    if (bal < 0) return Math.abs(bal);
    if (source.cardDue !== undefined && source.cardDue !== null) {
      return Number(source.cardDue);
    }
    const cardDebits = (transactions || [])
      .filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(source._id))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const cardCredits = (transactions || [])
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

  // Get selected Category Object in selectedMonthCategories or matching by name
  const selectedCategoryObj = useMemo(() => {
    if (!categoryId) return null;
    const directMatch = selectedMonthCategories.find(c => String(c._id) === String(categoryId));
    if (directMatch) return directMatch;
    const anyCat = categories.find(c => String(c._id) === String(categoryId));
    if (anyCat) {
      const nameMatch = selectedMonthCategories.find(c => c.name === anyCat.name);
      if (nameMatch) return nameMatch;
      return anyCat;
    }
    return null;
  }, [categoryId, selectedMonthCategories, categories]);

  // Get Category Tag Style for subcategories
  const selectedCategoryStyle = selectedCategoryObj ? getCategoryTagStyle(selectedCategoryObj, selectedMonthCategories) : null;

  // Get Subcategories for Selected Category
  const subCategoriesList = useMemo(() => {
    return selectedCategoryObj?.subCategories || [];
  }, [selectedCategoryObj]);

  const selectedSubCategoryObj = useMemo(() => {
    if (!subCategoryId) return null;
    return subCategoriesList.find(s => String(s._id) === String(subCategoryId)) || null;
  }, [subCategoryId, subCategoriesList]);

  // Dynamic Category Budget, Spent, and Balance for selectedMonth
  const { catBudget, catSpent, catBalance } = useMemo(() => {
    if (!selectedCategoryObj) return { catBudget: 0, catSpent: 0, catBalance: 0 };
    const budget = (selectedCategoryObj.subCategories || []).reduce(
      (sum, sub) => sum + (Number(sub.budget) || 0),
      Number(selectedCategoryObj.budget) || 0
    );
    const spent = selectedMonthTxns
      .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (
        String(t.categoryId?._id || t.categoryId) === String(selectedCategoryObj._id) ||
        (t.categoryId?.name && t.categoryId.name === selectedCategoryObj.name)
      ))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const balance = (budget - spent) === 0 ? 0 : (budget - spent);
    return { catBudget: budget, catSpent: spent, catBalance: balance };
  }, [selectedCategoryObj, selectedMonthTxns]);

  // Helper to check if a transaction belongs strictly to a subcategory
  const isTransactionMatchingSubCategory = (t, targetSub, targetCategory) => {
    if (!targetSub || !targetSub._id) return false;
    if (t.type === 'Credit' || t.type === 'Transfer') return false;
    const tSubId = String(t.subCategoryId?._id || t.subCategoryId || "");
    if (!tSubId) return false;

    // 1. Direct ID match
    if (tSubId === String(targetSub._id)) return true;

    // 2. Name match for identical subcategory under same parent category name across cloned versions
    const tCatId = String(t.categoryId?._id || t.categoryId || "");
    const parentCatName = targetCategory?.name;
    const isCatMatch = (targetCategory?._id && tCatId === String(targetCategory._id)) ||
                       (parentCatName && t.categoryId?.name === parentCatName);

    if (isCatMatch && targetSub.name) {
      const matchCat = categories.find(c => String(c._id) === tCatId || c.name === parentCatName);
      const matchSub = matchCat?.subCategories?.find(s => String(s._id) === tSubId);
      if (matchSub && matchSub.name?.trim().toLowerCase() === targetSub.name?.trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  // Dynamic Subcategory Budget, Spent, and Balance for selectedMonth
  const { subBudget, subSpent, subBalance } = useMemo(() => {
    if (!selectedSubCategoryObj) return { subBudget: 0, subSpent: 0, subBalance: 0 };
    const budget = Number(selectedSubCategoryObj.budget) || 0;
    const spent = selectedMonthTxns
      .filter(t => isTransactionMatchingSubCategory(t, selectedSubCategoryObj, selectedCategoryObj))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const balance = (budget - spent) === 0 ? 0 : (budget - spent);
    return { subBudget: budget, subSpent: spent, subBalance: balance };
  }, [selectedSubCategoryObj, selectedCategoryObj, selectedMonthTxns, categories]);

  const catAfter = catBalance - (calculatedAmount || 0);
  const subAfter = subBalance - (calculatedAmount || 0);

  // Reset SubCategory when Category changes
  const handleCategorySelect = (catId) => {
    setCategoryId(catId);
    setSubCategoryId("");
  };

  const handleTypeSelect = (type) => {
    setTransactionType(type);
    setCategoryId("");
    setSubCategoryId("");
    setTargetSourceId("");
  };

  // Calendar Days calculation for the current viewMonth
  const calendarDays = useMemo(() => {
    const startOfMonth = dayjs(viewMonth).startOf("month");
    const daysInCurrentMonth = startOfMonth.daysInMonth();
    const startDayOfWeek = startOfMonth.day(); // 0 = Sun, 1 = Mon, ...

    const prevMonth = startOfMonth.subtract(1, "month");
    const daysInPrevMonth = prevMonth.daysInMonth();

    const days = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateStr = prevMonth.date(d).format("YYYY-MM-DD");
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const dateStr = startOfMonth.date(i).format("YYYY-MM-DD");
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const remainingCells = (7 - (days.length % 7)) % 7;
    const nextMonth = startOfMonth.add(1, "month");
    for (let i = 1; i <= remainingCells; i++) {
      const dateStr = nextMonth.date(i).format("YYYY-MM-DD");
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewMonth]);

  const handlePrevMonth = () => {
    setViewMonth((prev) => dayjs(prev).subtract(1, "month").format("YYYY-MM-DD"));
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => dayjs(prev).add(1, "month").format("YYYY-MM-DD"));
  };

  const handleSelectDay = (cell) => {
    setDate(cell.dateStr);
    if (!cell.isCurrentMonth) {
      setViewMonth(cell.dateStr);
    }
  };

  const handleQuickToday = () => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    setDate(todayStr);
    setViewMonth(todayStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      message.error("Please enter a transaction description");
      return;
    }
    if (!sourceId) {
      message.error("Please select a From Payment Source / Bank");
      return;
    }
    const finalAmount = evaluateMathExpression(amount) ?? (Number(amount) || 0);
    if (!amount || finalAmount <= 0) {
      message.error("Please enter a valid positive amount");
      return;
    }

    if (transactionType === "Transfer") {
      if (!targetSourceId) {
        message.error("Please select a Target Account (Bank or Card) to transfer money to");
        return;
      }
      if (sourceId === targetSourceId) {
        message.error("Source account and Target account cannot be the same account");
        return;
      }
    }

    if (transactionType === "Debit") {
      if (!categoryId) {
        message.error("Please select a Category for this expense");
        return;
      }
      if (!subCategoryId) {
        message.error("Please select a Sub Category for the selected category");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await dispatch(addTransaction({
        date: date || new Date(),
        description: description.trim(),
        sourceId,
        targetSourceId: transactionType === "Transfer" ? targetSourceId : undefined,
        categoryId: transactionType === "Debit" ? categoryId : undefined,
        subCategoryId: (transactionType === "Debit" && subCategoryId) ? subCategoryId : undefined,
        amount: finalAmount,
        type: (transactionType === "DebitMoney" || transactionType === "Debit") ? "Debit" : transactionType,
        isReimbursable
      })).unwrap();

      message.success("Transaction logged successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      
      <div className="w-full max-w-[1540px] my-auto flex flex-col items-center justify-center">
        
        {/* Top Floating Control Bar */}
        <div className="w-full mb-3 flex items-center justify-between bg-base-100/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-base-300 shadow-xl shrink-0">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <div className="p-1.5 rounded-xl bg-primary/15 text-primary shrink-0">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2 leading-none">
                <span>Add Transaction</span>
              </h3>
              <p className="text-[10px] opacity-60 font-medium mt-0.5">5 Standalone Popups — Select from left to right</p>
            </div>

            {/* Dynamic Selection Path Breadcrumbs */}
            <div className="hidden md:flex items-center gap-1.5 ml-3 pl-3 border-l border-base-300 text-xs overflow-x-auto [scrollbar-width:none]">
              <span className="badge badge-sm font-bold bg-base-200">
                {transactionType === "Debit" ? "Expense" : (transactionType === "DebitMoney" ? "Debit Money" : (transactionType === "Credit" ? "Add Money" : "Transfer"))}
              </span>
              {sourceId && (
                <>
                  <span className="text-base-content/40 text-[10px]">→</span>
                  {(() => {
                    const src = sources.find(s => String(s._id) === String(sourceId));
                    const sStyle = getSourceTagStyle(src, sources);
                    const isCard = src?.type === "Card";
                    const cardDue = isCard ? getCardDueAmount(src) : null;
                    return (
                      <span className={`badge badge-sm font-bold ${sStyle.bg} ${sStyle.text} border-transparent flex items-center gap-1`}>
                        <span>{src?.name || "From Account"}</span>
                        {isCard && <span className="opacity-80 font-mono text-[9px] font-extrabold">(Due: ₹{cardDue.toLocaleString()})</span>}
                      </span>
                    );
                  })()}
                </>
              )}
              {transactionType === "Transfer" && targetSourceId && (
                <>
                  <span className="text-base-content/40 text-[10px]">→</span>
                  {(() => {
                    const trg = sources.find(s => String(s._id) === String(targetSourceId));
                    const tStyle = getSourceTagStyle(trg, sources);
                    const isCard = trg?.type === "Card";
                    const cardDue = isCard ? getCardDueAmount(trg) : null;
                    return (
                      <span className={`badge badge-sm font-bold ${tStyle.bg} ${tStyle.text} border-transparent flex items-center gap-1`}>
                        <span>To {trg?.name}</span>
                        {isCard && <span className="opacity-80 font-mono text-[9px] font-extrabold">(Due: ₹{cardDue.toLocaleString()})</span>}
                      </span>
                    );
                  })()}
                </>
              )}
              {transactionType === "Debit" && categoryId && selectedCategoryStyle && (
                <>
                  <span className="text-base-content/40 text-[10px]">→</span>
                  <span className={`badge badge-sm font-bold ${selectedCategoryStyle.bg} ${selectedCategoryStyle.text} border-transparent`}>
                    {selectedCategoryObj?.name}
                  </span>
                </>
              )}
              {transactionType === "Debit" && subCategoryId && selectedCategoryStyle && (
                <>
                  <span className="text-base-content/40 text-[10px]">→</span>
                  <span className={`badge badge-sm font-bold ${selectedCategoryStyle.bg} ${selectedCategoryStyle.text} border-transparent`}>
                    {subCategoriesList.find(s => String(s._id) === String(subCategoryId))?.name}
                  </span>
                </>
              )}
              {calculatedAmount !== null && (
                <>
                  <span className="text-base-content/40 text-[10px]">→</span>
                  <span className="badge badge-sm font-mono font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-transparent">
                    ₹{calculatedAmount.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/70 hover:text-base-content"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* 5 Distinct Popups Grid (Comfortable Height 540px) */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">

            {/* POPUP 1: Transaction Type with Tags (Extreme Left) */}
            <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-4 flex flex-col justify-between h-[540px] w-full min-w-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-black">1</span>
                  <span className="font-extrabold text-xs uppercase tracking-wider">Transaction Type</span>
                </div>
                <Layers size={14} className="text-base-content/40" />
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-0.5">
                {/* 1. Expense */}
                <button
                  type="button"
                  onClick={() => handleTypeSelect("Debit")}
                  className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between border-transparent ${
                    transactionType === "Debit"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                      : "bg-base-200/50 hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${transactionType === "Debit" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-base-300 text-base-content/60"}`}>
                      <TrendingDown size={16} />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">Expense</span>
                      <span className="text-[10px] opacity-60">Standard Category Spend</span>
                    </div>
                  </div>
                  {transactionType === "Debit" && <CheckCircle2 size={16} className="text-rose-600 dark:text-rose-400" />}
                </button>

                {/* 2. Debit Money */}
                <button
                  type="button"
                  onClick={() => handleTypeSelect("DebitMoney")}
                  className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between border-transparent ${
                    transactionType === "DebitMoney"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                      : "bg-base-200/50 hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${transactionType === "DebitMoney" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-base-300 text-base-content/60"}`}>
                      <Wallet size={16} />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">Debit Money</span>
                      <span className="text-[10px] opacity-60">Account deduction (No category)</span>
                    </div>
                  </div>
                  {transactionType === "DebitMoney" && <CheckCircle2 size={16} className="text-rose-600 dark:text-rose-400" />}
                </button>

                {/* 3. Add Money */}
                <button
                  type="button"
                  onClick={() => handleTypeSelect("Credit")}
                  className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between border-transparent ${
                    transactionType === "Credit"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                      : "bg-base-200/50 hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${transactionType === "Credit" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-base-300 text-base-content/60"}`}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">Add Money</span>
                      <span className="text-[10px] opacity-60">Income / Balance Top-up</span>
                    </div>
                  </div>
                  {transactionType === "Credit" && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
                </button>

                {/* 4. Transfer */}
                <button
                  type="button"
                  onClick={() => handleTypeSelect("Transfer")}
                  className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between border-transparent ${
                    transactionType === "Transfer"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "bg-base-200/50 hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${transactionType === "Transfer" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-base-300 text-base-content/60"}`}>
                      <ArrowRightLeft size={16} />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">Transfer</span>
                      <span className="text-[10px] opacity-60">Between your bank accounts</span>
                    </div>
                  </div>
                  {transactionType === "Transfer" && <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />}
                </button>
              </div>

              {/* Status Hint */}
              <div className="pt-2 border-t border-base-200 text-center text-[10px] opacity-50 shrink-0">
                Selected: {transactionType === "Debit" ? "Expense" : (transactionType === "DebitMoney" ? "Debit Money" : (transactionType === "Credit" ? "Add Money" : "Transfer"))}
              </div>
            </div>

            {/* POPUP 2: From Source / Bank Account with Individual Source Color Tags */}
            <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-4 flex flex-col justify-between h-[540px] w-full min-w-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">2</span>
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    {transactionType === "Credit" ? "To Account" : "From Account"}
                  </span>
                </div>
                <Wallet size={14} className="text-base-content/40" />
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5">
                {sources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                    <span className="text-xs font-bold">No Accounts Found</span>
                    <span className="text-[10px] opacity-75 mt-1">Add accounts in Settings</span>
                  </div>
                ) : (
                  sources.map((s) => {
                    const isSelected = String(s._id) === String(sourceId);
                    const tagStyle = getSourceTagStyle(s, sources);
                    const isCard = s.type === "Card";
                    const cardDue = isCard ? getCardDueAmount(s) : 0;

                    let displayAmtText = "";
                    if (isCard) {
                      if (isSelected && calculatedAmount && calculatedAmount > 0 && (transactionType === "Debit" || transactionType === "DebitMoney")) {
                        const nextDue = cardDue + calculatedAmount;
                        displayAmtText = `Due: ₹${cardDue.toLocaleString()} → ₹${nextDue.toLocaleString()}`;
                      } else {
                        displayAmtText = `Due: ₹${cardDue.toLocaleString()}`;
                      }
                    } else {
                      const curBal = Number(s.balance) || 0;
                      if (isSelected && calculatedAmount && calculatedAmount > 0) {
                        const nextBal = transactionType === "Credit" ? (curBal + calculatedAmount) : (curBal - calculatedAmount);
                        displayAmtText = `₹${curBal.toLocaleString()} → ₹${nextBal.toLocaleString()}`;
                      } else {
                        displayAmtText = `₹${curBal.toLocaleString()}`;
                      }
                    }

                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setSourceId(s._id)}
                        className={`p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-1.5 border-transparent cursor-pointer ${
                          isSelected
                            ? `${tagStyle.bg} ${tagStyle.text} font-bold shadow-xs`
                            : "bg-transparent hover:bg-base-200/50 text-base-content/80"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCard ? (
                            <CreditCard size={13} className="shrink-0 text-rose-500" />
                          ) : (
                            <Building2 size={13} className="shrink-0 opacity-70" />
                          )}
                          <span className="text-xs truncate font-semibold">{s.name}</span>
                          {isCard && <span className="badge badge-xs badge-error font-extrabold scale-75">Card</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] opacity-75 font-mono font-semibold">
                            {displayAmtText}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="shrink-0 text-primary" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Status Hint */}
              <div className="pt-2 border-t border-base-200 text-center text-[10px] opacity-50 shrink-0">
                {sourceId ? "Account Selected" : "Select Source Account"}
              </div>
            </div>

            {/* POPUP 3: Expense Category / Target Source (for Transfer) with Category Color Tags */}
            <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-4 flex flex-col justify-between h-[540px] w-full min-w-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-black">3</span>
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    {transactionType === "Transfer" ? "Target Account" : "Category"}
                  </span>
                </div>
                <Folder size={14} className="text-base-content/40" />
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5">
                {transactionType === "Transfer" ? (
                  // Transfer Mode: Select Target Bank Account or Credit Card
                  (() => {
                    const availableSources = sources.filter(s => String(s._id) !== String(sourceId));
                    const bankTargets = availableSources.filter(s => s.type !== "Card");
                    const cardTargets = availableSources.filter(s => s.type === "Card");

                    if (availableSources.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                          <span className="text-xs font-bold">No Other Accounts</span>
                          <span className="text-[10px] opacity-75 mt-1">Add another bank or card in Settings</span>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-2">
                        {/* Bank Accounts & Wallets Section */}
                        {bankTargets.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5">
                              <Building2 size={11} className="text-primary" />
                              <span>Bank Accounts & Wallets</span>
                            </div>
                            {bankTargets.map((s) => {
                              const isSelected = String(s._id) === String(targetSourceId);
                              const tagStyle = getSourceTagStyle(s, sources);
                              const curBal = Number(s.balance) || 0;
                              let displayTargetBal = `₹${curBal.toLocaleString()}`;
                              if (isSelected && calculatedAmount && calculatedAmount > 0) {
                                displayTargetBal = `₹${curBal.toLocaleString()} → ₹${(curBal + calculatedAmount).toLocaleString()}`;
                              }

                              return (
                                <button
                                  key={s._id}
                                  type="button"
                                  onClick={() => setTargetSourceId(s._id)}
                                  className={`p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-1.5 border-transparent cursor-pointer w-full ${
                                    isSelected
                                      ? `${tagStyle.bg} ${tagStyle.text} font-bold shadow-xs`
                                      : "bg-transparent hover:bg-base-200/50 text-base-content/80"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Building2 size={13} className="shrink-0 opacity-70" />
                                    <span className="text-xs truncate font-semibold">{s.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] opacity-75 font-mono font-semibold">
                                      {displayTargetBal}
                                    </span>
                                    {isSelected && <CheckCircle2 size={14} className="shrink-0 text-primary" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Credit Cards Section */}
                        {cardTargets.length > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-base-200/80">
                            <div className="text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-0.5 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <CreditCard size={11} className="text-rose-500" />
                                <span>Credit Cards (Bill Payment / Transfer)</span>
                              </span>
                              <span className="badge badge-xs badge-error font-extrabold scale-75">Card</span>
                            </div>
                            {cardTargets.map((s) => {
                              const isSelected = String(s._id) === String(targetSourceId);
                              const tagStyle = getSourceTagStyle(s, sources);
                              const cardDue = getCardDueAmount(s);

                              let displayTargetDue = `Due: ₹${cardDue.toLocaleString()}`;
                              if (isSelected && calculatedAmount && calculatedAmount > 0) {
                                const nextDue = Math.max(0, cardDue - calculatedAmount);
                                displayTargetDue = `Due: ₹${cardDue.toLocaleString()} → ₹${nextDue.toLocaleString()}`;
                              }

                              return (
                                <button
                                  key={s._id}
                                  type="button"
                                  onClick={() => setTargetSourceId(s._id)}
                                  className={`p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-1.5 border-transparent cursor-pointer w-full ${
                                    isSelected
                                      ? `${tagStyle.bg} ${tagStyle.text} font-bold shadow-xs`
                                      : "bg-transparent hover:bg-base-200/50 text-base-content/80"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <CreditCard size={13} className="shrink-0 text-rose-500" />
                                    <div className="min-w-0 flex flex-col">
                                      <span className="text-xs truncate font-semibold">{s.name}</span>
                                      {s.limit > 0 && (
                                        <span className="text-[9px] opacity-50 font-mono">Limit: ₹{s.limit.toLocaleString()}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] font-bold font-mono text-rose-500">
                                      {displayTargetDue}
                                    </span>
                                    {isSelected && <CheckCircle2 size={14} className="shrink-0 text-primary" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (transactionType === "DebitMoney" || transactionType === "Credit") ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                    <span className="text-xs font-bold">No Category Needed</span>
                    <span className="text-[10px] opacity-75 mt-1">Category is optional for {transactionType === "Credit" ? "Income" : "Debit Money"}</span>
                  </div>
                ) : selectedMonthCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                    <span className="text-xs font-bold">No Categories Found</span>
                    <span className="text-[10px] opacity-75 mt-1">Configure categories for {dayjs(date).format("MMMM YYYY")}</span>
                  </div>
                ) : (
                  selectedMonthCategories.map((c) => {
                    const isSelected = String(c._id) === String(categoryId);
                    const style = getCategoryTagStyle(c, selectedMonthCategories);

                    // Dynamic Remaining Calculation for Category in selectedMonth
                    const cBudget = (c.subCategories || []).reduce(
                      (sum, sub) => sum + (Number(sub.budget) || 0),
                      Number(c.budget) || 0
                    );
                    const cUsed = selectedMonthTxns
                      .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (
                        String(t.categoryId?._id || t.categoryId) === String(c._id) ||
                        (t.categoryId?.name && t.categoryId.name === c.name)
                      ))
                      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                    const rem = cBudget - cUsed;
                    const formattedRem = rem >= 0 ? `₹${rem.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `-₹${Math.abs(rem).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => handleCategorySelect(c._id)}
                        className={`p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-1.5 border-transparent cursor-pointer ${
                          isSelected
                            ? `${style.bg} ${style.text} font-bold shadow-xs`
                            : "bg-transparent hover:bg-base-200/50 text-base-content/80"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder size={13} className="shrink-0" />
                          <span className="font-bold text-xs truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] opacity-75 font-mono font-semibold">
                            {formattedRem}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="shrink-0" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Status Hint */}
              <div className="pt-2 border-t border-base-200 text-center text-[10px] opacity-50 shrink-0">
                {categoryId ? "Category Selected" : (transactionType === "Transfer" ? (targetSourceId ? "Target Selected" : "Select Target Bank or Card") : "Select Category")}
              </div>
            </div>

            {/* POPUP 4: Expense Sub Category */}
            <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-4 flex flex-col justify-between h-[540px] w-full min-w-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-black">4</span>
                  <span className="font-extrabold text-xs uppercase tracking-wider">Sub Category</span>
                </div>
                <Tag size={14} className="text-base-content/40" />
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5">
                {transactionType !== "Debit" ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                    <span className="text-xs font-bold">Not Applicable</span>
                    <span className="text-[10px] opacity-75 mt-1">Only used for standard Expense</span>
                  </div>
                ) : !categoryId ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                    <Folder size={28} className="mb-2 opacity-40" />
                    <span className="text-xs font-bold">Select a Category First</span>
                    <span className="text-[10px] opacity-75 mt-1">Choose from Popup 3 to view subcategories</span>
                  </div>
                ) : subCategoriesList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                    <span className="text-xs font-bold">No Subcategories</span>
                    <span className="text-[10px] opacity-75 mt-1">"{selectedCategoryObj?.name}" has no subcategories</span>
                  </div>
                ) : (
                  subCategoriesList.map((sub) => {
                    const isSelected = String(sub._id) === String(subCategoryId);
                    const sBudget = Number(sub.budget) || 0;
                    const sUsed = selectedMonthTxns
                      .filter(t => isTransactionMatchingSubCategory(t, sub, selectedCategoryObj))
                      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                    const rem = (sBudget - sUsed) === 0 ? 0 : (sBudget - sUsed);
                    const formattedRem = rem >= 0 ? `₹${rem.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `-₹${Math.abs(rem).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

                    const activeStyle = selectedCategoryStyle || { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400" };

                    return (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => setSubCategoryId(prev => prev === sub._id ? "" : sub._id)}
                        className={`p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-1.5 border-transparent cursor-pointer ${
                          isSelected
                            ? `${activeStyle.bg} ${activeStyle.text} font-bold shadow-xs`
                            : "bg-transparent hover:bg-base-200/50 text-base-content/80"
                        }`}
                      >
                        <span className="font-bold text-xs truncate">{sub.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] opacity-75 font-mono font-semibold">
                            {formattedRem}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="shrink-0 text-primary" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Status Hint */}
              <div className="pt-2 border-t border-base-200 text-center text-[10px] opacity-50 shrink-0">
                {subCategoryId ? "Subcategory Selected" : "Click to select or deselect"}
              </div>
            </div>

            {/* POPUP 5: Input Fields & Save (Extreme Right) with Integrated Month Calendar */}
            <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-4 flex flex-col justify-between h-[540px] w-full min-w-0">
              <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                <div className="flex items-center justify-between pb-1.5 border-b border-base-200 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black">5</span>
                    <span className="font-extrabold text-xs uppercase tracking-wider">Details & Save</span>
                  </div>
                  <Sparkles size={14} className="text-base-content/40" />
                </div>

                {/* Amount with Math Expression & Dynamic Total */}
                <div>
                  <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Amount (₹)</span>
                    <span className="text-[9px] lowercase font-normal opacity-60">math: + - * /</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {/* Calculation Input Field */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. 23-8-4"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input input-xs input-bordered w-full text-xs font-bold font-mono focus:input-primary text-left px-2 h-8"
                        autoFocus
                      />
                    </div>

                    {/* Equal Symbol */}
                    <div className="text-xs font-black text-base-content/40 select-none">=</div>

                    {/* Dynamic Calculation Total Field */}
                    <div
                      className={`w-20 sm:w-24 shrink-0 input input-xs input-bordered bg-base-200/80 flex items-center justify-end px-1.5 font-mono font-extrabold text-xs select-none truncate h-8 ${
                        calculatedAmount !== null ? 'text-primary font-black' : 'text-base-content/40'
                      }`}
                      title={calculatedAmount !== null ? `Calculated: ₹${calculatedAmount.toLocaleString()}` : "0.00"}
                    >
                      {calculatedAmount !== null
                        ? `₹${calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                        : "₹0.00"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-0.5">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grocery, Fuel, Dinner..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input input-xs input-bordered w-full text-xs font-semibold focus:input-primary h-8"
                  />
                </div>

                {/* Interactive Month Calendar Date Selector */}
                <div className="bg-base-200/50 p-2 rounded-2xl border border-base-200 flex flex-col gap-1">
                  
                  {/* Month Navigation Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-base-300 text-base-content/70 cursor-pointer h-5 w-5 min-h-0"
                        title="Previous Month"
                      >
                        <ChevronLeft size={12} />
                      </button>
                      <span className="font-extrabold text-[11px] text-base-content tracking-tight px-1 select-none whitespace-nowrap">
                        {dayjs(viewMonth).format("MMMM YYYY")}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="btn btn-ghost btn-xs btn-square rounded-lg hover:bg-base-300 text-base-content/70 cursor-pointer h-5 w-5 min-h-0"
                        title="Next Month"
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickToday}
                      className={`btn btn-xs rounded-lg px-2 text-[9.5px] font-extrabold h-5 min-h-0 cursor-pointer transition-colors ${
                        date === dayjs().format("YYYY-MM-DD")
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-primary hover:bg-primary/10"
                      }`}
                      title="Jump to Today"
                    >
                      Today
                    </button>
                  </div>

                  {/* Weekday Names Header */}
                  <div className="grid grid-cols-7 text-center text-[8.5px] font-black text-base-content/40 select-none">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, idx) => (
                      <div key={idx} className={idx === 0 || idx === 6 ? "text-rose-500/70" : ""}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days Matrix */}
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {calendarDays.map((cell, idx) => {
                      const isSelected = cell.dateStr === date;
                      const isToday = cell.dateStr === dayjs().format("YYYY-MM-DD");

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectDay(cell)}
                          className={`h-5.5 w-full flex items-center justify-center rounded-md text-[10px] font-bold transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-primary text-primary-content font-black shadow-xs scale-105"
                              : cell.isCurrentMonth
                              ? isToday
                                ? "bg-primary/15 text-primary font-black border border-primary/30"
                                : "text-base-content hover:bg-base-300/70"
                              : "text-base-content/25 hover:text-base-content/60"
                          }`}
                        >
                          {cell.dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Date Indicator */}
                  <div className="flex items-center justify-between text-[9.5px] font-medium pt-1 border-t border-base-300/50 text-base-content/60">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} className="text-primary" />
                      <span>Selected:</span>
                    </span>
                    <span className="font-bold text-primary font-mono text-[10px]">
                      {dayjs(date).format("ddd, DD MMM YYYY")}
                    </span>
                  </div>

                </div>

                {/* Reimbursable Toggle */}
                <div className="flex items-center justify-between bg-base-200/50 px-2.5 py-1.5 rounded-xl border border-base-200">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1 rounded-lg ${isReimbursable ? 'bg-warning/20 text-warning' : 'bg-base-300 text-base-content/50'}`}>
                      <Handshake size={12} />
                    </div>
                    <div>
                      <span className="font-bold text-[10px] block leading-tight">Reimbursable</span>
                      <span className="text-[8.5px] opacity-60">To collect back later</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isReimbursable}
                    onChange={(e) => setIsReimbursable(e.target.checked)}
                    className="checkbox checkbox-warning checkbox-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-base-200 shrink-0">
                <button
                  type="submit"
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black gap-2 border-0 shadow-lg shadow-emerald-600/30 w-full transition-all text-xs tracking-wide cursor-pointer h-9"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs text-white"></span>
                  ) : (
                    <>
                      <Save size={14} className="text-white shrink-0" />
                      <span>Save Transaction</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default AddTransactionModal;
