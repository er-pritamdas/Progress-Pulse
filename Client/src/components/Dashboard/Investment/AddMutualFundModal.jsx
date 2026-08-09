import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  PieChart,
  Building2,
  Layers,
  ShieldCheck,
  Check,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Hash,
  TrendingUp,
  Coins,
  CheckCircle2,
  AlertCircle,
  Landmark,
} from "lucide-react";

/**
 * AMC Options Preset List
 */
export const AMC_OPTIONS = [
  "Aditya Birla Sun Life Mutual Fund",
  "Axis Mutual Fund",
  "Bandhan Mutual Fund",
  "Bank of India Mutual Fund",
  "Baroda BNP Paribas Mutual Fund",
  "Canara Robeco Mutual Fund",
  "DSP Mutual Fund",
  "Edelweiss Mutual Fund",
  "Franklin Templeton Mutual Fund",
  "HDFC Mutual Fund",
  "HSBC Mutual Fund",
  "ICICI Prudential Mutual Fund",
  "Invesco Mutual Fund",
  "Kotak Mahindra Mutual Fund",
  "LIC Mutual Fund",
  "Mahindra Manulife Mutual Fund",
  "Mirae Asset Mutual Fund",
  "Motilal Oswal Mutual Fund",
  "Nippon India Mutual Fund",
  "Parag Parikh Mutual Fund",
  "PGIM India Mutual Fund",
  "Quant Mutual Fund",
  "SBI Mutual Fund",
  "Tata Mutual Fund",
  "The Wealth Company Mutual Fund",
  "UTI Mutual Fund",
  "Zerodha Fund House",
];

/**
 * Category & Sub-Category Options Dictionary
 */
export const CATEGORY_SUBOPTIONS = {
  Equity: [
    "Flexi Cap",
    "Large Cap",
    "Large & Mid Cap",
    "Mid Cap",
    "Small Cap",
    "Multi Cap",
    "Value",
    "Contra",
    "Focused",
    "Dividend Yield",
    "ELSS / Tax Saver",
    "Sectoral",
    "Thematic",
  ],
  Hybrid: [
    "Conservative Hybrid",
    "Balanced Hybrid",
    "Aggressive Hybrid",
    "Dynamic Asset Allocation / Balanced Advantage",
    "Multi Asset Allocation",
    "Arbitrage",
    "Equity Savings",
  ],
  Debt: [
    "Overnight",
    "Liquid",
    "Ultra Short Duration",
    "Low Duration",
    "Money Market",
    "Short Duration",
    "Medium Duration",
    "Medium to Long Duration",
    "Long Duration",
    "Dynamic Bond",
    "Corporate Bond",
    "Credit Risk",
    "Banking & PSU Debt",
    "Gilt",
    "Gilt with 10-Year Constant Duration",
    "Floater",
  ],
  Other: [
    "Index Fund",
    "Fund of Funds",
    "Gold",
    "Silver",
    "International / Overseas",
    "Solution Oriented",
    "Retirement",
    "Children's Fund",
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  AMC Autocomplete Search Component
 * ───────────────────────────────────────────────────────────────────────────── */
function AmcAutocomplete({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) return AMC_OPTIONS;
    const lowerQ = query.toLowerCase();
    return AMC_OPTIONS.filter((amc) => amc.toLowerCase().includes(lowerQ));
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-amc-item]");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (amc) => {
      setQuery(amc);
      onChange(amc);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Highlight matching text in suggestion
  const renderHighlightedText = (text) => {
    if (!query.trim()) return text;
    const lowerText = text.toLowerCase();
    const lowerQ = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-black bg-primary/10 rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const isCustomAmc =
    query.trim().length > 0 &&
    !AMC_OPTIONS.some((a) => a.toLowerCase() === query.trim().toLowerCase());

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Search
            size={14}
            className="text-base-content/40 group-focus-within:text-primary transition-colors duration-200"
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search or type AMC name..."}
          className="input input-sm input-bordered w-full rounded-xl font-bold text-xs pl-9 pr-8
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60
                     transition-all duration-200 bg-base-100"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md
                     text-base-content/40 hover:text-primary transition-colors cursor-pointer"
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-[9999] top-full left-0 right-0 mt-1.5 bg-base-100 border border-base-300
                     rounded-2xl shadow-2xl shadow-black/15 overflow-hidden
                     animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Results header */}
          <div className="px-3 py-2 bg-base-200/60 border-b border-base-200 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider">
              {suggestions.length > 0
                ? `${suggestions.length} AMC${suggestions.length > 1 ? "s" : ""} found`
                : "No matches"}
            </span>
            {isCustomAmc && suggestions.length === 0 && (
              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                <Plus size={10} /> Custom AMC
              </span>
            )}
          </div>

          {/* Suggestion list */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-52 overflow-y-auto overscroll-contain"
          >
            {suggestions.length > 0 ? (
              suggestions.map((amc, idx) => {
                const isHighlighted = idx === highlightedIndex;
                const isSelected =
                  amc.toLowerCase() === query.trim().toLowerCase();
                return (
                  <button
                    key={amc}
                    type="button"
                    data-amc-item
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(amc)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-100 cursor-pointer
                      ${
                        isHighlighted
                          ? "bg-primary/8 text-base-content"
                          : "text-base-content/80 hover:bg-base-200/60"
                      }
                      ${isSelected ? "bg-primary/10" : ""}
                    `}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black transition-colors duration-100
                        ${
                          isHighlighted || isSelected
                            ? "bg-primary/15 text-primary"
                            : "bg-base-200 text-base-content/50"
                        }`}
                    >
                      {isSelected ? (
                        <Check size={13} />
                      ) : (
                        amc.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate leading-tight">
                        {renderHighlightedText(amc)}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center">
                <div className="text-base-content/30 mb-2">
                  <Landmark size={24} className="mx-auto" />
                </div>
                <p className="text-xs font-bold text-base-content/60">
                  No matching AMC found
                </p>
                <p className="text-[10px] text-base-content/40 mt-0.5">
                  "<span className="font-bold text-primary">{query}</span>" will
                  be used as a custom AMC
                </p>
              </div>
            )}
          </div>

          {/* Custom AMC hint at bottom */}
          {isCustomAmc && suggestions.length > 0 && (
            <div className="px-3 py-2 bg-base-200/40 border-t border-base-200 flex items-center gap-2">
              <Plus size={11} className="text-primary shrink-0" />
              <span className="text-[10px] text-base-content/60">
                Press <kbd className="kbd kbd-xs font-mono">Enter</kbd> or keep
                typing to use "
                <span className="font-bold text-primary">{query}</span>" as
                custom AMC
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  Main Modal — Two-Panel Layout (Left + Right)
 * ───────────────────────────────────────────────────────────────────────────── */
export default function AddMutualFundModal({
  isOpen,
  onClose,
  onSaveFund,
  initialData = null,
}) {
  if (!isOpen) return null;

  // ─── Form State ──────────────────────────────────────────────────────────
  const [amc, setAmc] = useState("");
  const [folioNumber, setFolioNumber] = useState("");

  const [category, setCategory] = useState("Equity");
  const [subCategory, setSubCategory] = useState(
    CATEGORY_SUBOPTIONS["Equity"][0]
  );
  const [plan, setPlan] = useState("Direct");
  const [optionType, setOptionType] = useState("Growth");
  const [investmentType, setInvestmentType] = useState("SIP");

  // Validation
  const [errorMsg, setErrorMsg] = useState("");

  // ─── Pre-fill for Edit Mode ──────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setAmc(initialData.amc || "");
      setFolioNumber(initialData.folioNumber || "");
      setCategory(initialData.category || "Equity");
      setSubCategory(
        initialData.subCategory ||
          CATEGORY_SUBOPTIONS[initialData.category || "Equity"]?.[0] ||
          ""
      );
      setPlan(initialData.plan || "Direct");
      setOptionType(initialData.optionType || "Growth");
      setInvestmentType(initialData.investmentType || "SIP");
    }
  }, [initialData]);

  // When main category changes, reset sub-category
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const subOpts = CATEGORY_SUBOPTIONS[newCat] || [];
    setSubCategory(subOpts[0] || "");
  };

  const effectiveAmc = amc.trim();
  const isFormValid = effectiveAmc.length > 0;

  // Category visual config
  const categoryMeta = {
    Equity: {
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    Hybrid: {
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    Debt: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    Other: {
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!effectiveAmc) {
      setErrorMsg("Please select or enter an AMC / Fund House Name.");
      return;
    }

    const payload = {
      schemeName: effectiveAmc,        // use AMC as scheme name for table compat
      amc: effectiveAmc,
      category,
      subCategory,
      plan,
      optionType,
      folioNumber: folioNumber.trim(),
      investmentType,
      investedAmount: 0,
      units: 0,
      nav: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    };

    if (onSaveFund) {
      onSaveFund(payload, !!initialData);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md overflow-y-auto overflow-x-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col lg:flex-row items-stretch gap-0 w-full max-w-[920px] mx-auto my-auto"
        style={{
          animation: "mfModalEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* ================================================================= */}
        {/*  LEFT PANEL — AMC Name & Folio Number                             */}
        {/* ================================================================= */}
        <div className="bg-base-100 border border-base-300 lg:border-r-0 rounded-3xl lg:rounded-r-none shadow-2xl w-full lg:w-[420px] flex flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-base-200 bg-base-200/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/12 text-primary rounded-xl">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-base-content">
                  {initialData ? "Edit Mutual Fund" : "Add Mutual Fund"}
                </h2>
                <p className="text-[10px] text-base-content/55">
                  Fund House & Folio Details
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-circle btn-xs btn-ghost text-base-content/40 hover:text-base-content hover:bg-base-200 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
            {/* Validation Banner */}
            {errorMsg && (
              <div
                className="p-3 bg-error/10 border border-error/30 text-error rounded-xl font-semibold flex items-center gap-2 text-xs"
                style={{
                  animation:
                    "mfShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
                }}
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* AMC Search */}
            <div className="space-y-2">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center gap-1.5">
                <Landmark size={13} className="text-primary" />
                AMC (Asset Management Company){" "}
                <span className="text-error">*</span>
              </label>
              <AmcAutocomplete
                value={amc}
                onChange={setAmc}
                placeholder="Search or type AMC name..."
              />
              <p className="text-[10px] text-base-content/40 pl-1">
                Type to search 27 AMCs or enter a custom fund house
              </p>
            </div>

            {/* Folio Number */}
            <div className="space-y-2">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center gap-1.5">
                <Hash size={13} className="text-base-content/50" />
                Folio Number
                <span className="text-[10px] font-semibold text-base-content/35 ml-auto">
                  Optional
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. 910283912/12"
                className="input input-sm input-bordered w-full rounded-xl font-bold text-xs
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60
                           transition-all duration-200"
                value={folioNumber}
                onChange={(e) => setFolioNumber(e.target.value)}
              />
            </div>

            {/* Spacer pushes the preview chip to the bottom */}
            <div className="flex-1" />

            {/* Live Preview Card */}
            {effectiveAmc && (
              <div
                className="bg-base-200/50 p-3.5 rounded-2xl border border-base-300/60 space-y-2.5"
                style={{ animation: "mfFadeIn 0.25s ease-out" }}
              >
                <div className="text-[9px] font-black text-base-content/40 uppercase tracking-widest">
                  Preview
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {effectiveAmc.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-base-content truncate leading-tight">
                      {effectiveAmc}
                    </div>
                    <div className="text-[10px] text-base-content/50 flex items-center gap-1.5 mt-0.5">
                      <span>{plan} Plan</span>
                      <span className="text-base-content/25">•</span>
                      <span>{optionType}</span>
                      <span className="text-base-content/25">•</span>
                      <span className={categoryMeta[category]?.color}>
                        {category}
                      </span>
                    </div>
                  </div>
                </div>
                {folioNumber.trim() && (
                  <div className="text-[10px] text-base-content/50 pt-1 border-t border-base-300/50">
                    Folio:{" "}
                    <span className="font-bold text-base-content/70 font-mono">
                      {folioNumber}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/*  RIGHT PANEL — Category, Plan & Option Type                       */}
        {/* ================================================================= */}
        <div className="bg-base-100 border border-base-300 lg:border-l-0 rounded-3xl lg:rounded-l-none shadow-2xl w-full lg:w-[500px] flex flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-base-200 bg-base-200/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-secondary/12 text-secondary rounded-xl">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-base-content">
                  Classification & Plan
                </h3>
                <p className="text-[10px] text-base-content/55">
                  Category, Sub-Option & Investment Mode
                </p>
              </div>
            </div>
            {isFormValid && (
              <span className="flex items-center gap-1 text-[10px] text-success font-bold">
                <CheckCircle2 size={12} />
                Ready
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
            {/* ── Category ────────────────────────────────────── */}
            <div className="space-y-2.5">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center gap-1.5">
                <PieChart size={13} className="text-secondary" />
                Asset Category <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(CATEGORY_SUBOPTIONS).map((catName) => {
                  const isSelected = category === catName;
                  const meta = categoryMeta[catName];
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => handleCategoryChange(catName)}
                      className={`p-2.5 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border
                        ${
                          isSelected
                            ? `${meta.bg} ${meta.color} ${meta.border} shadow-sm`
                            : "bg-base-200/80 border-transparent hover:bg-base-300/80 text-base-content/55"
                        }`}
                    >
                      {isSelected && (
                        <Check size={12} strokeWidth={3} className="shrink-0" />
                      )}
                      <span>{catName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Sub-Category ────────────────────────────────── */}
            <div className="space-y-2">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers size={12} className="text-base-content/50" />
                  Sub-Category <span className="text-error">*</span>
                </span>
                <span className="text-[10px] font-semibold text-base-content/35">
                  {CATEGORY_SUBOPTIONS[category]?.length || 0} options
                </span>
              </label>
              <select
                className="select select-sm select-bordered w-full rounded-xl font-extrabold text-xs
                           focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/60
                           transition-all duration-200"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                {(CATEGORY_SUBOPTIONS[category] || []).map((subOpt, idx) => (
                  <option key={idx} value={subOpt}>
                    {subOpt}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="border-t border-base-200/80" />

            {/* ── Plan (Direct / Regular) ─────────────────────── */}
            <div className="space-y-2">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-accent" />
                Plan <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Direct", "Regular"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`p-2.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border
                      ${
                        plan === p
                          ? "bg-primary/12 text-primary border-primary/25 shadow-sm"
                          : "bg-base-200/80 border-transparent text-base-content/55 hover:bg-base-300/80"
                      }`}
                  >
                    {plan === p && <Check size={12} strokeWidth={3} />}
                    <span>{p} Plan</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Option Type (Growth / IDCW) ─────────────────── */}
            <div className="space-y-2">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-base-content/50" />
                Return Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "Growth", label: "Growth" },
                  { key: "IDCW", label: "IDCW (Dividend)" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setOptionType(opt.key)}
                    className={`p-2.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border
                      ${
                        optionType === opt.key
                          ? "bg-accent/12 text-accent border-accent/25 shadow-sm"
                          : "bg-base-200/80 border-transparent text-base-content/55 hover:bg-base-300/80"
                      }`}
                  >
                    {optionType === opt.key && (
                      <Check size={12} strokeWidth={3} />
                    )}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Investment Mode (SIP / Lumpsum) ────────────── */}
            <div className="space-y-2">
              <label className="label-text text-xs font-extrabold text-base-content/90 flex items-center gap-1.5">
                <Coins size={13} className="text-base-content/50" />
                Investment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "SIP", label: "SIP (Systematic)", icon: TrendingUp },
                  { key: "Lumpsum", label: "Lumpsum", icon: Coins },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setInvestmentType(mode.key)}
                    className={`p-2.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border
                      ${
                        investmentType === mode.key
                          ? "bg-primary/12 text-primary border-primary/25 shadow-sm"
                          : "bg-base-200/80 border-transparent text-base-content/55 hover:bg-base-300/80"
                      }`}
                  >
                    {investmentType === mode.key && (
                      <Check size={12} strokeWidth={3} />
                    )}
                    <mode.icon size={13} className="shrink-0" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-base-200 bg-base-200/40 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl text-base-content/55 hover:text-base-content gap-1 cursor-pointer"
            >
              <X size={14} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`btn btn-sm rounded-xl px-5 font-black shadow-md gap-1.5 transition-all duration-200 cursor-pointer
                ${
                  isFormValid
                    ? "btn-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95"
                    : "btn-disabled opacity-50"
                }`}
            >
              {initialData ? (
                <>
                  <Check size={14} />
                  <span>Update Fund</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Save Fund</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes mfModalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes mfFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mfShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
