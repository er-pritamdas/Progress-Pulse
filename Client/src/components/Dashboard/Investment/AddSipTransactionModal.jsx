import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Minus,
  Calendar,
  DollarSign,
  Layers,
  PiggyBank,
  Check,
  Calculator,
  Coins,
} from "lucide-react";

export default function AddSipTransactionModal({
  isOpen,
  onClose,
  onSave,
  fund = null,
  initialTxn = null,
  mode = "deposit", // "deposit" | "withdrawal"
}) {
  if (!isOpen) return null;

  const isEdit = !!initialTxn;

  // Determine if this transaction is a withdrawal
  const isWithdrawal =
    mode === "withdrawal" ||
    (initialTxn?.type &&
      (initialTxn.type.toLowerCase().includes("withdr") ||
        initialTxn.type.toLowerCase().includes("redemp") ||
        initialTxn.type.toLowerCase().includes("swp")));

  // Form State
  const [term, setTerm] = useState("");
  const [type, setType] = useState(isWithdrawal ? "SWP" : "SIP");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amtDeposit, setAmtDeposit] = useState("");
  const [er, setEr] = useState("0");
  const [nav, setNav] = useState("");
  const [units, setUnits] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate Available Units from fund's deposit transactions minus already redeemed units
  const totalDepositUnits = (fund?.transactions || []).reduce((sum, t) => {
    const tl = (t?.type || "").toLowerCase();
    const isW =
      tl.includes("withdr") || tl.includes("redemp") || tl.includes("swp");
    if (isW) return sum;
    const act =
      t.actualAmt !== undefined && t.actualAmt !== null
        ? Number(t.actualAmt)
        : Math.max(0, (t.amtDeposit ?? t.amount ?? 0) - (t.er ?? 0));
    const navVal = Number(t.nav ?? 0);
    const u = parseFloat(t.units) || (navVal > 0 ? act / navVal : 0);
    return sum + u;
  }, 0);

  const alreadyRedeemedUnits = (fund?.transactions || []).reduce((sum, t) => {
    const tl = (t?.type || "").toLowerCase();
    const isW =
      tl.includes("withdr") || tl.includes("redemp") || tl.includes("swp");
    if (!isW) return sum;
    // When editing, do not include the current transaction in alreadyRedeemedUnits
    if (
      isEdit &&
      initialTxn &&
      (t.id === initialTxn.id ||
        t._id === initialTxn._id ||
        t.id === initialTxn._id)
    ) {
      return sum;
    }
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

  // Setup initial data or pre-fill from last transaction
  useEffect(() => {
    if (isEdit && initialTxn) {
      setTerm(initialTxn.term || "");
      setType(initialTxn.type || (isWithdrawal ? "SWP" : "SIP"));
      setDate(
        initialTxn.date
          ? new Date(initialTxn.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setAmtDeposit(initialTxn.amtDeposit ?? initialTxn.amount ?? "");
      setEr(initialTxn.er ?? "0");
      setNav(initialTxn.nav ?? "");
      setUnits(
        initialTxn.units !== undefined && initialTxn.units !== null
          ? String(initialTxn.units)
          : ""
      );
    } else if (fund) {
      const txns = fund.transactions || [];
      const relevantTxns = isWithdrawal
        ? txns.filter((t) => {
            const tl = (t.type || "").toLowerCase();
            return (
              tl.includes("withdr") ||
              tl.includes("redemp") ||
              tl.includes("swp")
            );
          })
        : txns.filter((t) => {
            const tl = (t.type || "").toLowerCase();
            return (
              !tl.includes("withdr") &&
              !tl.includes("redemp") &&
              !tl.includes("swp")
            );
          });

      const nextTermNum = relevantTxns.length + 1;
      setTerm(`Term ${nextTermNum}`);
      setDate(new Date().toISOString().split("T")[0]);

      if (relevantTxns.length > 0) {
        const last = relevantTxns[relevantTxns.length - 1];
        setType(last.type || (isWithdrawal ? "SWP" : "SIP"));
        setAmtDeposit(last.amtDeposit ?? last.amount ?? "");
        setEr(last.er ?? "0");
        setNav(last.nav ?? "");
        const lastActual = Math.max(
          0,
          (last.amtDeposit ?? last.amount ?? 0) - (last.er ?? 0)
        );
        const lastNav = parseFloat(last.nav) || 0;
        let defaultUnits =
          last.units ??
          (lastNav > 0 ? (lastActual / lastNav).toFixed(3) : "");
        if (
          isWithdrawal &&
          defaultUnits !== "" &&
          parseFloat(defaultUnits) > availableUnits
        ) {
          defaultUnits = availableUnits > 0 ? availableUnits.toFixed(3) : "";
        }
        setUnits(
          defaultUnits !== undefined && defaultUnits !== null
            ? String(defaultUnits)
            : ""
        );
      } else {
        setType(isWithdrawal ? "SWP" : "SIP");
        setAmtDeposit("");
        setEr("0");
        setNav("");
        setUnits("");
      }
    }
  }, [initialTxn, fund, isEdit, isWithdrawal, availableUnits]);

  // Calculated values
  const numericUnits = parseFloat(units) || 0;
  const numericNav = parseFloat(nav) || 0;
  const numericEr = parseFloat(er) || 0;

  // For withdrawals, gross is calculated as (units * nav) if not manually overridden
  const computedGross = isWithdrawal
    ? numericUnits > 0 && numericNav > 0
      ? parseFloat((numericUnits * numericNav).toFixed(2))
      : parseFloat(amtDeposit) || 0
    : parseFloat(amtDeposit) || 0;

  const actualAmt = Math.max(0, computedGross - numericEr);

  // Auto-calculate for Deposits vs Withdrawals
  const handleUnitsChange = (val) => {
    let finalVal = val;
    if (isWithdrawal && val !== "") {
      const numVal = parseFloat(val);
      if (!isNaN(numVal) && numVal > availableUnits) {
        setErrorMsg(
          `Cannot redeem more than available ${availableUnits.toFixed(3)} units. Maximum available has been filled.`
        );
        finalVal = String(availableUnits);
      } else {
        setErrorMsg("");
      }
      // Auto-calculate Gross Amount = Units * NAV
      const uNum = parseFloat(finalVal) || 0;
      const navNum = parseFloat(nav) || 0;
      if (uNum > 0 && navNum > 0) {
        const gross = parseFloat((uNum * navNum).toFixed(2));
        setAmtDeposit(String(gross));
      } else if (uNum === 0) {
        setAmtDeposit("");
      }
    } else {
      setErrorMsg("");
    }
    setUnits(finalVal);
  };

  const handleNavChange = (val) => {
    setNav(val);
    const navNum = parseFloat(val) || 0;
    if (isWithdrawal) {
      // Auto-calculate Gross Amount = Units * NAV
      const uNum = parseFloat(units) || 0;
      if (uNum > 0 && navNum > 0) {
        const gross = parseFloat((uNum * navNum).toFixed(2));
        setAmtDeposit(String(gross));
      } else if (navNum === 0) {
        setAmtDeposit("");
      }
    } else {
      const dep = parseFloat(amtDeposit) || 0;
      const expense = parseFloat(er) || 0;
      const actual = Math.max(0, dep - expense);
      if (navNum > 0) {
        setUnits((actual / navNum).toFixed(3));
      }
    }
  };

  const handleAmtDepositChange = (val) => {
    setAmtDeposit(val);
    if (!isWithdrawal) {
      const dep = parseFloat(val) || 0;
      const expense = parseFloat(er) || 0;
      const actual = Math.max(0, dep - expense);
      const navNum = parseFloat(nav) || 0;
      if (navNum > 0) {
        setUnits((actual / navNum).toFixed(3));
      }
    }
  };

  const handleErChange = (val) => {
    setEr(val);
    if (!isWithdrawal) {
      const dep = parseFloat(amtDeposit) || 0;
      const expense = parseFloat(val) || 0;
      const actual = Math.max(0, dep - expense);
      const navNum = parseFloat(nav) || 0;
      if (navNum > 0) {
        setUnits((actual / navNum).toFixed(3));
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!term.trim()) {
      setErrorMsg("Please enter a term label (e.g. Term 1).");
      return;
    }
    if (!date) {
      setErrorMsg("Please select a transaction date.");
      return;
    }

    const parsedUnits = parseFloat(units) || 0;
    const parsedNav = parseFloat(nav) || 0;
    let parsedGross = parseFloat(amtDeposit) || 0;

    if (isWithdrawal) {
      if (parsedGross <= 0 && parsedUnits > 0 && parsedNav > 0) {
        parsedGross = parseFloat((parsedUnits * parsedNav).toFixed(2));
      }
      if (availableUnits <= 0) {
        setErrorMsg(
          "No available units to redeem in this mutual fund. Please add deposit / SIP entries first."
        );
        return;
      }
      if (parsedUnits <= 0) {
        setErrorMsg("Please enter the units to redeem.");
        return;
      }
      if (parsedUnits > availableUnits) {
        setErrorMsg(
          `Units redeemed (${parsedUnits.toFixed(3)}) cannot exceed available units (${availableUnits.toFixed(3)}).`
        );
        return;
      }
      if (parsedNav <= 0) {
        setErrorMsg("Please enter a valid Exit NAV.");
        return;
      }
    } else {
      if (!amtDeposit || parsedGross <= 0) {
        setErrorMsg("Please enter a valid deposit amount.");
        return;
      }
    }

    const payload = {
      term: term.trim(),
      type,
      date,
      amtDeposit: parsedGross,
      er: numericEr,
      nav: parsedNav,
      actualAmt,
      units: parsedUnits,
      amount: actualAmt,
    };

    if (isEdit && initialTxn) {
      payload.id = initialTxn.id;
    }

    onSave(payload, isEdit);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 w-screen h-screen z-[1000005] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in zoom-in-95 duration-200 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                isWithdrawal
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-secondary/10 text-secondary"
              }`}
            >
              {isWithdrawal ? <Minus size={20} /> : <PiggyBank size={20} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-base-content leading-tight">
                {isEdit
                  ? isWithdrawal
                    ? "Edit Withdrawal Entry"
                    : "Edit Transaction"
                  : isWithdrawal
                  ? "Add Mutual Fund Withdrawal Entry"
                  : "Add SIP / Lumpsum Transaction"}
              </h3>
              <p className="text-xs text-base-content/60 font-medium">
                {fund?.amc || "Mutual Fund"}{" "}
                {fund?.folioNumber
                  ? `• #${fund.folioNumber.replace(/^#/, "")}`
                  : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1.5 block">
              {isWithdrawal ? "Withdrawal Type" : "Investment Type"}
            </label>
            {isWithdrawal ? (
              <div className="grid grid-cols-2 gap-2 bg-base-200/60 p-1 rounded-2xl border border-base-200">
                <button
                  type="button"
                  onClick={() => setType("SWP")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    type === "SWP"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  SWP (Recurring)
                </button>
                <button
                  type="button"
                  onClick={() => setType("Redemption")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    type === "Redemption" || type === "Lumpsum"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  Redemption (One-time)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 bg-base-200/60 p-1 rounded-2xl border border-base-200">
                <button
                  type="button"
                  onClick={() => setType("SIP")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    type === "SIP"
                      ? "bg-secondary text-white shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  SIP (Recurring)
                </button>
                <button
                  type="button"
                  onClick={() => setType("Lumpsum")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    type === "Lumpsum"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  Lumpsum (One-time)
                </button>
              </div>
            )}
          </div>

          {/* Row 1: Term & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                Term Label
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Term 1"
                className={`input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none ${
                  isWithdrawal
                    ? "focus:border-amber-500"
                    : "focus:border-secondary"
                }`}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                {isWithdrawal ? "Withdrawal Date" : "Transaction Date"}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none ${
                  isWithdrawal
                    ? "focus:border-amber-500"
                    : "focus:border-secondary"
                }`}
                required
              />
            </div>
          </div>

          {/* WITHDRAWAL FLOW: Units First, then NAV, then Total Gross Value & Exit Load */}
          {isWithdrawal ? (
            <>
              {/* Row 2: Units Redeemed & Exit NAV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                    Units Redeemed
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max={availableUnits}
                    value={units}
                    onChange={(e) => handleUnitsChange(e.target.value)}
                    placeholder={
                      availableUnits > 0 ? availableUnits.toFixed(3) : "0.000"
                    }
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-amber-500 text-amber-600 dark:text-amber-400"
                    required
                  />
                  <div className="flex items-center justify-between mt-1 text-[10px] text-base-content/50">
                    <span>Max: {availableUnits.toFixed(3)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleUnitsChange(String(availableUnits));
                      }}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Use Max Units
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block flex items-center justify-between">
                    <span>Exit NAV / Selling NAV (₹)</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={nav}
                    onChange={(e) => handleNavChange(e.target.value)}
                    placeholder="e.g. 65.40"
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Gross Amount & Exit Load */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block flex items-center justify-between">
                    <span>Gross Amount (₹)</span>
                    <span className="text-[10px] text-amber-500 font-semibold lowercase">
                      (auto / editable)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amtDeposit}
                    onChange={(e) => handleAmtDepositChange(e.target.value)}
                    placeholder={
                      numericUnits > 0 && numericNav > 0
                        ? (numericUnits * numericNav).toFixed(2)
                        : "0.00"
                    }
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                    Exit Load / STT / Charges (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={er}
                    onChange={(e) => handleErChange(e.target.value)}
                    placeholder="0"
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* DEPOSIT FLOW: Amount & ER First, then NAV & Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                    Amount Deposited (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={amtDeposit}
                    onChange={(e) => handleAmtDepositChange(e.target.value)}
                    placeholder="e.g. 5000"
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-secondary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                    Expense Ratio / ER (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={er}
                    onChange={(e) => handleErChange(e.target.value)}
                    placeholder="0"
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block flex items-center justify-between">
                    <span>Net Asset Value / NAV (₹)</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={nav}
                    onChange={(e) => handleNavChange(e.target.value)}
                    placeholder="e.g. 65.40"
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block flex items-center justify-between">
                    <span>Units Allotted</span>
                    <span className="text-[10px] text-secondary font-semibold lowercase">
                      (auto / editable)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={units}
                    onChange={(e) => handleUnitsChange(e.target.value)}
                    placeholder={
                      numericNav > 0
                        ? (actualAmt / numericNav).toFixed(3)
                        : "0.000"
                    }
                    className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none font-mono focus:border-secondary text-secondary"
                  />
                </div>
              </div>
            </>
          )}

          {/* Auto-Calculated Live Preview Box */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isWithdrawal
                ? "bg-amber-500/5 border-amber-500/20"
                : "bg-secondary/5 border-secondary/20"
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-xs font-bold ${
                isWithdrawal
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-secondary"
              }`}
            >
              <Calculator size={14} />
              <span>Calculated Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] text-base-content/50 font-bold uppercase block">
                  {isWithdrawal
                    ? "Net Received"
                    : "Actual Amount"}
                </span>
                <span
                  className={`font-extrabold text-sm font-mono ${
                    isWithdrawal
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-secondary"
                  }`}
                >
                  ₹{actualAmt.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-base-content/50 font-bold uppercase block">
                  {isWithdrawal ? "Units Redeemed" : "Units Allotted"}
                </span>
                <span className="font-mono font-black text-sm text-base-content">
                  {units ||
                    (numericNav > 0
                      ? (actualAmt / numericNav).toFixed(3)
                      : "0.000")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md ${
                isWithdrawal
                  ? "btn-warning bg-amber-500 hover:bg-amber-600 text-white border-none shadow-amber-500/20"
                  : "btn-secondary shadow-secondary/20"
              }`}
            >
              <Check size={16} />
              <span>
                {isEdit
                  ? isWithdrawal
                    ? "Update Withdrawal"
                    : "Update Transaction"
                  : isWithdrawal
                  ? "Save Withdrawal"
                  : "Save Transaction"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

