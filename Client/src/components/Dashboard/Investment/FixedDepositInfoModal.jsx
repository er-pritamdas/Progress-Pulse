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
import CompanyLogo from "./CompanyLogo";

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
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-2.5 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-base-content/10 dark:border-base-content/10 my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-base-content/8 dark:border-base-content/8 bg-base-200/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <CompanyLogo name={fd.bankName} size="w-9 h-9 sm:w-10 sm:h-10" rounded="rounded-2xl" type="bank" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base text-base-content tracking-tight truncate">
                  {fd.bankName}
                </h3>
                {fd.fdNumber && (
                  <span className="text-[10px] font-mono font-bold text-base-content/60 bg-base-200 px-2 py-0.5 rounded-lg shrink-0">
                    #{fd.fdNumber}
                  </span>
                )}
                {isWithdrawn ? (
                  <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                    Withdrawn
                  </span>
                ) : isMatured ? (
                  <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 shrink-0">
                    Matured
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10.5px] sm:text-xs text-base-content/60 font-medium truncate mt-0.5">
                {fd.interestRate}% p.a. • {fd.tenureText || calculations.tenureText} • Quarterly Compounding
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/60 hover:text-base-content cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs flex-1">
          
          {/* Hero Metrics 4-Box Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-base-200/50 dark:bg-base-300/30 border border-base-content/8 dark:border-base-content/8">
              <span className="text-[9.5px] font-bold text-base-content/60 block uppercase tracking-wider">Principal</span>
              <span className="text-sm font-black font-mono text-primary mt-0.5 block truncate">
                ₹{principal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-base-200/50 dark:bg-base-300/30 border border-base-content/8 dark:border-base-content/8">
              <span className="text-[9.5px] font-bold text-base-content/60 block uppercase tracking-wider">Interest Rate</span>
              <span className="text-sm font-black font-mono text-base-content mt-0.5 block truncate">
                {fd.interestRate}% p.a.
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-base-200/50 dark:bg-base-300/30 border border-base-content/8 dark:border-base-content/8">
              <span className="text-[9.5px] font-bold text-base-content/60 block uppercase tracking-wider">Expected Return</span>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                ₹{calculations.maturityAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-base-200/50 dark:bg-base-300/30 border border-base-content/8 dark:border-base-content/8">
              <span className="text-[9.5px] font-bold text-base-content/60 block uppercase tracking-wider">Annual Yield</span>
              <span className="text-sm font-black font-mono text-primary mt-0.5 block truncate">
                {calculations.effectiveAnnualRate}% p.a.
              </span>
            </div>
          </div>

          {/* Timeline & Progress */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-base-200/50 to-emerald-500/10 border border-primary/20 space-y-2.5">
            <span className="font-black text-xs flex items-center gap-1.5 text-primary">
              <Sparkles size={14} />
              <span>Tenure Timeline & Maturity Milestones</span>
            </span>

            {/* Timeline Cards */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-base-100 border border-base-content/8 flex-1 min-w-0">
                <span className="text-[9px] opacity-60 uppercase font-black block">Start Date</span>
                <span className="font-extrabold font-mono text-[11px] sm:text-xs text-base-content truncate block">{start.format("DD MMM YYYY")}</span>
              </div>

              <div className="p-1 rounded-full bg-base-200 text-base-content/50 shrink-0">
                <ArrowRight size={13} />
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-base-100 border border-base-content/8 flex-1 min-w-0 text-center">
                <span className="text-[9px] opacity-60 uppercase font-black block">Today</span>
                <span className="font-extrabold font-mono text-[11px] sm:text-xs text-primary truncate block">{today.format("DD MMM YYYY")}</span>
              </div>

              <div className="p-1 rounded-full bg-base-200 text-base-content/50 shrink-0">
                <ArrowRight size={13} />
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-base-100 border border-base-content/8 flex-1 min-w-0 text-right">
                <span className="text-[9px] opacity-60 uppercase font-black block">Maturity Date</span>
                <span className="font-extrabold font-mono text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 truncate block">{maturity.format("DD MMM YYYY")}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWithdrawn ? "bg-amber-500" : isMatured ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[9.5px] font-mono text-base-content/70 font-semibold">
                <span>{daysPassed}d elapsed</span>
                <span className="font-bold">{progressPercent}% done</span>
                <span>{isWithdrawn ? "Withdrawn" : isMatured ? "Matured" : `${daysRemaining}d remaining`}</span>
              </div>
            </div>
          </div>

          {/* Configuration & Parameters Grid */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-base-200/40 dark:bg-base-300/30 border border-base-content/8 dark:border-base-content/8 space-y-2">
            <span className="font-black text-xs text-base-content/80 block">Deposit Configuration</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                <span className="opacity-60 font-semibold">Tenure:</span>
                <span className="font-black text-base-content">{fd.tenureText || calculations.tenureText}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                <span className="opacity-60 font-semibold">Compounding:</span>
                <span className="font-black text-base-content">Quarterly</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                <span className="opacity-60 font-semibold">Scheme:</span>
                <span className="font-black text-base-content truncate max-w-[100px]">{fd.schemeName || "Regular FD"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                <span className="opacity-60 font-semibold">Status:</span>
                <span className={`font-black ${isWithdrawn ? "text-amber-600" : isMatured ? "text-blue-600" : "text-emerald-600"}`}>
                  {isWithdrawn ? "Withdrawn" : isMatured ? "Matured" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Stats if Withdrawn */}
          {isWithdrawn && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <span className="font-black text-xs text-amber-600 dark:text-amber-400 block flex items-center gap-1.5">
                <Coins size={14} />
                <span>Withdrawal & Liquidation Settlement</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                  <span className="opacity-60 font-semibold">Withdrawn Date:</span>
                  <span className="font-black font-mono text-base-content">{dayjs(fd.withdrawalDate).format("DD MMM YYYY")}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                  <span className="opacity-60 font-semibold">Payout Got:</span>
                  <span className="font-black font-mono text-amber-600 dark:text-amber-400">₹{Number(fd.totalPayout || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                  <span className="opacity-60 font-semibold">Realized Interest:</span>
                  <span className="font-black font-mono text-emerald-600">+₹{Number(fd.realizedInterest || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-base-100 border border-base-content/6">
                  <span className="opacity-60 font-semibold">Net Gain:</span>
                  <span className="font-black font-mono text-emerald-600">+{Number(fd.realizedReturnPercent || 0)}% (₹{Number(fd.realizedGain || 0).toLocaleString("en-IN")})</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-base-content/8 dark:border-base-content/8 bg-base-200/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost font-bold rounded-xl text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
