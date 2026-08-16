import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTransaction } from "../../services/redux/slice/ExpenseSlice";
import { Info, X, Save, Calendar, Wallet, Folder, ArrowRightLeft, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";

const TransactionInfoModal = ({ transaction, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [infoText, setInfoText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (transaction) {
      setInfoText(transaction.info || "");
      setSaveSuccess(false);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const isTrf = transaction.type === "Transfer";
  const isCredit = transaction.type === "Credit";
  const isDebit = transaction.type === "Debit";

  const sourceName = transaction.sourceId?.name || (typeof transaction.sourceId === "string" ? transaction.sourceId : "Account");
  const targetName = transaction.targetSourceId?.name || (typeof transaction.targetSourceId === "string" ? transaction.targetSourceId : "Bank");
  const categoryName = transaction.categoryId?.name || (typeof transaction.categoryId === "string" ? transaction.categoryId : "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(
        updateTransaction({
          id: transaction._id,
          data: {
            info: infoText.trim()
          }
        })
      ).unwrap();
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error("Failed to save transaction info:", err);
      alert("Failed to save note: " + (err.message || "Unknown error"));
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                Transaction Information & Notes
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                {dayjs(transaction.date).format("ddd, DD MMM YYYY")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Transaction Metadata Card */}
          <div className="bg-base-200/60 border border-base-300/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-sm text-base-content truncate max-w-[280px]">
                {transaction.description || <span className="opacity-40 italic">No description</span>}
              </span>
              <span
                className={`font-mono font-extrabold text-base ${
                  isTrf
                    ? "text-amber-500 dark:text-amber-400"
                    : isCredit
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500"
                }`}
              >
                {isTrf ? "" : isCredit ? "+" : "-"}₹
                {Number(transaction.amount || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-base-300/50 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-100 border border-base-300/80 text-base-content/80">
                <Wallet size={12} className="text-primary" />
                {sourceName}
              </span>

              {isTrf && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ArrowRightLeft size={12} />
                  To {targetName}
                </span>
              )}

              {categoryName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Folder size={12} />
                  {categoryName}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isCredit
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isDebit
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {isCredit ? (
                  <>
                    <TrendingUp size={10} /> Credit
                  </>
                ) : isDebit ? (
                  <>
                    <TrendingDown size={10} /> Debit
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={10} /> Transfer
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Notes / Info Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-base-content/80 uppercase tracking-wider">
                Transaction Notes & Information
              </label>
              <span className="text-[11px] text-base-content/50 font-mono">
                {infoText.length} characters
              </span>
            </div>

            <textarea
              className="textarea textarea-bordered w-full rounded-2xl p-4 text-xs font-medium focus:textarea-primary min-h-[140px] leading-relaxed bg-base-100"
              placeholder="Write detailed information about this transaction (e.g. invoice/bill #, purpose, receipt notes, item list, reimbursement details)..."
              value={infoText}
              onChange={(e) => setInfoText(e.target.value)}
              rows={5}
              autoFocus
            />
            <p className="text-[11px] text-base-content/50 italic">
              These notes are saved to the database and can be reviewed anytime by clicking the <strong>ℹ</strong> button.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-200/50 border-t border-base-200 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl font-bold px-4"
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`btn btn-sm rounded-xl font-bold px-5 gap-2 transition-all ${
              saveSuccess ? "btn-success text-white" : "btn-primary shadow-md hover:shadow-lg"
            }`}
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={16} />
                Saved!
              </>
            ) : (
              <>
                <Save size={15} />
                Save Notes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfoModal;
