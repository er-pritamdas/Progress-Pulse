import React from "react";
import {
  Layers,
  Clock,
  TrendingUp,
  Coins,
  Calendar,
  Table,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

export default function MutualFundCard({
  index,
  fund,
  summary,
  onOpenTable,
  onOpenAddSip,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-base-100 rounded-3xl border border-base-300/35 hover:border-secondary/30 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 group/card">
      {/* Card Header: AMC Name, # Number, Folio, Category, Plan, Option & Actions */}
      <div className="p-4 sm:p-5 border-b border-base-300/30 bg-base-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          {/* AMC Name with small light opacity # Number */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {index !== undefined && index !== null && (
              <span className="text-[11px] font-mono font-bold text-base-content/40 bg-base-200/60 px-2 py-0.5 rounded-lg border border-base-300/35 shrink-0 select-none">
                #{index}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-base text-base-content tracking-tight truncate group-hover/card:text-secondary transition-colors">
                {fund.amc}
              </h3>
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

          {/* Action Buttons: Add Installment, Table View, Edit & Delete */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover/card:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onOpenAddSip}
              className="p-1.5 text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors cursor-pointer"
              title="Add Installment (SIP / Lumpsum)"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              onClick={onOpenTable}
              className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors cursor-pointer"
              title="Open Transactions Table View"
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

        {/* Hero Stat: Total Invested & Gross Deposited / ER Ribbon */}
        <div className="mt-1 p-3.5 bg-base-200/40 rounded-2xl border border-base-300/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-base-content/50 block">
              Total Actually Invested
            </span>
            <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{summary.totalInvested.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-semibold text-base-content/70">
            <div>
              <span className="text-[9.5px] uppercase text-base-content/40 block font-sans">Gross Deposited</span>
              <span className="text-base-content font-bold">₹{summary.totalDeposited.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-6 w-px bg-base-300/60" />
            <div>
              <span className="text-[9.5px] uppercase text-base-content/40 block font-sans">Total ER</span>
              <span className="text-error font-bold">₹{summary.totalEr.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body: Structured 2x3 Grid of Metrics */}
      <div className="p-4 sm:p-5 flex-1 space-y-3 bg-base-100/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* 1. Total Terms & Frequency Breakdown */}
          <div className="p-3 bg-base-200/40 rounded-2xl border border-base-300/35 space-y-1">
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
              <Layers size={11} className="text-secondary" /> Total Terms
            </span>
            <div className="font-extrabold text-sm text-base-content font-mono">
              {summary.totalTerms} <span className="text-xs font-sans font-medium text-base-content/60">Terms</span>
            </div>
            <div className="flex items-center gap-1 pt-0.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold">
                {summary.sipCount} SIPs
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                {summary.lsCount} LS
              </span>
            </div>
          </div>

          {/* 2. Duration */}
          <div className="p-3 bg-base-200/40 rounded-2xl border border-base-300/35 space-y-1">
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
          <div className="p-3 bg-base-200/40 rounded-2xl border border-base-300/35 space-y-1">
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
              <TrendingUp size={11} className="text-info" /> Avg NAV
            </span>
            <div className="font-extrabold text-sm text-base-content font-mono">
              ₹{summary.avgNav > 0 ? summary.avgNav.toFixed(2) : "—"}
            </div>
            <div className="text-[10px] text-base-content/50 font-medium">
              Cost per Unit
            </div>
          </div>

          {/* 4. Total Units */}
          <div className="p-3 bg-base-200/40 rounded-2xl border border-base-300/35 space-y-1">
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block flex items-center gap-1">
              <Coins size={11} className="text-warning" /> Total Units
            </span>
            <div className="font-extrabold text-sm text-base-content font-mono truncate">
              {summary.totalUnits.toFixed(3)}
            </div>
            <div className="text-[10px] text-base-content/50 font-medium">
              Accumulated
            </div>
          </div>

          {/* 5. Date Range (From -> To) */}
          <div className="col-span-2 p-3 bg-base-200/40 rounded-2xl border border-base-300/35 space-y-1">
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

    </div>
  );
}
