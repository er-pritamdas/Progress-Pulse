import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  Landmark,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Percent,
  Sparkles,
  ArrowRight,
  Info,
  Coins
} from "lucide-react";
import { calculateFdMaturity } from "./AddFixedDepositModal";

export default function FixedDepositInfoModal({
  isOpen,
  onClose,
  fd,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fd) return null;

  const principal = Number(
    fd.amount !== undefined && fd.amount !== null && fd.amount !== ""
      ? fd.amount
      : (fd.transactions?.[0]?.amtDeposit || fd.transactions?.[0]?.amount || 0)
  );

  const calculations = calculateFdMaturity({
    principal,
    interestRate: fd.interestRate,
    tenureYears: fd.tenureYears ?? (fd.tenureUnit === "Years" ? fd.tenureValue : 0),
    tenureMonths: fd.tenureMonths ?? (fd.tenureUnit === "Months" ? fd.tenureValue : 0),
    tenureDays: fd.tenureDays ?? (fd.tenureUnit === "Days" ? fd.tenureValue : 0),
    startDate: fd.startDate,
    compoundingFrequency: fd.compoundingFrequency || "Quarterly",
  });

  const start = dayjs(fd.startDate);
  const maturity = dayjs(fd.maturityDate || calculations.maturityDate);
  const today = dayjs();

  const totalDays = Math.max(1, maturity.diff(start, "day"));
  const daysPassed = Math.max(0, today.diff(start, "day"));
  const daysRemaining = Math.max(0, maturity.diff(today, "day"));
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
  const isMatured = today.isAfter(maturity) || daysRemaining === 0;

  const isWithdrawn = !!fd.isWithdrawn;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-base-300 my-auto flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-base-200 bg-base-200/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 text-primary">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 leading-tight text-base-content">
                <span>{fd.bankName}</span>
                {fd.fdNumber && (
                  <span className="badge badge-sm font-mono font-bold bg-base-300">
                    #{fd.fdNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-base-content/60 font-semibold mt-0.5">
                Fixed Deposit Full Insights & Settlement Schedule
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Hero Metrics 4-Box Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-base-200/60 dark:bg-base-300/40 border-2 border-base-200">
              <span className="text-[10px] font-black text-base-content/60 block uppercase">Principal Invested</span>
              <span className="text-sm font-black font-mono text-primary mt-0.5 block">
                ₹{principal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-base-200/60 dark:bg-base-300/40 border-2 border-base-200">
              <span className="text-[10px] font-black text-base-content/60 block uppercase">Interest Rate</span>
              <span className="text-sm font-black font-mono text-base-content mt-0.5 block">
                {fd.interestRate}% p.a.
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-base-200/60 dark:bg-base-300/40 border-2 border-base-200">
              <span className="text-[10px] font-black text-base-content/60 block uppercase">Expected Return</span>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                ₹{calculations.maturityAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-base-200/60 dark:bg-base-300/40 border-2 border-base-200">
              <span className="text-[10px] font-black text-base-content/60 block uppercase">Annual Yield</span>
              <span className="text-sm font-black font-mono text-primary mt-0.5 block">
                {calculations.effectiveAnnualRate}% p.a.
              </span>
            </div>
          </div>

          {/* Timeline & Progress */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-base-200/50 to-emerald-500/10 border-2 border-primary/20 space-y-3">
            <span className="font-black text-xs flex items-center gap-1.5 text-primary">
              <Sparkles size={15} />
              <span>Tenure Timeline & Maturity Milestones</span>
            </span>

            {/* Timeline Cards */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="p-2.5 rounded-xl bg-base-100 border-2 border-base-200 flex-1">
                <span className="text-[10px] opacity-60 uppercase font-black block">Start Date</span>
                <span className="font-extrabold font-mono text-xs text-base-content">{start.format("DD MMM YYYY")}</span>
              </div>

              <div className="p-1 rounded-full bg-base-300 text-base-content/60 shrink-0">
                <ArrowRight size={14} />
              </div>

              <div className="p-2.5 rounded-xl bg-base-100 border-2 border-base-200 flex-1 text-center">
                <span className="text-[10px] opacity-60 uppercase font-black block">Today</span>
                <span className="font-extrabold font-mono text-xs text-primary">{today.format("DD MMM YYYY")}</span>
              </div>

              <div className="p-1 rounded-full bg-base-300 text-base-content/60 shrink-0">
                <ArrowRight size={14} />
              </div>

              <div className="p-2.5 rounded-xl bg-base-100 border-2 border-base-200 flex-1 text-right">
                <span className="text-[10px] opacity-60 uppercase font-black block">Maturity Date</span>
                <span className="font-extrabold font-mono text-xs text-emerald-600 dark:text-emerald-400">{maturity.format("DD MMM YYYY")}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWithdrawn ? "bg-amber-500" : isMatured ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-base-content/70 font-semibold">
                <span>{daysPassed} days elapsed</span>
                <span className="font-bold">{progressPercent}% complete</span>
                <span>{isWithdrawn ? "Withdrawn" : isMatured ? "Matured" : `${daysRemaining} days remaining`}</span>
              </div>
            </div>
          </div>

          {/* Configuration & Parameters Grid */}
          <div className="p-4 rounded-2xl bg-base-200/50 dark:bg-base-300/40 border-2 border-base-200 space-y-2.5">
            <span className="font-black text-xs text-base-content/80 block">Deposit Configuration</span>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                <span className="opacity-60 font-semibold">Tenure:</span>
                <span className="font-black text-base-content">{fd.tenureText || calculations.tenureText}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                <span className="opacity-60 font-semibold">Compounding:</span>
                <span className="font-black text-base-content">Quarterly</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                <span className="opacity-60 font-semibold">Scheme / Type:</span>
                <span className="font-black text-base-content">{fd.schemeName || "Regular FD"}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                <span className="opacity-60 font-semibold">Status:</span>
                <span className={`font-black ${isWithdrawn ? "text-amber-600" : isMatured ? "text-blue-600" : "text-emerald-600"}`}>
                  {isWithdrawn ? "Withdrawn" : isMatured ? "Matured" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Stats if Withdrawn */}
          {isWithdrawn && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-2.5">
              <span className="font-black text-xs text-amber-600 dark:text-amber-400 block flex items-center gap-1.5">
                <Coins size={15} />
                <span>Withdrawal & Liquidation Settlement</span>
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                  <span className="opacity-60 font-semibold">Withdrawal Date:</span>
                  <span className="font-black font-mono text-base-content">{dayjs(fd.withdrawalDate).format("DD MMM YYYY")}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                  <span className="opacity-60 font-semibold">Total Payout Received:</span>
                  <span className="font-black font-mono text-amber-600 dark:text-amber-400">₹{Number(fd.totalPayout || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                  <span className="opacity-60 font-semibold">Realized Interest:</span>
                  <span className="font-black font-mono text-emerald-600">+₹{Number(fd.realizedInterest || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-base-100 border border-base-200">
                  <span className="opacity-60 font-semibold">Realized Net Gain:</span>
                  <span className="font-black font-mono text-emerald-600">+{Number(fd.realizedReturnPercent || 0)}% (₹{Number(fd.realizedGain || 0).toLocaleString("en-IN")})</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-base-200 bg-base-200/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost font-black rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
