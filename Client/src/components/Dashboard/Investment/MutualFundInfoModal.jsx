import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Info,
  PiggyBank,
  Minus,
  Layers,
  Calendar,
  DollarSign,
  TrendingUp,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Scale,
  Clock,
  Sparkles,
} from "lucide-react";
import CompanyLogo from "./CompanyLogo";

export default function MutualFundInfoModal({
  isOpen,
  onClose,
  fund = null,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
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

  const allTxns = fund.transactions || [];
  const depositTxns = allTxns.filter((t) => !isWithdrawalTxn(t));
  const withdrawalTxns = allTxns.filter(isWithdrawalTxn);

  // Helper to safely compute actualAmt & units for a txn
  const getTxnMetrics = (t) => {
    const dep = Number(t.amtDeposit ?? t.amount ?? 0);
    const erVal = Number(t.er ?? 0);
    const actual =
      t.actualAmt !== undefined && t.actualAmt !== null
        ? Number(t.actualAmt)
        : Math.max(0, dep - erVal);
    const navVal = Number(t.nav ?? 0);
    const u =
      parseFloat(t.units) || (navVal > 0 ? parseFloat((actual / navVal).toFixed(3)) : 0);
    return { gross: dep, er: erVal, actual, nav: navVal, units: u, date: t.date || "" };
  };

  // 1. DEPOSIT METRICS
  let totalGrossDeposit = 0;
  let totalDepositEr = 0;
  let totalNetInvested = 0;
  let totalDepositUnits = 0;
  let sipCount = 0;
  let sipAmount = 0;
  let lumpsumCount = 0;
  let lumpsumAmount = 0;

  const depositDates = [];
  const depositByYear = {};

  depositTxns.forEach((t) => {
    const m = getTxnMetrics(t);
    totalGrossDeposit += m.gross;
    totalDepositEr += m.er;
    totalNetInvested += m.actual;
    totalDepositUnits += m.units;

    if (m.date) depositDates.push(m.date);

    const typeLower = (t.type || "").toLowerCase();
    if (typeLower === "sip" || typeLower.includes("sip")) {
      sipCount += 1;
      sipAmount += m.actual;
    } else {
      lumpsumCount += 1;
      lumpsumAmount += m.actual;
    }

    const yr = m.date ? new Date(m.date).getFullYear() : "Other";
    if (!depositByYear[yr]) {
      depositByYear[yr] = { gross: 0, er: 0, net: 0, units: 0, count: 0 };
    }
    depositByYear[yr].gross += m.gross;
    depositByYear[yr].er += m.er;
    depositByYear[yr].net += m.actual;
    depositByYear[yr].units += m.units;
    depositByYear[yr].count += 1;
  });

  depositDates.sort();
  const firstDepositDate = depositDates[0] || "—";
  const latestDepositDate = depositDates[depositDates.length - 1] || "—";
  const avgDepositNav =
    totalDepositUnits > 0 ? totalNetInvested / totalDepositUnits : 0;
  const avgDepositPerTerm =
    depositTxns.length > 0 ? totalNetInvested / depositTxns.length : 0;

  // 2. WITHDRAWAL METRICS
  let totalGrossWithdrawn = 0;
  let totalExitLoad = 0;
  let totalNetReceived = 0;
  let totalRedeemedUnits = 0;
  let swpCount = 0;
  let swpAmount = 0;
  let redemptionCount = 0;
  let redemptionAmount = 0;

  const withdrawalDates = [];
  const withdrawalByYear = {};

  withdrawalTxns.forEach((t) => {
    const m = getTxnMetrics(t);
    totalGrossWithdrawn += m.gross;
    totalExitLoad += m.er;
    totalNetReceived += m.actual;
    totalRedeemedUnits += m.units;

    if (m.date) withdrawalDates.push(m.date);

    const typeLower = (t.type || "").toLowerCase();
    if (typeLower === "swp" || typeLower.includes("swp")) {
      swpCount += 1;
      swpAmount += m.actual;
    } else {
      redemptionCount += 1;
      redemptionAmount += m.actual;
    }

    const yr = m.date ? new Date(m.date).getFullYear() : "Other";
    if (!withdrawalByYear[yr]) {
      withdrawalByYear[yr] = { gross: 0, er: 0, net: 0, units: 0, count: 0 };
    }
    withdrawalByYear[yr].gross += m.gross;
    withdrawalByYear[yr].er += m.er;
    withdrawalByYear[yr].net += m.actual;
    withdrawalByYear[yr].units += m.units;
    withdrawalByYear[yr].count += 1;
  });

  withdrawalDates.sort();
  const firstWithdrawalDate = withdrawalDates[0] || "—";
  const latestWithdrawalDate = withdrawalDates[withdrawalDates.length - 1] || "—";
  const avgExitNav =
    totalRedeemedUnits > 0 ? totalGrossWithdrawn / totalRedeemedUnits : 0;
  const avgWithdrawnPerEvent =
    withdrawalTxns.length > 0 ? totalNetReceived / withdrawalTxns.length : 0;

  // 3. CUMULATIVE METRICS
  const activeHoldingUnits = Math.max(
    0,
    parseFloat((totalDepositUnits - totalRedeemedUnits).toFixed(4))
  );
  const isFullyRedeemed = totalDepositUnits > 0 && activeHoldingUnits <= 0.0001;
  const realizedPnL = totalNetReceived - totalNetInvested; // Withdrawn amt - Deposited amt
  const isProfit = realizedPnL > 0;
  const isLoss = realizedPnL < 0;
  const realizedPnLPct =
    totalNetInvested > 0
      ? ((realizedPnL / totalNetInvested) * 100).toFixed(2)
      : "0.00";

  const netCapitalAtRisk = totalNetInvested - totalNetReceived;
  const totalLifetimeCharges = totalDepositEr + totalExitLoad;
  const capitalReturnedPct =
    totalNetInvested > 0
      ? ((totalNetReceived / totalNetInvested) * 100).toFixed(1)
      : "0.0";
  const unitRetentionPct =
    totalDepositUnits > 0
      ? ((activeHoldingUnits / totalDepositUnits) * 100).toFixed(1)
      : "0.0";

  // Combine unique active years for timeline comparison
  const allYears = Array.from(
    new Set([...Object.keys(depositByYear), ...Object.keys(withdrawalByYear)])
  ).sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : Number(b) - Number(a)));

  const modalContent = (
    <div
      className="fixed inset-0 w-screen h-screen z-[1000005] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-7xl max-h-[94vh] flex flex-col gap-3 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Title Bar */}
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
                {isFullyRedeemed ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-base-300/80 text-base-content/80 border border-base-content/10 shrink-0">
                    Sold
                  </span>
                ) : totalRedeemedUnits > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
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
              Press <kbd className="kbd kbd-xs">ESC</kbd> to close
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

        {/* 3 SEPARATE POPUPS CONTAINER WITH SMALL GAPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4.5 overflow-y-auto max-h-[calc(94vh-80px)] pb-1">
          {/* ================================================================= */}
          {/* POPUP 1: DEPOSITED DETAILS                                        */}
          {/* ================================================================= */}
          <div className="bg-base-100/95 backdrop-blur-md rounded-3xl border border-secondary/25 hover:border-secondary/50 shadow-xl flex flex-col p-4 sm:p-5 gap-3.5 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-200/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
                  <PiggyBank size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-base-content">
                    Deposited Details
                  </h4>
                  <span className="text-[10px] text-base-content/50 font-semibold">
                    Inflow & Purchases
                  </span>
                </div>
              </div>
              <span className="badge badge-secondary badge-sm font-mono font-bold">
                {depositTxns.length} terms
              </span>
            </div>

            {/* Hero Stat */}
            <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20">
              <span className="text-[9px] uppercase font-bold tracking-wider text-secondary block mb-0.5">
                Total Actually Invested
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-secondary tracking-tight">
                ₹{totalNetInvested.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-secondary/15">
                <span>Gross: ₹{totalGrossDeposit.toLocaleString("en-IN")}</span>
                <span className="text-error font-medium">ER: ₹{totalDepositEr.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <Coins size={10} className="text-secondary" /> Units Allotted
                </span>
                <span className="text-xs font-mono font-black text-base-content">
                  {totalDepositUnits.toFixed(3)}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <TrendingUp size={10} className="text-secondary" /> Avg NAV
                </span>
                <span className="text-xs font-mono font-black text-base-content">
                  {avgDepositNav > 0 ? `₹${avgDepositNav.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <DollarSign size={10} className="text-secondary" /> Avg / Term
                </span>
                <span className="text-xs font-mono font-black text-base-content">
                  ₹{Math.round(avgDepositPerTerm).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <PieChart size={10} className="text-secondary" /> Breakdown
                </span>
                <span className="text-[10px] font-bold text-base-content/80">
                  {sipCount} SIP • {lumpsumCount} LS
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-base-content/50">First Deposit:</span>
                <span className="font-mono font-bold">{firstDepositDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/50">Latest Deposit:</span>
                <span className="font-mono font-bold">{latestDepositDate}</span>
              </div>
            </div>

            {/* Year-by-Year Table */}
            <div className="flex-1 space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 block flex items-center gap-1">
                <Calendar size={11} className="text-secondary" /> Annual Deposits
              </span>
              <div className="overflow-x-auto max-h-[160px] rounded-xl border border-base-200">
                <table className="table table-xs w-full bg-base-200/20 font-mono">
                  <thead>
                    <tr className="border-b border-base-200 text-base-content/50 text-[9px]">
                      <th>Year</th>
                      <th className="text-right">Terms</th>
                      <th className="text-right">Net (₹)</th>
                      <th className="text-right">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(depositByYear).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-2 text-base-content/40 italic">
                          No deposits yet
                        </td>
                      </tr>
                    ) : (
                      Object.keys(depositByYear)
                        .sort((a, b) => Number(b) - Number(a))
                        .map((yr) => (
                          <tr key={yr} className="hover:bg-base-200/60 text-[11px]">
                            <td className="font-sans font-bold">{yr}</td>
                            <td className="text-right">{depositByYear[yr].count}</td>
                            <td className="text-right font-bold text-secondary">
                              ₹{depositByYear[yr].net.toLocaleString("en-IN")}
                            </td>
                            <td className="text-right">{depositByYear[yr].units.toFixed(3)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* POPUP 2: WITHDRAWN DETAILS                                        */}
          {/* ================================================================= */}
          <div className="bg-base-100/95 backdrop-blur-md rounded-3xl border border-amber-500/25 hover:border-amber-500/50 shadow-xl flex flex-col p-4 sm:p-5 gap-3.5 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-200/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Minus size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-base-content">
                    Withdrawn Details
                  </h4>
                  <span className="text-[10px] text-base-content/50 font-semibold">
                    Outflow & Redemptions
                  </span>
                </div>
              </div>
              <span className="badge badge-warning bg-amber-500 text-white badge-sm font-mono font-bold">
                {withdrawalTxns.length} txns
              </span>
            </div>

            {/* Hero Stat */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                Total Net Received
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-amber-600 dark:text-amber-400 tracking-tight">
                ₹{totalNetReceived.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-amber-500/15">
                <span>Gross: ₹{totalGrossWithdrawn.toLocaleString("en-IN")}</span>
                <span className="text-error font-medium">Exit Load: ₹{totalExitLoad.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <Coins size={10} className="text-amber-500" /> Units Redeemed
                </span>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                  {totalRedeemedUnits.toFixed(3)}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <TrendingUp size={10} className="text-amber-500" /> Avg Exit NAV
                </span>
                <span className="text-xs font-mono font-black text-base-content">
                  {avgExitNav > 0 ? `₹${avgExitNav.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <DollarSign size={10} className="text-amber-500" /> Avg / Event
                </span>
                <span className="text-xs font-mono font-black text-base-content">
                  ₹{Math.round(avgWithdrawnPerEvent).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <PieChart size={10} className="text-amber-500" /> Breakdown
                </span>
                <span className="text-[10px] font-bold text-base-content/80">
                  {swpCount} SWP • {redemptionCount} Redemp
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-base-content/50">First Withdrawal:</span>
                <span className="font-mono font-bold">{firstWithdrawalDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/50">Latest Withdrawal:</span>
                <span className="font-mono font-bold">{latestWithdrawalDate}</span>
              </div>
            </div>

            {/* Year-by-Year Table */}
            <div className="flex-1 space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 block flex items-center gap-1">
                <Calendar size={11} className="text-amber-500" /> Annual Withdrawals
              </span>
              <div className="overflow-x-auto max-h-[160px] rounded-xl border border-base-200">
                <table className="table table-xs w-full bg-base-200/20 font-mono">
                  <thead>
                    <tr className="border-b border-base-200 text-base-content/50 text-[9px]">
                      <th>Year</th>
                      <th className="text-right">Txns</th>
                      <th className="text-right">Net (₹)</th>
                      <th className="text-right">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(withdrawalByYear).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-2 text-base-content/40 italic">
                          No withdrawals yet
                        </td>
                      </tr>
                    ) : (
                      Object.keys(withdrawalByYear)
                        .sort((a, b) => Number(b) - Number(a))
                        .map((yr) => (
                          <tr key={yr} className="hover:bg-base-200/60 text-[11px]">
                            <td className="font-sans font-bold">{yr}</td>
                            <td className="text-right">{withdrawalByYear[yr].count}</td>
                            <td className="text-right font-bold text-amber-600 dark:text-amber-400">
                              ₹{withdrawalByYear[yr].net.toLocaleString("en-IN")}
                            </td>
                            <td className="text-right">{withdrawalByYear[yr].units.toFixed(3)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* POPUP 3: CUMULATIVE DETAILS                                       */}
          {/* ================================================================= */}
          <div className="bg-base-100/95 backdrop-blur-md rounded-3xl border border-primary/25 hover:border-primary/50 shadow-xl flex flex-col p-4 sm:p-5 gap-3.5 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-200/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <Scale size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-base-content">
                    Cumulative Details
                  </h4>
                  <span className="text-[10px] text-base-content/50 font-semibold">
                    Net Balance & Holdings
                  </span>
                </div>
              </div>
              <span className="badge badge-primary badge-sm font-mono font-bold">
                {allTxns.length} total
              </span>
            </div>

            {/* Hero Stat: Active Capital or Realized Profit/Loss if Fully Redeemed */}
            {isFullyRedeemed ? (
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isProfit
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    : isLoss
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 shadow-sm"
                    : "bg-base-200 border-base-300 text-base-content"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-75 block">
                    Net P&L
                  </span>
                  <span className="badge badge-xs font-mono font-black text-[9px] bg-base-300/80 text-base-content/80 border border-base-content/10">
                    Sold
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black tracking-tight flex items-baseline gap-2">
                  <span>
                    {isProfit ? "+" : isLoss ? "-" : ""}₹
                    {Math.abs(realizedPnL).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold opacity-80">
                    ({isProfit ? "+" : ""}{realizedPnLPct}%)
                  </span>
                </div>
                <div className="text-[10.5px] font-mono opacity-80 mt-1 pt-1 border-t border-current/20">
                  <span>
                    (₹{totalNetReceived.toLocaleString("en-IN")} - ₹{totalNetInvested.toLocaleString("en-IN")})
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
                <span className="text-[9px] uppercase font-bold tracking-wider text-primary block mb-0.5">
                  Net Active Capital Invested
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-primary tracking-tight">
                  ₹{netCapitalAtRisk.toLocaleString("en-IN")}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-base-content/70 mt-1 pt-1 border-t border-primary/15">
                  <span>Units Left: {activeHoldingUnits.toFixed(3)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{unitRetentionPct}% retained</span>
                </div>
              </div>
            )}

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <ArrowDownLeft size={10} className="text-secondary" /> Total Invested
                </span>
                <span className="text-xs font-mono font-black text-secondary">
                  ₹{totalNetInvested.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <ArrowUpRight size={10} className="text-amber-500" /> Total Withdrawn
                </span>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                  ₹{totalNetReceived.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <Sparkles size={10} className="text-primary" /> Capital Returned
                </span>
                <span className="text-xs font-mono font-black text-base-content">
                  {capitalReturnedPct}%
                </span>
              </div>
              <div className="p-2.5 bg-base-200/50 rounded-xl border border-base-200">
                <span className="text-[9px] font-bold text-base-content/50 uppercase block flex items-center gap-1">
                  <DollarSign size={10} className="text-error" /> Total Charges
                </span>
                <span className="text-xs font-mono font-black text-error">
                  ₹{totalLifetimeCharges.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Inflow vs Outflow Units Comparison: Added, Redeemed, Left */}
            <div className="p-2.5 bg-base-200/30 rounded-xl border border-base-200/60 text-[10px] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-base-content/50 font-sans">Units Added (In):</span>
                <span className="font-bold text-secondary">+{totalDepositUnits.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/50 font-sans">Units Redeemed (Out):</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">-{totalRedeemedUnits.toFixed(3)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-base-200">
                <span className="text-base-content font-sans font-bold">Units Left:</span>
                <span className={`font-black ${activeHoldingUnits > 0 ? "text-primary" : "text-base-content/50"}`}>
                  {activeHoldingUnits.toFixed(3)} {activeHoldingUnits === 0 ? "(100% Redeemed)" : ""}
                </span>
              </div>
            </div>

            {/* Year-by-Year Net Cash Flow Table */}
            <div className="flex-1 space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 block flex items-center gap-1">
                <Calendar size={11} className="text-primary" /> Annual Net Flow Timeline
              </span>
              <div className="overflow-x-auto max-h-[160px] rounded-xl border border-base-200">
                <table className="table table-xs w-full bg-base-200/20 font-mono">
                  <thead>
                    <tr className="border-b border-base-200 text-base-content/50 text-[9px]">
                      <th>Year</th>
                      <th className="text-right">In (₹)</th>
                      <th className="text-right">Out (₹)</th>
                      <th className="text-right">Net Flow (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allYears.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-2 text-base-content/40 italic">
                          No transactions
                        </td>
                      </tr>
                    ) : (
                      allYears.map((yr) => {
                        const dep = depositByYear[yr] || { net: 0 };
                        const wth = withdrawalByYear[yr] || { net: 0 };
                        const netFlow = dep.net - wth.net;
                        return (
                          <tr key={yr} className="hover:bg-base-200/60 text-[11px]">
                            <td className="font-sans font-bold">{yr}</td>
                            <td className="text-right text-secondary">₹{dep.net.toLocaleString("en-IN")}</td>
                            <td className="text-right text-amber-600 dark:text-amber-400">₹{wth.net.toLocaleString("en-IN")}</td>
                            <td
                              className={`text-right font-black ${
                                netFlow >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {netFlow >= 0 ? "+" : ""}₹
                              {netFlow.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
