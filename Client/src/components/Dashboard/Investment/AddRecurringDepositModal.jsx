import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  PiggyBank,
  Calendar,
  Building2,
  ChevronDown,
  Save,
  AlertCircle
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";
import { BANK_OPTIONS, calculateFdMaturity as calculateRdMaturity } from "./AddFixedDepositModal";

export { calculateRdMaturity };

export default function AddRecurringDepositModal({
  isOpen,
  onClose,
  onSave,
  editingRd = null,
}) {
  // Form States
  const [bankName, setBankName] = useState("");
  const [interestRate, setInterestRate] = useState("7.0");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [maturityDate, setMaturityDate] = useState(dayjs().add(1, "year").format("YYYY-MM-DD"));
  const [rdNumber, setRdNumber] = useState("");

  // Bank Search Autocomplete
  const [bankSearch, setBankSearch] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const bankDropdownRef = useRef(null);

  // Errors & UI states
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close bank dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pre-fill on edit or reset on create
  useEffect(() => {
    if (editingRd) {
      setBankName(editingRd.bankName || "");
      setBankSearch(editingRd.bankName || "");
      setInterestRate(String(editingRd.interestRate ?? "7.0"));
      setStartDate(
        editingRd.startDate
          ? dayjs(editingRd.startDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD")
      );
      setMaturityDate(
        editingRd.maturityDate
          ? dayjs(editingRd.maturityDate).format("YYYY-MM-DD")
          : dayjs().add(1, "year").format("YYYY-MM-DD")
      );
      setRdNumber(editingRd.rdNumber || "");
      setErrorMsg("");
    } else {
      setBankName("");
      setBankSearch("");
      setInterestRate("7.0");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setMaturityDate(dayjs().add(1, "year").format("YYYY-MM-DD"));
      setRdNumber("");
      setErrorMsg("");
    }
  }, [editingRd, isOpen]);

  // Filtered Banks for Autocomplete
  const filteredBanks = useMemo(() => {
    if (!bankSearch.trim()) return BANK_OPTIONS;
    return BANK_OPTIONS.filter((b) =>
      b.toLowerCase().includes(bankSearch.toLowerCase())
    );
  }, [bankSearch]);

  // Dynamic Tenure & Calculation based on Start Date and End Date
  const calculations = useMemo(() => {
    return calculateRdMaturity({
      principal: 0,
      interestRate: Number(interestRate) || 0,
      startDate,
      maturityDate,
    });
  }, [interestRate, startDate, maturityDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const chosenBank = bankName.trim() || bankSearch.trim();
    if (!chosenBank) {
      setErrorMsg("Please select or enter a Bank / Institution Name");
      return;
    }
    if (!interestRate || Number(interestRate) <= 0) {
      setErrorMsg("Please enter a valid Rate of Interest (% p.a.)");
      return;
    }
    if (!startDate) {
      setErrorMsg("Please select Start Date");
      return;
    }
    if (!maturityDate) {
      setErrorMsg("Please select End Date (Maturity Date)");
      return;
    }
    if (dayjs(maturityDate).isBefore(dayjs(startDate))) {
      setErrorMsg("End Date cannot be before Start Date");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...(editingRd || {}),
        bankName: chosenBank,
        rdNumber: rdNumber.trim(),
        schemeName: editingRd?.schemeName || "Regular RD",
        interestRate: Number(interestRate),
        startDate,
        maturityDate,
        tenureYears: calculations.tenureYears,
        tenureMonths: calculations.tenureMonths,
        tenureDays: calculations.tenureDays,
        tenureText: calculations.tenureText,
        tenureValue: calculations.totalDays,
        tenureUnit: "Days",
        maturityAmount: calculations.maturityAmount,
        compoundingFrequency: "Quarterly",
        status: editingRd?.status || "Active",
      };

      // For new RD, amount is 0 until deposits are added
      if (!editingRd) {
        payload.amount = 0;
        payload.transactions = [];
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save Recurring Deposit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-base-300 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b-2 border-base-200 flex justify-between items-center bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary">
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 leading-tight text-base-content">
                <span>{editingRd ? "Edit Recurring Deposit" : "Add Recurring Deposit"}</span>
              </h3>
              <p className="text-[11px] text-base-content/60 font-semibold mt-0.5">
                Bank name, interest rate, start date & end date (deposits are added via table or + button)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/60 hover:text-base-content"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="alert alert-error text-xs py-2.5 rounded-xl flex items-center gap-2 shadow-xs font-bold">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Bank / Institution Name */}
          <div className="relative" ref={bankDropdownRef}>
            <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Bank / Institution Name *</span>
              {bankName && (
                <span className="text-[10px] text-primary font-bold lowercase">
                  selected: {bankName}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary">
                <Building2 size={16} />
              </span>
              <input
                type="text"
                placeholder="Search or type Bank Name (e.g. SBI, HDFC, Post Office)..."
                value={bankSearch}
                onFocus={() => setIsBankDropdownOpen(true)}
                onChange={(e) => {
                  setBankSearch(e.target.value);
                  setBankName(e.target.value);
                  setIsBankDropdownOpen(true);
                }}
                className="input h-11 w-full pl-10 pr-9 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsBankDropdownOpen((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Bank Autocomplete Suggestions Dropdown */}
            {isBankDropdownOpen && filteredBanks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-base-100 rounded-2xl border-2 border-base-300 shadow-2xl z-[100] p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => {
                      setBankName(bank);
                      setBankSearch(bank);
                      setIsBankDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      bankName === bank
                        ? "bg-primary text-primary-content font-black"
                        : "hover:bg-base-200 text-base-content"
                    }`}
                  >
                    <span>{bank}</span>
                    {bankName === bank && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Start Date & End Date (Maturity Date) */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5">
                  Start Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content px-3.5 shadow-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5">
                  End Date (Maturity) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="input h-11 w-full rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content px-3.5 shadow-xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Tenure Ribbon */}
            <div className="px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-[11px] font-bold">
              <span className="text-base-content/70">Calculated Tenure:</span>
              <span className="font-mono text-primary font-black">
                {calculations.tenureText} ({calculations.totalDays} Total Days)
              </span>
            </div>
          </div>

          {/* 3. Rate of Interest & RD Account Number */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5">
                Rate of Interest (% p.a.) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 7.10"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="input h-11 w-full pl-3.5 pr-12 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-black text-primary">% p.a.</span>
              </div>
            </div>

            <div>
              <label className="block font-black text-base-content/85 text-[11px] uppercase tracking-wider mb-1.5">
                RD Account Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary font-mono font-black text-xs">#</span>
                <input
                  type="text"
                  placeholder="e.g. RD98234"
                  value={rdNumber}
                  onChange={(e) => setRdNumber(e.target.value)}
                  className="input h-11 w-full pl-8 rounded-2xl bg-base-200 dark:bg-base-300/80 border-2 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost font-black rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-sm btn-primary font-black rounded-xl gap-2 shadow-lg shadow-primary/30 border-0 h-10 px-5 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <Save size={16} />
                  <span>{editingRd ? "Update Recurring Deposit" : "Save Recurring Deposit"}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
