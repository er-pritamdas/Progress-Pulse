import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  Plus,
  Minus,
  Calendar,
  DollarSign,
  PiggyBank,
  Check,
  Calculator,
  Coins,
  TrendingUp,
  Percent,
  AlertCircle,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";

export default function AddFdTransactionModal({
  isOpen,
  onClose,
  onSave,
  fd = null,
  initialTxn = null,
  mode = "deposit", // "deposit" | "withdrawal"
}) {
  if (!isOpen) return null;

  const isEdit = !!initialTxn;

  // Determine if this transaction is a withdrawal
  const isWithdrawal =
    mode === "withdrawal" ||
    (initialTxn?.type &&
      (initialTxn.type.toLowerCase().includes("withdr") ||
        initialTxn.type.toLowerCase().includes("break") ||
        initialTxn.type.toLowerCase().includes("liquid") ||
        initialTxn.type.toLowerCase().includes("payout")));

  // Form State
  const [term, setTerm] = useState("");
  const [type, setType] = useState(isWithdrawal ? "Full Maturity Liquidation" : "Top-up");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [amount, setAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("0");
  const [penalty, setPenalty] = useState("0");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate available principal from FD's deposit transactions minus previous withdrawals
  const totalDepositedAmt = (fd?.transactions || []).reduce((sum, t) => {
    const tl = (t?.type || "").toLowerCase();
    const isW = tl.includes("withdr") || tl.includes("break") || tl.includes("liquid") || tl.includes("payout");
    if (isW) return sum;
    return sum + (Number(t.amtDeposit || t.amount || 0));
  }, 0);

  const alreadyWithdrawnAmt = (fd?.transactions || []).reduce((sum, t) => {
    const tl = (t?.type || "").toLowerCase();
    const isW = tl.includes("withdr") || tl.includes("break") || tl.includes("liquid") || tl.includes("payout");
    if (!isW) return sum;
    if (isEdit && initialTxn && (t.id === initialTxn.id || t._id === initialTxn._id || t.id === initialTxn._id)) {
      return sum;
    }
    return sum + (Number(t.amtDeposit || t.amount || 0));
  }, 0);

  const availablePrincipal = Math.max(0, Math.round((totalDepositedAmt - alreadyWithdrawnAmt + Number.EPSILON) * 100) / 100);

  // Pre-fill on Edit / Mode Switch
  useEffect(() => {
    if (isEdit && initialTxn) {
      setTerm(initialTxn.term || "");
      setType(initialTxn.type || (isWithdrawal ? "Full Maturity Liquidation" : "Top-up"));
      setDate(initialTxn.date ? dayjs(initialTxn.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
      setAmount(String(initialTxn.amtDeposit ?? initialTxn.amount ?? ""));
      setInterestAmount(String(initialTxn.interestAmount ?? "0"));
      setPenalty(String(initialTxn.penalty ?? "0"));
      setNotes(initialTxn.notes || "");
    } else {
      setTerm(isWithdrawal ? "Full Liquidation" : "Additional Deposit");
      setType(isWithdrawal ? "Full Maturity Liquidation" : "Top-up");
      setDate(dayjs().format("YYYY-MM-DD"));
      // When withdrawing, prefill the entire 100% active principal
      setAmount(isWithdrawal ? String(availablePrincipal) : "");
      setInterestAmount("0");
      setPenalty("0");
      setNotes("");
    }
    setErrorMsg("");
  }, [isOpen, isEdit, initialTxn, isWithdrawal, fd, availablePrincipal]);

  const parsedAmount = evaluateMathExpression(amount) ?? (Number(amount) || 0);
  const parsedInterest = Number(interestAmount) || 0;
  const parsedPenalty = Number(penalty) || 0;

  // Net actual amount calculation
  const actualAmt = isWithdrawal
    ? Math.max(0, parsedAmount + parsedInterest - parsedPenalty)
    : parsedAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (parsedAmount <= 0) {
      setErrorMsg("Please enter a valid positive amount");
      return;
    }

    if (isWithdrawal && parsedAmount > availablePrincipal) {
      setErrorMsg(`Withdrawal amount (₹${parsedAmount.toLocaleString()}) exceeds active principal (₹${availablePrincipal.toLocaleString()})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const txnPayload = {
        term: term.trim() || (isWithdrawal ? "Full Liquidation" : "Top-up"),
        type,
        date,
        amtDeposit: parsedAmount,
        interestAmount: parsedInterest,
        penalty: parsedPenalty,
        actualAmt,
        notes: notes.trim(),
      };

      await onSave(txnPayload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-base-300 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`px-5 py-3.5 border-b border-base-200 flex justify-between items-center ${isWithdrawal ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isWithdrawal ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-primary/20 text-primary'}`}>
              {isWithdrawal ? <Minus size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2 leading-tight">
                <span>{isEdit ? "Edit FD Transaction" : isWithdrawal ? "Liquidate / Break Fixed Deposit" : "Add FD Deposit / Top-up"}</span>
              </h3>
              <p className="text-[11px] opacity-60 font-medium">{fd?.bankName || "Fixed Deposit"} {fd?.fdNumber ? `(#${fd.fdNumber})` : ""}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost btn-circle rounded-full hover:bg-base-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="alert alert-error text-xs py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Principal Hero for Withdrawal */}
          {isWithdrawal && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Landmark size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold opacity-75 uppercase block">Total Active Principal to Liquidate</span>
                  <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                    ₹{availablePrincipal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <span className="badge badge-sm font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border-transparent">
                100% Full Liquidation
              </span>
            </div>
          )}

          {/* Row 1: Transaction Type & Term Label */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
                Transaction Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="select select-sm w-full rounded-xl bg-base-200/60 border-base-300 focus:border-primary text-xs font-bold"
              >
                {isWithdrawal ? (
                  <>
                    <option value="Full Maturity Liquidation">Full Maturity Liquidation</option>
                    <option value="Premature Break">Premature Break (Closure)</option>
                    <option value="Interest Payout">Interest Payout</option>
                  </>
                ) : (
                  <>
                    <option value="Top-up">Top-up Deposit</option>
                    <option value="Deposit">Deposit</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
                Term / Label
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Maturity Payout, Full Break..."
                className="input input-sm w-full rounded-xl bg-base-200/60 border-base-300 focus:border-primary text-xs font-semibold"
              />
            </div>
          </div>

          {/* Row 2: Date & Principal Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input input-sm w-full rounded-xl bg-base-200/60 border-base-300 focus:border-primary text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{isWithdrawal ? "Principal Amount (₹) *" : "Deposit Amount (₹) *"}</span>
                <span className="text-[9px] lowercase font-normal opacity-60">math: + - * /</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-primary">₹</span>
                  <input
                    type="text"
                    placeholder="e.g. 100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input input-sm w-full pl-6 rounded-xl bg-base-200/60 border-base-300 focus:border-primary text-xs font-mono font-bold"
                    readOnly={isWithdrawal}
                  />
                </div>
                <span className="text-xs font-bold opacity-40 select-none">=</span>
                <div
                  className={`w-24 shrink-0 input input-sm rounded-xl bg-base-200/90 border-base-300 flex items-center justify-end px-1.5 font-mono font-extrabold text-xs select-none truncate ${
                    parsedAmount > 0 ? "text-primary" : "text-base-content/40"
                  }`}
                >
                  ₹{parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 (Withdrawal Only): Realized Interest Received & Penalty Deductions */}
          {isWithdrawal && (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60">
              <div>
                <label className="block font-extrabold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider mb-1">
                  + Realized Interest (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={interestAmount}
                  onChange={(e) => setInterestAmount(e.target.value)}
                  className="input input-sm w-full rounded-xl bg-base-100 border-base-300 focus:border-emerald-500 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-extrabold text-rose-600 dark:text-rose-400 text-[10px] uppercase tracking-wider mb-1">
                  - Penalty / Deductions (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  className="input input-sm w-full rounded-xl bg-base-100 border-base-300 focus:border-rose-500 text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
                />
              </div>

              {/* Net Payout Summary */}
              <div className="col-span-2 pt-2 border-t border-base-300 flex items-center justify-between">
                <span className="font-extrabold text-xs opacity-75">Net Received Payout:</span>
                <span className="font-black text-sm font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{actualAmt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Row 4: Notes / Reason */}
          <div>
            <label className="block font-extrabold text-base-content/70 text-[10px] uppercase tracking-wider mb-1">
              Notes / Reason (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Matured upon tenure completion, Emergency break..."
              className="input input-sm w-full rounded-xl bg-base-200/60 border-base-300 focus:border-primary text-xs font-semibold"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost font-bold rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-sm text-white font-black rounded-xl gap-2 shadow-lg border-0 cursor-pointer ${
                isWithdrawal
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs text-white"></span>
              ) : (
                <>
                  <Check size={16} className="text-white" />
                  <span>{isEdit ? "Update Transaction" : isWithdrawal ? "Liquidate Fixed Deposit" : "Record Deposit"}</span>
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
