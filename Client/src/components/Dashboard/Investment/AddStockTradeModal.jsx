import React, { useState, useEffect, useMemo } from "react";
import CallyDatePicker, { formatDateDDMMMYYYY } from "../DatePicker";
import {
  X,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Shield,
  Tag,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Calculator,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AddStockTradeModal({
  isOpen,
  onClose,
  onSaveTrade,
  initialData = null,
}) {
  if (!isOpen) return null;

  // ----------------------------------------------------------------------
  // Form State
  // ----------------------------------------------------------------------
  // Wizard Active Step (1: Buy Details, 2: Sell Details)
  const [step, setStep] = useState(1);

  // Section 1: Basic Stock Info (Mandatory)
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("Zerodha");
  const [cap, setCap] = useState("Large");
  const [exchange, setExchange] = useState("NSE");
  const [term, setTerm] = useState("Delivery");

  // Section 2: Buy Details (Mandatory)
  const [bDate, setBDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bShare, setBShare] = useState("");
  const [bQty, setBQty] = useState("");
  const [bTt, setBTt] = useState("");
  const [bBkg, setBBkg] = useState("20");
  const [bPdc, setBPdc] = useState("0");

  // Section 3: Sell Details (Optional)
  const [isSold, setIsSold] = useState(false);
  const [sDate, setSDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sShare, setSShare] = useState("");
  const [sQty, setSQty] = useState("");
  const [sTt, setSTt] = useState("");
  const [sBkg, setSBkg] = useState("20");
  const [sPdc, setSPdc] = useState("0");
  const [dp, setDp] = useState("15.93");

  // Form Validation Message
  const [errorMsg, setErrorMsg] = useState("");

  // Right Popup Carousel State & Ref
  const [activeRightSlide, setActiveRightSlide] = useState(0);
  const rightScrollRef = React.useRef(null);

  const scrollToSlide = (slideIndex) => {
    setActiveRightSlide(slideIndex);
    if (rightScrollRef.current) {
      const slideWidth = rightScrollRef.current.clientWidth;
      rightScrollRef.current.scrollTo({
        left: slideIndex * slideWidth,
        behavior: "smooth",
      });
    }
  };

  const handleRightScroll = (e) => {
    const slideWidth = e.target.clientWidth;
    if (slideWidth > 0) {
      const currentSlide = Math.round(e.target.scrollLeft / slideWidth);
      if (currentSlide !== activeRightSlide) {
        setActiveRightSlide(currentSlide);
      }
    }
  };

  // Auto-scroll right popup when step changes (Step 2 Sell Details -> Slide 1 Realized PnL)
  useEffect(() => {
    if (step === 2) {
      scrollToSlide(1);
    } else if (step === 1) {
      scrollToSlide(0);
    }
  }, [step]);

  // Pre-fill state when in Edit Mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPlatform(initialData.platform || "Zerodha");
      setCap(initialData.cap || "Large");
      setExchange(initialData.exchange || "NSE");
      setTerm(initialData.term || "Delivery");

      setBDate(initialData.bDate || new Date().toISOString().split("T")[0]);
      setBShare(initialData.bShare ? initialData.bShare.toString() : "");
      setBQty(initialData.bQty ? initialData.bQty.toString() : "");
      setBTt(initialData.bTt ? initialData.bTt.toString() : "");
      setBBkg(initialData.bBkg !== undefined ? initialData.bBkg.toString() : "20");
      setBPdc(initialData.bPdc !== undefined ? initialData.bPdc.toString() : "0");

      const hasSell =
        (initialData.sQty && parseFloat(initialData.sQty) > 0) ||
        (initialData.sDate && initialData.sDate !== "-");
      setIsSold(hasSell);

      if (hasSell) {
        setSDate(initialData.sDate || new Date().toISOString().split("T")[0]);
        setSShare(initialData.sShare ? initialData.sShare.toString() : "");
        setSQty(initialData.sQty ? initialData.sQty.toString() : "");
        setSTt(initialData.sTt ? initialData.sTt.toString() : "");
        setSBkg(initialData.sBkg !== undefined ? initialData.sBkg.toString() : "20");
        setSPdc(initialData.sPdc !== undefined ? initialData.sPdc.toString() : "0");
        setDp(initialData.dp !== undefined ? initialData.dp.toString() : "15.93");
      } else {
        setSDate(new Date().toISOString().split("T")[0]);
        setSShare("");
        setSQty("");
        setSTt("");
        setSBkg("20");
        setSPdc("0");
        setDp("15.93");
      }
      setStep(1);
    } else {
      setName("");
      setPlatform("Zerodha");
      setCap("Large");
      setExchange("NSE");
      setTerm("Delivery");
      setBDate(new Date().toISOString().split("T")[0]);
      setBShare("");
      setBQty("");
      setBTt("");
      setBBkg("20");
      setBPdc("0");
      setIsSold(false);
      setSDate(new Date().toISOString().split("T")[0]);
      setSShare("");
      setSQty("");
      setSTt("");
      setSBkg("20");
      setSPdc("0");
      setDp("15.93");
      setStep(1);
    }
  }, [initialData, isOpen]);

  // ----------------------------------------------------------------------
  // Step Validation Checkers
  // ----------------------------------------------------------------------
  const isStep1Complete = useMemo(() => name.trim().length > 0, [name]);

  const numBShare = parseFloat(bShare) || 0;
  const numBQty = parseFloat(bQty) || 0;

  const isStep2Complete = useMemo(() => {
    return isStep1Complete && numBShare > 0 && numBQty > 0;
  }, [isStep1Complete, numBShare, numBQty]);

  // ----------------------------------------------------------------------
  // Reactive Auto-Calculations
  // ----------------------------------------------------------------------
  // Total = Share P * Share Q
  const bStock = useMemo(() => numBShare * numBQty, [numBShare, numBQty]);

  const numBBkg = parseFloat(bBkg) || 0;
  const numBPdc = parseFloat(bPdc) || 0;
  const bBkgPdc = useMemo(() => numBBkg + numBPdc, [numBBkg, numBPdc]);

  const numBTt = parseFloat(bTt) || 0;
  // Effective Buy TT divisor: uses numBTt if typed (>0), else defaults to numBQty
  const effectiveBtDivisor = useMemo(() => {
    if (numBTt > 0) return numBTt;
    return numBQty > 0 ? numBQty : 1;
  }, [numBTt, numBQty]);

  // Final Buy Share Price: [Share Price + (Total Charges / TT)]
  const bFShare = useMemo(() => {
    if (numBShare <= 0) return 0;
    return numBShare + bBkgPdc / effectiveBtDivisor;
  }, [numBShare, bBkgPdc, effectiveBtDivisor]);

  // Final Buy Stock Cost: [Share Quantity * Final Share Price]
  const bFStock = useMemo(() => {
    return numBQty * bFShare;
  }, [numBQty, bFShare]);

  // SELL CALCULATIONS
  const numSShare = parseFloat(sShare) || 0;
  const numSQty = parseFloat(sQty) || 0;
  const sStock = useMemo(() => numSShare * numSQty, [numSShare, numSQty]);

  const numSBkg = parseFloat(sBkg) || 0;
  const numSPdc = parseFloat(sPdc) || 0;
  const numDp = parseFloat(dp) || 0;
  const sBkgPdc = useMemo(() => numSBkg + numSPdc, [numSBkg, numSPdc]);

  const numSTt = parseFloat(sTt) || 0;
  const effectiveStDivisor = useMemo(() => {
    if (numSTt > 0) return numSTt;
    return numSQty > 0 ? numSQty : 1;
  }, [numSTt, numSQty]);

  // Final Sell Share Price: [Share Price - ((Total Charges / TT) + (DP / Share Qty))]
  const sFShare = useMemo(() => {
    if (!isSold || numSShare <= 0) return 0;
    const sellChargesDivTt = sBkgPdc / effectiveStDivisor;
    const dpPerShare = numSQty > 0 ? numDp / numSQty : 0;
    return numSShare - (sellChargesDivTt + dpPerShare);
  }, [isSold, numSShare, sBkgPdc, effectiveStDivisor, numSQty, numDp]);

  // Final Sell Stock Price: [Final Sell Share Price * Share Quantity]
  const sFStock = useMemo(() => {
    if (!isSold) return 0;
    return numSQty * sFShare;
  }, [isSold, numSQty, sFShare]);

  // POSITION & GAIN CALCULATIONS
  const qLeft = useMemo(() => {
    if (!isSold) return numBQty;
    return Math.max(0, numBQty - numSQty);
  }, [isSold, numBQty, numSQty]);

  // Auto-clamp Sell Quantity so it never exceeds Buy Quantity
  useEffect(() => {
    if (numBQty > 0 && numSQty > numBQty) {
      setSQty(numBQty.toString());
      setErrorMsg(`Sell Quantity capped to maximum Buy Quantity (${numBQty}).`);
    }
  }, [numBQty, numSQty]);

  // Auto-detect Term (Intraday if buy date === sell date & sold)
  useEffect(() => {
    if (isSold && bDate && sDate && bDate === sDate) {
      setTerm("Intraday");
      setDp("0"); // No DP for Intraday
    } else if (isSold && bDate && sDate && bDate !== sDate) {
      setTerm("Delivery");
      if (dp === "0") setDp("15.93");
    }
  }, [isSold, bDate, sDate]);

  // Holding Period in Days
  const holdingDays = useMemo(() => {
    if (!bDate || !isSold || !sDate) return 0;
    const d1 = new Date(bDate);
    const d2 = new Date(sDate);
    const diffTime = d2.getTime() - d1.getTime();
    if (isNaN(diffTime) || diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [bDate, isSold, sDate]);

  // Holding Term Classification based on Excel formula
  const getHoldingTermLabel = (days) => {
    if (!bDate || !isSold || !sDate) return "";
    if (days <= 1) return "Intraday (1D)";
    if (days <= 2) return "BTST (2D)";
    if (days <= 29) return "Swing (2D-1M)";
    if (days <= 90) return "Positional (1M-3M)";
    if (days <= 270) return "Short Term (3M-6M)";
    if (days <= 360) return "Medium Term (6M-1Y)";
    return "Long Term (1Y-Max)";
  };

  // Realized Profit & Loss (₹) and (%)
  const gainRs = useMemo(() => {
    if (!isSold || numSQty <= 0) return 0;
    const costForSoldQty = numSQty * bFShare;
    return sFStock - costForSoldQty;
  }, [isSold, numSQty, bFShare, sFStock]);

  const gainPct = useMemo(() => {
    if (!isSold || numSQty <= 0) return 0;
    const costForSoldQty = numSQty * bFShare;
    if (costForSoldQty <= 0) return 0;
    return (gainRs / costForSoldQty) * 100;
  }, [isSold, numSQty, bFShare, gainRs]);

  // Format INR Helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  // ----------------------------------------------------------------------
  // Step Navigation Controls
  // ----------------------------------------------------------------------
  const handleGoToStep = (targetStep) => {
    setErrorMsg("");

    if (targetStep === 2) {
      if (!isStep1Complete) {
        setErrorMsg("Please enter Stock Name in Basic Info panel to proceed.");
        return;
      }
      if (!isStep2Complete) {
        setErrorMsg("Please enter valid Buy Share Price and Share Qty to proceed to Sell Details.");
        return;
      }
      setIsSold(true);
      setStep(2);
    } else {
      setStep(targetStep);
    }
  };

  // ----------------------------------------------------------------------
  // Handle Final Submit
  // ----------------------------------------------------------------------
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!isStep1Complete) {
      setErrorMsg("Please enter Stock Name in the Basic Info panel.");
      return;
    }

    if (!isStep2Complete) {
      setErrorMsg("Please complete Buy Details.");
      setStep(1);
      return;
    }

    if (isSold) {
      if (!sShare || numSShare <= 0) {
        setErrorMsg("Please enter a valid Sell Share Price.");
        setStep(2);
        return;
      }
      if (!sQty || numSQty <= 0 || numSQty > numBQty) {
        setErrorMsg("Sell Quantity must be greater than 0 and <= Buy Quantity.");
        setStep(2);
        return;
      }
    }

    const stockTradeObj = {
      id: initialData ? initialData.id : `STK-${Date.now()}`,
      slNo: initialData ? initialData.slNo : 1,
      name: name.trim().toUpperCase(),
      platform,
      cap,
      exchange,
      term,
      // Buy Details
      bDate,
      bShare: numBShare,
      bQty: numBQty,
      bStock,
      bBkg: numBBkg,
      bPdc: numBPdc,
      bBkgPdc,
      bFShare: parseFloat(bFShare.toFixed(2)),
      bFStock: parseFloat(bFStock.toFixed(2)),
      bTt: numBTt,
      // Sell Details
      sDate: isSold ? sDate : "-",
      sShare: isSold ? numSShare : 0,
      sQty: isSold ? numSQty : 0,
      sStock: isSold ? sStock : 0,
      sBkg: isSold ? numSBkg : 0,
      sPdc: isSold ? numSPdc : 0,
      dp: isSold ? numDp : 0,
      sBkgPdc: isSold ? sBkgPdc : 0,
      sFShare: isSold ? parseFloat(sFShare.toFixed(2)) : 0,
      sFStock: isSold ? parseFloat(sFStock.toFixed(2)) : 0,
      sTt: isSold ? numSTt : 0,
      // Summary
      period: holdingDays,
      qLeft,
      gainRs: isSold ? parseFloat(gainRs.toFixed(2)) : 0,
      gainPct: isSold ? parseFloat(gainPct.toFixed(2)) : 0,
    };

    onSaveTrade(stockTradeObj, !!initialData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
      {/* Side-by-Side Dual/Triple Popup Container */}
      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 w-full max-w-[1440px] mx-auto my-auto">
        
        {/* =================================================================== */}
        {/* LEFT PANEL: Basic Stock Info (Always Visible)                       */}
        {/* =================================================================== */}
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl w-full lg:w-72 flex flex-col overflow-hidden shrink-0">
          {/* Left Panel Header */}
          <div className="px-5 py-4 border-b border-base-200 bg-base-200/50 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-extrabold text-sm tracking-tight text-base-content">
                  Basic Stock Info
                </h3>
                <p className="text-[10px] text-base-content/60">
                  Stock Metadata • Required
                </p>
              </div>
            </div>
            <span className="badge badge-error badge-xs font-bold">
              Mandatory
            </span>
          </div>

          {/* Left Panel Body */}
          <div className="p-5 overflow-y-auto scroll-hidden overflow-x-hidden flex-1 space-y-3 text-xs">
            {/* Stock Name */}
            <div className="space-y-1">
              <label className="label-text text-xs font-bold text-base-content/80">
                Stock Symbol / Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. RELIANCE, INFY"
                  className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-bold text-xs uppercase pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-1">
              <label className="label-text text-xs font-bold text-base-content/80">
                Platform / Broker <span className="text-error">*</span>
              </label>
              <select
                className="select select-sm select-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-semibold text-xs"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="Zerodha">Zerodha</option>
                <option value="Groww">Groww</option>
                <option value="AngelOne">AngelOne</option>
                <option value="Upstox">Upstox</option>
                <option value="ICICI Direct">ICICI Direct</option>
                <option value="HDFC Securities">HDFC Securities</option>
                <option value="Kotak Neo">Kotak Neo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Market Cap */}
            <div className="space-y-1">
              <label className="label-text text-xs font-bold text-base-content/80">
                Market Cap <span className="text-error">*</span>
              </label>
              <select
                className="select select-sm select-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-semibold text-xs"
                value={cap}
                onChange={(e) => setCap(e.target.value)}
              >
                <option value="Large">Large Cap</option>
                <option value="Mid">Mid Cap</option>
                <option value="Small">Small Cap</option>
                <option value="Micro">Micro Cap</option>
              </select>
            </div>

            {/* Exchange */}
            <div className="space-y-1">
              <label className="label-text text-xs font-bold text-base-content/80">
                Exchange <span className="text-error">*</span>
              </label>
              <select
                className="select select-sm select-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-semibold text-xs"
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="MCX">MCX</option>
              </select>
            </div>

            {/* Completion Status Indicator */}
            <div className={`p-3 rounded-xl border text-center space-y-1 mt-2 ${
              isStep1Complete
                ? "bg-success/10 border-success/30"
                : "bg-warning/10 border-warning/30"
            }`}>
              <div className="flex items-center justify-center gap-1.5">
                {isStep1Complete ? (
                  <CheckCircle2 size={14} className="text-success" />
                ) : (
                  <AlertCircle size={14} className="text-warning" />
                )}
                <span className={`text-xs font-bold ${
                  isStep1Complete ? "text-success" : "text-warning"
                }`}>
                  {isStep1Complete ? "Basic Info Complete" : "Stock Name Required"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CENTER POPUP: Step-by-Step Entry Wizard (Fixed Dimensions)          */}
        {/* =================================================================== */}
        <form
          onSubmit={handleSubmit}
          className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl w-full lg:w-[780px] h-[650px] max-h-[94vh] flex flex-col overflow-hidden shrink-0"
        >
          {/* Popup 1 Header with Stepper */}
          <div className="px-5 py-3.5 border-b border-base-200 bg-base-200/50 shrink-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/15 text-primary rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                    {initialData
                      ? `Edit Stock Trade — ${initialData.name}`
                      : "Add Stock Trade Entry"}
                    <span className="badge badge-primary badge-xs font-semibold">
                      Step {step} of 2
                    </span>
                  </h2>
                  <p className="text-xs text-base-content/70">
                    Fill sections sequentially with live calculations between boxes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-xs btn-circle btn-ghost text-base-content/60 hover:text-base-content"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stepper Wizard Bar */}
            <div className="grid grid-cols-2 gap-2">
              {/* Step 1 Pill: Buy Details */}
              <button
                type="button"
                onClick={() => handleGoToStep(1)}
                className={`p-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  step === 1
                    ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                    : isStep2Complete
                    ? "bg-success/15 text-success border border-success/30"
                    : "bg-base-200 text-base-content/60"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black bg-current/20 shrink-0">
                  {isStep2Complete && step !== 1 ? <Check size={11} /> : "1"}
                </span>
                <span className="truncate">1. Buy Details</span>
              </button>

              {/* Step 2 Pill: Sell Details */}
              <button
                type="button"
                onClick={() => handleGoToStep(2)}
                className={`p-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                  step === 2
                    ? "bg-secondary text-secondary-content shadow-md shadow-secondary/20"
                    : isSold
                    ? "bg-secondary/15 text-secondary border border-secondary/30 cursor-pointer"
                    : "bg-base-200 text-base-content/60 opacity-60 cursor-not-allowed"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black bg-current/20 shrink-0">
                  {!isStep2Complete ? <Lock size={10} /> : "2"}
                </span>
                <span className="truncate">2. Sell Details</span>
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="mx-5 mt-3 p-2.5 bg-error/10 border border-error/30 text-error rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Popup 1 Active Step Form Body */}
          <div className="p-5 overflow-y-auto scroll-hidden overflow-x-hidden flex-1 flex flex-col text-xs">
            {/* STEP 1: Buy Details — Horizontal Layout */}
            {step === 1 && (
              <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-base-200">
                  <span className="font-extrabold text-xs text-primary flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-content flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Section 1: Buy Details ({name || "Stock"})
                  </span>
                  <span className="badge badge-error badge-xs font-bold">
                    Mandatory
                  </span>
                </div>

                {/* Buy Date */}
                <div className="space-y-1">
                  <label className="label-text text-xs font-semibold text-base-content">
                    Buy Date <span className="text-error">*</span>
                  </label>
                  <CallyDatePicker
                    value={bDate}
                    onChange={(val) => setBDate(val)}
                    placeholder="Select Buy Date"
                    required
                  />
                </div>

                {/* Horizontal: Step A  +  Step B  side by side */}
                <div className="flex items-stretch gap-3 flex-1 my-2">
                  {/* STEP A: Raw Cost */}
                  <div className="flex-1 bg-base-200/40 rounded-2xl border border-base-300 p-4 flex flex-col justify-between space-y-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <DollarSign size={12} />
                      Raw Buy Cost
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">Share Price ₹ <span className="text-error">*</span></label>
                        <input type="number" step="0.05" placeholder="2450.00" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-bold text-xs" value={bShare} onChange={(e) => setBShare(e.target.value)} autoFocus required />
                      </div>
                      <span className="text-base-content font-black text-lg pb-1 shrink-0">×</span>
                      <div className="flex-1">
                        <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">Quantity <span className="text-error">*</span></label>
                        <input type="number" placeholder="50" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-bold text-xs" value={bQty} onChange={(e) => setBQty(e.target.value)} required />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-base-300 flex items-center justify-between">
                      <span className="text-[10px] text-base-content font-semibold">Raw Total</span>
                      <span className="text-sm font-black text-primary">{formatCurrency(bStock)}</span>
                    </div>
                  </div>

                  {/* Plain + connector */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-base-content">+</span>
                  </div>

                  {/* STEP B: Charges / TT */}
                  <div className="flex-1 bg-base-200/40 rounded-2xl border border-base-300 p-4 flex flex-col justify-between space-y-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-warning flex items-center gap-1.5">
                      <Calculator size={12} />
                      Charges Per Share
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="text-base-content text-lg font-light pb-1 shrink-0">[</span>
                      <div className="flex-1 min-w-0">
                        <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">BKG ₹</label>
                        <input type="number" step="0.01" placeholder="20" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-bold text-xs" value={bBkg} onChange={(e) => setBBkg(e.target.value)} />
                      </div>
                      <span className="text-base-content font-black text-sm pb-1 shrink-0">+</span>
                      <div className="flex-1 min-w-0">
                        <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">PDC ₹</label>
                        <input type="number" step="0.01" placeholder="0" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-bold text-xs" value={bPdc} onChange={(e) => setBPdc(e.target.value)} />
                      </div>
                      <span className="text-base-content text-lg font-light pb-1 shrink-0">]</span>
                      <span className="text-base-content font-black text-lg pb-1 shrink-0">÷</span>
                      <div className="flex-1 min-w-0">
                        <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">Day TT ₹</label>
                        <input type="number" step="0.01" placeholder={bStock ? bStock.toString() : "TT"} className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full rounded-xl font-bold text-xs" value={bTt} onChange={(e) => setBTt(e.target.value)} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-base-300 flex items-center justify-between">
                      <span className="text-[10px] text-base-content font-semibold">Per Share Charge</span>
                      <span className="text-sm font-black text-warning">{formatCurrency(bBkgPdc / effectiveBtDivisor)}</span>
                    </div>
                  </div>
                </div>

                {/* Equation Banner: Share Price + (Charges/TT) = Final */}
                <div className="bg-base-200/30 rounded-xl border border-base-300 px-4 py-3 flex items-center justify-center gap-3 flex-wrap my-1">
                  <div className="bg-primary/8 border border-primary/20 rounded-lg px-3 py-1.5 text-center">
                    <div className="text-[8px] text-base-content font-semibold uppercase">Share Price</div>
                    <div className="text-xs font-black text-primary">{formatCurrency(numBShare)}</div>
                  </div>
                  <span className="text-lg font-black text-base-content">+</span>
                  <div className="bg-warning/8 border border-warning/20 rounded-lg px-3 py-1.5 text-center">
                    <div className="text-[8px] text-base-content font-semibold uppercase">Charges / TT</div>
                    <div className="text-xs font-black text-warning">{formatCurrency(bBkgPdc / effectiveBtDivisor)}</div>
                  </div>
                  <span className="text-lg font-black text-base-content">=</span>
                  <div className="bg-success/10 border-2 border-success/30 rounded-lg px-4 py-1.5 text-center">
                    <div className="text-[8px] text-base-content font-semibold uppercase">Final Buy Price / Share</div>
                    <div className="text-sm font-black text-success">{formatCurrency(bFShare)}</div>
                  </div>
                </div>

                {/* Final Total */}
                <div className="p-4 rounded-2xl border-2 border-base-300 bg-base-200/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-base-content">Total Buy Stock Cost</div>
                    <div className="text-[10px] font-bold text-base-content/80 mt-0.5">
                      {formatCurrency(bFShare)} × {numBQty} shares
                    </div>
                  </div>
                  <span className="text-xl font-black tracking-tight text-primary">{formatCurrency(bFStock)}</span>
                </div>
              </div>
            )}

            {/* STEP 2: Sell Details with Operators Between Boxes */}
            {step === 2 && (
              <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-base-200">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <span className="font-extrabold text-xs text-secondary uppercase tracking-wide">
                      Section 2: Sell Details ({name || "Stock"})
                    </span>
                  </div>

                  {/* Checkbox Toggle for Sold / Active position */}
                  <label className="flex items-center gap-1.5 cursor-pointer bg-base-200 px-2.5 py-1 rounded-xl border border-base-300 hover:border-secondary">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-secondary"
                      checked={isSold}
                      onChange={(e) => setIsSold(e.target.checked)}
                    />
                    <span className="font-bold text-xs">
                      Mark Trade as Sold
                    </span>
                  </label>
                </div>

                {!isSold ? (
                  <div className="p-8 text-center bg-base-200/50 rounded-3xl border border-base-300 space-y-3 my-auto">
                    <ShoppingCart className="w-8 h-8 mx-auto text-base-content/40" />
                    <div className="font-extrabold text-xs text-base-content">
                      Position is currently OPEN / HOLDING
                    </div>
                    <p className="text-[11px] text-base-content/60 max-w-xs mx-auto">
                      Check "Mark Trade as Sold" above if you have closed or realized this stock position.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSold(true)}
                      className="btn btn-xs btn-secondary rounded-xl font-bold"
                    >
                      Log Sell Details Now
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between gap-2">
                    {/* Sell Date */}
                    <div className="space-y-1">
                      <label className="label-text text-xs font-semibold text-base-content">
                        Sell Date <span className="text-error">*</span>
                      </label>
                      <CallyDatePicker
                        value={sDate}
                        onChange={(val) => setSDate(val)}
                        placeholder="Select Sell Date"
                        required
                      />
                    </div>

                    {/* Horizontal: Step A  −  Step B  side by side */}
                    <div className="flex items-stretch gap-3 flex-1 my-1">
                      {/* STEP A: Sell Revenue */}
                      <div className="flex-1 bg-base-200/40 rounded-2xl border border-base-300 p-4 flex flex-col justify-between space-y-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-secondary flex items-center gap-1.5">
                          <DollarSign size={12} />
                          Sell Revenue
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">Sell Price ₹ <span className="text-error">*</span></label>
                            <input type="number" step="0.05" placeholder="2680.00" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-secondary/40 w-full rounded-xl font-bold text-xs" value={sShare} onChange={(e) => setSShare(e.target.value)} autoFocus required />
                          </div>
                          <span className="text-base-content font-black text-lg pb-1 shrink-0">×</span>
                          <div className="flex-1">
                            <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">Sell Qty <span className="text-error">*</span></label>
                            <input
                              type="number"
                              min="1"
                              max={numBQty > 0 ? numBQty : undefined}
                              placeholder={`Max ${numBQty}`}
                              className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-secondary/40 w-full rounded-xl font-bold text-xs"
                              value={sQty}
                              onChange={(e) => {
                                const val = e.target.value;
                                const numVal = parseFloat(val);
                                if (val !== "" && !isNaN(numVal) && numBQty > 0 && numVal > numBQty) {
                                  setSQty(numBQty.toString());
                                  setErrorMsg(`Sell Quantity cannot exceed Buy Quantity (${numBQty}).`);
                                } else {
                                  setErrorMsg("");
                                  setSQty(val);
                                }
                              }}
                              required
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-base-300 flex items-center justify-between">
                          <span className="text-[10px] text-base-content font-semibold">Revenue</span>
                          <span className="text-sm font-black text-secondary">{formatCurrency(sStock)}</span>
                        </div>
                      </div>

                      {/* Plain − connector */}
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <span className="text-2xl font-black text-base-content">−</span>
                      </div>

                      {/* STEP B: Deductions / TT */}
                      <div className="flex-1 bg-base-200/40 rounded-2xl border border-base-300 p-4 flex flex-col justify-between space-y-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-warning flex items-center gap-1.5">
                          <Calculator size={12} />
                          Deductions Per Share
                        </div>
                        <div className="flex items-end gap-1.5">
                          <span className="text-base-content text-lg font-light pb-1 shrink-0">[</span>
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">BKG ₹</label>
                            <input type="number" step="0.01" placeholder="20" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-secondary/40 w-full rounded-xl font-bold text-xs" value={sBkg} onChange={(e) => setSBkg(e.target.value)} />
                          </div>
                          <span className="text-base-content font-black text-sm pb-1 shrink-0">+</span>
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">PDC ₹</label>
                            <input type="number" step="0.01" placeholder="0" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-secondary/40 w-full rounded-xl font-bold text-xs" value={sPdc} onChange={(e) => setSPdc(e.target.value)} />
                          </div>
                          <span className="text-base-content font-black text-sm pb-1 shrink-0">+</span>
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">DP ₹</label>
                            <input type="number" step="0.01" placeholder="15.93" className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-secondary/40 w-full rounded-xl font-bold text-xs" value={dp} onChange={(e) => setDp(e.target.value)} />
                          </div>
                          <span className="text-base-content text-lg font-light pb-1 shrink-0">]</span>
                          <span className="text-base-content font-black text-lg pb-1 shrink-0">÷</span>
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] font-semibold text-base-content uppercase mb-1 block">Day TT ₹</label>
                            <input type="number" step="0.01" placeholder={sStock ? sStock.toString() : "TT"} className="input input-sm input-bordered focus:outline-none focus:ring-0 focus:border-secondary/40 w-full rounded-xl font-bold text-xs" value={sTt} onChange={(e) => setSTt(e.target.value)} />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-base-300 flex items-center justify-between">
                          <span className="text-[10px] text-base-content font-semibold">Per Share Deduction</span>
                          <span className="text-sm font-black text-warning">{formatCurrency((sBkgPdc + numDp) / effectiveStDivisor)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Equation Banner: Sell Price − (Deductions/TT) = Final */}
                    <div className="bg-base-200/30 rounded-xl border border-base-300 px-4 py-3 flex items-center justify-center gap-3 flex-wrap">
                      <div className="bg-secondary/8 border border-secondary/20 rounded-lg px-3 py-1.5 text-center">
                        <div className="text-[8px] text-base-content font-semibold uppercase">Sell Price</div>
                        <div className="text-xs font-black text-secondary">{formatCurrency(numSShare)}</div>
                      </div>
                      <span className="text-lg font-black text-base-content">−</span>
                      <div className="bg-warning/8 border border-warning/20 rounded-lg px-3 py-1.5 text-center">
                        <div className="text-[8px] text-base-content font-semibold uppercase">Deductions / TT</div>
                        <div className="text-xs font-black text-warning">{formatCurrency((sBkgPdc + numDp) / effectiveStDivisor)}</div>
                      </div>
                      <span className="text-lg font-black text-base-content">=</span>
                      <div className="bg-success/10 border-2 border-success/30 rounded-lg px-4 py-1.5 text-center">
                        <div className="text-[8px] text-base-content font-semibold uppercase">Final Sell Price / Share</div>
                        <div className="text-sm font-black text-success">{formatCurrency(sFShare)}</div>
                      </div>
                    </div>

                    {/* Final Total */}
                    <div className="p-4 rounded-2xl border-2 border-base-300 bg-base-200/30 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-base-content">Net Sell Realization</div>
                        <div className="text-[10px] font-bold text-base-content/80 mt-0.5">
                          {formatCurrency(sFShare)} × {numSQty} shares
                        </div>
                      </div>
                      <span className="text-xl font-black tracking-tight text-secondary">{formatCurrency(sFStock)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Popup 1 Footer Controls */}
          <div className="px-5 py-3.5 border-t border-base-200 bg-base-200/50 flex items-center justify-between shrink-0 text-xs">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => handleGoToStep(step - 1)}
                  className="btn btn-xs btn-ghost rounded-lg gap-1 font-bold cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-xs btn-ghost rounded-lg text-base-content/70"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step === 1 && (
                <>
                  {!isSold && (
                    <button
                      type="submit"
                      className="btn btn-xs btn-outline btn-primary rounded-lg gap-1 font-bold cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>Save (Holding)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleGoToStep(2)}
                    className="btn btn-xs btn-primary rounded-lg gap-1 font-extrabold px-4 shadow-sm cursor-pointer"
                  >
                    <span>Next: Sell Details</span>
                    <ArrowRight size={13} />
                  </button>
                </>
              )}

              {step === 2 && (
                <button
                  type="submit"
                  className="btn btn-xs btn-primary rounded-lg px-5 font-extrabold shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  {initialData ? "Update Stock Trade" : "Save Stock Trade"}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* =================================================================== */}
        {/* POPUP 2 (RIGHT): Horizontally Scrollable Live Summary & PnL         */}
        {/* =================================================================== */}
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl w-full lg:w-72 h-[650px] max-h-[94vh] flex flex-col overflow-hidden shrink-0">
          {/* Popup 2 Header with Navigation Arrows & Page Indicator */}
          <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {activeRightSlide === 0 ? (
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <TrendingUp className={`w-5 h-5 shrink-0 ${gainRs >= 0 ? "text-success" : "text-error"}`} />
              )}
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs tracking-tight text-base-content truncate">
                  {activeRightSlide === 0 ? "Live Trade Summary" : "Realized PnL Summary"}
                </h3>
                <p className="text-[9px] text-base-content/60">
                  Slide {activeRightSlide + 1} of 2 • Horizontal Scroll
                </p>
              </div>
            </div>
            {/* Arrows & Navigation */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => scrollToSlide(0)}
                className={`btn btn-circle btn-xs ${activeRightSlide === 0 ? "btn-primary text-primary-content" : "btn-ghost text-base-content/60"}`}
                title="Live Trade Summary (Slide 1)"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSlide(1)}
                className={`btn btn-circle btn-xs ${activeRightSlide === 1 ? "btn-secondary text-secondary-content" : "btn-ghost text-base-content/60"}`}
                title="Realized PnL Summary (Slide 2)"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Body Container */}
          <div
            ref={rightScrollRef}
            onScroll={handleRightScroll}
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent scroll-smooth"
          >
            {/* SLIDE 1: Live Trade Summary */}
            <div className="w-full shrink-0 snap-start p-4 overflow-y-auto space-y-3 text-xs">
              {/* Stock Symbol & Basic Metadata Card */}
              <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg font-black text-sm tracking-wide uppercase">
                    {name || "STOCK SYMBOL"}
                  </span>
                  <span className="badge badge-outline badge-xs font-bold">
                    {term}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-base-content/70">
                  <span>Broker: {platform}</span>
                  <span>•</span>
                  <span>Exchange: {exchange}</span>
                  <span>•</span>
                  <span>{cap} Cap</span>
                </div>
              </div>

              {/* Buy Position Summary */}
              <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-200 space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase text-primary tracking-wider flex items-center justify-between">
                  <span>Buy Details</span>
                  <span>{formatDateDDMMMYYYY(bDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Share Price:</span>
                  <span>{formatCurrency(numBShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Quantity:</span>
                  <span className="font-bold">{numBQty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Total Buy Charges:</span>
                  <span className="text-warning font-semibold">
                    {formatCurrency(bBkgPdc)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-base-200 font-extrabold text-xs">
                  <span>Final Buy Cost:</span>
                  <span className="text-primary">{formatCurrency(bFStock)}</span>
                </div>
              </div>

              {/* Sell Position Summary (if sold) */}
              {isSold && (
                <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-200 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase text-secondary tracking-wider flex items-center justify-between">
                    <span>Sell Details</span>
                    <span>{formatDateDDMMMYYYY(sDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Sell Share Price:</span>
                    <span>{formatCurrency(numSShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Sell Quantity:</span>
                    <span className="font-bold">{numSQty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Sell Charges + DP:</span>
                    <span className="text-warning font-semibold">
                      {formatCurrency(sBkgPdc + numDp)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-base-200 font-extrabold text-xs">
                    <span>Net Realization:</span>
                    <span className="text-secondary">{formatCurrency(sFStock)}</span>
                  </div>
                </div>
              )}

              {/* Quantity Left & Holding Period */}
              <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/70">Quantity Remaining:</span>
                  <span className="font-extrabold text-primary">
                    {qLeft} Shares
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/70">Holding Duration:</span>
                  <div className="text-right">
                    <span className="font-bold font-mono">{holdingDays} Days</span>
                    {getHoldingTermLabel(holdingDays) && (
                      <span className="block text-[9px] font-extrabold text-primary">
                        {getHoldingTermLabel(holdingDays)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SLIDE 2: Realized PnL Summary */}
            <div className="w-full shrink-0 snap-start p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Highlight PnL Card */}
              <div
                className={`p-4 rounded-2xl border flex flex-col gap-1 ${
                  gainRs >= 0
                    ? "bg-success/15 border-success/30 text-success"
                    : "bg-error/15 border-error/30 text-error"
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                  Net Realized PnL
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black tracking-tight">
                    {gainRs >= 0 ? "+" : ""}
                    {formatCurrency(gainRs)}
                  </span>
                  <span className="text-sm font-black flex items-center gap-0.5">
                    {gainRs >= 0 ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownRight size={18} />
                    )}
                    {gainPct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Financial Breakdown Card */}
              <div className="bg-base-200/60 p-3.5 rounded-2xl border border-base-200 space-y-2.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/70 pb-1 border-b border-base-300">
                  Financial Breakdown
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/80 font-bold uppercase text-[9px]">Total Buy Stocks Cost:</span>
                  <span className="font-extrabold text-primary">{formatCurrency(bFStock)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/80 font-bold uppercase text-[9px]">Net Sell Realization:</span>
                  <span className="font-extrabold text-secondary">{formatCurrency(sFStock)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-base-300 font-black">
                  <span className="text-base-content uppercase text-[9px]">Net PnL Realized:</span>
                  <span className={gainRs >= 0 ? "text-success text-sm" : "text-error text-sm"}>
                    {gainRs >= 0 ? "+" : ""}{formatCurrency(gainRs)}
                  </span>
                </div>
              </div>

              {/* Holding Info Pill */}
              <div className="p-3.5 bg-base-200/40 rounded-2xl border border-base-300 text-center space-y-1.5 overflow-hidden">
                <div className="text-[9px] uppercase font-extrabold text-base-content/60">Holding Duration & Term</div>
                <div className="text-[11px] font-black text-base-content whitespace-nowrap truncate">
                  {holdingDays} Days ({formatDateDDMMMYYYY(bDate)} → {isSold && sDate && sDate !== "-" ? formatDateDDMMMYYYY(sDate) : "Open"})
                </div>
                {getHoldingTermLabel(holdingDays) && (
                  <div className="pt-0.5">
                    <span className="badge badge-primary px-3 py-2 font-black text-xs shadow-sm">
                      {getHoldingTermLabel(holdingDays)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
