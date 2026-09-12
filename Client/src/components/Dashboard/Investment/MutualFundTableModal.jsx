import React, { useState, useEffect } from "react";
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
  Minus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { formatDateDDMMMYYYY } from "../DatePicker";
import CompanyLogo from "./CompanyLogo";

export default function MutualFundTableModal({
  fund,
  summary,
  isOpen,
  defaultViewMode = "deposit", // "deposit" | "withdrawal" | "all"
  onClose,
  onOpenAddSip,
  onOpenAddWithdrawal,
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
  const [tableTab, setTableTab] = useState(defaultViewMode || "deposit");

  // Sync tab with defaultViewMode prop whenever modal opens
  useEffect(() => {
    if (defaultViewMode) {
      setTableTab(defaultViewMode);
    }
  }, [defaultViewMode, isOpen]);

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

  const isWithdrawalTxn = (t) => {
    const typeLower = (t?.type || "").toLowerCase();
    return (
      typeLower.includes("withdr") ||
      typeLower.includes("redemp") ||
      typeLower.includes("swp")
    );
  };

  const isWithdrawalView = tableTab === "withdrawal";

  // Filter transactions based on active table tab
  const allTxns = fund.transactions || [];
  const filteredTxns = isWithdrawalView
    ? allTxns.filter(isWithdrawalTxn)
    : tableTab === "deposit"
    ? allTxns.filter((t) => !isWithdrawalTxn(t))
    : allTxns;

  // Calculate available units for withdrawal validation
  const totalDepositUnits = allTxns.reduce((sum, t) => {
    if (isWithdrawalTxn(t)) return sum;
    const act =
      t.actualAmt !== undefined && t.actualAmt !== null
        ? Number(t.actualAmt)
        : Math.max(0, (t.amtDeposit ?? t.amount ?? 0) - (t.er ?? 0));
    const navVal = Number(t.nav ?? 0);
    const u = parseFloat(t.units) || (navVal > 0 ? act / navVal : 0);
    return sum + u;
  }, 0);

  const alreadyRedeemedUnits = allTxns.reduce((sum, t) => {
    if (!isWithdrawalTxn(t)) return sum;
    if (editingTxnKey && t.id === editingTxnKey.txnId) return sum;
    const act =
      t.actualAmt !== undefined && t.actualAmt !== null
        ? Number(t.actualAmt)
        : Math.max(0, (t.amtDeposit ?? t.amount ?? 0) - (t.er ?? 0));
    const navVal = Number(t.nav ?? 0);
    const u = parseFloat(t.units) || (navVal > 0 ? act / navVal : 0);
    return sum + u;
  }, 0);

  const availableUnits = Math.max(
    0,
    parseFloat((totalDepositUnits - alreadyRedeemedUnits).toFixed(4))
  );

  const yearGroups = getFundTransactionsByYear(
    filteredTxns,
    sipSortBy,
    sipSortOrder
  );

  const modalContent = (
    <div
      className="fixed inset-0 w-screen h-screen z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 md:p-5 animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[1620px] h-[94vh] max-h-[940px] flex flex-col gap-3 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Header Bar */}
        <div className="bg-base-100/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-base-300/60 shadow-xl px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo name={fund.amc} size="w-10 h-10" rounded="rounded-2xl" type="mf" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-base-content tracking-tight truncate">
                  {fund.amc}
                </h3>
                {fund.folioNumber && (
                  <span className="text-[11px] font-mono font-bold text-base-content/60 bg-base-200 px-2 py-0.5 rounded-lg shrink-0">
                    #{fund.folioNumber.replace(/^#/, "")}
                  </span>
                )}
                {summary.isFullyRedeemed ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-base-300/80 text-base-content/80 border border-base-content/10 shrink-0">
                    Sold
                  </span>
                ) : (summary.totalUnitsWithdrawn || 0) > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 shrink-0">
                    Selling
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-base-content/60 font-medium truncate">
                {fund.category} → {(fund.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim()} • {fund.plan} • {fund.optionType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-[11px] text-base-content/50 font-medium hidden md:block mr-2">
              Press <kbd className="kbd kbd-xs font-mono font-bold">ESC</kbd> to close
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Layout: Left Table + Right 2 Summary Popups */}
        <div className="flex flex-col lg:flex-row gap-3.5 flex-1 min-h-0 overflow-hidden">
          {/* Left Table Panel Card */}
          <div className="flex-1 bg-base-100/95 backdrop-blur-md rounded-3xl border border-base-300/60 shadow-xl flex flex-col overflow-hidden h-full min-w-0">

        {/* Toolbar: Tab Switcher (Deposits vs Withdrawals) + Year Group Collapse + Add Action */}
        <div className="px-4 sm:px-5 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* View Switcher Toggle */}
            <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60">
              <button
                type="button"
                onClick={() => setTableTab("deposit")}
                className={`btn btn-xs rounded-lg px-3 font-bold transition-all cursor-pointer ${
                  tableTab === "deposit"
                    ? "bg-secondary text-white shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                }`}
              >
                Deposits ({summary.totalTerms})
              </button>
              <button
                type="button"
                onClick={() => setTableTab("withdrawal")}
                className={`btn btn-xs rounded-lg px-3 font-bold transition-all cursor-pointer ${
                  tableTab === "withdrawal"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                }`}
              >
                Withdrawals ({summary.totalWithdrawalTerms || 0})
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-base-content/60 font-medium">
              {isWithdrawalView ? (
                <>
                  <span className="badge badge-xs bg-primary/15 text-primary font-bold">
                    {summary.swpCount || 0} SWP
                  </span>
                  <span className="badge badge-xs bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold">
                    {summary.lsWithdrawalCount || 0} LS
                  </span>
                </>
              ) : (
                <>
                  <span className="badge badge-xs bg-secondary/15 text-secondary font-bold">
                    {summary.sipCount} SIPs
                  </span>
                  <span className="badge badge-xs bg-primary/15 text-primary font-bold">
                    {summary.lsCount} LS
                  </span>
                </>
              )}
            </div>
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
                  className="btn btn-ghost btn-xs rounded-xl gap-1.5 font-bold text-xs h-7 min-h-0 text-base-content/80 hover:text-base-content hover:bg-base-200 border border-base-300 shadow-2xs cursor-pointer"
                  title={
                    areAllCollapsed
                      ? "Expand All Year Groups"
                      : "Collapse All Year Groups"
                  }
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

            {isWithdrawalView ? (
              <button
                type="button"
                onClick={() =>
                  onOpenAddWithdrawal
                    ? onOpenAddWithdrawal(fund)
                    : onOpenAddSip(fund, "withdrawal")
                }
                className="btn btn-primary btn-xs rounded-xl gap-1.5 font-bold text-xs h-7 min-h-0 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 transition-all text-primary-content"
              >
                <Minus size={13} />
                <span>Add Withdrawal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAddSip(fund, "deposit")}
                className="btn btn-secondary btn-xs rounded-xl gap-1.5 font-bold text-xs h-7 min-h-0 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={13} />
                <span>Add Installment (SIP / LS)</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Table View Container */}
        <div className="flex-1 overflow-auto [scrollbar-width:thin] bg-base-100 min-h-0">
          {/* Empty State when 0 transactions */}
          {filteredTxns.length === 0 ? (
            <div className="py-16 text-center bg-base-100 rounded-2xl border border-base-200/80 shadow-sm my-6 max-w-md mx-auto">
              <div
                className={`p-3.5 rounded-2xl w-fit mx-auto mb-3 ${
                  isWithdrawalView
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/10 text-secondary"
                }`}
              >
                {isWithdrawalView ? <Minus size={28} /> : <Layers size={28} />}
              </div>
              <h4 className="text-base font-bold text-base-content mb-1">
                {isWithdrawalView
                  ? "No Withdrawals Logged Yet"
                  : "No Deposit Transactions Logged Yet"}
              </h4>
              <p className="text-xs text-base-content/60 mb-4 px-4">
                {isWithdrawalView
                  ? "Track your systematic withdrawals (SWP) and lumpsum mutual fund redemptions."
                  : "Start tracking your SIP or Lumpsum investments for this mutual fund."}
              </p>
              <button
                type="button"
                onClick={() =>
                  isWithdrawalView
                    ? onOpenAddWithdrawal
                      ? onOpenAddWithdrawal(fund)
                      : onOpenAddSip(fund, "withdrawal")
                    : onOpenAddSip(fund, "deposit")
                }
                className={`btn btn-sm rounded-xl gap-2 font-bold cursor-pointer ${
                  isWithdrawalView
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-secondary shadow-xs"
                }`}
              >
                {isWithdrawalView ? <Minus size={14} /> : <Plus size={14} />}
                <span>
                  {isWithdrawalView
                    ? "Add First Withdrawal"
                    : "Add First Installment"}
                </span>
              </button>
            </div>
          ) : (
            <table className="table table-xs w-full text-xs table-auto border-collapse">
              <thead className="sticky top-0 z-30 shadow-xs">
                <tr className="border-b border-base-300 text-[10px] font-bold text-base-content/70 uppercase tracking-wider select-none bg-base-200">
                  {/* Term Sort Button */}
                  <th className="sticky top-0 z-30 py-2.5 px-2 text-left font-bold bg-base-200 border-b border-base-300">
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
                  <th className="sticky top-0 z-30 py-2.5 px-1.5 text-center font-bold bg-base-200 border-b border-base-300">
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
                  <th className="sticky top-0 z-30 py-2.5 px-2 text-center font-bold bg-base-200 border-b border-base-300">
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

                  {/* Deposit / Gross Withdrawn Sort Button */}
                  <th className="sticky top-0 z-30 py-2.5 px-2 text-right font-bold bg-base-200 border-b border-base-300">
                    <button
                      type="button"
                      onClick={() => handleSipSort("amtDeposit")}
                      className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                      title={isWithdrawalView ? "Sort by Gross Amount" : "Sort by Deposit Amount"}
                    >
                      <Coins size={11} className="text-secondary/70 shrink-0" />
                      <span className="truncate">
                        {isWithdrawalView ? "Gross Withdrawn ₹" : "Deposit ₹"}
                      </span>
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

                  {/* ER / Charges Sort Button */}
                  <th className="sticky top-0 z-30 py-2.5 px-1.5 text-right font-bold bg-base-200 border-b border-base-300">
                    <button
                      type="button"
                      onClick={() => handleSipSort("er")}
                      className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                      title="Sort by Charges / ER"
                    >
                      <Percent size={11} className="text-secondary/70 shrink-0" />
                      <span className="truncate">
                        {isWithdrawalView ? "Charges ₹" : "ER ₹"}
                      </span>
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

                  {/* NAV Sort Button */}
                  <th className="sticky top-0 z-30 py-2.5 px-2 text-right font-bold bg-base-200 border-b border-base-300">
                    <button
                      type="button"
                      onClick={() => handleSipSort("nav")}
                      className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                      title="Sort by NAV"
                    >
                      <TrendingUp size={11} className="text-secondary/70 shrink-0" />
                      <span className="truncate">
                        {isWithdrawalView ? "Exit NAV ₹" : "NAV ₹"}
                      </span>
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
                  <th className="sticky top-0 z-30 py-2.5 px-2 text-right font-bold bg-base-200 border-b border-base-300">
                    <button
                      type="button"
                      onClick={() => handleSipSort("units")}
                      className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                      title="Sort by Units"
                    >
                      <Layers size={11} className="text-secondary/70 shrink-0" />
                      <span className="truncate">
                        {isWithdrawalView ? "Redeemed" : "Units"}
                      </span>
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

                  {/* Actual Amt / Net Received Sort Button */}
                  <th className="sticky top-0 z-30 py-2.5 px-2 text-right font-bold bg-base-200 border-b border-base-300">
                    <button
                      type="button"
                      onClick={() => handleSipSort("actualAmt")}
                      className="flex items-center justify-end gap-1 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                      title="Sort by Actual Amount"
                    >
                      <PiggyBank size={11} className="text-secondary/70 shrink-0" />
                      <span className="truncate">
                        {isWithdrawalView ? "Net Received ₹" : "Actual Amt ₹"}
                      </span>
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
                  <th className="sticky top-0 z-30 py-2.5 px-1 text-center font-bold bg-base-200 border-b border-base-300">
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
                                <span
                                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border shrink-0 ${
                                    isWithdrawalView
                                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-secondary/15 text-secondary border-secondary/20"
                                  }`}
                                >
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

                            {/* Col 4: Gross / Deposit Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-bold text-base-content text-xs truncate border-b border-base-200/80">
                              ₹{yg.totalDeposit.toLocaleString("en-IN")}
                            </td>

                            {/* Col 5: Charges / ER Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-1.5 text-right bg-base-200/95 backdrop-blur-md font-bold text-error/80 text-xs truncate border-b border-base-200/80">
                              ₹{yg.totalEr.toLocaleString("en-IN")}
                            </td>

                            {/* Col 6: NAV Avg */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-semibold text-base-content/70 text-xs truncate border-b border-base-200/80">
                              {yg.avgNav > 0 ? `₹${yg.avgNav.toFixed(2)}` : "—"}
                            </td>

                            {/* Col 7: Units Subtotal */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-mono font-bold text-base-content/90 text-xs truncate border-b border-base-200/80">
                              {yg.totalUnits.toFixed(3)}
                            </td>

                            {/* Col 8: Net Received / Actual Subtotal */}
                            <td
                              className={`sticky top-[32px] z-10 py-1.5 px-2 text-right bg-base-200/95 backdrop-blur-md font-extrabold text-xs truncate border-b border-base-200/80 ${
                                isWithdrawalView
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isWithdrawalView ? "" : "+"}₹
                              {yg.totalActual.toLocaleString("en-IN")}
                            </td>

                            {/* Col 9: Actions */}
                            <td className="sticky top-[32px] z-10 py-1.5 px-1 bg-base-200/95 backdrop-blur-md border-b border-base-200/80"></td>
                          </tr>

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
                                        value={editTxnData.type || (isWithdrawalView ? "SWP" : "SIP")}
                                        onChange={(e) =>
                                          setEditTxnData({ ...editTxnData, type: e.target.value })
                                        }
                                        className="h-6 text-xs font-semibold px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                      >
                                        {isWithdrawalView ? (
                                          <>
                                            <option value="SWP">SWP</option>
                                            <option value="Redemption">Redemption</option>
                                          </>
                                        ) : (
                                          <>
                                            <option value="SIP">SIP</option>
                                            <option value="Lumpsum">LS</option>
                                          </>
                                        )}
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
                                        min="0"
                                        max={isWithdrawalView ? availableUnits : undefined}
                                        value={
                                          editTxnData.units !== undefined
                                            ? editTxnData.units
                                            : editNav > 0
                                            ? (editActualAmt / editNav).toFixed(3)
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          if (isWithdrawalView && val !== "") {
                                            const num = parseFloat(val);
                                            if (!isNaN(num) && num > availableUnits) {
                                              setEditTxnData({
                                                ...editTxnData,
                                                units: String(availableUnits),
                                              });
                                              return;
                                            }
                                          }
                                          setEditTxnData({ ...editTxnData, units: val });
                                        }}
                                        className="h-6 text-xs font-mono font-medium px-1 py-0 rounded-lg border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 text-info"
                                        placeholder={editNav > 0 ? (editActualAmt / editNav).toFixed(3) : "0.000"}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveEditSipTxn();
                                          if (e.key === "Escape") setEditingTxnKey(null);
                                        }}
                                      />
                                    </td>
                                    <td
                                      className={`py-1 px-1 text-right font-medium text-xs truncate ${
                                        isWithdrawalView
                                          ? "text-amber-600 dark:text-amber-400"
                                          : "text-emerald-600 dark:text-emerald-400"
                                      }`}
                                    >
                                      {isWithdrawalView ? "" : "+"}₹
                                      {editActualAmt.toLocaleString("en-IN")}
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

                              const isW = isWithdrawalTxn(txn);

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
                                        isW
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                          : txn.type === "Lumpsum" || txn.type === "LUMPSUM"
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                          : "bg-secondary/10 text-secondary border border-secondary/20"
                                      }`}
                                    >
                                      {txn.type || (isW ? "SWP" : "SIP")}
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
                                  <td
                                    className={`py-2 px-2 text-right font-bold text-xs truncate ${
                                      isW
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {isW ? "" : "+"}₹{actualAmt.toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-2 px-1 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => onOpenEditSip(fund, txn)}
                                        className="p-1 text-info bg-info/10 hover:bg-info/20 rounded-lg transition-colors cursor-pointer"
                                        title={isW ? "Edit Withdrawal" : "Edit Installment"}
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSipTxn(fund.id, txn.id)}
                                        className="p-1 text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
                                        title={isW ? "Delete Withdrawal" : "Delete Installment"}
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
              )}
            </div>

          {/* Table Bottom Footer Bar */}
          <div className="p-3 sm:px-5 sm:py-3 border-t border-base-200 bg-base-200/40 flex items-center justify-between text-xs shrink-0">
            <div className="text-base-content/60 font-mono text-xs">
              Showing <strong className="text-base-content font-bold">{filteredTxns.length}</strong> {isWithdrawalView ? "withdrawal events" : "deposit installments"}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 rounded-xl px-4 font-bold text-xs shrink-0 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANEL: 1 POPUP CARD WITH 2 FACES (DEPOSIT & WITHDRAWAL)     */}
        {/* ================================================================= */}
        <div className="w-full lg:w-84 xl:w-96 flex flex-col shrink-0 h-full overflow-hidden">
          <div className="bg-base-100/95 backdrop-blur-md rounded-3xl border border-base-300/60 shadow-xl flex flex-col h-full overflow-hidden justify-between">
            {/* Top Navigation & Face Indicator Header with 2 Arrow Controls */}
            <div className="p-3.5 sm:p-4 border-b border-base-200/80 bg-base-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                    tableTab === "withdrawal"
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary/15 text-secondary"
                  }`}
                >
                  {tableTab === "withdrawal" ? <Minus size={14} /> : <PiggyBank size={14} />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-base-content truncate">
                    {tableTab === "withdrawal" ? "Withdrawal Summary" : "Deposited Summary"}
                  </h4>
                  <span className="text-[9.5px] text-base-content/50 font-semibold block truncate">
                    {tableTab === "withdrawal" ? "Face 2 • Outflows" : "Face 1 • Inflows"}
                  </span>
                </div>
              </div>

              {/* 2 Navigation Arrows (Left & Right) to switch between faces */}
              <div className="flex items-center gap-1 bg-base-200/80 p-1 rounded-xl border border-base-300/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setTableTab("deposit")}
                  className={`p-1 rounded-lg transition-all cursor-pointer ${
                    tableTab === "deposit"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-300/60"
                  }`}
                  title="Show Deposited Details (Face 1)"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-[10px] font-mono font-black px-1.5 text-base-content/70 select-none">
                  {tableTab === "deposit" ? "1 / 2" : "2 / 2"}
                </span>
                <button
                  type="button"
                  onClick={() => setTableTab("withdrawal")}
                  className={`p-1 rounded-lg transition-all cursor-pointer ${
                    tableTab === "withdrawal"
                      ? "bg-primary text-primary-content shadow-xs"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-300/60"
                  }`}
                  title="Show Withdrawal Details (Face 2)"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* 2-Face Slider Body (No scrollbars, smooth sliding transition) */}
            <div className="flex-1 overflow-hidden relative w-full min-h-0">
              <div
                className={`w-[200%] h-full flex transition-transform duration-300 ease-out ${
                  tableTab === "withdrawal" ? "-translate-x-1/2" : "translate-x-0"
                }`}
              >
                {/* ----------------------------------------------------------- */}
                {/* FACE 1: DEPOSITED SUMMARY                                   */}
                {/* ----------------------------------------------------------- */}
                <div className="w-1/2 h-full p-4 sm:p-4.5 flex flex-col justify-between gap-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                  <div className="space-y-3">
                    {/* Hero Net Invested */}
                    <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 shadow-2xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] uppercase font-black tracking-wider text-secondary block">
                          Total Actually Invested
                        </span>
                        <span className="badge badge-secondary badge-xs font-mono font-bold">
                          {summary.totalTerms} terms
                        </span>
                      </div>
                      <div className="text-2xl font-mono font-black text-secondary tracking-tight">
                        ₹{summary.totalInvested.toLocaleString("en-IN")}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-secondary/15">
                        <span>Gross: ₹{summary.totalDeposited.toLocaleString("en-IN")}</span>
                        <span className="text-error font-semibold">ER: ₹{summary.totalEr.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* 4 Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <Coins size={10} className="text-secondary" /> Units Added
                        </span>
                        <span className="text-xs font-mono font-black text-secondary">
                          +{summary.totalUnits.toFixed(3)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <TrendingUp size={10} className="text-secondary" /> Avg NAV
                        </span>
                        <span className="text-xs font-mono font-black text-base-content">
                          {summary.avgNav > 0 ? `₹${summary.avgNav.toFixed(2)}` : "—"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <Layers size={10} className="text-secondary" /> Breakdown
                        </span>
                        <span className="text-[10.5px] font-bold text-base-content/80">
                          {summary.sipCount} SIP • {summary.lsCount} LS
                        </span>
                      </div>
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <Clock size={10} className="text-primary" /> Duration
                        </span>
                        <span className="text-[10.5px] font-bold text-base-content truncate">
                          {summary.durationText || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10.5px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-base-content/50">First Deposit:</span>
                        <span className="font-mono font-bold text-base-content">{summary.fromDateStr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/50">Latest Deposit:</span>
                        <span className="font-mono font-bold text-base-content">{summary.toDateStr}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTableTab("withdrawal")}
                    className="w-full py-2 px-3 rounded-xl bg-base-200/80 hover:bg-base-200 text-base-content/80 hover:text-base-content border border-base-300/60 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>View Withdrawal Summary</span>
                    <ChevronRight size={14} className="text-primary" />
                  </button>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* FACE 2: WITHDRAWAL SUMMARY                                  */}
                {/* ----------------------------------------------------------- */}
                <div className="w-1/2 h-full p-4 sm:p-4.5 flex flex-col justify-between gap-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                  <div className="space-y-3">
                    {/* Hero Net Withdrawn */}
                    <div className="p-3 rounded-2xl bg-base-200/60 border border-base-300/60 shadow-2xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] uppercase font-black tracking-wider text-base-content/60 block">
                          Total Actually Withdrawn
                        </span>
                        <span className="badge badge-primary badge-xs font-mono font-bold">
                          {summary.totalWithdrawalTerms || 0} events
                        </span>
                      </div>
                      <div className="text-2xl font-mono font-black text-base-content tracking-tight">
                        ₹{(summary.totalWithdrawn || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-base-300/40">
                        <span>Gross: ₹{(summary.grossWithdrawn || 0).toLocaleString("en-IN")}</span>
                        <span className="text-error font-semibold">Exit Load: ₹{(summary.totalWithdrawalEr || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* 4 Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <Coins size={10} className="text-warning" /> Units Redeemed
                        </span>
                        <span className="text-xs font-mono font-black text-base-content">
                          -{(summary.totalUnitsWithdrawn || 0).toFixed(3)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <TrendingUp size={10} className="text-info" /> Avg Exit NAV
                        </span>
                        <span className="text-xs font-mono font-black text-base-content">
                          {(summary.avgExitNav || 0) > 0 ? `₹${summary.avgExitNav.toFixed(2)}` : "—"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <Layers size={10} className="text-primary" /> Breakdown
                        </span>
                        <span className="text-[10.5px] font-bold text-base-content/80">
                          {summary.swpCount || 0} SWP • {summary.lsWithdrawalCount || 0} LS
                        </span>
                      </div>
                      <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                        <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                          <Coins size={10} className="text-secondary" /> Units Left
                        </span>
                        <span className="text-xs font-mono font-black text-secondary">
                          {summary.activeUnits.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10.5px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-base-content/50">First Withdrawal:</span>
                        <span className="font-mono font-bold text-base-content">{summary.withdrawalFromDateStr || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/50">Latest Withdrawal:</span>
                        <span className="font-mono font-bold text-base-content">{summary.withdrawalToDateStr || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTableTab("deposit")}
                    className="w-full py-2 px-3 rounded-xl bg-base-200/80 hover:bg-base-200 text-base-content/80 hover:text-base-content border border-base-300/60 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} className="text-secondary" />
                    <span>View Deposited Summary</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
