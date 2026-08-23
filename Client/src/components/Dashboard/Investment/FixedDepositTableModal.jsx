import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  Landmark,
  PiggyBank,
  Calendar,
  Coins,
  Percent,
  TrendingUp,
  Hash,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";

export default function FixedDepositTableModal({
  fd,
  summary,
  isOpen,
  defaultViewMode = "deposit", // "deposit" | "withdrawal" | "all"
  onClose,
  onOpenAddDeposit,
  onOpenAddWithdrawal,
  onOpenEditTxn,
  onDeleteTxn,
  onSaveInlineTxn,
}) {
  const [tableTab, setTableTab] = useState(defaultViewMode || "deposit");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [collapsedYears, setCollapsedYears] = useState(new Set());

  // Inline Add State
  const [isInlineAdding, setIsInlineAdding] = useState(false);
  const [inlineData, setInlineData] = useState({
    term: "",
    type: "Top-up",
    date: dayjs().format("YYYY-MM-DD"),
    amount: "",
    interestAmount: "0",
    penalty: "0",
    notes: "",
  });

  // Inline Edit State
  const [editingTxnId, setEditingTxnId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (defaultViewMode) setTableTab(defaultViewMode);
  }, [defaultViewMode, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fd) return null;

  const isWithdrawalTxn = (t) => {
    const tl = (t?.type || "").toLowerCase();
    return tl.includes("withdr") || tl.includes("break") || tl.includes("liquid") || tl.includes("payout");
  };

  const allTxns = fd.transactions || [];
  const filteredTxns = allTxns.filter((t) => {
    if (tableTab === "withdrawal") return isWithdrawalTxn(t);
    if (tableTab === "deposit") return !isWithdrawalTxn(t);
    return true;
  });

  // Sorting
  const sortedTxns = [...filteredTxns].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "date") {
      valA = new Date(a.date || 0).getTime();
      valB = new Date(b.date || 0).getTime();
    } else if (sortBy === "amount" || sortBy === "amtDeposit") {
      valA = Number(a.amtDeposit || a.amount || 0);
      valB = Number(b.amtDeposit || b.amount || 0);
    } else if (sortBy === "actualAmt") {
      valA = Number(a.actualAmt || 0);
      valB = Number(b.actualAmt || 0);
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Group by Year
  const txnsByYear = sortedTxns.reduce((acc, t) => {
    const year = dayjs(t.date || new Date()).format("YYYY");
    if (!acc[year]) acc[year] = [];
    acc[year].push(t);
    return acc;
  }, {});

  const sortedYears = Object.keys(txnsByYear).sort((a, b) => (sortOrder === "asc" ? a - b : b - a));

  const toggleYearCollapse = (year) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const handleSort = (colKey) => {
    if (sortBy === colKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(colKey);
      setSortOrder("desc");
    }
  };

  // Start Inline Add
  const startInlineAdd = (mode) => {
    setIsInlineAdding(true);
    setInlineData({
      term: mode === "withdrawal" ? `Withdrawal ${allTxns.filter(isWithdrawalTxn).length + 1}` : `Deposit ${allTxns.filter(t => !isWithdrawalTxn(t)).length + 1}`,
      type: mode === "withdrawal" ? "Withdrawal" : "Top-up",
      date: dayjs().format("YYYY-MM-DD"),
      amount: "",
      interestAmount: "0",
      penalty: "0",
      notes: "",
    });
  };

  // Save Inline Add
  const handleSaveInline = async () => {
    const parsedAmt = evaluateMathExpression(inlineData.amount) ?? (Number(inlineData.amount) || 0);
    if (parsedAmt <= 0) return;

    const isW = isWithdrawalTxn(inlineData);
    const parsedInt = Number(inlineData.interestAmount) || 0;
    const parsedPen = Number(inlineData.penalty) || 0;

    const payload = {
      term: inlineData.term.trim() || (isW ? "Withdrawal" : "Top-up"),
      type: inlineData.type,
      date: inlineData.date,
      amtDeposit: parsedAmt,
      interestAmount: parsedInt,
      penalty: parsedPen,
      actualAmt: isW ? Math.max(0, parsedAmt + parsedInt - parsedPen) : parsedAmt,
      notes: inlineData.notes.trim(),
    };

    await onSaveInlineTxn(payload);
    setIsInlineAdding(false);
  };

  // Start Inline Edit
  const startInlineEdit = (txn) => {
    setEditingTxnId(txn.id || txn._id);
    setEditData({
      term: txn.term || "",
      type: txn.type || "Deposit",
      date: txn.date ? dayjs(txn.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      amount: String(txn.amtDeposit ?? txn.amount ?? ""),
      interestAmount: String(txn.interestAmount ?? "0"),
      penalty: String(txn.penalty ?? "0"),
      notes: txn.notes || "",
    });
  };

  // Save Inline Edit
  const handleSaveEdit = async (txnId) => {
    const parsedAmt = evaluateMathExpression(editData.amount) ?? (Number(editData.amount) || 0);
    if (parsedAmt <= 0) return;

    const isW = isWithdrawalTxn(editData);
    const parsedInt = Number(editData.interestAmount) || 0;
    const parsedPen = Number(editData.penalty) || 0;

    const payload = {
      term: editData.term.trim(),
      type: editData.type,
      date: editData.date,
      amtDeposit: parsedAmt,
      interestAmount: parsedInt,
      penalty: parsedPen,
      actualAmt: isW ? Math.max(0, parsedAmt + parsedInt - parsedPen) : parsedAmt,
      notes: editData.notes.trim(),
    };

    await onSaveInlineTxn(payload, txnId);
    setEditingTxnId(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-base-300 my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 text-primary">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 leading-tight">
                <span>{fd.bankName}</span>
                {fd.fdNumber && (
                  <span className="badge badge-sm font-mono font-bold bg-base-300">
                    #{fd.fdNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs opacity-60 font-medium mt-0.5">
                {fd.interestRate}% p.a. • {fd.tenureText || `${fd.tenureValue} ${fd.tenureUnit}`} • {fd.compoundingFrequency} Compounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300">
              <button
                type="button"
                onClick={() => setTableTab("deposit")}
                className={`btn btn-xs rounded-lg px-3 transition-all ${
                  tableTab === "deposit" ? "btn-primary shadow-xs text-white" : "btn-ghost"
                }`}
              >
                Deposits ({allTxns.filter(t => !isWithdrawalTxn(t)).length})
              </button>
              <button
                type="button"
                onClick={() => setTableTab("withdrawal")}
                className={`btn btn-xs rounded-lg px-3 transition-all ${
                  tableTab === "withdrawal" ? "btn-warning shadow-xs text-white" : "btn-ghost"
                }`}
              >
                Withdrawals ({allTxns.filter(isWithdrawalTxn).length})
              </button>
              <button
                type="button"
                onClick={() => setTableTab("all")}
                className={`btn btn-xs rounded-lg px-3 transition-all ${
                  tableTab === "all" ? "btn-neutral shadow-xs text-white" : "btn-ghost"
                }`}
              >
                All ({allTxns.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-xs btn-ghost btn-circle rounded-full hover:bg-base-200 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Action Trigger Ribbon */}
        <div className="px-5 py-2.5 bg-base-200/30 border-b border-base-200 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAddDeposit ? onOpenAddDeposit(fd, "deposit") : startInlineAdd("deposit")}
              className="btn btn-xs btn-primary font-bold rounded-xl gap-1"
            >
              <Plus size={13} />
              <span>Add Deposit / Top-up</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAddWithdrawal ? onOpenAddWithdrawal(fd, "withdrawal") : startInlineAdd("withdrawal")}
              className="btn btn-xs btn-outline btn-warning font-bold rounded-xl gap-1"
            >
              <Minus size={13} />
              <span>Add Withdrawal / Break</span>
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-base-content/70">
            Active Principal: <span className="text-primary font-black">₹{summary.activePrincipal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {sortedYears.length === 0 ? (
            <div className="p-8 text-center bg-base-200/40 rounded-2xl border border-base-200">
              <Landmark size={32} className="mx-auto mb-2 text-base-content/30" />
              <p className="font-bold text-base-content/70">No transactions recorded yet in this view</p>
              <p className="text-[11px] opacity-60 mt-1">Use the buttons above to log deposits or withdrawals.</p>
            </div>
          ) : (
            sortedYears.map((year) => {
              const yearTxns = txnsByYear[year];
              const isYearCollapsed = collapsedYears.has(year);

              const yearDeposits = yearTxns.filter(t => !isWithdrawalTxn(t)).reduce((s, t) => s + (Number(t.amtDeposit || t.amount || 0)), 0);
              const yearWithdrawals = yearTxns.filter(isWithdrawalTxn).reduce((s, t) => s + (Number(t.amtDeposit || t.amount || 0)), 0);

              return (
                <div key={year} className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-2xs">
                  {/* Collapsible Year Header */}
                  <div
                    onClick={() => toggleYearCollapse(year)}
                    className="px-4 py-2.5 bg-base-200/60 flex items-center justify-between cursor-pointer hover:bg-base-200 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2 font-extrabold text-sm">
                      <div className={`p-1 rounded-lg bg-base-300 text-base-content transition-transform duration-200 ${isYearCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                        <ChevronDown size={14} />
                      </div>
                      <span>Year {year}</span>
                      <span className="badge badge-sm font-bold bg-base-300">
                        {yearTxns.length} txn{yearTxns.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      {yearDeposits > 0 && (
                        <span className="text-primary font-bold">
                          Deposits: ₹{yearDeposits.toLocaleString("en-IN")}
                        </span>
                      )}
                      {yearWithdrawals > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Withdrawals: ₹{yearWithdrawals.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transactions Table */}
                  {!isYearCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="table table-xs w-full">
                        <thead>
                          <tr className="bg-base-200/30 text-[10px] uppercase tracking-wider text-base-content/60 font-extrabold border-b border-base-200">
                            <th className="py-2.5">Date</th>
                            <th>Term / Label</th>
                            <th>Type</th>
                            <th className="text-right">Principal (₹)</th>
                            <th className="text-right">+ Interest (₹)</th>
                            <th className="text-right">- Penalty (₹)</th>
                            <th className="text-right">Net Payout (₹)</th>
                            <th>Notes</th>
                            <th className="text-center w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearTxns.map((txn) => {
                            const isEditing = editingTxnId === (txn.id || txn._id);
                            const isW = isWithdrawalTxn(txn);

                            if (isEditing) {
                              return (
                                <tr key={txn.id || txn._id} className="bg-primary/5">
                                  <td>
                                    <input
                                      type="date"
                                      value={editData.date}
                                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                      className="input input-xs input-bordered rounded-lg w-28 text-xs font-semibold"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      value={editData.term}
                                      onChange={(e) => setEditData({ ...editData, term: e.target.value })}
                                      className="input input-xs input-bordered rounded-lg w-28 text-xs font-semibold"
                                    />
                                  </td>
                                  <td>
                                    <select
                                      value={editData.type}
                                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                      className="select select-xs select-bordered rounded-lg text-xs font-bold"
                                    >
                                      <option value="Deposit">Deposit</option>
                                      <option value="Top-up">Top-up</option>
                                      <option value="Withdrawal">Withdrawal</option>
                                      <option value="Premature Break">Premature Break</option>
                                      <option value="Maturity Liquidation">Maturity Liquidation</option>
                                    </select>
                                  </td>
                                  <td className="text-right">
                                    <input
                                      type="text"
                                      value={editData.amount}
                                      onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                      className="input input-xs input-bordered rounded-lg w-24 text-right text-xs font-mono font-bold"
                                    />
                                  </td>
                                  <td className="text-right">
                                    <input
                                      type="number"
                                      value={editData.interestAmount}
                                      onChange={(e) => setEditData({ ...editData, interestAmount: e.target.value })}
                                      className="input input-xs input-bordered rounded-lg w-20 text-right text-xs font-mono text-emerald-600"
                                    />
                                  </td>
                                  <td className="text-right">
                                    <input
                                      type="number"
                                      value={editData.penalty}
                                      onChange={(e) => setEditData({ ...editData, penalty: e.target.value })}
                                      className="input input-xs input-bordered rounded-lg w-20 text-right text-xs font-mono text-rose-600"
                                    />
                                  </td>
                                  <td className="text-right font-mono font-bold">
                                    ₹{((evaluateMathExpression(editData.amount) || 0) + (Number(editData.interestAmount) || 0) - (Number(editData.penalty) || 0)).toLocaleString()}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      value={editData.notes}
                                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                      className="input input-xs input-bordered rounded-lg w-32 text-xs"
                                    />
                                  </td>
                                  <td className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEdit(txn.id || txn._id)}
                                        className="btn btn-xs btn-primary btn-circle"
                                      >
                                        <Check size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingTxnId(null)}
                                        className="btn btn-xs btn-ghost btn-circle"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={txn.id || txn._id} className="hover:bg-base-200/40">
                                <td className="font-mono font-medium">
                                  {dayjs(txn.date).format("DD MMM YYYY")}
                                </td>
                                <td className="font-bold">{txn.term || "—"}</td>
                                <td>
                                  <span className={`badge badge-xs font-bold ${
                                    isW ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  } border-transparent`}>
                                    {txn.type}
                                  </span>
                                </td>
                                <td className="text-right font-mono font-bold">
                                  ₹{Number(txn.amtDeposit || txn.amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                                  {txn.interestAmount > 0 ? `+₹${Number(txn.interestAmount).toLocaleString("en-IN")}` : "—"}
                                </td>
                                <td className="text-right font-mono text-rose-600 dark:text-rose-400">
                                  {txn.penalty > 0 ? `-₹${Number(txn.penalty).toLocaleString("en-IN")}` : "—"}
                                </td>
                                <td className="text-right font-mono font-black text-primary">
                                  ₹{Number(txn.actualAmt || txn.amtDeposit || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="text-base-content/70 truncate max-w-xs">{txn.notes || "—"}</td>
                                <td className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => onOpenEditTxn ? onOpenEditTxn(fd, txn) : startInlineEdit(txn)}
                                      className="p-1 hover:bg-base-200 rounded-lg text-info"
                                      title="Edit Transaction"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteTxn && onDeleteTxn(fd.id, txn.id || txn._id)}
                                      className="p-1 hover:bg-base-200 rounded-lg text-error"
                                      title="Delete Transaction"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
