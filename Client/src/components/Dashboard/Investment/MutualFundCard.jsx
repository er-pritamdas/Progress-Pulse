import React, { useState } from "react";
import {
  Layers,
  Clock,
  TrendingUp,
  Coins,
  Calendar,
  Table,
  Plus,
  Minus,
  Info,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CompanyLogo from "./CompanyLogo";

export default function MutualFundCard({
  index,
  fund,
  summary,
  onOpenInfo,
  onOpenTable,
  onOpenAddSip,
  onOpenAddWithdrawal,
  onEdit,
  onDelete,
  hideNumbers = false,
}) {
  const [activeFace, setActiveFace] = useState(0); // 0 = Deposited Details, 1 = Withdrawal Details

  return (
    <>
      {/* =================================================================== */}
      {/* DESKTOP CARD VIEW                                                   */}
      {/* =================================================================== */}
      <div className="hidden md:flex bg-base-100 rounded-3xl border border-base-content/8 dark:border-base-content/8 hover:border-secondary/30 shadow-xs hover:shadow-lg flex-col justify-between overflow-hidden transition-all duration-300 group/card">
      {/* Card Header: AMC Name, # Number, Folio, Category, Plan, Option & Actions */}
      <div className="p-4 sm:p-5 border-b border-base-content/8 dark:border-base-content/8 bg-base-100 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          {/* AMC Name with small light opacity # Number */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {index !== undefined && index !== null && (
              <span className="text-[11px] font-mono font-bold text-base-content/40 bg-base-200/60 px-2 py-0.5 rounded-lg shrink-0 select-none">
                #{index}
              </span>
            )}
            <CompanyLogo name={fund.amc} size="w-8 h-8" type="mf" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-base-content tracking-tight truncate group-hover/card:text-secondary transition-colors">
                  {fund.amc}
                </h3>
                {summary.isFullyRedeemed ? (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-base-300 text-base-content/90 border border-base-content/10 shrink-0 shadow-2xs">
                    Sold
                  </span>
                ) : (summary.totalUnitsWithdrawn || 0) > 0 ? (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 shadow-2xs">
                    Selling
                  </span>
                ) : null}
              </div>

              {/* Category Hierarchy, Plan, Option & Folio Number - Single Line */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-base-content/60 mt-1 flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-medium">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 text-[9.5px] shrink-0">
                  {fund.category} → {(fund.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim()}
                </span>
                <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                <span className="text-[10px] shrink-0">{fund.plan}</span>
                <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                <span className="text-[10px] shrink-0">{fund.optionType}</span>
                {fund.folioNumber && (
                  <>
                    <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                    <span className="text-[10px] font-mono font-medium text-base-content/70 shrink-0">
                      #{fund.folioNumber.replace(/^#/, "")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Info (i), Add (+ / -), Table View, Edit & Delete */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover/card:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onOpenInfo && onOpenInfo(fund)}
              className="p-1.5 text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors cursor-pointer"
              title="Fund Detailed Insights (Deposited, Withdrawn & Cumulative)"
            >
              <Info size={14} />
            </button>
            {activeFace === 0 ? (
              <button
                type="button"
                onClick={() => onOpenAddSip && onOpenAddSip(fund, "deposit")}
                className="p-1.5 text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors cursor-pointer"
                title="Add Installment (SIP / Lumpsum Deposit)"
              >
                <Plus size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onOpenAddWithdrawal
                    ? onOpenAddWithdrawal(fund)
                    : onOpenAddSip && onOpenAddSip(fund, "withdrawal")
                }
                className="p-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors cursor-pointer"
                title="Add Withdrawal (SWP / Redemption)"
              >
                <Minus size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onOpenTable && onOpenTable(fund, activeFace === 1 ? "withdrawal" : "deposit")
              }
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title={
                activeFace === 1
                  ? "Open Withdrawals Table View"
                  : "Open Deposits Table View"
              }
            >
              <Table size={14} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors cursor-pointer"
              title="Edit Fund Details"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-error bg-error/10 hover:bg-error/20 rounded-xl transition-colors cursor-pointer"
              title="Delete Fund"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Carousel Track: Face 1 (Deposited) & Face 2 (Withdrawals) */}
      <div className="relative overflow-hidden w-full flex-1">
        <div
          className="flex w-[200%] transition-transform duration-300 ease-out"
          style={{
            transform: activeFace === 0 ? "translateX(0%)" : "translateX(-50%)",
          }}
        >
          {/* ================================================================= */}
          {/* FACE 1: DEPOSITED DETAILS                                         */}
          {/* ================================================================= */}
          <div className="w-1/2 p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between shrink-0">
            {/* Hero Stat: Total Invested & Gross Deposited / ER Ribbon with Far-Right Arrow Icons */}
            <div className="p-3 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/50 block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Total Actually Invested
                </span>
                <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {hideNumbers
                    ? "₹ ••••••"
                    : `₹${summary.totalInvested.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-auto">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-base-content/70">
                  <div>
                    <span className="text-[9px] uppercase text-base-content/40 block font-sans">Gross Deposited</span>
                    <span className="text-base-content font-bold">
                      {hideNumbers
                        ? "₹ ••••••"
                        : `₹${summary.totalDeposited.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="h-5 w-px bg-base-content/10" />
                  <div>
                    <span className="text-[9px] uppercase text-base-content/40 block font-sans">Total ER</span>
                    <span className="text-error font-bold">
                      {hideNumbers
                        ? "₹ •••"
                        : `₹${summary.totalEr.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Far Right: Next Arrow Icon (Only right arrow on Deposited face) */}
                <button
                  type="button"
                  onClick={() => setActiveFace(1)}
                  className="p-1 rounded-lg text-base-content/50 hover:text-base-content hover:bg-base-200/80 transition-colors cursor-pointer shrink-0"
                  title="Switch to Withdrawal Details"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Face 1 Body: Structured 2x3 Grid of Deposit Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* 1. Total Terms & Frequency Breakdown */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Layers size={11} className="text-secondary" /> Total Terms
                </span>
                <div className="font-extrabold text-sm text-base-content font-mono">
                  {hideNumbers ? "••" : summary.totalTerms}{" "}
                  <span className="text-xs font-sans font-medium text-base-content/60">Terms</span>
                </div>
                <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold">
                    {hideNumbers ? "•• SIPs" : `${summary.sipCount} SIPs`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                    {hideNumbers ? "•• LS" : `${summary.lsCount} LS`}
                  </span>
                </div>
              </div>

              {/* 2. Duration */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Clock size={11} className="text-primary" /> Duration
                </span>
                <div className="font-extrabold text-sm text-base-content truncate">
                  {summary.durationText}
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  Active Timeline
                </div>
              </div>

              {/* 3. Average NAV */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <TrendingUp size={11} className="text-info" /> Avg NAV
                </span>
                <div className="font-extrabold text-sm text-base-content font-mono">
                  {hideNumbers
                    ? "₹ ••••"
                    : summary.avgNav > 0
                    ? `₹${summary.avgNav.toFixed(2)}`
                    : "—"}
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  Cost per Unit
                </div>
              </div>

              {/* 4. Units Breakdown: Added, Redeemed, Left */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Coins size={11} className="text-warning" /> Units Left:{" "}
                  <strong className="font-mono text-base-content font-black">
                    {hideNumbers ? "•••••" : summary.activeUnits.toFixed(3)}
                  </strong>
                </span>
                <div className="flex items-center justify-between text-[9.5px] font-mono pt-0.5 border-t border-base-content/8 dark:border-base-content/8 text-base-content/70">
                  <span>
                    Added:{" "}
                    <strong className="text-secondary">
                      {hideNumbers ? "+•••••" : `+${summary.totalUnits.toFixed(3)}`}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9.5px] font-mono text-base-content/70">
                  <span>
                    Redeemed:{" "}
                    <strong className="text-amber-600 dark:text-amber-400">
                      {hideNumbers
                        ? "-•••••"
                        : `-${(summary.totalUnitsWithdrawn || 0).toFixed(3)}`}
                    </strong>
                  </span>
                </div>
              </div>

              {/* 5. Date Range (From -> To) */}
              <div className="col-span-2 p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Calendar size={11} className="text-secondary" /> Date Range (From → To)
                </span>
                <div className="font-mono font-bold text-xs text-base-content flex items-center gap-1.5 flex-wrap">
                  <span>{summary.fromDateStr}</span>
                  <span className="text-base-content/40">→</span>
                  <span>{summary.toDateStr}</span>
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  First to Latest Installment
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* FACE 2: WITHDRAWAL DETAILS                                        */}
          {/* ================================================================= */}
          <div className="w-1/2 p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between shrink-0">
            {/* Hero Stat: Total Withdrawn & Gross / ER Ribbon with Far-Right Arrow Icons */}
            <div className="p-3 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/50 block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-base-content/40 inline-block" />
                  Total Actually Withdrawn
                </span>
                <span className="text-lg font-mono font-black text-base-content tracking-tight">
                  {hideNumbers
                    ? "₹ ••••••"
                    : `₹${(summary.totalWithdrawn || 0).toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-auto">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-base-content/70">
                  <div>
                    <span className="text-[9px] uppercase text-base-content/40 block font-sans">Gross Withdrawn</span>
                    <span className="text-base-content font-bold">
                      {hideNumbers
                        ? "₹ ••••••"
                        : `₹${(summary.grossWithdrawn || 0).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="h-5 w-px bg-base-content/10" />
                  <div>
                    <span className="text-[9px] uppercase text-base-content/40 block font-sans">Total ER</span>
                    <span className="text-error font-bold">
                      {hideNumbers
                        ? "₹ •••"
                        : `₹${(summary.totalWithdrawalEr || 0).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Far Right: Prev Arrow Icon (Only left arrow on Withdrawal face) */}
                <button
                  type="button"
                  onClick={() => setActiveFace(0)}
                  className="p-1 rounded-lg text-base-content/50 hover:text-base-content hover:bg-base-200/80 transition-colors cursor-pointer shrink-0"
                  title="Switch to Deposited Details"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Face 2 Body: Structured 2x3 Grid of Withdrawal Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* 1. Total Withdrawals Breakdown */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Layers size={11} className="text-secondary" /> Total Terms
                </span>
                <div className="font-extrabold text-sm text-base-content font-mono">
                  {hideNumbers ? "••" : summary.totalWithdrawalTerms || 0}{" "}
                  <span className="text-xs font-sans font-medium text-base-content/60">Terms</span>
                </div>
                <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded-md bg-base-300/60 text-base-content/80 text-[10px] font-bold">
                    {hideNumbers ? "•• SWP" : `${summary.swpCount || 0} SWP`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                    {hideNumbers ? "•• LS" : `${summary.lsWithdrawalCount || 0} LS`}
                  </span>
                </div>
              </div>

              {/* 2. Duration */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Clock size={11} className="text-primary" /> Duration
                </span>
                <div className="font-extrabold text-sm text-base-content truncate">
                  {summary.withdrawalDurationText || "—"}
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  Withdrawal Timeline
                </div>
              </div>

              {/* 3. Average Exit NAV */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <TrendingUp size={11} className="text-info" /> Avg NAV
                </span>
                <div className="font-extrabold text-sm text-base-content font-mono">
                  {hideNumbers
                    ? "₹ ••••"
                    : (summary.avgExitNav || 0) > 0
                    ? `₹${summary.avgExitNav.toFixed(2)}`
                    : "—"}
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  Exit Price per Unit
                </div>
              </div>

              {/* 4. Units Breakdown: Redeemed, Added, Left */}
              <div className="p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Coins size={11} className="text-warning" /> Units Redeemed:{" "}
                  <strong className="font-mono text-base-content font-black">
                    {hideNumbers
                      ? "-•••••"
                      : `-${(summary.totalUnitsWithdrawn || 0).toFixed(3)}`}
                  </strong>
                </span>
                <div className="flex items-center justify-between text-[9.5px] font-mono pt-0.5 border-t border-base-content/8 dark:border-base-content/8 text-base-content/70">
                  <span>
                    Added:{" "}
                    <strong className="text-secondary">
                      {hideNumbers ? "+•••••" : `+${summary.totalUnits.toFixed(3)}`}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9.5px] font-mono text-base-content/70">
                  <span>
                    Units Left:{" "}
                    <strong className="text-base-content font-bold">
                      {hideNumbers ? "•••••" : summary.activeUnits.toFixed(3)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* 5. Date Range (From -> To) */}
              <div className="col-span-2 p-2.5 bg-base-200/40 rounded-2xl border border-base-content/6 dark:border-base-content/6 space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Calendar size={11} className="text-secondary" /> Date Range (From → To)
                </span>
                <div className="font-mono font-bold text-xs text-base-content flex items-center gap-1.5 flex-wrap">
                  <span>{summary.withdrawalFromDateStr || "—"}</span>
                  <span className="text-base-content/40">→</span>
                  <span>{summary.withdrawalToDateStr || "—"}</span>
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  First to Latest Withdrawal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* =================================================================== */}
      {/* MOBILE COMPRESSED CARD VIEW                                         */}
      {/* =================================================================== */}
      <div className="flex md:hidden bg-base-100 rounded-2xl border border-base-content/8 dark:border-base-content/8 shadow-xs hover:shadow-md flex-col justify-between overflow-hidden transition-all duration-200">
        {/* Card Header: ONLY MF Details (No Action Icons) */}
        <div className="p-3 border-b border-base-content/8 dark:border-base-content/8 bg-base-200/30 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {index !== undefined && index !== null && (
                <span className="text-[10px] font-mono font-bold text-base-content/40 bg-base-200 px-1.5 py-0.2 rounded-md shrink-0 select-none">
                  #{index}
                </span>
              )}
              <CompanyLogo name={fund.amc} size="w-6 h-6" type="mf" />
              <h3 className="font-extrabold text-xs text-base-content tracking-tight truncate">
                {fund.amc}
              </h3>
            </div>
            {summary.isFullyRedeemed ? (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-base-300 text-base-content/90 border border-base-content/10 shrink-0">
                Sold
              </span>
            ) : (summary.totalUnitsWithdrawn || 0) > 0 ? (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                Selling
              </span>
            ) : null}
          </div>

          {/* Category Hierarchy, Plan, Option & Folio */}
          <div className="flex items-center gap-1 text-base-content/60 text-[10px] font-medium flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-md border border-emerald-500/20 text-[9px] shrink-0">
              {fund.category} → {(fund.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim()}
            </span>
            <span className="text-base-content/30">•</span>
            <span className="shrink-0">{fund.plan}</span>
            <span className="text-base-content/30">•</span>
            <span className="shrink-0">{fund.optionType}</span>
            {fund.folioNumber && (
              <>
                <span className="text-base-content/30">•</span>
                <span className="font-mono text-base-content/70 shrink-0">
                  #{fund.folioNumber.replace(/^#/, "")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Invested vs Withdrawn Two Tabs (Replacing arrow mark) */}
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
              <span>Invested</span>
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

        {/* Compressed Body: Tab 0 (Invested) or Tab 1 (Withdrawn) */}
        <div className="p-3 space-y-2">
          {activeFace === 0 ? (
            /* FACE 0: INVESTED DETAILS */
            <div className="space-y-2 animate-in fade-in duration-150">
              {/* Hero Stat: Total Actually Invested + Gross & ER */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 block">
                    Actually Invested
                  </span>
                  <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {hideNumbers ? "₹ ••••••" : `₹${summary.totalInvested.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="text-right text-[10px] font-mono text-base-content/70 space-y-0.5">
                  <div>
                    <span className="text-base-content/50 uppercase text-[9px] mr-1">Gross:</span>
                    <span className="font-bold text-base-content">
                      {hideNumbers ? "••••" : `₹${summary.totalDeposited.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/50 uppercase text-[9px] mr-1">ER:</span>
                    <span className="font-bold text-error">
                      {hideNumbers ? "•••" : `₹${summary.totalEr.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 1: Terms, Duration and Avg NAV in a single line (3 columns) */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {/* 1. Terms */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 truncate">
                    <Layers size={10} className="text-secondary shrink-0" /> Terms
                  </span>
                  <div className="font-extrabold text-xs font-mono text-base-content truncate">
                    {hideNumbers ? "••" : summary.totalTerms}{" "}
                    <span className="text-[8.5px] font-normal text-base-content/60">({summary.sipCount}S, {summary.lsCount}L)</span>
                  </div>
                </div>

                {/* 2. Duration */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 truncate">
                    <Clock size={10} className="text-primary shrink-0" /> Duration
                  </span>
                  <div className="font-extrabold text-xs text-base-content truncate" title={summary.durationText}>
                    {summary.durationText}
                  </div>
                </div>

                {/* 3. Avg NAV */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 truncate">
                    <TrendingUp size={10} className="text-info shrink-0" /> Avg NAV
                  </span>
                  <div className="font-extrabold text-xs font-mono text-base-content truncate">
                    {hideNumbers ? "₹ ••••" : summary.avgNav > 0 ? `₹${summary.avgNav.toFixed(2)}` : "—"}
                  </div>
                </div>
              </div>

              {/* Row 2: Units Left */}
              <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                    <Coins size={10} className="text-warning shrink-0" /> Units Left
                  </span>
                  <div className="font-extrabold text-sm font-mono text-base-content">
                    {hideNumbers ? "•••••" : summary.activeUnits.toFixed(3)}
                  </div>
                </div>
                <div className="text-right text-[9.5px] font-mono text-base-content/65 space-y-0.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[8.5px] uppercase font-bold text-base-content/40">Total:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">+{summary.totalUnits.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[8.5px] uppercase font-bold text-base-content/40">Sold:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">-{(summary.totalUnitsWithdrawn || 0).toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FACE 1: WITHDRAWAL DETAILS */
            <div className="space-y-2 animate-in fade-in duration-150">
              {/* Hero Stat: Total Actually Withdrawn + Gross & ER */}
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 block">
                    Actually Withdrawn
                  </span>
                  <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    {hideNumbers ? "₹ ••••••" : `₹${(summary.totalWithdrawn || 0).toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="text-right text-[10px] font-mono text-base-content/70 space-y-0.5">
                  <div>
                    <span className="text-base-content/50 uppercase text-[9px] mr-1">Gross:</span>
                    <span className="font-bold text-base-content">
                      {hideNumbers ? "••••" : `₹${(summary.grossWithdrawn || 0).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/50 uppercase text-[9px] mr-1">ER:</span>
                    <span className="font-bold text-error">
                      {hideNumbers ? "•••" : `₹${(summary.totalWithdrawalEr || 0).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 1: Terms, Duration and Exit NAV in a single line (3 columns) */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {/* 1. Terms */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 truncate">
                    <Layers size={10} className="text-secondary shrink-0" /> Terms
                  </span>
                  <div className="font-extrabold text-xs font-mono text-base-content truncate">
                    {hideNumbers ? "••" : summary.totalWithdrawalTerms || 0}{" "}
                    <span className="text-[8.5px] font-normal text-base-content/60">({summary.swpCount || 0}S, {summary.lsWithdrawalCount || 0}L)</span>
                  </div>
                </div>

                {/* 2. Duration */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 truncate">
                    <Clock size={10} className="text-primary shrink-0" /> Duration
                  </span>
                  <div className="font-extrabold text-xs text-base-content truncate" title={summary.withdrawalDurationText || "—"}>
                    {summary.withdrawalDurationText || "—"}
                  </div>
                </div>

                {/* 3. Exit NAV */}
                <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl space-y-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 truncate">
                    <TrendingUp size={10} className="text-info shrink-0" /> Exit NAV
                  </span>
                  <div className="font-extrabold text-xs font-mono text-base-content truncate">
                    {hideNumbers ? "₹ ••••" : (summary.avgExitNav || 0) > 0 ? `₹${summary.avgExitNav.toFixed(2)}` : "—"}
                  </div>
                </div>
              </div>

              {/* Row 2: Units Redeemed */}
              <div className="p-2 bg-base-200/50 border border-base-content/6 dark:border-base-content/6 rounded-xl flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                    <Coins size={10} className="text-warning shrink-0" /> Redeemed
                  </span>
                  <div className="font-extrabold text-sm font-mono text-amber-600 dark:text-amber-400">
                    {hideNumbers ? "-•••••" : `-${(summary.totalUnitsWithdrawn || 0).toFixed(3)}`}
                  </div>
                </div>
                <div className="text-right text-[9.5px] font-mono text-base-content/65 space-y-0.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[8.5px] uppercase font-bold text-base-content/40">Units Left:</span>
                    <span className="font-semibold text-base-content font-mono">{summary.activeUnits.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Stacked Date Range on Left + Action Icons on Right */}
        <div className="px-3 py-2 border-t border-base-content/8 dark:border-base-content/8 bg-base-200/30 flex items-center justify-between gap-2">
          {/* Left: Stacked From Date & To Date aligned in a single margin */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 text-[10px] font-mono leading-tight shrink-0">
            <span className="text-[8.5px] uppercase font-bold text-base-content/40 tracking-wider">From:</span>
            <span className="font-semibold text-base-content/80">
              {activeFace === 0 ? (summary.fromDateStr || "—") : (summary.withdrawalFromDateStr || "—")}
            </span>
            <span className="text-[8.5px] uppercase font-bold text-base-content/40 tracking-wider">To:</span>
            <span className="font-semibold text-base-content/80">
              {activeFace === 0 ? (summary.toDateStr || "—") : (summary.withdrawalToDateStr || "—")}
            </span>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onOpenInfo && onOpenInfo(fund)}
              className="p-1.5 text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors cursor-pointer"
              title="Fund Detailed Insights"
            >
              <Info size={14} />
            </button>
            {activeFace === 0 ? (
              <button
                type="button"
                onClick={() => onOpenAddSip && onOpenAddSip(fund, "deposit")}
                className="p-1.5 text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors cursor-pointer"
                title="Add SIP / Lumpsum Deposit"
              >
                <Plus size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onOpenAddWithdrawal
                    ? onOpenAddWithdrawal(fund)
                    : onOpenAddSip && onOpenAddSip(fund, "withdrawal")
                }
                className="p-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors cursor-pointer"
                title="Add Withdrawal"
              >
                <Minus size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onOpenTable && onOpenTable(fund, activeFace === 1 ? "withdrawal" : "deposit")
              }
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title="Open Table View"
            >
              <Table size={14} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-info bg-info/10 hover:bg-info/20 rounded-xl transition-colors cursor-pointer"
              title="Edit Fund"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-error bg-error/10 hover:bg-error/20 rounded-xl transition-colors cursor-pointer"
              title="Delete Fund"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
