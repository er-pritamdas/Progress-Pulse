import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Coins,
  Hash,
  FileText,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronsUp,
  ChevronsDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Percent,
  Layers
} from "lucide-react";
import { calculateRdMaturity } from "./AddRecurringDepositModal";

export default function RecurringDepositTableModal({
  isOpen,
  onClose,
  rd = null,
  onOpenAddDeposit,
  onOpenEditDeposit,
  onDeleteDeposit,
  hideNumbers = false,
}) {
  // Navigation face: 0 = Deposited Summary, 1 = Withdrawal Summary
  const [activeFace, setActiveFace] = useState(0);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // "term" | "date" | "amount"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

  // Collapsed year groups
  const [collapsedYears, setCollapsedYears] = useState(new Set());

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset states when opening
  useEffect(() => {
    if (isOpen && rd) {
      setSearchTerm("");
    }
  }, [isOpen, rd]);

  const rawTxns = rd?.transactions || [];

  // Sort and Filter Transactions
  const filteredTxns = useMemo(() => {
    let list = [...rawTxns];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((t) => {
        const termMatch = (t.installmentNo || t.term || "").toLowerCase().includes(term);
        const notesMatch = (t.notes || "").toLowerCase().includes(term);
        const dateMatch = (t.date || "").toLowerCase().includes(term);
        const amtMatch = String(t.amount || t.amtDeposit || "").includes(term);
        return termMatch || notesMatch || dateMatch || amtMatch;
      });
    }

    list.sort((a, b) => {
      if (sortBy === "term") {
        const valA = (a.installmentNo || a.term || "").toLowerCase();
        const valB = (b.installmentNo || b.term || "").toLowerCase();
        const numA = parseInt(valA.replace(/\D/g, ""), 10);
        const numB = parseInt(valB.replace(/\D/g, ""), 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortBy === "date") {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === "amount") {
        const amtA = Number(a.amount || a.amtDeposit || 0);
        const amtB = Number(b.amount || b.amtDeposit || 0);
        return sortOrder === "asc" ? amtA - amtB : amtB - amtA;
      }
      return 0;
    });

    return list;
  }, [rawTxns, searchTerm, sortBy, sortOrder]);

  // Group filtered transactions by Year
  const yearGroups = useMemo(() => {
    const map = {};
    const yearsList = [];

    filteredTxns.forEach((txn) => {
      let yr = "Other";
      if (txn.date) {
        const parts = String(txn.date).split("-");
        if (parts[0] && parts[0].length === 4) {
          yr = parts[0];
        } else {
          const d = new Date(txn.date);
          if (!isNaN(d.getFullYear())) {
            yr = String(d.getFullYear());
          }
        }
      }
      if (!map[yr]) {
        map[yr] = [];
        yearsList.push(yr);
      }
      map[yr].push(txn);
    });

    return yearsList.map((year) => {
      const txns = map[year];
      const subtotal = txns.reduce((s, t) => s + Number(t.amount || t.amtDeposit || 0), 0);
      return {
        year,
        txns,
        subtotal,
        count: txns.length,
      };
    });
  }, [filteredTxns]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder(col === "term" || col === "date" ? "asc" : "desc");
    }
  };

  const toggleYearCollapse = (year) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleAllYears = () => {
    if (collapsedYears.size === yearGroups.length) {
      setCollapsedYears(new Set());
    } else {
      setCollapsedYears(new Set(yearGroups.map((yg) => yg.year)));
    }
  };

  const totalDeposited = rawTxns.reduce(
    (acc, t) => acc + Number(t.amount || t.amtDeposit || 0),
    0
  );

  const avgInstallment = rawTxns.length > 0 ? totalDeposited / rawTxns.length : 0;

  // Tenure & Calculations
  const calculations = calculateRdMaturity({
    principal: totalDeposited,
    interestRate: rd?.interestRate || 0,
    tenureYears: rd?.tenureYears ?? 1,
    tenureMonths: rd?.tenureMonths ?? 0,
    tenureDays: rd?.tenureDays ?? 0,
    startDate: rd?.startDate || dayjs().format("YYYY-MM-DD"),
    maturityDate: rd?.maturityDate || dayjs().add(1, "year").format("YYYY-MM-DD"),
    compoundingFrequency: rd?.compoundingFrequency || "Quarterly",
  });

  const start = dayjs(rd?.startDate || new Date());
  const maturity = dayjs(rd?.maturityDate || calculations.maturityDate || new Date());
  const today = dayjs();
  const totalDays = Math.max(1, maturity.diff(start, "day"));
  const daysPassed = Math.max(0, today.diff(start, "day"));
  const daysRemaining = Math.max(0, maturity.diff(today, "day"));
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
  const isMatured = today.isAfter(maturity) || daysRemaining === 0;

  if (!isOpen || !rd) return null;

  return createPortal(
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
            <div className="w-10 h-10 rounded-2xl font-black text-base flex items-center justify-center shrink-0 border shadow-xs bg-primary/15 text-primary border-primary/20">
              {(rd.bankName || "RD").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-base-content tracking-tight truncate">
                  {rd.bankName}
                </h3>
                {rd.rdNumber && (
                  <span className="text-[11px] font-mono font-bold text-base-content/60 bg-base-200 px-2 py-0.5 rounded-lg shrink-0">
                    #{rd.rdNumber.replace(/^#/, "")}
                  </span>
                )}
                {rd.isWithdrawn ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                    Withdrawn
                  </span>
                ) : isMatured ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 shrink-0">
                    Matured
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                    Active Deposit
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/60 font-medium truncate">
                Recurring Deposit • {rd.interestRate}% p.a. • Quarterly Compounding • {rd.tenureText || calculations.tenureText}
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

        {/* Main Content Layout: Left Table + Right 2-Face Summary */}
        <div className="flex flex-col lg:flex-row gap-3.5 flex-1 min-h-0 overflow-hidden">
          
          {/* Left Table Panel Card */}
          <div className="flex-1 bg-base-100/95 backdrop-blur-md rounded-3xl border border-base-300/60 shadow-xl flex flex-col overflow-hidden h-full min-w-0">
            
            {/* Toolbar: Search + Year Collapse + Add Action */}
            <div className="px-4 sm:px-5 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              
              {/* Left Side: Search Bar & Count Badge */}
              <div className="flex items-center gap-2.5 flex-1 min-w-[220px] max-w-md">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search installments by #, notes, date, amount..."
                    className="input input-xs h-8 pl-8 pr-7 w-full rounded-xl bg-base-200/70 border-base-300 focus:border-primary text-xs font-medium"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <span className="badge badge-sm badge-neutral font-mono font-bold text-[10.5px] shrink-0">
                  {filteredTxns.length} Deposits
                </span>
              </div>

              {/* Right Side: Year Group Expand/Collapse + Add Installment Button */}
              <div className="flex items-center gap-2">
                {yearGroups.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllYears}
                    className="btn btn-ghost btn-xs rounded-xl gap-1.5 font-bold text-xs h-8 min-h-0 text-base-content/80 hover:text-base-content hover:bg-base-200 border border-base-300 shadow-2xs cursor-pointer"
                    title={collapsedYears.size === yearGroups.length ? "Expand All Year Groups" : "Collapse All Year Groups"}
                  >
                    {collapsedYears.size === yearGroups.length ? (
                      <>
                        <ChevronsDown size={13} className="text-primary" />
                        <span>Expand All</span>
                      </>
                    ) : (
                      <>
                        <ChevronsUp size={13} className="text-primary" />
                        <span>Collapse All</span>
                      </>
                    )}
                  </button>
                )}

                {/* Primary Add Deposit Modal Button */}
                <button
                  type="button"
                  onClick={() => onOpenAddDeposit(rd)}
                  className="btn btn-primary btn-xs rounded-xl gap-1.5 font-bold text-xs h-8 min-h-0 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 transition-all text-primary-content"
                >
                  <Plus size={13} />
                  <span>Add Deposit</span>
                </button>
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="flex-1 overflow-auto [scrollbar-width:thin] bg-base-100 min-h-0">
              {filteredTxns.length === 0 ? (
                <div className="py-16 text-center bg-base-100 rounded-2xl border border-base-200/80 shadow-sm my-6 max-w-md mx-auto">
                  <div className="p-3.5 rounded-2xl w-fit mx-auto mb-3 bg-primary/10 text-primary">
                    <PiggyBank size={28} />
                  </div>
                  <h4 className="text-base font-bold text-base-content mb-1">
                    {searchTerm ? "No Matching Deposits Found" : "No Deposit Installments Yet"}
                  </h4>
                  <p className="text-xs text-base-content/60 mb-4 px-4">
                    {searchTerm
                      ? `No installments matched "${searchTerm}".`
                      : "Start logging your recurring deposit monthly installments."}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAddDeposit(rd)}
                    className="btn btn-sm btn-primary rounded-xl gap-2 font-bold cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Add First Deposit</span>
                  </button>
                </div>
              ) : (
                <table className="table table-xs w-full text-xs table-auto border-collapse">
                  <thead className="sticky top-0 z-30 shadow-xs">
                    <tr className="border-b border-base-300 text-[10px] font-bold text-base-content/70 uppercase tracking-wider select-none bg-base-200">
                      
                      {/* Installment / Term Header */}
                      <th className="sticky top-0 z-30 py-2.5 px-3 text-left font-bold bg-base-200 border-b border-base-300 w-36">
                        <button
                          type="button"
                          onClick={() => handleSort("term")}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
                          title="Sort by Installment / Term"
                        >
                          <Hash size={11} className="text-primary/70 shrink-0" />
                          <span className="truncate">Installment #</span>
                          {sortBy === "term" ? (
                            sortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-primary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-primary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Date Header */}
                      <th className="sticky top-0 z-30 py-2.5 px-3 text-left font-bold bg-base-200 border-b border-base-300 w-36">
                        <button
                          type="button"
                          onClick={() => handleSort("date")}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
                          title="Sort by Deposit Date"
                        >
                          <Calendar size={11} className="text-primary/70 shrink-0" />
                          <span className="truncate">Deposit Date</span>
                          {sortBy === "date" ? (
                            sortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-primary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-primary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Amount Deposited Header */}
                      <th className="sticky top-0 z-30 py-2.5 px-3 text-right font-bold bg-base-200 border-b border-base-300 w-40">
                        <button
                          type="button"
                          onClick={() => handleSort("amount")}
                          className="flex items-center justify-end gap-1 ml-auto hover:text-primary transition-colors cursor-pointer group"
                          title="Sort by Amount Deposited"
                        >
                          <Coins size={11} className="text-primary/70 shrink-0" />
                          <span className="truncate">Amount (₹)</span>
                          {sortBy === "amount" ? (
                            sortOrder === "asc" ? (
                              <ArrowUp size={11} className="text-primary font-bold shrink-0" />
                            ) : (
                              <ArrowDown size={11} className="text-primary font-bold shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      </th>

                      {/* Notes Header */}
                      <th className="sticky top-0 z-30 py-2.5 px-3 text-left font-bold bg-base-200 border-b border-base-300">
                        <div className="flex items-center gap-1 text-base-content/70">
                          <FileText size={11} className="text-base-content/50" />
                          <span>Notes / Remarks</span>
                        </div>
                      </th>

                      {/* Actions Header */}
                      <th className="sticky top-0 z-30 py-2.5 px-3 text-center font-bold bg-base-200 border-b border-base-300 w-24">
                        <span>Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-base-200/70 font-medium">
                    {/* Year Grouped Rows */}
                    {yearGroups.map((group) => {
                      const isCollapsed = collapsedYears.has(group.year);

                      return (
                        <React.Fragment key={group.year}>
                          {/* Year Collapsible Header Ribbon */}
                          <tr
                            onClick={() => toggleYearCollapse(group.year)}
                            className="bg-base-200/70 hover:bg-base-200 text-base-content font-bold cursor-pointer select-none transition-colors border-y border-base-300/80"
                          >
                            <td colSpan={5} className="py-2 px-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-0.5 rounded-md bg-base-300 text-base-content/70 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                                    <ChevronDown size={14} />
                                  </div>
                                  <span className="font-black text-xs text-base-content tracking-tight">
                                    {group.year}
                                  </span>
                                  <span className="badge badge-xs badge-neutral font-mono font-bold">
                                    {group.count} {group.count === 1 ? "deposit" : "deposits"}
                                  </span>
                                </div>

                                <div className="text-[11px] font-mono text-base-content/80 font-bold">
                                  Year Subtotal:{" "}
                                  <strong className="text-primary font-black">
                                    {hideNumbers ? "₹ ••••••" : `₹${group.subtotal.toLocaleString("en-IN")}`}
                                  </strong>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Year Transaction Rows */}
                          {!isCollapsed &&
                            group.txns.map((txn, idx) => {
                              const txnId = txn.id || txn._id;
                              const amt = Number(txn.amount ?? txn.amtDeposit ?? 0);

                              return (
                                <tr key={txnId || idx} className="hover:bg-base-200/40 transition-colors">
                                  {/* 1. Installment Label */}
                                  <td className="py-2.5 px-3 font-mono font-bold text-base-content/80">
                                    <span className="badge badge-sm badge-neutral font-mono font-bold text-[10.5px]">
                                      {txn.installmentNo || txn.term || `#${idx + 1}`}
                                    </span>
                                  </td>

                                  {/* 2. Deposit Date */}
                                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-base-content/80">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar size={12} className="text-primary shrink-0" />
                                      <span>{txn.date ? dayjs(txn.date).format("DD MMM YYYY") : "-"}</span>
                                    </div>
                                  </td>

                                  {/* 3. Amount */}
                                  <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-primary whitespace-nowrap">
                                    {hideNumbers ? "₹ ••••••" : `₹${amt.toLocaleString("en-IN")}`}
                                  </td>

                                  {/* 4. Notes */}
                                  <td className="py-2.5 px-3 text-base-content/70 max-w-xs truncate">
                                    {txn.notes || <span className="text-base-content/30 italic">No notes</span>}
                                  </td>

                                  {/* 5. Actions (Edit Opens Modal & Delete) */}
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => onOpenEditDeposit && onOpenEditDeposit(rd, txn)}
                                        className="p-1 text-base-content/60 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Deposit Installment"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteDeposit(rd, txnId)}
                                        className="p-1 text-base-content/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Deposit"
                                      >
                                        <Trash2 size={13} />
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
                Showing <strong className="text-base-content font-bold">{filteredTxns.length}</strong> deposit installments
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
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                    activeFace === 1 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-primary/15 text-primary"
                  }`}>
                    {activeFace === 1 ? <Coins size={14} /> : <PiggyBank size={14} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-base-content truncate">
                      {activeFace === 1 ? "Withdrawal Summary" : "Deposited Summary"}
                    </h4>
                    <span className="text-[9.5px] text-base-content/50 font-semibold block truncate">
                      {activeFace === 1 ? "Face 2 • Settlement" : "Face 1 • Inflows"}
                    </span>
                  </div>
                </div>

                {/* 2 Navigation Arrows (Left & Right) to switch between faces */}
                <div className="flex items-center gap-1 bg-base-200/80 p-1 rounded-xl border border-base-300/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveFace(0)}
                    className={`p-1 rounded-lg transition-all cursor-pointer ${
                      activeFace === 0
                        ? "bg-primary text-primary-content shadow-xs"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-300/60"
                    }`}
                    title="Show Deposited Details (Face 1)"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-[10px] font-mono font-black px-1.5 text-base-content/70 select-none">
                    {activeFace === 0 ? "1 / 2" : "2 / 2"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFace(1)}
                    className={`p-1 rounded-lg transition-all cursor-pointer ${
                      activeFace === 1
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-300/60"
                    }`}
                    title="Show Withdrawal Details (Face 2)"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* 2-Face Slider Body */}
              <div className="flex-1 overflow-hidden relative w-full min-h-0">
                <div
                  className={`w-[200%] h-full flex transition-transform duration-300 ease-out ${
                    activeFace === 1 ? "-translate-x-1/2" : "translate-x-0"
                  }`}
                >
                  {/* ----------------------------------------------------------- */}
                  {/* FACE 1: DEPOSITED SUMMARY                                   */}
                  {/* ----------------------------------------------------------- */}
                  <div className="w-1/2 h-full p-4 sm:p-4.5 flex flex-col justify-between gap-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                    <div className="space-y-3">
                      {/* Hero Net Invested */}
                      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] uppercase font-black tracking-wider text-primary block">
                            Total Principal Deposited
                          </span>
                          <span className="badge badge-primary badge-xs font-mono font-bold">
                            {rawTxns.length} installments
                          </span>
                        </div>
                        <div className="text-2xl font-mono font-black text-primary tracking-tight">
                          {hideNumbers ? "₹ ••••••" : `₹${totalDeposited.toLocaleString("en-IN")}`}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-primary/15">
                          <span>Rate: {rd.interestRate}% p.a.</span>
                          <span>Quarterly Compounded</span>
                        </div>
                      </div>

                      {/* 4 Stats Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <TrendingUp size={10} className="text-primary" /> Interest Rate
                          </span>
                          <span className="text-xs font-mono font-black text-primary">
                            {rd.interestRate}% p.a.
                          </span>
                        </div>
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <Clock size={10} className="text-primary" /> RD Tenure
                          </span>
                          <span className="text-xs font-mono font-black text-base-content truncate">
                            {rd.tenureText || calculations.tenureText}
                          </span>
                        </div>
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <Coins size={10} className="text-primary" /> Avg Installment
                          </span>
                          <span className="text-[10.5px] font-mono font-bold text-base-content">
                            ₹{Math.round(avgInstallment).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <Layers size={10} className="text-primary" /> Compounding
                          </span>
                          <span className="text-[10.5px] font-bold text-base-content truncate">
                            {rd.compoundingFrequency || "Quarterly"}
                          </span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10.5px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-base-content/50">Start Date:</span>
                          <span className="font-mono font-bold text-base-content">{dayjs(rd.startDate).format("DD MMM YYYY")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/50">Maturity Date:</span>
                          <span className="font-mono font-bold text-base-content">{dayjs(rd.maturityDate).format("DD MMM YYYY")}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-base-200">
                          <span className="text-base-content/50">Timeline Status:</span>
                          <span className="font-mono font-black text-primary">
                            {isMatured ? "Matured" : `${daysRemaining} days left (${progressPercent}%)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveFace(1)}
                      className="w-full py-2 px-3 rounded-xl bg-base-200/80 hover:bg-base-200 text-base-content/80 hover:text-base-content border border-base-300/60 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>View Settlement / Withdrawal Details</span>
                      <ChevronRight size={14} className="text-primary" />
                    </button>
                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* FACE 2: WITHDRAWAL / SETTLEMENT SUMMARY                     */}
                  {/* ----------------------------------------------------------- */}
                  <div className="w-1/2 h-full p-4 sm:p-4.5 flex flex-col justify-between gap-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                    <div className="space-y-3">
                      {/* Hero Net Withdrawn */}
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 block">
                            Settlement Payout (Withdrawn)
                          </span>
                          <span className="badge badge-sm font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0">
                            {rd.isWithdrawn ? "Settled" : "Active RD"}
                          </span>
                        </div>
                        <div className="text-2xl font-mono font-black text-base-content tracking-tight">
                          {hideNumbers ? "₹ ••••••" : (rd.isWithdrawn ? `₹${Number(rd.totalPayout || 0).toLocaleString("en-IN")}` : "Not Withdrawn")}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-amber-500/15">
                          <span>Penalty: ₹{Number(rd.penalty || 0).toLocaleString("en-IN")}</span>
                          <span className={Number(rd.realizedGain || 0) >= 0 ? "text-emerald-600 font-black" : "text-rose-600 font-black"}>
                            Gain: {Number(rd.realizedGain || 0) >= 0 ? "+" : ""}₹{Number(rd.realizedGain || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* 4 Stats Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <Coins size={10} className="text-amber-500" /> Withdrawal Amt
                          </span>
                          <span className="text-xs font-mono font-black text-base-content">
                            {rd.isWithdrawn ? `₹${Number(rd.totalPayout || 0).toLocaleString("en-IN")}` : "—"}
                          </span>
                        </div>
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <Percent size={10} className="text-rose-500" /> Penalties
                          </span>
                          <span className="text-xs font-mono font-black text-rose-600">
                            {rd.isWithdrawn ? `₹${Number(rd.penalty || 0).toLocaleString("en-IN")}` : "₹0"}
                          </span>
                        </div>
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <TrendingUp size={10} className="text-emerald-500" /> Net Profit/Loss
                          </span>
                          <span className={`text-[10.5px] font-mono font-black ${
                            Number(rd.realizedGain || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {rd.isWithdrawn ? `${Number(rd.realizedGain || 0) >= 0 ? '+' : ''}₹${Number(rd.realizedGain || 0).toLocaleString("en-IN")} (${rd.realizedReturnPercent}%)` : "—"}
                          </span>
                        </div>
                        <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                          <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                            <Layers size={10} className="text-primary" /> Status
                          </span>
                          <span className="text-[10.5px] font-bold text-base-content truncate">
                            {rd.isWithdrawn ? "Withdrawn" : isMatured ? "Matured" : "Active"}
                          </span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10.5px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-base-content/50">Withdrawal Date:</span>
                          <span className="font-mono font-bold text-base-content">
                            {rd.withdrawalDate ? dayjs(rd.withdrawalDate).format("DD MMM YYYY") : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/50">Days Held:</span>
                          <span className="font-mono font-bold text-base-content">
                            {rd.isWithdrawn && rd.withdrawalDate ? `${Math.max(0, dayjs(rd.withdrawalDate).diff(dayjs(rd.startDate), "day"))} days` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveFace(0)}
                      className="w-full py-2 px-3 rounded-xl bg-base-200/80 hover:bg-base-200 text-base-content/80 hover:text-base-content border border-base-300/60 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} className="text-primary" />
                      <span>View Deposited Summary</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
