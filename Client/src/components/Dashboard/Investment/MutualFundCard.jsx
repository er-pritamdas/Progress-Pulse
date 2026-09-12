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
    <div className="bg-base-100 rounded-3xl border border-base-300 dark:border-base-content/20 hover:border-secondary/50 shadow-xs hover:shadow-lg flex flex-col justify-between overflow-hidden transition-all duration-300 group/card">
      {/* Card Header: AMC Name, # Number, Folio, Category, Plan, Option & Actions */}
      <div className="p-4 sm:p-5 border-b border-base-300 dark:border-base-content/15 bg-base-100 flex flex-col gap-2.5">
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
            <div className="p-3 bg-base-200/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
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
                  <div className="h-5 w-px bg-base-300/60" />
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Coins size={11} className="text-warning" /> Units Left:{" "}
                  <strong className="font-mono text-base-content font-black">
                    {hideNumbers ? "•••••" : summary.activeUnits.toFixed(3)}
                  </strong>
                </span>
                <div className="flex items-center justify-between text-[9.5px] font-mono pt-0.5 border-t border-base-300/40 text-base-content/70">
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
              <div className="col-span-2 p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
            <div className="p-3 bg-base-200/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
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
                  <div className="h-5 w-px bg-base-300/60" />
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
              <div className="p-2.5 bg-base-200/40 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
                  <Coins size={11} className="text-warning" /> Units Redeemed:{" "}
                  <strong className="font-mono text-base-content font-black">
                    {hideNumbers
                      ? "-•••••"
                      : `-${(summary.totalUnitsWithdrawn || 0).toFixed(3)}`}
                  </strong>
                </span>
                <div className="flex items-center justify-between text-[9.5px] font-mono pt-0.5 border-t border-base-300/40 text-base-content/70">
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
              <div className="col-span-2 p-2.5 bg-base-200/40 rounded-2xl space-y-1">
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
  );
}
