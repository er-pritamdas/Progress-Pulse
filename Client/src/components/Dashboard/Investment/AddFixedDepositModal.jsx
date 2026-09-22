import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  Landmark,
  Calendar,
  Building2,
  ChevronDown,
  Sparkles,
  Save,
  AlertCircle
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";

export const BANK_OPTIONS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda (BOB)",
  "Canara Bank",
  "Union Bank of India",
  "IDBI Bank",
  "IndusInd Bank",
  "Federal Bank",
  "Yes Bank",
  "IDFC FIRST Bank",
  "Post Office Time Deposit",
  "Bajaj Finance",
  "Shriram Finance",
  "Mahindra Finance",
  "AU Small Finance Bank",
  "Equitas Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "Bandhan Bank",
  "RBL Bank",
];

export const calculateFdMaturity = ({
  principal = 0,
  interestRate = 0,
  startDate = dayjs().format("YYYY-MM-DD"),
  maturityDate = dayjs().add(1, "year").format("YYYY-MM-DD"),
  tenureYears = 0,
  tenureMonths = 0,
  tenureDays = 0,
}) => {
  const P = Number(principal) || 0;
  const r = Number(interestRate) || 0;
  const start = dayjs(startDate || new Date());
  
  let end;
  if (maturityDate) {
    end = dayjs(maturityDate);
  } else {
    end = start.add(tenureYears || 1, "year").add(tenureMonths || 0, "month").add(tenureDays || 0, "day");
  }

  const totalDays = Math.max(0, end.diff(start, "day"));
  const tInYears = totalDays / 365;

  // Derive readable tenure text
  let y = end.diff(start, "year");
  let m = end.subtract(y, "year").diff(start, "month");
  let d = end.subtract(y, "year").subtract(m, "month").diff(start, "day");

  const parts = [];
  if (y > 0) parts.push(`${y} Year${y !== 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} Month${m !== 1 ? "s" : ""}`);
  if (d > 0) parts.push(`${d} Day${d !== 1 ? "s" : ""}`);
  const tenureText = parts.length > 0 ? parts.join(" ") : `${totalDays} Days`;

  // Compounding: Quarterly Indian banking standard
  const n = 4;
  let maturityAmount = P;
  if (P > 0 && r > 0 && tInYears > 0) {
    maturityAmount = P * Math.pow(1 + r / (100 * n), n * tInYears);
  }

  maturityAmount = Math.round((maturityAmount + Number.EPSILON) * 100) / 100;
  const totalInterest = Math.max(0, Math.round((maturityAmount - P + Number.EPSILON) * 100) / 100);
  const gainPercent = P > 0 ? Math.round(((totalInterest / P) * 100 + Number.EPSILON) * 100) / 100 : 0;

  return {
    maturityDate: end.format("YYYY-MM-DD"),
    maturityAmount,
    totalInterest,
    gainPercent,
    totalDays,
    tenureYears: y,
    tenureMonths: m,
    tenureDays: d,
    tenureText,
    tInYears,
  };
};

/* Bank Autocomplete Component */
function BankAutocomplete({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return BANK_OPTIONS;
    const lower = query.toLowerCase();
    return BANK_OPTIONS.filter((b) => b.toLowerCase().includes(lower));
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary font-bold">
          <Building2 size={16} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || "Select or type bank name..."}
          className="input h-8 w-full pl-10 pr-9 rounded-xl bg-base-200 dark:bg-base-300/80 border border-base-content/12 dark:border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronDown size={15} />
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[999999] mt-1 w-full bg-base-100 border border-base-content/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-1.5 text-xs">
          {suggestions.map((bank) => (
            <li
              key={bank}
              onClick={() => {
                setQuery(bank);
                onChange(bank);
                setIsOpen(false);
              }}
              className="px-3.5 py-2.5 hover:bg-primary/15 hover:text-primary rounded-xl cursor-pointer font-bold transition-colors flex items-center gap-2.5"
            >
              <Landmark size={15} className="text-primary shrink-0" />
              <span className="truncate">{bank}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddFixedDepositModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) {
  const isEdit = !!initialData;

  // 6 Essential User Inputs
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [maturityDate, setMaturityDate] = useState(dayjs().add(1, "year").format("YYYY-MM-DD"));
  const [interestRate, setInterestRate] = useState("7.10");
  const [fdNumber, setFdNumber] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Pre-fill on Edit
  useEffect(() => {
    if (isEdit && initialData) {
      setBankName(initialData.bankName || "");
      const initialAmt =
        initialData.amount !== undefined && initialData.amount !== null
          ? initialData.amount
          : (initialData.transactions || []).find((t) => !t.type?.toLowerCase().includes("withdr"))?.amtDeposit ?? "";
      setAmount(String(initialAmt));
      setStartDate(initialData.startDate ? dayjs(initialData.startDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
      setMaturityDate(
        initialData.maturityDate
          ? dayjs(initialData.maturityDate).format("YYYY-MM-DD")
          : dayjs(initialData.startDate || new Date()).add(1, "year").format("YYYY-MM-DD")
      );
      setInterestRate(String(initialData.interestRate || "7.10"));
      setFdNumber(initialData.fdNumber || "");
      setErrorMsg("");
    } else {
      setBankName("");
      setAmount("");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setMaturityDate(dayjs().add(1, "year").format("YYYY-MM-DD"));
      setInterestRate("7.10");
      setFdNumber("");
      setErrorMsg("");
    }
  }, [isOpen, isEdit, initialData]);

  // Evaluated Principal Amount from math input
  const evaluatedPrincipal = evaluateMathExpression(amount) ?? (Number(amount) || 0);

  // Live Auto-Calculation from Start Date & End Date
  const calculations = useMemo(() => {
    return calculateFdMaturity({
      principal: evaluatedPrincipal,
      interestRate: Number(interestRate) || 0,
      startDate,
      maturityDate,
    });
  }, [evaluatedPrincipal, interestRate, startDate, maturityDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!bankName.trim()) {
      setErrorMsg("Please select or enter the Bank Name");
      return;
    }
    if (evaluatedPrincipal <= 0) {
      setErrorMsg("Please enter a valid positive Amount Deposited");
      return;
    }
    if (!startDate) {
      setErrorMsg("Please select Start Date");
      return;
    }
    if (!maturityDate) {
      setErrorMsg("Please select End Date");
      return;
    }
    if (dayjs(maturityDate).isBefore(dayjs(startDate))) {
      setErrorMsg("End Date cannot be before Start Date");
      return;
    }
    if (Number(interestRate) <= 0) {
      setErrorMsg("Please enter a valid Rate of Interest (% p.a.)");
      return;
    }

    setIsSubmitting(true);
    try {
      const fdPayload = {
        ...(isEdit && initialData ? initialData : {}),
        bankName: bankName.trim(),
        amount: evaluatedPrincipal,
        startDate,
        maturityDate,
        interestRate: Number(interestRate),
        fdNumber: fdNumber.trim(),
        tenureYears: calculations.tenureYears,
        tenureMonths: calculations.tenureMonths,
        tenureDays: calculations.tenureDays,
        tenureText: calculations.tenureText,
        maturityAmount: calculations.maturityAmount,
        compoundingFrequency: "Quarterly",
        status: isEdit && initialData?.isWithdrawn ? "Withdrawn" : (isEdit && initialData?.status ? initialData.status : "Active"),
      };

      await onSave(fdPayload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save Fixed Deposit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-2.5 sm:p-5 animate-in fade-in duration-200">
      {/* =================================================================== */}
      {/* DESKTOP MODAL (Visible on Tablet/Desktop: hidden sm:flex)          */}
      {/* =================================================================== */}
      <div className="hidden sm:flex bg-base-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-base-content/10 dark:border-base-content/10 w-full max-w-lg max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex-col">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-base-content/8 dark:border-base-content/8 flex justify-between items-center bg-base-200/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/15 text-primary">
              <Landmark size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm flex items-center gap-2 leading-tight text-base-content">
                <span>{isEdit ? "Edit Fixed Deposit" : "Add Fixed Deposit"}</span>
              </h3>
              <p className="text-[10.5px] sm:text-[11px] text-base-content/60 font-semibold mt-0.5">
                Enter your Fixed Deposit investment details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/60 hover:text-base-content cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form with scrollable body and pinned footer */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs flex-1">
            {errorMsg && (
              <div className="alert alert-error text-xs py-2 rounded-xl flex items-center gap-2 shadow-xs font-bold">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Bank Name */}
            <div>
              <label className="block font-black text-base-content/85 text-[10.5px] uppercase tracking-wider mb-1.5">
                Bank / Institution Name *
              </label>
              <BankAutocomplete
                value={bankName}
                onChange={setBankName}
                placeholder="e.g. State Bank of India, HDFC Bank..."
              />
            </div>

            {/* 2. Amount Deposited */}
            <div>
              <label className="block font-black text-base-content/85 text-[10.5px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Amount Deposited (₹) *</span>
                <span className="text-[9.5px] lowercase font-bold text-primary/90 bg-primary/10 px-1.5 py-0.2 rounded-md">supports: + - * /</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-black text-sm text-primary">₹</span>
                  <input
                    type="text"
                    placeholder="e.g. 100000 or 50000*2"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input h-8 w-full pl-7 rounded-xl bg-base-200 dark:bg-base-300/80 border border-base-content/12 dark:border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                    autoFocus
                  />
                </div>
                <span className="text-sm font-black text-base-content/50 select-none">=</span>
                <div
                  className={`w-28 sm:w-36 shrink-0 input h-8 rounded-xl bg-base-200 dark:bg-base-300 border border-base-content/12 flex items-center justify-end px-2.5 font-mono font-black text-xs select-none truncate ${
                    evaluatedPrincipal > 0 ? "text-primary border-primary/40 bg-primary/10" : "text-base-content/40"
                  }`}
                  title={`Principal: ₹${evaluatedPrincipal.toLocaleString()}`}
                >
                  ₹{evaluatedPrincipal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* 3. Start Date & End Date */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                <div>
                  <label className="block font-black text-base-content/85 text-[10.5px] uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input h-8 w-full rounded-xl bg-base-200 dark:bg-base-300/80 border border-base-content/12 dark:border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content shadow-xs transition-all px-2.5"
                  />
                </div>

                <div>
                  <label className="block font-black text-base-content/85 text-[10.5px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>End Date (Maturity) *</span>
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="input h-8 w-full rounded-xl bg-base-200 dark:bg-base-300/80 border border-base-content/12 dark:border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content shadow-xs transition-all px-2.5"
                  />
                </div>
              </div>

              {/* Calculated Tenure Ribbon */}
              {startDate && maturityDate && !dayjs(maturityDate).isBefore(dayjs(startDate)) && (
                <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9.5px] uppercase font-black text-primary shrink-0">
                      Tenure:
                    </span>
                    <span className="text-xs font-black text-base-content font-mono truncate">
                      {calculations.tenureYears}y, {calculations.tenureMonths}m, {calculations.tenureDays}d
                    </span>
                  </div>
                  <span className="badge badge-sm font-mono font-black bg-primary text-primary-content border-0 shrink-0 text-[10px]">
                    {calculations.totalDays} Days
                  </span>
                </div>
              )}
            </div>

            {/* 4. Rate of Interest & FD Account Number */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              <div>
                <label className="block font-black text-base-content/85 text-[10.5px] uppercase tracking-wider mb-1.5">
                  Rate of Interest (% p.a.) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7.10"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="input h-8 w-full pl-3 pr-10 rounded-xl bg-base-200 dark:bg-base-300/80 border border-base-content/12 dark:border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">%</span>
                </div>
              </div>

              <div>
                <label className="block font-black text-base-content/85 text-[10.5px] uppercase tracking-wider mb-1.5">
                  FD Account Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono font-black text-xs">#</span>
                  <input
                    type="text"
                    placeholder="e.g. FD98234"
                    value={fdNumber}
                    onChange={(e) => setFdNumber(e.target.value)}
                    className="input h-8 w-full pl-7 rounded-xl bg-base-200 dark:bg-base-300/80 border border-base-content/12 dark:border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Pinned Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-base-content/8 dark:border-base-content/8 bg-base-200/40 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost font-bold rounded-xl cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black rounded-xl gap-1.5 shadow-md shadow-emerald-600/30 border-0 h-9 px-4 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs text-white"></span>
              ) : (
                <>
                  <Save size={15} className="text-white shrink-0" />
                  <span>{isEdit ? "Update FD" : "Save FD"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* =================================================================== */}
      {/* MOBILE COMPACT MODAL (Visible on Phone: flex sm:hidden)            */}
      {/* =================================================================== */}
      <div className="flex sm:hidden bg-base-100 rounded-2xl shadow-2xl border border-base-content/12 dark:border-base-content/12 w-full max-w-[390px] max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex-col">
        {/* Compact Header */}
        <div className="px-3.5 py-2.5 border-b border-base-content/8 dark:border-base-content/8 flex justify-between items-center bg-base-200/40 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Landmark size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs flex items-center gap-1.5 leading-tight text-base-content truncate">
                <span>{isEdit ? "Edit Fixed Deposit" : "Add Fixed Deposit"}</span>
              </h3>
              <p className="text-[10px] text-base-content/55 font-medium leading-tight truncate">
                FD investment details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/60 hover:text-base-content cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Compact Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-3 space-y-2.5 text-xs flex-1">
            {errorMsg && (
              <div className="alert alert-error text-xs py-1.5 px-2.5 rounded-lg flex items-center gap-2 shadow-xs font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}

            {/* 1. Bank Name */}
            <div>
              <label className="block font-black text-base-content/80 text-[10px] uppercase tracking-wider mb-1">
                Bank / Institution *
              </label>
              <BankAutocomplete
                value={bankName}
                onChange={setBankName}
                placeholder="e.g. State Bank of India, HDFC..."
              />
            </div>

            {/* 2. Amount Deposited */}
            <div>
              <label className="block font-black text-base-content/80 text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Deposit Amount (₹) *</span>
                <span className="text-[8.5px] lowercase font-bold text-primary/90 bg-primary/10 px-1.5 py-0.2 rounded">supports: + - * /</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-black text-xs text-primary">₹</span>
                  <input
                    type="text"
                    placeholder="e.g. 100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input h-8 w-full pl-6 rounded-lg bg-base-200 dark:bg-base-300/80 border border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  />
                </div>
                <span className="text-xs font-black text-base-content/40 select-none">=</span>
                <div
                  className={`w-24 shrink-0 input h-8 rounded-lg bg-base-200 dark:bg-base-300 border border-base-content/12 flex items-center justify-end px-2 font-mono font-black text-[11px] select-none truncate ${
                    evaluatedPrincipal > 0 ? "text-primary border-primary/40 bg-primary/10" : "text-base-content/40"
                  }`}
                  title={`Principal: ₹${evaluatedPrincipal.toLocaleString()}`}
                >
                  ₹{evaluatedPrincipal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* 3. Start Date & End Date */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-base-content/80 text-[10px] uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input h-8 w-full rounded-lg bg-base-200 dark:bg-base-300/80 border border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content shadow-xs transition-all px-2"
                  />
                </div>
                <div>
                  <label className="block font-black text-base-content/80 text-[10px] uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="input h-8 w-full rounded-lg bg-base-200 dark:bg-base-300/80 border border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-bold text-base-content shadow-xs transition-all px-2"
                  />
                </div>
              </div>

              {/* Calculated Tenure Inline Ribbon */}
              {startDate && maturityDate && !dayjs(maturityDate).isBefore(dayjs(startDate)) && (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-1 text-[10.5px]">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[8.5px] uppercase font-black text-emerald-600 dark:text-emerald-400 shrink-0">Tenure:</span>
                    <span className="font-bold text-base-content font-mono truncate text-[10.5px]">
                      {calculations.tenureYears}y, {calculations.tenureMonths}m, {calculations.tenureDays}d
                    </span>
                  </div>
                  <span className="badge badge-xs font-mono font-bold bg-emerald-600 text-white border-0 shrink-0 text-[9px] px-1.5 py-0.5">
                    {calculations.totalDays} Days
                  </span>
                </div>
              )}
            </div>

            {/* 4. Rate of Interest & FD Account Number */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-black text-base-content/80 text-[10px] uppercase tracking-wider mb-1">
                  Interest Rate (% p.a.) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7.10"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="input h-8 w-full pl-2.5 pr-6 rounded-lg bg-base-200 dark:bg-base-300/80 border border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px] font-black text-primary">%</span>
                </div>
              </div>
              <div>
                <label className="block font-black text-base-content/80 text-[10px] uppercase tracking-wider mb-1">
                  FD # (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary font-mono font-black text-[11px]">#</span>
                  <input
                    type="text"
                    placeholder="e.g. FD98234"
                    value={fdNumber}
                    onChange={(e) => setFdNumber(e.target.value)}
                    className="input h-8 w-full pl-6 rounded-lg bg-base-200 dark:bg-base-300/80 border border-base-content/12 hover:border-base-content/30 focus:border-primary focus:bg-base-100 text-xs font-mono font-bold text-base-content placeholder:text-base-content/40 shadow-xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 5. Live Estimated Maturity Summary */}
            {evaluatedPrincipal > 0 && Number(interestRate) > 0 && (
              <div className="px-2.5 py-1.5 rounded-lg bg-base-200/60 border border-base-content/8 flex items-center justify-between text-[10.5px] font-mono">
                <span className="text-[8.5px] uppercase font-bold text-base-content/50">Est. Maturity:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    ₹{calculations.maturityAmount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[9.5px] text-base-content/50">
                    (+₹{calculations.totalInterest.toLocaleString("en-IN")})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className="px-3.5 py-2.5 border-t border-base-content/8 dark:border-base-content/8 bg-base-200/40 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-xs btn-ghost font-bold rounded-lg cursor-pointer text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-lg gap-1 shadow-xs border-0 h-8 px-3.5 cursor-pointer text-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs text-white"></span>
              ) : (
                <>
                  <Save size={13} className="text-white shrink-0" />
                  <span>{isEdit ? "Update FD" : "Save FD"}</span>
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
