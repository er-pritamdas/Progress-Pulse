import React, { useState, useEffect, useMemo } from "react";
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

// Helper to retrieve the latest chronological transaction from an RD
const getLastTransaction = (targetRd) => {
  const txns = targetRd?.transactions || [];
  if (!txns || txns.length === 0) return null;
  const validTxns = txns
    .filter((t) => t && t.date && dayjs(t.date).isValid())
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  return validTxns.length > 0 ? validTxns[validTxns.length - 1] : txns[txns.length - 1];
};

// Helper to auto-populate next deposit date: exactly +1 month from last entry
const getNextDepositDate = (targetRd) => {
  const lastTxn = getLastTransaction(targetRd);
  if (lastTxn && lastTxn.date && dayjs(lastTxn.date).isValid()) {
    return dayjs(lastTxn.date).add(1, "month").format("YYYY-MM-DD");
  }

  // If no transactions yet, default to targetRd.startDate if valid, otherwise today
  if (targetRd?.startDate && dayjs(targetRd.startDate).isValid()) {
    return dayjs(targetRd.startDate).format("YYYY-MM-DD");
  }

  return dayjs().format("YYYY-MM-DD");
};

// Helper to find the next installment number
const getNextInstallmentNum = (targetRd) => {
  const txns = targetRd?.transactions || [];
  let maxNum = txns.length;
  txns.forEach((t) => {
    const str = String(t.installmentNo || t.term || "");
    const match = str.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  return maxNum + 1;
};

export default function AddRdDepositModal({
  isOpen,
  onClose,
  onSave,
  rd = null,
  initialTxn = null,
}) {
  const isEdit = !!initialTxn;

  const lastTxn = useMemo(() => getLastTransaction(rd), [rd]);

  // Form State
  const [installmentNo, setInstallmentNo] = useState(() =>
    initialTxn?.installmentNo || initialTxn?.term || `Installment ${getNextInstallmentNum(rd)}`
  );
  const [date, setDate] = useState(() =>
    initialTxn?.date
      ? dayjs(initialTxn.date).format("YYYY-MM-DD")
      : getNextDepositDate(rd)
  );
  const [amountInput, setAmountInput] = useState(() => {
    if (initialTxn) {
      return String(initialTxn.amount ?? initialTxn.amtDeposit ?? "");
    }
    const last = getLastTransaction(rd);
    return String(
      last?.amount ?? last?.amtDeposit ?? rd?.transactions?.[0]?.amount ?? rd?.amount ?? "10000"
    );
  });
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

  // Pre-fill on initialTxn or rd change
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
        const nextNum = getNextInstallmentNum(rd);
        setInstallmentNo(`Installment ${nextNum}`);
        setDate(getNextDepositDate(rd));
        const last = getLastTransaction(rd);
        const defaultAmt =
          last?.amount ?? last?.amtDeposit ?? rd?.transactions?.[0]?.amount ?? rd?.amount ?? "10000";
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
      const nextNum = getNextInstallmentNum(rd);
      const payload = {
        installmentNo: installmentNo.trim() || `Installment ${nextNum}`,
        term: installmentNo.trim() || `Installment ${nextNum}`,
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
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-base-300 my-auto">
        
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
                className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content px-3.5 shadow-xs"
              />
            </div>

            <div>
              <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-primary" />
                  <span>Deposit Date *</span>
                </span>
                {!isEdit && lastTxn?.date && (
                  <span
                    className="text-[10px] font-bold text-primary/80 normal-case"
                    title={`Last entry: ${dayjs(lastTxn.date).format("DD MMM YYYY")}`}
                  >
                    +1 mo from last ({dayjs(lastTxn.date).format("DD MMM")})
                  </span>
                )}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content px-3.5 shadow-xs"
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
                  className="input h-11 w-full pl-8 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs"
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
              className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-medium text-base-content px-3.5 shadow-xs"
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
