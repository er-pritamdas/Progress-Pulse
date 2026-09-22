import React, { useState } from "react";
import dayjs from "dayjs";
import {
  PiggyBank,
  Coins,
  Pencil,
  Trash2,
  Table,
  Plus,
  Clock,
  Calendar,
  TrendingUp,
  Sparkles,
  MinusCircle,
  Landmark,
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
  const [activeFace, setActiveFace] = useState(0); // 0 = Invested Details, 1 = Withdrawn Details

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
    <>
      {/* =================================================================== */}
      {/* DESKTOP CARD VIEW                                                   */}
      {/* =================================================================== */}
      <div className="hidden md:flex bg-base-100 rounded-3xl border border-base-content/8 dark:border-base-content/8 hover:border-primary/40 shadow-xs hover:shadow-lg flex-col justify-between overflow-hidden transition-all duration-300 group/card">
        
        {/* Card Top Header: Bank Name, # Number, RD #, Scheme, Rate & Action Buttons */}
        <div className="p-4 sm:p-5 border-b border-base-content/8 dark:border-base-content/8 bg-base-100 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            
            {/* Bank Name & Index */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {index !== undefined && index !== null && (
                <span className="text-[11px] font-mono font-bold text-base-content/40 bg-base-200/60 px-2 py-0.5 rounded-lg shrink-0 select-none">
                  #{index}
                </span>
              )}
              <CompanyLogo name={rd.bankName} size="w-8 h-8" type="bank" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-base-content tracking-tight truncate group-hover/card:text-primary transition-colors">
                    {rd.bankName}
                  </h3>

                  {/* Status Badge */}
                  {isWithdrawn ? (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 shadow-2xs">
                      Withdrawn
                    </span>
                  ) : isMatured ? (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 shrink-0 shadow-2xs">
                      Matured
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 shadow-2xs">
                      Active Deposit
                    </span>
                  )}
                </div>

                {/* Subtitle Details Ribbon */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-base-content/60 mt-1 flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] font-medium text-[10px]">
                  <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20 text-[9.5px] shrink-0">
                    {rd.interestRate}% p.a. • Quarterly
                  </span>
                  <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                  <span className="shrink-0">{rd.tenureText || calculations.tenureText}</span>
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

            {/* Quick Actions Menu (Add Deposit, View Table, Withdraw, Edit & Delete) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover/card:opacity-100 transition-opacity">
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

              {/* 3. Withdraw / Settle Button */}
              <button
                type="button"
                onClick={() => onOpenWithdraw && onOpenWithdraw(rd)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isWithdrawn
                    ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                    : "text-primary bg-primary/10 hover:bg-primary/20"
                }`}
                title={isWithdrawn ? "Edit Withdrawal Settlement" : "Withdraw / Settle RD"}
              >
                <Coins size={14} />
              </button>

              {/* 4. Edit Button */}
              <button
                type="button"
                onClick={() => onEdit(rd)}
                className="p-1.5 text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors cursor-pointer"
                title="Edit Recurring Deposit"
              >
                <Pencil size={14} />
              </button>

              {/* 5. Delete Button */}
              <button
                type="button"
                onClick={() => onDelete(rd)}
                className="p-1.5 text-error bg-error/10 hover:bg-error/20 rounded-xl transition-colors cursor-pointer"
                title="Delete Recurring Deposit"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Side Grid Layout: Deposited Side vs Withdrawn Side */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
          
          {/* SIDE 1: DEPOSITED (BUY SIDE) */}
          <div className="p-4 rounded-2xl bg-base-200/50 dark:bg-base-300/30 border border-base-content/6 dark:border-base-content/6 flex flex-col justify-between space-y-3">
            
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
              <div className="py-2.5 text-center space-y-2 bg-base-100/50 rounded-xl border border-dashed border-base-content/15 p-2">
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

          {/* SIDE 2: WITHDRAWN / SETTLEMENT */}
          <div className="p-4 rounded-2xl bg-base-200/50 dark:bg-base-300/30 border border-base-content/6 dark:border-base-content/6 flex flex-col justify-between space-y-3">
            
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

      {/* =================================================================== */}
      {/* MOBILE COMPRESSED CARD VIEW (< md screen sizes)                      */}
      {/* Matches FD / MF mobile card structure with 2 face tabs & thin border */}
      {/* =================================================================== */}
      <div className="flex md:hidden bg-base-100 rounded-2xl border border-base-content/8 dark:border-base-content/8 shadow-xs flex-col overflow-hidden transition-all duration-300">
        
        {/* Mobile Header: Bank Logo, Name, Index, Status & Subtitle */}
        <div className="p-3 border-b border-base-content/8 dark:border-base-content/8 bg-base-100 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {index !== undefined && index !== null && (
                <span className="text-[10px] font-mono font-bold text-base-content/40 bg-base-200/60 px-1.5 py-0.5 rounded-md shrink-0 select-none">
                  #{index}
                </span>
              )}
              <CompanyLogo name={rd.bankName} size="w-7 h-7" type="bank" />
              <h3 className="font-black text-sm text-base-content tracking-tight truncate">
                {rd.bankName}
              </h3>
            </div>

            {/* Status Badge */}
            {isWithdrawn ? (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                Withdrawn
              </span>
            ) : isMatured ? (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 shrink-0">
                Matured
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                Active
              </span>
            )}
          </div>

          {/* Subtitle Details Ribbon */}
          <div className="flex items-center gap-1 text-base-content/60 text-[10px] font-medium flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.2 rounded-md border border-primary/20 text-[9px] shrink-0">
              {rd.interestRate}% p.a. • Quarterly
            </span>
            <span className="text-base-content/30">•</span>
            <span className="shrink-0">{rd.tenureText || calculations.tenureText}</span>
            {rd.rdNumber && (
              <>
                <span className="text-base-content/30">•</span>
                <span className="font-mono text-base-content/70 shrink-0">
                  #{rd.rdNumber}
                </span>
              </>
            )}
            {rd.schemeName && rd.schemeName !== "Regular RD" && (
              <>
                <span className="text-base-content/30">•</span>
                <span className="badge badge-xs font-semibold bg-base-200 border-0 shrink-0 text-[9px]">
                  {rd.schemeName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Invested vs Withdrawn Two Tabs */}
        <div className="px-3 pt-2 pb-1 bg-base-100">
          <div className="grid grid-cols-2 gap-1 bg-base-200/80 dark:bg-base-800/60 p-0.5 rounded-xl border border-base-content/8 dark:border-base-content/8">
            <button
              type="button"
              onClick={() => setActiveFace(0)}
              className={`h-7 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeFace === 0
                  ? "bg-base-100 dark:bg-base-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black border border-base-content/8 dark:border-base-content/8 scale-[1.01]"
                  : "text-base-content/65 hover:text-base-content"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeFace === 0 ? "bg-emerald-500" : "bg-base-content/30"}`} />
              <span>Deposited</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFace(1)}
              className={`h-7 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeFace === 1
                  ? "bg-base-100 dark:bg-base-900 text-amber-600 dark:text-amber-400 shadow-xs font-black border border-base-content/8 dark:border-base-content/8 scale-[1.01]"
                  : "text-base-content/65 hover:text-base-content"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeFace === 1 ? "bg-amber-500" : "bg-base-content/30"}`} />
              <span>Withdrawn</span>
            </button>
          </div>
        </div>

        {/* Compressed Body: Tab 0 (Deposited) or Tab 1 (Withdrawn) */}
        <div className="p-3 space-y-2">
          {activeFace === 0 ? (
            /* FACE 0: DEPOSITED DETAILS */
            <div className="space-y-2 animate-in fade-in duration-150">
              {/* Hero Stat: Total Principal Deposited + Expected Maturity & Interest */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 block">
                    Total Deposited
                  </span>
                  <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {hideNumbers ? "₹ ••••••" : `₹${principal.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="text-right text-[10px] font-mono text-base-content/70 space-y-0.5">
                  <div>
                    <span className="text-base-content/50 uppercase text-[9px] mr-1">Expected:</span>
                    <span className="font-bold text-base-content">
                      {hideNumbers ? "••••" : `₹${calculations.maturityAmount.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/50 uppercase text-[9px] mr-1">Interest:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {hideNumbers ? "•••" : `+₹${calculations.totalInterest.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Compact Metric Cards */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {/* 1. Rate & Compounding */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp size={10} className="text-primary" /> Rate
                  </span>
                  <div className="font-extrabold text-xs font-mono text-base-content">
                    {rd.interestRate}% p.a.
                  </div>
                  <div className="text-[9px] font-mono text-base-content/60">
                    Quarterly Compounding
                  </div>
                </div>

                {/* 2. Tenure */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} className="text-secondary" /> Tenure
                  </span>
                  <div className="font-extrabold text-xs text-base-content truncate">
                    {rd.tenureText || calculations.tenureText}
                  </div>
                  <div className="text-[9px] font-mono text-base-content/60">
                    {isMatured ? "Matured" : `${daysRemaining} days left`}
                  </div>
                </div>

                {/* 3. Start Date */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={10} className="text-info" /> Start Date
                  </span>
                  <div className="font-extrabold text-xs font-mono text-base-content truncate">
                    {start.format("DD MMM YYYY")}
                  </div>
                  <div className="text-[9px] font-mono text-base-content/60">
                    {daysPassed}d passed
                  </div>
                </div>

                {/* 4. Maturity Date */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} className="text-warning" /> Maturity Date
                  </span>
                  <div className="font-extrabold text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">
                    {maturity.format("DD MMM YYYY")}
                  </div>
                  <div className="text-[9px] font-mono text-base-content/60">
                    +{calculations.gainPercent || 0}% Gain
                  </div>
                </div>
              </div>

              {/* Progress Bar with Start & Maturity Dates */}
              {transactions.length === 0 ? (
                <div className="p-3 bg-base-200/30 border border-dashed border-base-content/15 rounded-xl text-center space-y-1.5">
                  <p className="text-[11px] text-base-content/60 font-medium">No installments recorded yet.</p>
                  <button
                    type="button"
                    onClick={() => onOpenAddDeposit && onOpenAddDeposit(rd)}
                    className="btn btn-xs btn-primary rounded-xl font-bold gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add First Deposit</span>
                  </button>
                </div>
              ) : (
                <div className="p-2 bg-base-200/30 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[9.5px] font-mono text-base-content/70 font-semibold">
                    <span>{start.format("DD MMM YY")}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                        {transactions.length} {transactions.length === 1 ? 'Deposit' : 'Deposits'}
                      </span>
                      <span className="text-primary font-black">{progressPercent}%</span>
                    </div>
                    <span>{maturity.format("DD MMM YY")}</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWithdrawn ? "bg-amber-500" : isMatured ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* FACE 1: WITHDRAWAL DETAILS */
            <div className="space-y-2 animate-in fade-in duration-150">
              {!isWithdrawn ? (
                /* Not Withdrawn Prompt */
                <div className="p-4 bg-base-200/40 border border-base-content/6 dark:border-base-content/6 rounded-xl text-center space-y-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                    <Coins size={16} />
                  </div>
                  <p className="text-[11px] text-base-content/70 font-medium">
                    Not withdrawn yet. When matured or broken, record your settlement payout.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenWithdraw && onOpenWithdraw(rd)}
                    className="btn btn-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold rounded-xl w-full gap-1.5 transition-all cursor-pointer h-8 shadow-2xs"
                  >
                    <Coins size={13} />
                    <span>Withdraw / Settle RD</span>
                  </button>
                </div>
              ) : (
                /* Withdrawn Details */
                <>
                  {/* Hero Stat: Total Received / Net Payout + Gain/Loss */}
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 block">
                        Net Payout Received
                      </span>
                      <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400 tracking-tight">
                        {hideNumbers ? "₹ ••••••" : `₹${Number(rd.totalPayout || 0).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    <div className="text-right text-[10px] font-mono space-y-0.5">
                      <div>
                        <span className="text-base-content/50 uppercase text-[9px] mr-1">Gain:</span>
                        <span className={`font-bold ${Number(rd.realizedGain || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                          {hideNumbers ? "••••" : `${Number(rd.realizedGain || 0) >= 0 ? "+" : ""}₹${Number(rd.realizedGain || 0).toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      <div>
                        <span className={`badge badge-xs font-mono font-bold border-0 ${
                          Number(rd.realizedGain || 0) >= 0
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/20 text-rose-700"
                        }`}>
                          {Number(rd.realizedReturnPercent || 0) >= 0 ? `+${rd.realizedReturnPercent}%` : `${rd.realizedReturnPercent}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Compact Metric Cards */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {/* 1. Withdrawal Date */}
                    <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={10} className="text-primary" /> Withdrawn Date
                      </span>
                      <div className="font-extrabold text-xs font-mono text-base-content">
                        {dayjs(rd.withdrawalDate).format("DD MMM YYYY")}
                      </div>
                      <div className="text-[9px] font-mono text-base-content/60">
                        {Math.max(0, dayjs(rd.withdrawalDate).diff(start, "day"))} days held
                      </div>
                    </div>

                    {/* 2. Realized Interest */}
                    <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={10} className="text-secondary" /> Realized Interest
                      </span>
                      <div className="font-extrabold text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        {hideNumbers ? "••••" : `+₹${Number(rd.realizedGain || 0).toLocaleString("en-IN")}`}
                      </div>
                      <div className="text-[9px] font-mono text-base-content/60">
                        Total earnings
                      </div>
                    </div>

                    {/* 3. Penalties */}
                    <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                        <MinusCircle size={10} className="text-rose-500" /> Penalties / Deductions
                      </span>
                      <div className="font-extrabold text-xs font-mono text-base-content">
                        {hideNumbers ? "•••" : Number(rd.penalty || 0) > 0 ? `₹${Number(rd.penalty).toLocaleString("en-IN")}` : "₹0 (None)"}
                      </div>
                      <div className="text-[9px] font-mono text-base-content/60">
                        Premature charges
                      </div>
                    </div>

                    {/* 4. Principal Recovered */}
                    <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                        <Landmark size={10} className="text-info" /> Principal Ret.
                      </span>
                      <div className="font-extrabold text-xs font-mono text-base-content">
                        {hideNumbers ? "••••" : `₹${principal.toLocaleString("en-IN")}`}
                      </div>
                      <div className="text-[9px] font-mono text-base-content/60">
                        100% Returned
                      </div>
                    </div>
                  </div>

                  {/* Settlement Action Bar */}
                  <div className="px-2.5 py-1.5 bg-base-200/30 border border-base-content/6 dark:border-base-content/6 rounded-lg text-[10px] flex items-center justify-between">
                    <span className="text-base-content/60 font-semibold">Settlement Actions:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenWithdraw && onOpenWithdraw(rd)}
                        className="text-primary hover:underline font-extrabold cursor-pointer"
                      >
                        Edit Settlement
                      </button>
                      <span className="text-base-content/30">•</span>
                      <button
                        type="button"
                        onClick={() => onRemoveWithdrawal ? onRemoveWithdrawal(rd) : onOpenWithdraw && onOpenWithdraw(rd)}
                        className="text-rose-500 hover:text-rose-600 hover:underline font-extrabold cursor-pointer flex items-center gap-0.5"
                      >
                        <Trash2 size={11} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Action Icons on the Footer */}
        <div className="px-3 py-2 border-t border-base-content/8 dark:border-base-content/8 bg-base-200/30 flex items-center justify-end">
          <div className="flex items-center gap-1.5">
            {/* 1. Add Deposit Button */}
            <button
              type="button"
              onClick={() => onOpenAddDeposit && onOpenAddDeposit(rd)}
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title="Deposit Amount (Add Installment)"
            >
              <Plus size={14} />
            </button>

            {/* 2. Table Button */}
            <button
              type="button"
              onClick={() => onOpenTable && onOpenTable(rd)}
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title="View Deposits Table"
            >
              <Table size={14} />
            </button>

            {/* 3. Withdraw Button */}
            <button
              type="button"
              onClick={() => onOpenWithdraw && onOpenWithdraw(rd)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isWithdrawn
                  ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              }`}
              title={isWithdrawn ? "Edit Withdrawal Settlement" : "Withdraw / Settle RD"}
            >
              <Coins size={14} />
            </button>

            {/* 4. Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(rd)}
              className="p-1.5 text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors cursor-pointer"
              title="Edit Recurring Deposit"
            >
              <Pencil size={14} />
            </button>

            {/* 5. Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(rd)}
              className="p-1.5 text-error bg-error/10 hover:bg-error/20 rounded-xl transition-colors cursor-pointer"
              title="Delete Recurring Deposit"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
