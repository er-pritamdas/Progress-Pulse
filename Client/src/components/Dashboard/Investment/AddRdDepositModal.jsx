import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  PiggyBank,
  Calendar,
  Save,
  AlertCircle,
  Hash,
  FileText
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";

export default function AddRdDepositModal({
  isOpen,
  onClose,
  onSave,
  rd = null,
  initialTxn = null,
}) {
  const isEdit = !!initialTxn;

  // Next installment default number
  const nextInstallmentNum = (rd?.transactions || []).length + 1;

  // Form State
  const [installmentNo, setInstallmentNo] = useState(
    initialTxn?.installmentNo || initialTxn?.term || `Installment ${nextInstallmentNum}`
  );
  const [date, setDate] = useState(
    initialTxn?.date
      ? dayjs(initialTxn.date).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD")
  );
  const [amountInput, setAmountInput] = useState(
    initialTxn
      ? String(initialTxn.amount ?? initialTxn.amtDeposit ?? "")
      : String(rd?.transactions?.[0]?.amount || rd?.amount || "10000")
  );
  const [notes, setNotes] = useState(initialTxn?.notes || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Pre-fill on initialTxn change
  useEffect(() => {
    if (isOpen) {
      if (initialTxn) {
        setInstallmentNo(initialTxn.installmentNo || initialTxn.term || "Installment 1");
        setDate(
          initialTxn.date
            ? dayjs(initialTxn.date).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD")
        );
        setAmountInput(String(initialTxn.amount ?? initialTxn.amtDeposit ?? ""));
        setNotes(initialTxn.notes || "");
      } else {
        const nextNum = (rd.transactions || []).length + 1;
        setInstallmentNo(`Installment ${nextNum}`);
        setDate(dayjs().format("YYYY-MM-DD"));
        // Default to first installment amount if available
        const defaultAmt = rd.transactions?.[0]?.amount || rd.amount || "10000";
        setAmountInput(String(defaultAmt));
        setNotes("");
      }
      setErrorMsg("");
    }
  }, [isOpen, initialTxn, rd]);

  // Evaluated Math Expression Amount
  const evaluatedAmount = evaluateMathExpression(amountInput) ?? (Number(amountInput) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (evaluatedAmount <= 0) {
      setErrorMsg("Please enter a valid Deposit Amount");
      return;
    }
    if (!date) {
      setErrorMsg("Please select a Deposit Date");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        installmentNo: installmentNo.trim() || `Installment ${nextInstallmentNum}`,
        term: installmentNo.trim() || `Installment ${nextInstallmentNum}`,
        date,
        amount: evaluatedAmount,
        amtDeposit: evaluatedAmount,
        notes: notes.trim(),
      };

      await onSave(payload, initialTxn?.id || initialTxn?._id);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save deposit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !rd) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-base-300 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b-2 border-base-200 flex justify-between items-center bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary">
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 leading-tight text-base-content">
                <span>{isEdit ? "Edit RD Deposit" : "Add RD Deposit"}</span>
              </h3>
              <p className="text-[11px] text-base-content/60 font-semibold mt-0.5">
                {rd?.bankName} {rd?.rdNumber ? `(#${rd.rdNumber})` : ""} • Rate: {rd?.interestRate}%
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/60 hover:text-base-content"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="alert alert-error text-xs py-2.5 rounded-xl flex items-center gap-2 shadow-xs font-bold">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Installment Number / Term & Date */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Hash size={13} className="text-primary" />
                <span>Installment # *</span>
              </label>
              <input
                type="text"
                value={installmentNo}
                onChange={(e) => setInstallmentNo(e.target.value)}
                placeholder="e.g. Installment 1"
                className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content px-3.5 shadow-xs transition-all"
              />
            </div>

            <div>
              <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-primary" />
                <span>Deposit Date *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content px-3.5 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* 2. Amount Deposited (with Math Expression Support) */}
          <div>
            <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Amount Deposited (₹) *</span>
              <span className="text-[10px] lowercase font-bold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-md">supports: + - * /</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-sm text-primary">₹</span>
                <input
                  type="text"
                  placeholder="e.g. 5000 or 2500 * 2"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="input h-11 w-full pl-8 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  autoFocus
                />
              </div>
              <span className="text-sm font-black text-base-content/50 select-none">=</span>
              <div
                className={`w-32 shrink-0 input h-11 rounded-2xl bg-base-200 dark:bg-base-300 border-2 border-base-content/20 flex items-center justify-end px-3 font-mono font-black text-xs select-none truncate ${
                  evaluatedAmount > 0 ? "text-primary border-primary/40 bg-primary/10" : "text-base-content/40"
                }`}
              >
                ₹{evaluatedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* 3. Notes (Optional) */}
          <div>
            <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText size={13} className="text-base-content/60" />
              <span>Notes / Remarks (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Auto-debited from salary account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-medium text-base-content px-3.5 shadow-xs transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost font-black rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-sm btn-primary font-black rounded-xl gap-2 shadow-lg shadow-primary/30 border-0 h-10 px-5 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? "Update Deposit" : "Save Deposit"}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
