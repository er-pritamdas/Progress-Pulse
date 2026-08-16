import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CheckCircle2,
  Building2,
  Briefcase,
  Shield,
  Tag,
  Calculator,
} from "lucide-react";
import { formatDateDDMMMYYYY } from "../DatePicker";

/**
 * 5-Window Read-Only Calculation Modal for Stock Trades
 * Layout:
 * - Window 1: Extreme Left (Full Height)
 * - Window 2: Top Horizontal (Buy Calculation Formula with Operators)
 * - Window 3: Middle Horizontal (Sell Calculation Formula with Operators)
 * - Window 4: Bottom Vertical Left (Position & Duration Summary)
 * - Window 5: Bottom Vertical Right (Realized PnL Summary)
 */
export default function StockTradeCalculationModal({ isOpen, onClose, trade }) {
  if (!isOpen || !trade) return null;

  // Format Currency Helper
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  // BUY CALCULATIONS
  const numBShare = parseFloat(trade.bShare) || 0;
  const numBQty = parseFloat(trade.bQty) || 0;
  const rawBStock = numBShare * numBQty;

  const numBBkg = parseFloat(trade.bBkg) || 0;
  const numBPdc = parseFloat(trade.bPdc) || 0;
  const bBkgPdc = trade.bBkgPdc !== undefined ? parseFloat(trade.bBkgPdc) : numBBkg + numBPdc;

  const numBTt = parseFloat(trade.bTt) || 0;
  const effectiveBtDivisor = numBTt > 0 ? numBTt : numBQty > 0 ? numBQty : 1;

  const bFShare =
    trade.bFShare !== undefined && parseFloat(trade.bFShare) > 0
      ? parseFloat(trade.bFShare)
      : numBShare > 0
      ? numBShare + bBkgPdc / effectiveBtDivisor
      : 0;

  const bFStock =
    trade.bFStock !== undefined && parseFloat(trade.bFStock) > 0
      ? parseFloat(trade.bFStock)
      : numBQty * bFShare;

  // SELL CALCULATIONS
  const isSold =
    (trade.sQty && parseFloat(trade.sQty) > 0) ||
    (trade.sDate && trade.sDate !== "-");

  const numSShare = parseFloat(trade.sShare) || 0;
  const numSQty = parseFloat(trade.sQty) || 0;
  const rawSStock = numSShare * numSQty;

  const numSBkg = parseFloat(trade.sBkg) || 0;
  const numSPdc = parseFloat(trade.sPdc) || 0;
  const numDp = parseFloat(trade.dp) || 0;
  const sBkgPdc = trade.sBkgPdc !== undefined ? parseFloat(trade.sBkgPdc) : numSBkg + numSPdc;

  const numSTt = parseFloat(trade.sTt) || 0;
  const effectiveStDivisor = numSTt > 0 ? numSTt : numSQty > 0 ? numSQty : 1;

  const sellChargesDivTt = sBkgPdc / effectiveStDivisor;
  const dpPerShare = numSQty > 0 ? numDp / numSQty : 0;

  const sFShare =
    trade.sFShare !== undefined && parseFloat(trade.sFShare) > 0
      ? parseFloat(trade.sFShare)
      : isSold && numSShare > 0
      ? numSShare - (sellChargesDivTt + dpPerShare)
      : 0;

  const sFStock =
    trade.sFStock !== undefined && parseFloat(trade.sFStock) > 0
      ? parseFloat(trade.sFStock)
      : isSold
      ? numSQty * sFShare
      : 0;

  // POSITION & GAIN
  const qLeft =
    trade.qLeft !== undefined
      ? parseFloat(trade.qLeft)
      : isSold
      ? Math.max(0, numBQty - numSQty)
      : numBQty;

  const costForSoldQty = numSQty * bFShare;

  const holdingDays = useMemo(() => {
    if (!trade.bDate || !isSold || !trade.sDate || trade.sDate === "-") return 0;
    const d1 = new Date(trade.bDate);
    const d2 = new Date(trade.sDate);
    const diffTime = d2.getTime() - d1.getTime();
    if (isNaN(diffTime) || diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [trade.bDate, trade.sDate, isSold]);

  // Holding Term Label based on Excel formula
  const getHoldingTermLabel = (days) => {
    if (!isSold) {
      if (trade.bDate) {
        const d1 = new Date(trade.bDate);
        const d2 = new Date();
        const diffTime = d2.getTime() - d1.getTime();
        const openDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
        if (openDays <= 1) return "Intraday (1D)";
        if (openDays <= 2) return "BTST (2D)";
        if (openDays <= 29) return "Swing (2D-1M)";
        if (openDays <= 90) return "Positional (1M-3M)";
        if (openDays <= 270) return "Short Term (3M-6M)";
        if (openDays <= 360) return "Medium Term (6M-1Y)";
        return "Long Term (1Y-Max)";
      }
      return "";
    }
    if (days <= 1) return "Intraday (1D)";
    if (days <= 2) return "BTST (2D)";
    if (days <= 29) return "Swing (2D-1M)";
    if (days <= 90) return "Positional (1M-3M)";
    if (days <= 270) return "Short Term (3M-6M)";
    if (days <= 360) return "Medium Term (6M-1Y)";
    return "Long Term (1Y-Max)";
  };

  const gainRs = useMemo(() => {
    if (trade.gainRs !== undefined && isSold) return parseFloat(trade.gainRs);
    if (!isSold || numSQty <= 0) return 0;
    return sFStock - costForSoldQty;
  }, [trade.gainRs, isSold, numSQty, sFStock, costForSoldQty]);

  const gainPct = useMemo(() => {
    if (trade.gainPct !== undefined && isSold) return parseFloat(trade.gainPct);
    if (!isSold || numSQty <= 0 || costForSoldQty <= 0) return 0;
    return (gainRs / costForSoldQty) * 100;
  }, [trade.gainPct, isSold, numSQty, costForSoldQty, gainRs]);

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-x-auto animate-in fade-in duration-200">
      {/* Popup Container Relative Wrapper */}
      <div className="relative flex flex-row items-stretch justify-center gap-4 max-w-[1380px] w-full mx-auto my-auto p-2">
        {/* Top-Right Corner Close Button on Popup Container */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 btn btn-circle btn-sm bg-base-100 hover:bg-base-200 border-2 border-base-300 shadow-2xl text-base-content z-[100001] cursor-pointer transition-transform hover:scale-110"
          title="Close Calculation Viewer"
        >
          <X size={16} />
        </button>
        
        {/* =================================================================== */}
        {/* WINDOW 1: Extreme Left (Full Height w-64 h-[650px])                  */}
        {/* =================================================================== */}
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl w-64 h-[650px] flex flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-base-200 bg-base-200/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-extrabold text-sm tracking-tight text-base-content">
                  Window 1: Basic Info
                </h3>
                <p className="text-[10px] text-base-content/60">Stock Metadata</p>
              </div>
            </div>
            <span className="badge badge-primary badge-xs font-bold">1/5</span>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto scroll-hidden flex-1 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              {/* Stock Symbol */}
              <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center">
                <div className="text-[9px] uppercase font-bold text-primary/80">Stock Symbol</div>
                <div className="text-xl font-black text-primary uppercase mt-0.5 tracking-wider">
                  {trade.name}
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="bg-base-200/60 p-4 rounded-2xl border border-base-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 font-medium">Platform / Broker:</span>
                  <span className="px-2 py-0.5 rounded bg-base-200 border border-base-300 text-[10px] font-bold text-base-content">
                    {trade.platform}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 font-medium">Exchange:</span>
                  <span className="px-2 py-0.5 rounded bg-base-200 border border-base-300 text-[10px] font-bold text-base-content">
                    {trade.exchange}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 font-medium">Market Cap:</span>
                  <span className="px-2 py-0.5 rounded bg-base-200 border border-base-300 text-[10px] font-bold text-base-content">
                    {trade.cap} Cap
                  </span>
                </div>
              </div>
            </div>

            {/* Position Status Pill */}
            <div className="p-4 bg-base-200/40 rounded-2xl border border-base-300 text-center space-y-1">
              <div className="text-[9px] uppercase font-bold text-base-content/60">Position Status</div>
              <div className="text-sm font-black">
                {qLeft > 0 ? (
                  <span className="text-primary">{qLeft} Shares Holding</span>
                ) : (
                  <span className="text-success">Position Fully Closed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* MAIN RIGHT CONTAINER (Windows 2, 3, 4, 5)                           */}
        {/* =================================================================== */}
        <div className="flex-1 max-w-[1080px] h-[650px] flex flex-col justify-between gap-3 shrink-0">

          {/* ------------------------------------------------------------------ */}
          {/* WINDOW 2: Top Horizontal (Buy Calculation)                          */}
          {/* ------------------------------------------------------------------ */}
          <div className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-4 flex flex-col justify-between shrink-0">
            {/* Window 2 Header */}
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <h4 className="font-extrabold text-xs tracking-tight text-primary uppercase">
                  Window 2: Buy Details Calculation ({formatDateDDMMMYYYY(trade.bDate)})
                </h4>
              </div>
              <span className="badge badge-primary badge-xs font-bold">2/5</span>
            </div>

            {/* ── VISUAL MATH FORMULA ── */}
            <div className="flex items-center gap-1 my-2 overflow-x-auto">

              {/* ┌─────────────────────────────────────────────────────────────┐ */}
              {/* │  FORMULA BLOCK: Final Buy Price / Share                     │ */}
              {/* │  bFShare  =  bShare  +  ( BKG + PDC ) ÷ TT                 │ */}
              {/* └─────────────────────────────────────────────────────────────┘ */}

              {/* Result Label */}
              <div className="bg-success/10 border-2 border-success/30 rounded-xl px-3 py-1.5 text-center shrink-0">
                <div className="text-[8px] text-base-content/70 font-bold uppercase leading-tight">Final Buy<br/>Price/Share</div>
                <div className="text-sm font-black text-success mt-0.5">{formatCurrency(bFShare)}</div>
              </div>

              {/* = */}
              <span className="text-2xl font-black text-base-content/70 shrink-0 mx-1">=</span>

              {/* Buy Share Price */}
              <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-2 text-center shrink-0">
                <div className="text-[8px] text-primary/70 font-bold uppercase">Share Price</div>
                <div className="text-sm font-black text-primary">{formatCurrency(numBShare)}</div>
              </div>

              {/* + */}
              <span className="text-2xl font-black text-success shrink-0 mx-1">+</span>

              {/* ── BIG FRACTION:  (BKG + PDC) / TT ── */}
              <div className="flex items-center shrink-0">
                {/* Big Left Bracket */}
                <span className="text-3xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>[</span>

                {/* Fraction Stack */}
                <div className="flex flex-col items-center mx-1">
                  {/* Numerator: BKG + PDC */}
                  <div className="flex items-center gap-1 px-2 py-0.5">
                    <div className="text-center">
                      <div className="text-[7px] text-warning/70 font-bold uppercase">BKG</div>
                      <div className="text-[11px] font-black text-warning">{formatCurrency(numBBkg)}</div>
                    </div>
                    <span className="text-base font-black text-success/80">+</span>
                    <div className="text-center">
                      <div className="text-[7px] text-warning/70 font-bold uppercase">PDC</div>
                      <div className="text-[11px] font-black text-warning">{formatCurrency(numBPdc)}</div>
                    </div>
                  </div>
                  {/* Division Line */}
                  <div className="w-full h-[2px] bg-base-content/50 rounded-full my-0.5"></div>
                  {/* Denominator: TT */}
                  <div className="text-center px-2 py-0.5">
                    <div className="text-[7px] text-info/70 font-bold uppercase">TT (Turnover)</div>
                    <div className="text-[11px] font-black text-info">{effectiveBtDivisor}</div>
                  </div>
                </div>

                {/* Big Right Bracket */}
                <span className="text-3xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>]</span>
              </div>

              {/* Intermediate Result */}
              <div className="bg-warning/10 border border-warning/20 rounded-lg px-2 py-1 text-center shrink-0">
                <div className="text-[7px] text-warning/70 font-bold uppercase">Charges/Share</div>
                <div className="text-[11px] font-black text-warning">{formatCurrency(bBkgPdc / effectiveBtDivisor)}</div>
              </div>

              {/* Separator: vertical dots */}
              <span className="text-xl text-base-content/30 shrink-0 mx-1">⟹</span>

              {/* ┌─────────────────────────────────────────────────────────────┐ */}
              {/* │  FORMULA BLOCK: Total Buy Stock Cost                        │ */}
              {/* │  bFStock  =  bFShare  ×  bQty                              │ */}
              {/* └─────────────────────────────────────────────────────────────┘ */}

              {/* Big Left Bracket */}
              <span className="text-5xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>[</span>

              {/* Final Share Price (compact repeat) */}
              <div className="text-center shrink-0 px-1">
                <div className="text-[7px] text-success/70 font-bold uppercase">Final Price</div>
                <div className="text-xs font-black text-success">{formatCurrency(bFShare)}</div>
              </div>

              {/* × */}
              <span className="text-xl font-black text-base-content/70 shrink-0">×</span>

              {/* Quantity */}
              <div className="text-center shrink-0 px-1">
                <div className="text-[7px] text-primary/70 font-bold uppercase">Qty</div>
                <div className="text-xs font-black text-primary">{numBQty}</div>
              </div>

              {/* Big Right Bracket */}
              <span className="text-5xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>]</span>

              {/* = */}
              <span className="text-2xl font-black text-base-content/70 shrink-0 mx-1">=</span>

              {/* TOTAL BUY STOCK COST — Final Answer */}
              <div className="bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/40 rounded-xl px-4 py-2 text-center shrink-0 shadow-md">
                <div className="text-[8px] text-primary/80 font-bold uppercase tracking-wider">Total Buy Cost</div>
                <div className="text-base font-black text-primary tracking-tight">{formatCurrency(bFStock)}</div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* WINDOW 3: Middle Horizontal (Sell Calculation)                      */}
          {/* ------------------------------------------------------------------ */}
          <div className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-4 flex flex-col justify-between shrink-0">
            {/* Window 3 Header */}
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-secondary" />
                <h4 className="font-extrabold text-xs tracking-tight text-secondary uppercase">
                  Window 3: Sell Details Calculation ({isSold ? formatDateDDMMMYYYY(trade.sDate) : "Position Open"})
                </h4>
              </div>
              <span className="badge badge-secondary badge-xs font-bold">3/5</span>
            </div>

            {/* ── VISUAL MATH FORMULA ── */}
            {isSold ? (
              <div className="flex items-center gap-1 my-2 overflow-x-auto">

                {/* ┌─────────────────────────────────────────────────────────────┐ */}
                {/* │  FORMULA BLOCK: Final Sell Price / Share                    │ */}
                {/* │  sFShare  =  sShare  −  [ (BKG + PDC) ÷ TT  +  DP ÷ Qty ]  │ */}
                {/* └─────────────────────────────────────────────────────────────┘ */}

                {/* Result Label */}
                <div className="bg-success/10 border-2 border-success/30 rounded-xl px-3 py-1.5 text-center shrink-0">
                  <div className="text-[8px] text-base-content/70 font-bold uppercase leading-tight">Final Sell<br/>Price/Share</div>
                  <div className="text-sm font-black text-success mt-0.5">{formatCurrency(sFShare)}</div>
                </div>

                {/* = */}
                <span className="text-2xl font-black text-base-content/70 shrink-0 mx-1">=</span>

                {/* Sell Share Price */}
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-3 py-2 text-center shrink-0">
                  <div className="text-[8px] text-secondary/70 font-bold uppercase">Share Price</div>
                  <div className="text-sm font-black text-secondary">{formatCurrency(numSShare)}</div>
                </div>

                {/* − */}
                <span className="text-2xl font-black text-error shrink-0 mx-1">−</span>

                {/* ── BIG BRACKET: [ (BKG + PDC) / TT  +  DP / Qty ] ── */}
                <div className="flex items-center shrink-0">
                  {/* Big Left Bracket */}
                  <span className="text-5xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>[</span>

                  {/* Fraction 1: (BKG + PDC) / TT */}
                  <div className="flex items-center mx-0.5">
                    <span className="text-3xl font-extralight text-base-content/30 leading-none select-none" style={{fontFamily: 'serif'}}>(</span>
                    <div className="flex flex-col items-center mx-0.5">
                      {/* Numerator: BKG + PDC */}
                      <div className="flex items-center gap-1 px-1.5 py-0.5">
                        <div className="text-center">
                          <div className="text-[7px] text-warning/70 font-bold uppercase">BKG</div>
                          <div className="text-[11px] font-black text-warning">{formatCurrency(numSBkg)}</div>
                        </div>
                        <span className="text-sm font-black text-success/80">+</span>
                        <div className="text-center">
                          <div className="text-[7px] text-warning/70 font-bold uppercase">PDC</div>
                          <div className="text-[11px] font-black text-warning">{formatCurrency(numSPdc)}</div>
                        </div>
                      </div>
                      {/* Division Line */}
                      <div className="w-full h-[2px] bg-base-content/50 rounded-full my-0.5"></div>
                      {/* Denominator: TT */}
                      <div className="text-center px-1.5 py-0.5">
                        <div className="text-[7px] text-info/70 font-bold uppercase">TT</div>
                        <div className="text-[11px] font-black text-info">{effectiveStDivisor}</div>
                      </div>
                    </div>
                    <span className="text-3xl font-extralight text-base-content/30 leading-none select-none" style={{fontFamily: 'serif'}}>)</span>
                  </div>

                  {/* + */}
                  <span className="text-base font-black text-success/80 shrink-0 mx-1">+</span>

                  {/* Fraction 2: DP / Qty */}
                  <div className="flex items-center mx-0.5">
                    <span className="text-3xl font-extralight text-base-content/30 leading-none select-none" style={{fontFamily: 'serif'}}>(</span>
                    <div className="flex flex-col items-center mx-0.5">
                      {/* Numerator: DP */}
                      <div className="px-2 py-0.5 text-center">
                        <div className="text-[7px] text-error/70 font-bold uppercase">DP Charges</div>
                        <div className="text-[11px] font-black text-error">{formatCurrency(numDp)}</div>
                      </div>
                      {/* Division Line */}
                      <div className="w-full h-[2px] bg-base-content/50 rounded-full my-0.5"></div>
                      {/* Denominator: Qty */}
                      <div className="text-center px-2 py-0.5">
                        <div className="text-[7px] text-info/70 font-bold uppercase">Qty</div>
                        <div className="text-[11px] font-black text-info">{numSQty}</div>
                      </div>
                    </div>
                    <span className="text-3xl font-extralight text-base-content/30 leading-none select-none" style={{fontFamily: 'serif'}}>)</span>
                  </div>

                  {/* Big Right Bracket */}
                  <span className="text-5xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>]</span>
                </div>

                {/* Intermediate Result */}
                <div className="bg-warning/10 border border-warning/20 rounded-lg px-2 py-1 text-center shrink-0">
                  <div className="text-[7px] text-warning/70 font-bold uppercase">Deduction/Share</div>
                  <div className="text-[11px] font-black text-warning">{formatCurrency(sellChargesDivTt + dpPerShare)}</div>
                </div>

                {/* Separator */}
                <span className="text-xl text-base-content/30 shrink-0 mx-1">⟹</span>

                {/* ┌─────────────────────────────────────────────────────────────┐ */}
                {/* │  FORMULA BLOCK: Net Sell Realization                        │ */}
                {/* │  sFStock  =  sFShare  ×  sQty                              │ */}
                {/* └─────────────────────────────────────────────────────────────┘ */}

                {/* Big Left Bracket */}
                <span className="text-5xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>[</span>

                {/* Final Share Price (compact repeat) */}
                <div className="text-center shrink-0 px-1">
                  <div className="text-[7px] text-success/70 font-bold uppercase">Final Price</div>
                  <div className="text-xs font-black text-success">{formatCurrency(sFShare)}</div>
                </div>

                {/* × */}
                <span className="text-xl font-black text-base-content/70 shrink-0">×</span>

                {/* Quantity */}
                <div className="text-center shrink-0 px-1">
                  <div className="text-[7px] text-secondary/70 font-bold uppercase">Qty</div>
                  <div className="text-xs font-black text-secondary">{numSQty}</div>
                </div>

                {/* Big Right Bracket */}
                <span className="text-5xl font-extralight text-base-content/40 leading-none select-none" style={{fontFamily: 'serif'}}>]</span>

                {/* = */}
                <span className="text-2xl font-black text-base-content/70 shrink-0 mx-1">=</span>

                {/* NET SELL REALIZATION — Final Answer */}
                <div className="bg-gradient-to-br from-secondary/15 to-secondary/5 border-2 border-secondary/40 rounded-xl px-4 py-2 text-center shrink-0 shadow-md">
                  <div className="text-[8px] text-secondary/80 font-bold uppercase tracking-wider">Net Sell Realization</div>
                  <div className="text-base font-black text-secondary tracking-tight">{formatCurrency(sFStock)}</div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-xs opacity-60 font-semibold my-1">
                Trade currently holding — Sell calculation formula will activate once sold.
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* BOTTOM ROW: Windows 4 & 5 (Vertical Side-by-Side)                  */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex flex-row items-stretch gap-4 flex-1">

            {/* WINDOW 4: Bottom Vertical Left (Position & Duration Summary) */}
            <div className="flex-1 bg-base-100 border border-base-300 rounded-3xl shadow-xl p-4 flex flex-col justify-between">
              {/* Window 4 Header */}
              <div className="flex items-center justify-between pb-2 border-b border-base-200 shrink-0">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="font-extrabold text-xs tracking-tight text-base-content uppercase">
                    Window 4: Summary
                  </h4>
                </div>
                <span className="badge badge-primary badge-xs font-bold">4/5</span>
              </div>

              {/* Quantity Summary Card */}
              <div className="bg-base-200/60 p-3 rounded-2xl border border-base-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Quantity Bought:</span>
                  <span className="font-bold">{numBQty} Shares</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Quantity Sold:</span>
                  <span className="font-bold text-secondary">{numSQty} Shares</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-base-300 font-extrabold">
                  <span className="text-base-content/80">Quantity Remaining:</span>
                  <span className="text-primary font-black">{qLeft} Shares</span>
                </div>
              </div>

              {/* Holding Duration Pill */}
              <div className="p-3 bg-base-200/40 rounded-2xl border border-base-300 text-center space-y-1 overflow-hidden">
                <div className="text-[9px] uppercase font-extrabold text-base-content/60">Holding Duration & Term</div>
                <div className="text-[11px] font-black text-base-content whitespace-nowrap truncate">
                  {holdingDays} Days ({formatDateDDMMMYYYY(trade.bDate)} → {formatDateDDMMMYYYY(trade.sDate)})
                </div>
                {getHoldingTermLabel(holdingDays) && (
                  <div className="pt-0.5">
                    <span className="badge badge-primary px-3 py-1.5 font-black text-xs shadow-sm">
                      {getHoldingTermLabel(holdingDays)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* WINDOW 5: Bottom Vertical Right (Realized PnL Summary) */}
            <div className="flex-1 bg-base-100 border border-base-300 rounded-3xl shadow-xl p-4 flex flex-col justify-between">
              {/* Window 5 Header */}
              <div className="flex items-center justify-between pb-2 border-b border-base-200 shrink-0">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${gainRs >= 0 ? "text-success" : "text-error"}`} />
                  <h4 className="font-extrabold text-xs tracking-tight text-base-content uppercase">
                    Window 5: Realized PnL Summary
                  </h4>
                </div>
                <span className="badge badge-secondary badge-xs font-bold">5/5</span>
              </div>

              {isSold ? (
                <div className="space-y-2.5 my-auto">
                  {/* Highlight PnL Card */}
                  <div
                    className={`p-3.5 rounded-2xl border flex flex-col gap-0.5 ${
                      gainRs >= 0
                        ? "bg-success/15 border-success/30 text-success"
                        : "bg-error/15 border-error/30 text-error"
                    }`}
                  >
                    <div className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">
                      Net Realized PnL
                    </div>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xl font-black tracking-tight">
                        {gainRs >= 0 ? "+" : ""}
                        {formatCurrency(gainRs)}
                      </span>
                      <span className="text-xs font-black flex items-center gap-0.5">
                        {gainRs >= 0 ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                        {gainPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Card */}
                  <div className="bg-base-200/60 p-3 rounded-2xl border border-base-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/80 font-bold uppercase text-[9px]">Total Buy Stocks Cost:</span>
                      <span className="font-extrabold text-primary">{formatCurrency(costForSoldQty > 0 ? costForSoldQty : bFStock)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/80 font-bold uppercase text-[9px]">Net Sell Realization:</span>
                      <span className="font-extrabold text-secondary">{formatCurrency(sFStock)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-base-300 font-black">
                      <span className="text-base-content uppercase text-[9px]">Net PnL Realized:</span>
                      <span className={gainRs >= 0 ? "text-success text-xs font-extrabold" : "text-error text-xs font-extrabold"}>
                        {gainRs >= 0 ? "+" : ""}{formatCurrency(gainRs)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3 opacity-60 text-xs my-auto font-semibold">
                  Position Open — Realized PnL summary will generate when sold.
                </div>
              )}
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
