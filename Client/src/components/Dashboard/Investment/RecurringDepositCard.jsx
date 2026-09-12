import React from "react";
import dayjs from "dayjs";
import {
  PiggyBank,
  Coins,
  Pencil,
  Trash2,
  Table,
  Plus
} from "lucide-react";
import { calculateRdMaturity } from "./AddRecurringDepositModal";
import CompanyLogo from "./CompanyLogo";

export default function RecurringDepositCard({
  index,
  rd,
  onEdit,
  onDelete,
  onOpenWithdraw,
  onRemoveWithdrawal,
  onOpenAddDeposit,
  onOpenTable,
  hideNumbers = false,
}) {
  const transactions = rd.transactions || [];
  // Deposited amount is purely the summation of all add deposits
  const principal = transactions.reduce(
    (acc, t) => acc + Number(t.amount || t.amtDeposit || 0),
    0
  );

  // Compute live calculations from RD properties
  const calculations = calculateRdMaturity({
    principal,
    interestRate: rd.interestRate,
    tenureYears: rd.tenureYears ?? (rd.tenureUnit === "Years" ? rd.tenureValue : 0),
    tenureMonths: rd.tenureMonths ?? (rd.tenureUnit === "Months" ? rd.tenureValue : 0),
    tenureDays: rd.tenureDays ?? (rd.tenureUnit === "Days" ? rd.tenureValue : 0),
    startDate: rd.startDate,
    maturityDate: rd.maturityDate,
    compoundingFrequency: rd.compoundingFrequency || "Quarterly",
  });

  // Tenure Progress Calculation
  const start = dayjs(rd.startDate);
  const maturity = dayjs(rd.maturityDate || calculations.maturityDate);
  const today = dayjs();

  const totalDays = Math.max(1, maturity.diff(start, "day"));
  const daysPassed = Math.max(0, today.diff(start, "day"));
  const daysRemaining = Math.max(0, maturity.diff(today, "day"));
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
  const isMatured = today.isAfter(maturity) || daysRemaining === 0;

  const isWithdrawn = !!rd.isWithdrawn;

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 dark:border-base-content/20 hover:border-primary/50 shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden transition-all duration-300 group/card">
      
      {/* Card Top Header: Bank Name, # Number, RD #, Scheme, Rate & Action Buttons */}
      <div className="p-4 sm:p-5 border-b border-base-300 dark:border-base-content/15 bg-base-100 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          
          {/* Bank Name & Index */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {index !== undefined && index !== null && (
              <span className="text-[11px] font-mono font-bold text-base-content/50 bg-base-200 px-2 py-0.5 rounded-xl border border-base-300 shrink-0 select-none">
                #{index}
              </span>
            )}
            <CompanyLogo name={rd.bankName} size="w-8 h-8" type="bank" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base text-base-content tracking-tight truncate group-hover/card:text-primary transition-colors">
                  {rd.bankName}
                </h3>

                {/* Status Badge */}
                {isWithdrawn ? (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    Withdrawn
                  </span>
                ) : isMatured ? (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shrink-0">
                    Matured
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    Active Deposit
                  </span>
                )}
              </div>

              {/* Subtitle Details Ribbon */}
              <div className="flex items-center gap-1.5 text-base-content/60 mt-1 flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] font-medium text-[10.5px]">
                <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 shrink-0">
                  {rd.interestRate}% p.a. • Quarterly
                </span>
                <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                <span className="shrink-0 font-bold">{rd.tenureText || calculations.tenureText}</span>
                {rd.rdNumber && (
                  <>
                    <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                    <span className="font-mono font-medium text-base-content/70 shrink-0">
                      #{rd.rdNumber}
                    </span>
                  </>
                )}
                {rd.schemeName && rd.schemeName !== "Regular RD" && (
                  <>
                    <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                    <span className="badge badge-xs font-semibold bg-base-200 border-0 shrink-0">
                      {rd.schemeName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Menu (Add Deposit, View Table, Edit & Delete) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. Add Deposit (+) Button */}
            <button
              type="button"
              onClick={() => onOpenAddDeposit && onOpenAddDeposit(rd)}
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title="Deposit Amount (Add Installment)"
            >
              <Plus size={14} />
            </button>

            {/* 2. Table Icon Button */}
            <button
              type="button"
              onClick={() => onOpenTable && onOpenTable(rd)}
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title="View Deposits Table"
            >
              <Table size={14} />
            </button>

            {/* 3. Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(rd)}
              className="p-1.5 text-base-content/60 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors cursor-pointer"
              title="Edit Recurring Deposit"
            >
              <Pencil size={14} />
            </button>

            {/* 4. Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(rd)}
              className="p-1.5 text-base-content/60 hover:text-error hover:bg-error/10 rounded-xl transition-colors cursor-pointer"
              title="Delete Recurring Deposit"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2-Side Grid Layout: One Side Deposited (Buy Side), One Side Withdrawn (Sell Side) */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
        
        {/* ============================================================== */}
        {/* SIDE 1: DEPOSITED (BUY SIDE)                                  */}
        {/* ============================================================== */}
        <div className="p-4 rounded-2xl bg-base-200/60 dark:bg-base-300/40 flex flex-col justify-between space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] uppercase font-black tracking-wider text-base-content/70 flex items-center gap-1.5">
              <PiggyBank size={14} className="text-primary" />
              <span>Deposited</span>
            </span>

            <span className="text-[10.5px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
              {transactions.length} {transactions.length === 1 ? 'Deposit' : 'Deposits'}
            </span>
          </div>

          {/* Principal Invested */}
          <div>
            <span className="text-[10px] uppercase font-bold text-base-content/60 block">Total Principal Deposited</span>
            <span className="text-xl font-black font-mono text-primary">
              {hideNumbers ? "₹ ••••••" : `₹${principal.toLocaleString("en-IN")}`}
            </span>
          </div>

          {/* If no deposits yet: Prompt to log first deposit */}
          {transactions.length === 0 ? (
            <div className="py-2.5 text-center space-y-2 bg-base-100/50 rounded-xl border border-dashed border-base-300 p-2">
              <p className="text-[11px] text-base-content/50 font-medium">No deposits added yet.</p>
              <button
                type="button"
                onClick={() => onOpenAddDeposit && onOpenAddDeposit(rd)}
                className="btn btn-xs btn-primary rounded-xl font-black gap-1 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Add First Deposit</span>
              </button>
            </div>
          ) : (
            /* Progressive Graph Starting from Start Date to End Date */
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-base-content/75 font-semibold">
                <span>{start.format("DD MMM YYYY")}</span>
                <span className="text-primary font-black">{progressPercent}%</span>
                <span>{maturity.format("DD MMM YYYY")}</span>
              </div>

              <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWithdrawn ? "bg-amber-500" : isMatured ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[9.5px] font-mono text-base-content/50">
                <span>Start</span>
                <span>{isMatured ? "Matured" : `${daysRemaining}d left`}</span>
                <span>Maturity</span>
              </div>
            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* SIDE 2: WITHDRAWN / SETTLEMENT                                 */}
        {/* ============================================================== */}
        <div className="p-4 rounded-2xl bg-base-200/60 dark:bg-base-300/40 flex flex-col justify-between space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] uppercase font-black tracking-wider text-base-content/70 flex items-center gap-1.5">
              <Coins size={14} className={isWithdrawn ? 'text-primary' : 'text-base-content/40'} />
              <span>Withdrawn</span>
            </span>

            {isWithdrawn && (
              <span className="text-[10px] font-bold text-base-content/60">
                {dayjs(rd.withdrawalDate).format("DD MMM YYYY")}
              </span>
            )}
          </div>

          {/* If NOT Withdrawn: Prompt to Liquidate */}
          {!isWithdrawn ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-2 space-y-2.5">
              <p className="text-[11px] text-base-content/60 font-medium">
                Not withdrawn yet. When matured or broken, record your settlement payout.
              </p>

              <button
                type="button"
                onClick={() => onOpenWithdraw(rd)}
                className="btn btn-sm bg-primary/15 hover:bg-primary/25 text-primary border-0 font-black rounded-2xl w-full gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Coins size={15} />
                <span>Withdraw / Settle RD</span>
              </button>
            </div>
          ) : (
            /* If Withdrawn: Settlement Breakdown & Gain */
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-base-content/60 block">Withdrawal Amount</span>
                  <span className="text-xl font-black font-mono text-base-content">
                    {hideNumbers ? "₹ ••••••" : `₹${Number(rd.totalPayout || 0).toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-base-content/60 block">
                    {Number(rd.realizedGain || 0) >= 0 ? "Net Profit" : "Net Loss"}
                  </span>
                  <span className={`text-lg font-black font-mono ${
                    Number(rd.realizedGain || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                  }`}>
                    {hideNumbers ? "₹ ••••••" : `${Number(rd.realizedGain || 0) >= 0 ? '+' : ''}₹${Number(rd.realizedGain || 0).toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                <span className={`badge badge-xs font-mono font-bold border-0 ${
                  Number(rd.realizedGain || 0) >= 0 ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/20 text-rose-700"
                }`}>
                  {Number(rd.realizedReturnPercent || 0) >= 0 ? `+${rd.realizedReturnPercent}%` : `${rd.realizedReturnPercent}%`} {Number(rd.realizedGain || 0) >= 0 ? "Profit" : "Loss"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenWithdraw(rd)}
                    className="text-primary hover:underline font-extrabold cursor-pointer"
                  >
                    Edit
                  </button>

                  <span className="text-base-content/30">•</span>

                  <button
                    type="button"
                    onClick={() => onRemoveWithdrawal ? onRemoveWithdrawal(rd) : onOpenWithdraw(rd)}
                    className="text-rose-500 hover:text-rose-600 hover:underline font-extrabold cursor-pointer flex items-center gap-1"
                    title="Remove Withdrawn Transaction"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
