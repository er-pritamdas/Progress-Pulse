import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, DollarSign, Layers, PiggyBank, Check, Calculator } from "lucide-react";

export default function AddSipTransactionModal({
  isOpen,
  onClose,
  onSave,
  fund = null,
  initialTxn = null,
}) {
  if (!isOpen) return null;

  const isEdit = !!initialTxn;

  // Form State
  const [term, setTerm] = useState("");
  const [type, setType] = useState("SIP");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amtDeposit, setAmtDeposit] = useState("");
  const [er, setEr] = useState("0");
  const [nav, setNav] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Setup initial data or pre-fill from last transaction
  useEffect(() => {
    if (isEdit && initialTxn) {
      setTerm(initialTxn.term || "");
      setType(initialTxn.type || "SIP");
      setDate(
        initialTxn.date
          ? new Date(initialTxn.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setAmtDeposit(initialTxn.amtDeposit ?? initialTxn.amount ?? "");
      setEr(initialTxn.er ?? "0");
      setNav(initialTxn.nav ?? "");
    } else if (fund) {
      const txns = fund.transactions || [];
      const nextTermNum = txns.length + 1;
      setTerm(`Term ${nextTermNum}`);
      setDate(new Date().toISOString().split("T")[0]);

      if (txns.length > 0) {
        const last = txns[txns.length - 1];
        setType(last.type || "SIP");
        setAmtDeposit(last.amtDeposit ?? last.amount ?? "");
        setEr(last.er ?? "0");
        setNav(last.nav ?? "");
      } else {
        setType("SIP");
        setAmtDeposit("");
        setEr("0");
        setNav("");
      }
    }
  }, [initialTxn, fund, isEdit]);

  // Calculated values
  const numericDeposit = parseFloat(amtDeposit) || 0;
  const numericEr = parseFloat(er) || 0;
  const actualAmt = Math.max(0, numericDeposit - numericEr);
  const numericNav = parseFloat(nav) || 0;
  const units = numericNav > 0 ? (actualAmt / numericNav).toFixed(3) : "0.000";

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
    if (!amtDeposit || numericDeposit <= 0) {
      setErrorMsg("Please enter a valid deposit amount.");
      return;
    }

    const payload = {
      term: term.trim(),
      type,
      date,
      amtDeposit: numericDeposit,
      er: numericEr,
      nav: numericNav,
      actualAmt,
      units: parseFloat(units) || 0,
    };

    if (isEdit && initialTxn) {
      payload.id = initialTxn.id;
    }

    onSave(payload, isEdit);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-base-100 rounded-3xl border border-base-200 shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <PiggyBank size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-base-content leading-tight">
                {isEdit ? "Edit Transaction" : "Add SIP / Lumpsum Transaction"}
              </h3>
              <p className="text-xs text-base-content/60 font-medium">
                {fund?.amc || "Mutual Fund"}{" "}
                {fund?.folioNumber ? `• Folio #${fund.folioNumber}` : ""}
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

          {/* Type Selector (SIP vs Lumpsum) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1.5 block">
              Investment Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-base-200/60 p-1 rounded-2xl border border-base-200">
              <button
                type="button"
                onClick={() => setType("SIP")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
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
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  type === "Lumpsum"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                Lumpsum (One-time)
              </button>
            </div>
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
                className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none focus:border-secondary"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none focus:border-secondary"
                required
              />
            </div>
          </div>

          {/* Row 2: Deposit & Expense Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
                Amount Deposited (₹)
              </label>
              <input
                type="number"
                step="100"
                value={amtDeposit}
                onChange={(e) => setAmtDeposit(e.target.value)}
                placeholder="e.g. 5000"
                className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none focus:border-secondary"
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
                onChange={(e) => setEr(e.target.value)}
                placeholder="0"
                className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Row 3: NAV */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 mb-1 block">
              Net Asset Value / NAV (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={nav}
              onChange={(e) => setNav(e.target.value)}
              placeholder="e.g. 65.40"
              className="input input-sm input-bordered w-full rounded-xl font-bold text-xs focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Auto-Calculated Live Preview Box */}
          <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
              <Calculator size={14} />
              <span>Calculated Totals</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] text-base-content/50 font-bold uppercase block">
                  Actual Amount (Deposit - ER)
                </span>
                <span className="font-extrabold text-sm text-secondary">
                  ₹{actualAmt.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-base-content/50 font-bold uppercase block">
                  Units Allotted (Actual / NAV)
                </span>
                <span className="font-mono font-black text-sm text-base-content">
                  {units}
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
              className="btn btn-secondary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md shadow-secondary/20"
            >
              <Check size={16} />
              <span>{isEdit ? "Update Transaction" : "Save Transaction"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
