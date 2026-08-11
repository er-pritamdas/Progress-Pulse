import React, { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { message } from "antd";

const AddTransactionModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { categories, sources, currentMonth, transactions } = useSelector((state) => state.expense);

  // Form State
  const [transactionType, setTransactionType] = useState("Debit"); // "Debit" | "Credit" | "Transfer"
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [targetSourceId, setTargetSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter Categories for Current Month
  const currentMonthCategories = categories.filter(c => !c.month || c.month === currentMonth);

  // Transactions in current month for budget calculations
  const currentMonthTxns = transactions.filter(t => {
    if (!currentMonth || !t.date) return true;
    return dayjs(t.date).format("YYYY-MM") === currentMonth;
  });

  // Get selected Category Object
  const selectedCategoryObj = currentMonthCategories.find(c => String(c._id) === String(categoryId));

  // Get Subcategories for Selected Category
  const subCategoriesList = selectedCategoryObj?.subCategories || [];

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
    if (!amount || Number(amount) <= 0) {
      message.error("Please enter a valid positive amount");
      return;
    }

    if (transactionType === "Transfer") {
      if (!targetSourceId) {
        message.error("Please select a Target Bank to transfer money to");
        return;
      }
      if (sourceId === targetSourceId) {
        message.error("Source bank and Target bank cannot be the same account");
        return;
      }
    }

    if (transactionType === "Debit" && !categoryId) {
      message.error("Please select a Category for this expense");
      return;
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
        amount: Number(amount),
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

  return (
    <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Compact Header */}
        <div className="px-5 py-3 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2 leading-tight">
                <span>Quick Add Transaction</span>
              </h3>
              <p className="text-[11px] opacity-60 font-medium">Click options directly below without dropdown menus</p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-xs btn-ghost btn-circle rounded-full">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - 2-Column Wide Layout (No Scroll Required) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
          
          {/* LEFT COLUMN: Option Selection Chips (Col Span 7) */}
          <div className="lg:col-span-7 space-y-3.5">
            
            {/* 1. Transaction Type */}
            <div>
              <span className="block font-extrabold text-base-content/60 uppercase tracking-wider text-[10px] mb-1.5">
                1. Transaction Type
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeSelect("Debit")}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all text-center ${
                    transactionType === "Debit"
                      ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-extrabold shadow-2xs scale-[1.02]"
                      : "border-base-200 bg-base-100 hover:bg-base-200/50 text-base-content/70 opacity-75"
                  }`}
                >
                  <TrendingDown size={14} className={transactionType === "Debit" ? "text-rose-500" : ""} />
                  <span className="font-bold text-[11px]">Expense</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect("DebitMoney")}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all text-center ${
                    transactionType === "DebitMoney"
                      ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-extrabold shadow-2xs scale-[1.02]"
                      : "border-base-200 bg-base-100 hover:bg-base-200/50 text-base-content/70 opacity-75"
                  }`}
                >
                  <TrendingDown size={14} className={transactionType === "DebitMoney" ? "text-rose-500" : ""} />
                  <span className="font-bold text-[11px]">Debit Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect("Credit")}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all text-center ${
                    transactionType === "Credit"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-2xs scale-[1.02]"
                      : "border-base-200 bg-base-100 hover:bg-base-200/50 text-base-content/70 opacity-75"
                  }`}
                >
                  <TrendingUp size={14} className={transactionType === "Credit" ? "text-emerald-500" : ""} />
                  <span className="font-bold text-[11px]">Add Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect("Transfer")}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all text-center ${
                    transactionType === "Transfer"
                      ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-2xs scale-[1.02]"
                      : "border-base-200 bg-base-100 hover:bg-base-200/50 text-base-content/70 opacity-75"
                  }`}
                >
                  <ArrowRightLeft size={14} className={transactionType === "Transfer" ? "text-amber-500" : ""} />
                  <span className="font-bold text-[11px]">Bank Transfer</span>
                </button>
              </div>
            </div>

            {/* 2. Payment Source (From Account) */}
            <div>
              <span className="block font-extrabold text-base-content/60 uppercase tracking-wider text-[10px] mb-1.5">
                2. From Account
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((s) => {
                  const isSelected = String(s._id) === String(sourceId);
                  const style = getSourceTagStyle(s, sources);
                  const amt = s.type === 'Card' && !s.balance && s.limit ? s.limit : (s.balance || 0);

                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => setSourceId(s._id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? `${style.bg} ${style.text} border-primary ring-2 ring-primary ring-offset-1 font-bold shadow-xs scale-[1.02]`
                          : `${style.bg} ${style.text} border-transparent hover:border-base-300 opacity-75 hover:opacity-100`
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${style.swatch}`}></span>
                      <span className="font-bold text-[11px] truncate max-w-[100px]">{s.name}</span>
                      <span className="text-[10px] opacity-70 font-mono font-semibold">
                        (₹{amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                      {isSelected && <CheckCircle2 size={13} className="shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Category / Target Options */}
            {transactionType === "Transfer" && (
              <div>
                <span className="block font-extrabold text-base-content/60 uppercase tracking-wider text-[10px] mb-1.5">
                  3. Target Bank (To)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sources.filter(s => s.type !== 'Card' && String(s._id) !== String(sourceId)).map((s) => {
                    const isSelected = String(s._id) === String(targetSourceId);
                    const style = getSourceTagStyle(s, sources);

                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setTargetSourceId(s._id)}
                        className={`px-2.5 py-1.5 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? `${style.bg} ${style.text} border-amber-500 ring-2 ring-amber-500 ring-offset-1 font-bold shadow-xs scale-[1.02]`
                            : `${style.bg} ${style.text} border-transparent hover:border-base-300 opacity-75 hover:opacity-100`
                        }`}
                      >
                        <ArrowRightLeft size={12} className="shrink-0 text-amber-500" />
                        <span className="font-bold text-[11px] truncate max-w-[100px]">{s.name}</span>
                        <span className="text-[10px] opacity-70 font-mono font-semibold">
                          (₹{(s.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </span>
                        {isSelected && <CheckCircle2 size={13} className="shrink-0 text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {transactionType === "Debit" && (
              <div>
                <span className="block font-extrabold text-base-content/60 uppercase tracking-wider text-[10px] mb-1.5">
                  3. Expense Category
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentMonthCategories.map((c) => {
                    const isSelected = String(c._id) === String(categoryId);
                    const tagStyle = getCategoryTagStyle(c, currentMonthCategories);

                    const catBudget = (c.subCategories || []).reduce((sum, sub) => sum + (Number(sub.budget) || 0), 0);
                    const catUsed = currentMonthTxns
                      .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (String(t.categoryId?._id || t.categoryId) === String(c._id)))
                      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                    const rem = catBudget - catUsed;
                    const formattedRem = rem >= 0 ? `₹${rem.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-₹${Math.abs(rem).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => handleCategorySelect(c._id)}
                        className={`px-2.5 py-1.5 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? `${tagStyle.bg} ${tagStyle.text} border-primary ring-2 ring-primary ring-offset-1 font-bold shadow-xs scale-[1.02]`
                            : `${tagStyle.bg} ${tagStyle.text} border-transparent hover:border-base-300 opacity-75 hover:opacity-100`
                        }`}
                      >
                        <Folder size={12} className="shrink-0" />
                        <span className="font-bold text-[11px] truncate max-w-[110px]">{c.name}</span>
                        <span className="text-[10px] opacity-70 font-mono font-semibold">
                          ({formattedRem})
                        </span>
                        {isSelected && <CheckCircle2 size={13} className="shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Sub-Category (ONLY SHOWN AFTER CATEGORY IS CHOSEN) */}
            {transactionType === "Debit" && categoryId && subCategoriesList.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-150 p-2.5 rounded-xl bg-base-200/50 border border-base-300/60">
                <span className="block font-extrabold text-primary uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                  <Tag size={12} />
                  <span>4. Sub-Category for "{selectedCategoryObj?.name}"</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {subCategoriesList.map((sub) => {
                    const isSelected = String(sub._id) === String(subCategoryId);
                    const subBudget = Number(sub.budget) || 0;
                    const subUsed = currentMonthTxns
                      .filter(t => t.type !== 'Credit' && t.type !== 'Transfer' && (
                        String(t.subCategoryId?._id || t.subCategoryId) === String(sub._id) ||
                        (String(t.categoryId?._id || t.categoryId) === String(categoryId) && t.description?.includes(sub.name))
                      ))
                      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                    const rem = subBudget - subUsed;
                    const formattedRem = rem >= 0 ? `₹${rem.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-₹${Math.abs(rem).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    return (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => setSubCategoryId(sub._id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
                          isSelected
                            ? "bg-primary text-primary-content border-primary shadow-2xs scale-105"
                            : "bg-base-100 text-base-content/80 border-base-300 hover:border-primary/50"
                        }`}
                      >
                        <span>{sub.name}</span>
                        <span className="text-[9px] opacity-75 font-mono">({formattedRem})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Amount, Description, Date & Actions (Col Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3 lg:border-l lg:border-base-200 lg:pl-5">
            
            <div className="space-y-3">
              {/* Amount */}
              <div>
                <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-primary">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input input-sm input-bordered w-full text-base font-extrabold font-mono focus:input-primary text-right pl-7"
                    autoFocus
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery, Fuel, Dinner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs font-semibold focus:input-primary"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs font-semibold focus:input-primary"
                />
              </div>

              {/* Reimbursable Toggle */}
              <div className="flex items-center justify-between bg-base-200/50 p-2.5 rounded-xl border border-base-200">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isReimbursable ? 'bg-warning/20 text-warning' : 'bg-base-300 text-base-content/50'}`}>
                    <Handshake size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-[11px] block">Reimbursable</span>
                    <span className="text-[9px] opacity-60">Collect money back later</span>
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
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-xs btn-ghost font-bold"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-sm btn-primary font-bold gap-1.5 text-white shadow-md flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Transaction</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AddTransactionModal;
