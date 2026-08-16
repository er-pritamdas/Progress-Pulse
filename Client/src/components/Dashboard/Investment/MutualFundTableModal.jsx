import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  Sparkles,
  Calendar,
  Coins,
  Percent,
  TrendingUp,
  PiggyBank,
  Hash,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronsUp,
  ChevronsDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { formatDateDDMMMYYYY } from "../DatePicker";

export default function MutualFundTableModal({
  fund,
  summary,
  isOpen,
  onClose,
  onOpenAddSip,
  onOpenEditSip,
  onDeleteSipTxn,
  getFundTransactionsByYear,
  sipSortBy,
  sipSortOrder,
  handleSipSort,
  collapsedMfYearKeys,
  toggleMfYearCollapse,
  toggleAllMfYearsCollapse,
  inlineAddingMfId,
  setInlineAddingMfId,
  inlineTxnData,
  setInlineTxnData,
  saveInlineSipTxn,
  editingTxnKey,
  setEditingTxnKey,
  editTxnData,
  setEditTxnData,
  saveEditSipTxn,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fund) return null;

  const yearGroups = getFundTransactionsByYear(
    fund.transactions || [],
    sipSortBy,
    sipSortOrder
  );
  const isInlineAdding = inlineAddingMfId === fund.id;

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[999999] bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 w-full max-w-6xl h-[92vh] max-h-[920px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-secondary/15 text-secondary font-black text-base flex items-center justify-center shrink-0 border border-secondary/20 shadow-xs">
              {(fund.amc || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-lg text-base-content tracking-tight">
                {fund.amc}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-base-content/60 mt-0.5 flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-medium">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 text-[10.5px] shrink-0">
                  {fund.category} → {(fund.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim()}
                </span>
                <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                <span className="text-[11px] shrink-0">{fund.plan}</span>
                <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                <span className="text-[11px] shrink-0">{fund.optionType}</span>
                {fund.folioNumber && (
                  <>
                    <span className="text-base-content/30 text-[9px] shrink-0">•</span>
                    <span className="text-[11px] font-mono font-medium text-base-content/70 shrink-0">
                      #{fund.folioNumber.replace(/^#/, "")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary Badges + ESC Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-end sm:self-auto">
            <div className="hidden md:flex items-center gap-3 bg-base-100 px-3.5 py-1.5 rounded-2xl border border-base-300 shadow-2xs text-xs font-mono">
              <span>
                Invested:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">
                  ₹{summary.totalInvested.toLocaleString("en-IN")}
                </strong>
              </span>
              <span className="text-base-content/30">•</span>
              <span>
                Units: <strong className="font-bold">{summary.totalUnits.toFixed(3)}</strong>
              </span>
              <span className="text-base-content/30">•</span>
              <span>
                Terms: <strong className="font-bold">{summary.totalTerms}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-xs sm:btn-sm btn-ghost gap-1 px-1.5 rounded-xl text-base-content/70 hover:text-base-content hover:bg-base-200/80 transition-all font-mono select-none"
              title="Close (Press Esc)"
            >
              <kbd className="kbd kbd-sm font-mono font-black text-[11px] bg-base-100 border border-base-300 shadow-2xs px-2 py-0.5 rounded-lg cursor-pointer">
                ESC
              </kbd>
            </button>
          </div>
        </div>

        {/* Toolbar: Year Group Collapse / Expand + Add SIP + Sort Indicators */}
        <div className="px-4 sm:px-5 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base-content/70 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-secondary" />
              <span>{summary.totalTerms} Total Transactions</span>
            </span>
            <span className="badge badge-xs bg-secondary/15 text-secondary font-bold">
              {summary.sipCount} SIPs
            </span>
            <span className="badge badge-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
              {summary.lsCount} LS
            </span>
            {sipSortBy && (
              <span className="text-[10.5px] text-base-content/50 font-normal hidden sm:inline">
                (Sorted by {sipSortBy} {sipSortOrder.toUpperCase()})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {yearGroups.length > 0 && (() => {
              const allYearKeys = yearGroups.map((yg) => `${fund.id}-${yg.year}`);
              const areAllCollapsed = allYearKeys.every((key) =>
                collapsedMfYearKeys.has(key)
              );

              return (
                <button
                  type="button"
                  onClick={() => toggleAllMfYearsCollapse(fund.id, yearGroups)}
                  className="btn btn-ghost btn-xs rounded-xl gap-1.5 font-bold text-xs h-7 min-h-0 text-base-content/80 hover:text-base-content hover:bg-base-200 border border-base-300 shadow-2xs"
                  title={areAllCollapsed ? "Expand All Year Groups" : "Collapse All Year Groups"}
                >
                  {areAllCollapsed ? (
                    <>
                      <ChevronsDown size={13} className="text-secondary" />
                      <span>Expand All Years</span>
                    </>
                  ) : (
                    <>
                      <ChevronsUp size={13} className="text-secondary" />
                      <span>Collapse All Years</span>
                    </>
                  )}
                </button>
              );
            })()}

            <button
              type="button"
              onClick={() => onOpenAddSip(fund)}
              className="btn btn-secondary btn-xs rounded-xl gap-1.5 font-bold text-xs h-7 min-h-0 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={13} />
              <span>Add Installment (SIP / LS)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table View Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-thin p-3 sm:p-4 bg-base-200/20">
          {/* Empty State when 0 transactions */}
          {summary.totalTerms === 0 && (
            <div className="py-16 text-center bg-base-100 rounded-2xl border border-base-200/80 shadow-sm my-6 max-w-md mx-auto">
              <div className="p-3.5 bg-secondary/10 text-secondary rounded-2xl w-fit mx-auto mb-3">
                <Layers size={28} />
              </div>
              <h4 className="text-base font-bold text-base-content mb-1">No Transactions Logged Yet</h4>
              <p className="text-xs text-base-content/60 mb-4">
                Start tracking your SIP or Lumpsum investments for this mutual fund.
              </p>
              <button
                type="button"
                onClick={() => onOpenAddSip(fund)}
                className="btn btn-secondary btn-sm rounded-xl gap-2 font-bold"
              >
                <Plus size={14} />
                <span>Add First Installment</span>
              </button>
            </div>
          )}

          {summary.totalTerms > 0 && (
            <div className="bg-base-100 border border-base-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="w-full overflow-x-auto">
                <table className="table table-xs w-full text-xs table-auto">
                  <thead className="z-20">
                    <tr className="border-b border-base-200/80 text-[10px] font-bold text-base-content/70 uppercase tracking-wider select-none bg-base-200/90 backdrop-blur-md">
                      {/* Term Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-2 text-left font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("term")}
                          className="flex items-center gap-1 hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Term"
                        >
                          <Hash size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">Term</span>
                          {sipSortBy === "term" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Type Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-1.5 text-center font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("type")}
                          className="flex items-center justify-center gap-1 mx-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Type"
                        >
                          <Sparkles size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">Type</span>
                          {sipSortBy === "type" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Date Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-2 text-center font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("date")}
                          className="flex items-center justify-center gap-1 mx-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Date"
                        >
                          <Calendar size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">Date</span>
                          {sipSortBy === "date" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Deposit ₹ Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-2 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("amtDeposit")}
                          className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Deposit Amount"
                        >
                          <Coins size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">Deposit ₹</span>
                          {sipSortBy === "amtDeposit" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* ER ₹ Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-1.5 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("er")}
                          className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Expense Ratio / Charges"
                        >
                          <Percent size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">ER ₹</span>
                          {sipSortBy === "er" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* NAV ₹ Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-2 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("nav")}
                          className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by NAV"
                        >
                          <TrendingUp size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">NAV ₹</span>
                          {sipSortBy === "nav" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Units Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-2 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("units")}
                          className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Units"
                        >
                          <Layers size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">Units</span>
                          {sipSortBy === "units" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Actual Amt ₹ Sort Button */}
                      <th className="sticky top-0 z-20 py-2.5 px-2 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        <button
                          type="button"
                          onClick={() => handleSipSort("actualAmt")}
                          className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                          title="Sort by Actual Amt"
                        >
                          <PiggyBank size={11} className="text-secondary/70 shrink-0" />
                          <span className="truncate">Actual Amt ₹</span>
                          {sipSortBy === "actualAmt" ? (
                            sipSortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-secondary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-secondary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Actions Header */}
                      <th className="sticky top-0 z-20 py-2.5 px-1 text-center font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                        Act
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearGroups.map((yg, yIdx) => {
                      const yearKey = `${fund.id}-${yg.year}`;
                      const isYearCollapsed = collapsedMfYearKeys.has(yearKey);

                      return (
                        <React.Fragment key={yg.year}>
                          {/* Collapsible Year Group Header Row */}
                          <tr
                            className="cursor-pointer select-none font-bold transition-colors bg-base-200/60 hover:bg-base-200"
                            onClick={() => toggleMfYearCollapse(fund.id, yg.year)}
                          >
                            {/* Col 1: Term / Year Title & Count */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-left bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                  className={`transition-transform duration-200 shrink-0 ${
                                    !isYearCollapsed ? "rotate-0" : "-rotate-90"
                                  }`}
                                >
                                  <ChevronDown size={13} className="text-base-content/60" />
                                </div>
                                <span className="font-bold text-xs text-base-content flex items-center gap-1 shrink-0">
                                  <Calendar size={11} className="text-primary shrink-0" />
                                  <span>{yg.year}</span>
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold border border-secondary/20 shrink-0">
                                  {yg.txns.length} txns
                                </span>
                              </div>
                            </td>

                            {/* Col 2: Type */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-1.5 text-center bg-base-200/95 backdrop-blur-md text-base-content/30 border-b border-base-200/80">
                              —
                            </td>

                            {/* Col 3: Date */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-center bg-base-200/95 backdrop-blur-md text-base-content/30 border-b border-base-200/80">
                              —
                            </td>

                            {/* Col 4: Deposit ₹ Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-bold text-base-content text-xs truncate border-b border-base-200/80">
                              ₹{yg.totalDeposit.toLocaleString("en-IN")}
                            </td>

                            {/* Col 5: ER ₹ Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-1.5 text-right bg-base-200/95 backdrop-blur-md font-bold text-error/80 text-xs truncate border-b border-base-200/80">
                              ₹{yg.totalEr.toLocaleString("en-IN")}
                            </td>

                            {/* Col 6: NAV ₹ Avg */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-semibold text-base-content/70 text-xs truncate border-b border-base-200/80">
                              {yg.avgNav > 0 ? `₹${yg.avgNav.toFixed(2)}` : "—"}
                            </td>

                            {/* Col 7: Units Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-mono font-bold text-base-content/90 text-xs truncate border-b border-base-200/80">
                              {yg.totalUnits.toFixed(3)}
                            </td>

                            {/* Col 8: Actual Amt ₹ Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-extrabold text-emerald-600 dark:text-emerald-400 text-xs truncate border-b border-base-200/80">
                              +₹{yg.totalActual.toLocaleString("en-IN")}
                            </td>

                            {/* Col 9: Actions */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-1 bg-base-200/95 backdrop-blur-md border-b border-base-200/80"></td>
                          </tr>

                          {/* Inline Add Row (rendered inside top year block) */}
                          {isInlineAdding && yIdx === 0 && (() => {
                            const inlineAmtDep = parseFloat(inlineTxnData.amtDeposit) || 0;
                            const inlineEr = parseFloat(inlineTxnData.er) || 0;
                            const inlineActualAmt = Math.max(0, inlineAmtDep - inlineEr);
                            const inlineNav = parseFloat(inlineTxnData.nav) || 0;
                            const inlineUnits = inlineNav > 0 ? (inlineActualAmt / inlineNav).toFixed(3) : "-";

                            return (
                              <tr className="bg-secondary/10 border-b border-secondary/20">
                                <td className="py-1 px-1">
                                  <input
                                    type="text"
                                    value={inlineTxnData.term}
                                    onChange={(e) =>
                                      setInlineTxnData({ ...inlineTxnData, term: e.target.value })
                                    }
                                    className="h-6 text-xs font-medium px-1.5 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                    placeholder="Term #"
                                  />
                                </td>
                                <td className="py-1 px-1 text-center">
                                  <select
                                    value={inlineTxnData.type}
                                    onChange={(e) =>
                                      setInlineTxnData({ ...inlineTxnData, type: e.target.value })
                                    }
                                    className="h-6 text-xs font-semibold px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                  >
                                    <option value="SIP">SIP</option>
                                    <option value="Lumpsum">LS</option>
                                  </select>
                                </td>
                                <td className="py-1 px-1 text-center">
                                  <input
                                    type="date"
                                    value={inlineTxnData.date}
                                    onChange={(e) =>
                                      setInlineTxnData({ ...inlineTxnData, date: e.target.value })
                                    }
                                    className="h-6 text-xs font-mono px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="100"
                                    value={inlineTxnData.amtDeposit}
                                    onChange={(e) => {
                                      const newAmt = e.target.value;
                                      const dep = parseFloat(newAmt) || 0;
                                      const erVal = parseFloat(inlineTxnData.er) || 0;
                                      const actual = Math.max(0, dep - erVal);
                                      const nVal = parseFloat(inlineTxnData.nav) || 0;
                                      const newU = nVal > 0 ? (actual / nVal).toFixed(3) : inlineTxnData.units;
                                      setInlineTxnData({ ...inlineTxnData, amtDeposit: newAmt, units: newU });
                                    }}
                                    className="h-6 text-xs font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 font-mono"
                                    placeholder="0"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveInlineSipTxn();
                                      if (e.key === "Escape") setInlineAddingMfId(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="1"
                                    value={inlineTxnData.er}
                                    onChange={(e) => {
                                      const newEr = e.target.value;
                                      const dep = parseFloat(inlineTxnData.amtDeposit) || 0;
                                      const erVal = parseFloat(newEr) || 0;
                                      const actual = Math.max(0, dep - erVal);
                                      const nVal = parseFloat(inlineTxnData.nav) || 0;
                                      const newU = nVal > 0 ? (actual / nVal).toFixed(3) : inlineTxnData.units;
                                      setInlineTxnData({ ...inlineTxnData, er: newEr, units: newU });
                                    }}
                                    className="h-6 text-xs font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 font-mono"
                                    placeholder="0"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveInlineSipTxn();
                                      if (e.key === "Escape") setInlineAddingMfId(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="0.0001"
                                    value={inlineTxnData.nav}
                                    onChange={(e) => {
                                      const newNav = e.target.value;
                                      const dep = parseFloat(inlineTxnData.amtDeposit) || 0;
                                      const erVal = parseFloat(inlineTxnData.er) || 0;
                                      const actual = Math.max(0, dep - erVal);
                                      const nVal = parseFloat(newNav) || 0;
                                      const newU = nVal > 0 ? (actual / nVal).toFixed(3) : inlineTxnData.units;
                                      setInlineTxnData({ ...inlineTxnData, nav: newNav, units: newU });
                                    }}
                                    className="h-6 text-xs font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 font-mono"
                                    placeholder="0.00"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveInlineSipTxn();
                                      if (e.key === "Escape") setInlineAddingMfId(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={inlineTxnData.units !== undefined ? inlineTxnData.units : (inlineNav > 0 ? (inlineActualAmt / inlineNav).toFixed(3) : "")}
                                    onChange={(e) =>
                                      setInlineTxnData({ ...inlineTxnData, units: e.target.value })
                                    }
                                    className="h-6 text-xs font-mono font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-secondary"
                                    placeholder={inlineNav > 0 ? (inlineActualAmt / inlineNav).toFixed(3) : "0.000"}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveInlineSipTxn();
                                      if (e.key === "Escape") setInlineAddingMfId(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right font-medium text-xs text-emerald-600 dark:text-emerald-400 truncate">
                                  +₹{inlineActualAmt.toLocaleString("en-IN")}
                                </td>
                                <td className="py-1 px-1 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={saveInlineSipTxn}
                                      className="p-1 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
                                      title="Save"
                                    >
                                      <Check size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineAddingMfId(null)}
                                      className="p-1 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* Transaction Rows for this year (rendered if NOT collapsed) */}
                          {!isYearCollapsed &&
                            yg.txns.map((txn, tIdx) => {
                              const isEditing =
                                editingTxnKey?.fundId === fund.id &&
                                editingTxnKey?.txnId === txn.id;

                              if (isEditing) {
                                const editAmtDep = parseFloat(editTxnData.amtDeposit) || 0;
                                const editEr = parseFloat(editTxnData.er) || 0;
                                const editActualAmt = Math.max(0, editAmtDep - editEr);
                                const editNav = parseFloat(editTxnData.nav) || 0;
                                const editUnits =
                                  editNav > 0 ? (editActualAmt / editNav).toFixed(3) : "-";

                                return (
                                  <tr key={txn.id} className="bg-info/5 border-b border-info/15">
                                    <td className="py-1 px-1">
                                      <input
                                        type="text"
                                        value={editTxnData.term}
                                        onChange={(e) =>
                                          setEditTxnData({ ...editTxnData, term: e.target.value })
                                        }
                                        className="h-6 text-xs font-medium px-1.5 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                      />
                                    </td>
                                    <td className="py-1 px-1 text-center">
                                      <select
                                        value={editTxnData.type || "SIP"}
                                        onChange={(e) =>
                                          setEditTxnData({ ...editTxnData, type: e.target.value })
                                        }
                                        className="h-6 text-xs font-semibold px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                      >
                                        <option value="SIP">SIP</option>
                                        <option value="Lumpsum">LS</option>
                                      </select>
                                    </td>
                                    <td className="py-1 px-1 text-center">
                                      <input
                                        type="date"
                                        value={editTxnData.date}
                                        onChange={(e) =>
                                          setEditTxnData({ ...editTxnData, date: e.target.value })
                                        }
                                        className="h-6 text-xs font-mono px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                      />
                                    </td>
                                    <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="100"
                                    value={editTxnData.amtDeposit}
                                    onChange={(e) => {
                                      const newAmt = e.target.value;
                                      const dep = parseFloat(newAmt) || 0;
                                      const erVal = parseFloat(editTxnData.er) || 0;
                                      const actual = Math.max(0, dep - erVal);
                                      const nVal = parseFloat(editTxnData.nav) || 0;
                                      const newU = nVal > 0 ? (actual / nVal).toFixed(3) : editTxnData.units;
                                      setEditTxnData({ ...editTxnData, amtDeposit: newAmt, units: newU });
                                    }}
                                    className="h-6 text-xs font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 font-mono"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEditSipTxn();
                                      if (e.key === "Escape") setEditingTxnKey(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="1"
                                    value={editTxnData.er}
                                    onChange={(e) => {
                                      const newEr = e.target.value;
                                      const dep = parseFloat(editTxnData.amtDeposit) || 0;
                                      const erVal = parseFloat(newEr) || 0;
                                      const actual = Math.max(0, dep - erVal);
                                      const nVal = parseFloat(editTxnData.nav) || 0;
                                      const newU = nVal > 0 ? (actual / nVal).toFixed(3) : editTxnData.units;
                                      setEditTxnData({ ...editTxnData, er: newEr, units: newU });
                                    }}
                                    className="h-6 text-xs font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 font-mono"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEditSipTxn();
                                      if (e.key === "Escape") setEditingTxnKey(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="0.0001"
                                    value={editTxnData.nav}
                                    onChange={(e) => {
                                      const newNav = e.target.value;
                                      const dep = parseFloat(editTxnData.amtDeposit) || 0;
                                      const erVal = parseFloat(editTxnData.er) || 0;
                                      const actual = Math.max(0, dep - erVal);
                                      const nVal = parseFloat(newNav) || 0;
                                      const newU = nVal > 0 ? (actual / nVal).toFixed(3) : editTxnData.units;
                                      setEditTxnData({ ...editTxnData, nav: newNav, units: newU });
                                    }}
                                    className="h-6 text-xs font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 font-mono"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEditSipTxn();
                                      if (e.key === "Escape") setEditingTxnKey(null);
                                    }}
                                  />
                                </td>
                                <td className="py-1 px-1 text-right">
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={editTxnData.units !== undefined ? editTxnData.units : (editNav > 0 ? (editActualAmt / editNav).toFixed(3) : "")}
                                    onChange={(e) =>
                                      setEditTxnData({ ...editTxnData, units: e.target.value })
                                    }
                                    className="h-6 text-xs font-mono font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 text-info"
                                    placeholder={editNav > 0 ? (editActualAmt / editNav).toFixed(3) : "0.000"}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEditSipTxn();
                                      if (e.key === "Escape") setEditingTxnKey(null);
                                    }}
                                  />
                                </td>
                                    <td className="py-1 px-1 text-right font-medium text-xs text-emerald-600 dark:text-emerald-400 truncate">
                                      +₹{editActualAmt.toLocaleString("en-IN")}
                                    </td>
                                    <td className="py-1 px-1 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={saveEditSipTxn}
                                          className="p-1 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
                                          title="Save"
                                        >
                                          <Check size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingTxnKey(null)}
                                          className="p-1 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                                          title="Cancel"
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              const amtDep = Number(txn.amtDeposit ?? txn.amount ?? 0);
                              const er = Number(txn.er ?? 0);
                              const actualAmt =
                                txn.actualAmt !== undefined && txn.actualAmt !== null
                                  ? Number(txn.actualAmt)
                                  : Math.max(0, amtDep - er);
                              const nav = Number(txn.nav ?? 0);
                              const units =
                                parseFloat(txn.units) || (nav > 0 ? actualAmt / nav : 0);
                              const unitsDisplay = units > 0 ? units.toFixed(3) : "-";

                              return (
                                <tr
                                  key={txn.id}
                                  className="hover:bg-base-200/50 border-b border-base-200/60 transition-colors"
                                >
                                  <td className="py-2 px-2 text-left font-bold text-xs text-base-content/80">
                                    {txn.term || `#${tIdx + 1}`}
                                  </td>
                                  <td className="py-2 px-1.5 text-center">
                                    <span
                                      className={`px-1.5 py-0.5 text-[9.5px] font-bold rounded-md uppercase tracking-wider ${
                                        txn.type === "Lumpsum" || txn.type === "LUMPSUM"
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                          : "bg-secondary/10 text-secondary border border-secondary/20"
                                      }`}
                                    >
                                      {txn.type === "Lumpsum" || txn.type === "LUMPSUM"
                                        ? "LS"
                                        : txn.type || "SIP"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-center font-mono text-xs text-base-content/70 truncate">
                                    {formatDateDDMMMYYYY(txn.date)}
                                  </td>
                                  <td className="py-2 px-2 text-right font-medium text-xs text-base-content truncate">
                                    ₹{amtDep.toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-2 px-1.5 text-right font-medium text-xs text-error/80 truncate">
                                    ₹{er.toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-2 px-2 text-right font-medium text-xs text-base-content/70 truncate">
                                    {nav > 0 ? `₹${nav}` : "-"}
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono font-medium text-xs text-base-content/80 truncate">
                                    {unitsDisplay}
                                  </td>
                                  <td className="py-2 px-2 text-right font-bold text-xs text-emerald-600 dark:text-emerald-400 truncate">
                                    +₹{actualAmt.toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-2 px-1 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => onOpenEditSip(fund, txn)}
                                        className="p-1 text-info bg-info/10 hover:bg-info/20 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Installment"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSipTxn(fund.id, txn.id)}
                                        className="p-1 text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Installment"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Summary Bar & Close Button */}
        <div className="p-3 sm:p-4 border-t border-base-200 bg-base-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full sm:w-auto font-mono text-[11px]">
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Terms
              </span>
              <span className="font-extrabold">
                {summary.totalTerms} ({summary.sipCount}S/{summary.lsCount}L)
              </span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Duration
              </span>
              <span className="font-extrabold truncate">{summary.durationText}</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Deposited
              </span>
              <span className="font-extrabold">₹{summary.totalDeposited.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Total ER
              </span>
              <span className="font-extrabold text-error">
                ₹{summary.totalEr.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Avg NAV
              </span>
              <span className="font-extrabold">
                {summary.avgNav > 0 ? `₹${summary.avgNav.toFixed(2)}` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Total Units
              </span>
              <span className="font-extrabold">{summary.totalUnits.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase text-base-content/50 block font-sans font-bold">
                Net Invested
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{summary.totalInvested.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost border border-base-300 rounded-xl px-4 font-bold text-xs shrink-0"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
