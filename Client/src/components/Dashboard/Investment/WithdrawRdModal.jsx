import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  PiggyBank,
  Calendar,
  AlertCircle,
  Coins,
  Save,
  RotateCcw,
  Trash2
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";

export default function WithdrawRdModal({
  isOpen,
  onClose,
  onSaveSettlement,
  rd = null,
}) {
  const transactions = rd?.transactions || [];
  const principal = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + Number(t.amount || t.amtDeposit || 0), 0)
    : Number(rd?.amount || 0);

  // Form State
  const [withdrawalDate, setWithdrawalDate] = useState(
    rd?.withdrawalDate || dayjs().format("YYYY-MM-DD")
  );
  const [amountGotInput, setAmountGotInput] = useState(
    String(rd?.totalPayout || rd?.maturityAmount || principal || "")
  );
  const [penaltyInput, setPenaltyInput] = useState(String(rd?.penalty || "0"));
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

  // Pre-fill on open
  useEffect(() => {
    if (rd) {
      setWithdrawalDate(
        rd.withdrawalDate
          ? dayjs(rd.withdrawalDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD")
      );
      const defaultGot =
        rd.totalPayout !== undefined && rd.totalPayout !== null && rd.totalPayout > 0
          ? rd.totalPayout
          : (rd.maturityAmount || principal || "");
      setAmountGotInput(String(defaultGot));
      setPenaltyInput(String(rd.penalty ?? "0"));
      setErrorMsg("");
    }
  }, [isOpen, rd, principal]);

  // Evaluated Amount Received (Withdrawal Amount) & Penalty
  const evaluatedAmountGot = evaluateMathExpression(amountGotInput) ?? (Number(amountGotInput) || 0);
  const evaluatedPenalty = evaluateMathExpression(penaltyInput) ?? (Number(penaltyInput) || 0);

  // Core Formula:
  // Net Payout = Amount Got - Penalty
  // Profit or Loss = Net Payout - Deposited (Principal)
  const netPayout = Math.max(0, Math.round((evaluatedAmountGot - evaluatedPenalty + Number.EPSILON) * 100) / 100);
  const profitOrLoss = Math.round((netPayout - principal + Number.EPSILON) * 100) / 100;
  const profitOrLossPercent = principal > 0
    ? Math.round(((profitOrLoss / principal) * 100 + Number.EPSILON) * 100) / 100
    : 0;

  const isProfit = profitOrLoss >= 0;

  // Days held between Start Date and Withdrawal Date
  const start = dayjs(rd?.startDate || new Date());
  const wDate = dayjs(withdrawalDate || new Date());
  const daysHeld = Math.max(0, wDate.diff(start, "day"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (evaluatedAmountGot <= 0) {
      setErrorMsg("Please enter the total Amount Received on withdrawal");
      return;
    }
    if (!withdrawalDate) {
      setErrorMsg("Please select Withdrawal Date");
      return;
    }

    setIsSubmitting(true);
    try {
      const settlementPayload = {
        ...rd,
        isWithdrawn: true,
        withdrawalDate,
        totalPayout: netPayout,
        penalty: evaluatedPenalty,
        realizedGain: profitOrLoss,
        realizedReturnPercent: profitOrLossPercent,
        realizedPrincipal: principal,
        realizedInterest: Math.max(0, profitOrLoss),
        status: "Withdrawn",
      };

      await onSaveSettlement(settlementPayload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save withdrawal settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToActive = async () => {
    if (!window.confirm("Are you sure you want to remove this Withdrawn transaction and restore this Recurring Deposit to Active?")) return;
    setIsSubmitting(true);
    try {
      const resetPayload = {
        ...rd,
        isWithdrawn: false,
        withdrawalDate: "",
        totalPayout: 0,
        penalty: 0,
        realizedGain: 0,
        realizedReturnPercent: 0,
        realizedPrincipal: 0,
        realizedInterest: 0,
        status: "Active",
      };
      await onSaveSettlement(resetPayload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to remove withdrawal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !rd) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-base-300 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b-2 border-base-200 flex justify-between items-center bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 leading-tight text-base-content">
                <span>{rd.isWithdrawn ? "Edit Withdrawal Settlement" : "Withdraw Recurring Deposit"}</span>
              </h3>
              <p className="text-[11px] text-base-content/60 font-semibold mt-0.5">
                {rd.bankName} {rd.rdNumber ? `(#${rd.rdNumber})` : ""} • Deposited: ₹{principal.toLocaleString()}
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

          {/* 1. Withdrawal Date */}
          <div>
            <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Withdrawal Date *</span>
              <span className="text-[9.5px] font-bold text-amber-600 dark:text-amber-400">{daysHeld} Days Held</span>
            </label>
            <input
              type="date"
              value={withdrawalDate}
              onChange={(e) => setWithdrawalDate(e.target.value)}
              className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-amber-500 focus:bg-base-100 text-xs font-bold px-3.5 transition-all shadow-xs"
            />
          </div>

          {/* 2. Side-by-Side: Withdrawal Amount & Penalties Amount */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Withdrawal Amount Received */}
            <div>
              <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Withdrawal Amt (₹) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-sm text-amber-600 dark:text-amber-400">₹</span>
                <input
                  type="text"
                  placeholder="e.g. 107100"
                  value={amountGotInput}
                  onChange={(e) => setAmountGotInput(e.target.value)}
                  className="input h-11 w-full pl-8 pr-2.5 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-amber-500 focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Penalties Amount */}
            <div>
              <label className="block font-black text-rose-600 dark:text-rose-400 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Penalties Amt (₹)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-sm text-rose-600 dark:text-rose-400">₹</span>
                <input
                  type="text"
                  placeholder="0"
                  value={penaltyInput}
                  onChange={(e) => setPenaltyInput(e.target.value)}
                  className="input h-11 w-full pl-8 pr-2.5 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-rose-500 focus:bg-base-100 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 placeholder:text-base-content/40 shadow-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Bottom Calculation Result Card: Profit or Loss */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-base-200/90 via-base-200 to-base-300/60 border-2 border-base-300 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-base-content/70 pb-2 border-b border-base-content/10">
              <span>Deposited: ₹{principal.toLocaleString("en-IN")}</span>
              <span>Net Got: ₹{netPayout.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-base-content/60 block">
                  Profit / Loss Calculation
                </span>
                <span className="text-xs font-bold text-base-content/70 mt-0.5 block font-mono">
                  ₹{netPayout.toLocaleString("en-IN")} - ₹{principal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-right">
                <span className={`text-[10.5px] uppercase tracking-wider font-black block ${
                  isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                }`}>
                  {isProfit ? "Net Profit" : "Net Loss"}
                </span>
                <div className={`text-lg font-black font-mono tracking-tight ${
                  isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                }`}>
                  {isProfit ? `+₹${profitOrLoss.toLocaleString("en-IN")}` : `-₹${Math.abs(profitOrLoss).toLocaleString("en-IN")}`}
                </div>
                <span className={`badge badge-sm font-mono font-black border ${
                  isProfit
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-700 border-rose-500/30"
                } mt-0.5`}>
                  {isProfit ? `+${profitOrLossPercent}%` : `${profitOrLossPercent}%`} {isProfit ? "Profit" : "Loss"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-base-200">
            {rd.isWithdrawn ? (
              <button
                type="button"
                onClick={handleResetToActive}
                className="btn btn-sm btn-ghost text-rose-600 font-black rounded-xl gap-1.5 hover:bg-rose-500/10"
                disabled={isSubmitting}
              >
                <Trash2 size={15} />
                <span>Remove Withdrawal</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
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
                className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl gap-2 shadow-lg shadow-amber-600/30 border-0 h-10 px-5 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs text-white"></span>
                ) : (
                  <>
                    <Save size={16} className="text-white shrink-0" />
                    <span>{rd.isWithdrawn ? "Update Settlement" : "Confirm Withdrawal"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
