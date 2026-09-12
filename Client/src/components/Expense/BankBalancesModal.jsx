import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { getSourceTagStyle } from "../../utils/expenseTheme";
import {
  X,
  Building2,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Plus,
  EyeOff
} from "lucide-react";
import CompanyLogo from "../Dashboard/Investment/CompanyLogo";

const BankBalancesModal = ({ isOpen, onClose, initialTypeFilter = "all" }) => {
  const { sources, transactions, currentMonth } = useSelector((state) => state.expense);
  const isCurrentMonth = !currentMonth || currentMonth === dayjs().format("YYYY-MM");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "Bank" | "Card" | "Wallet"

  useEffect(() => {
    if (isOpen) {
      setTypeFilter(initialTypeFilter || "all");
    }
  }, [isOpen, initialTypeFilter]);

  // Excluded Sources State (persisted in localStorage and synced across components)
  const [excludedSourceIds, setExcludedSourceIds] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_excluded_sources");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("expense_excluded_sources");
        setExcludedSourceIds(saved ? JSON.parse(saved) : []);
      } catch (e) {}
    };
    window.addEventListener("excluded_sources_updated", handleSync);
    return () => window.removeEventListener("excluded_sources_updated", handleSync);
  }, []);

  const toggleExcludeSource = (sourceId) => {
    const sId = String(sourceId);
    const updated = excludedSourceIds.includes(sId)
      ? excludedSourceIds.filter(id => id !== sId)
      : [...excludedSourceIds, sId];
    setExcludedSourceIds(updated);
    try {
      localStorage.setItem("expense_excluded_sources", JSON.stringify(updated));
      window.dispatchEvent(new Event("excluded_sources_updated"));
    } catch (e) {}
  };

  const getCardDueAmount = (source, txList = []) => {
    if (!source || source.type !== 'Card') return 0;
    if (source.cardDue !== undefined && source.cardDue !== null && Number(source.cardDue) > 0) return Number(source.cardDue);
    const bal = Number(source.balance) || 0;
    if (bal < 0) return Math.abs(bal);
    if (source.cardDue !== undefined && source.cardDue !== null) return Number(source.cardDue);
    const cardDebits = txList
      .filter(t => t.type === 'Debit' && String(t.sourceId?._id || t.sourceId) === String(source._id))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const cardCredits = txList
      .filter(t => (t.type === 'Credit' || t.type === 'Transfer') && (
        String(t.targetSourceId?._id || t.targetSourceId) === String(source._id) ||
        String(t.sourceId?._id || t.sourceId) === String(source._id)
      ))
      .reduce((sum, t) => {
        if (t.type === 'Credit' && String(t.sourceId?._id || t.sourceId) === String(source._id)) {
          return sum + (Number(t.amount) || 0);
        }
        if (t.type === 'Transfer' && String(t.targetSourceId?._id || t.targetSourceId) === String(source._id)) {
          return sum + (Number(t.amount) || 0);
        }
        return sum;
      }, 0);

    const due = cardDebits - cardCredits;
    return due > 0 ? due : 0;
  };

  if (!isOpen) return null;

  // Calculate totals excluding disabled sources
  const bankSources = sources.filter((s) => (s.type === "Bank" || !s.type) && !excludedSourceIds.includes(String(s._id)));
  const cardSources = sources.filter((s) => s.type === "Card" && !excludedSourceIds.includes(String(s._id)));
  const walletSources = sources.filter((s) => s.type === "Wallet" && !excludedSourceIds.includes(String(s._id)));

  const totalBankBalance = bankSources.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalWalletBalance = walletSources.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalAssets = totalBankBalance + totalWalletBalance;

  const totalCardSpent = cardSources.reduce((sum, source) => sum + getCardDueAmount(source, transactions), 0);

  const filteredSources = sources.filter((s) => {
    const matchesName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" ? true : (s.type || "Bank") === typeFilter;
    return matchesName && matchesType;
  });

  const netAssets = totalAssets - totalCardSpent;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 text-primary">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2 flex-wrap">
                <span>Bank Accounts & Balances</span>
                {!isCurrentMonth && (
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    {dayjs(currentMonth).format("MMMM YYYY")} Closing
                  </span>
                )}
                {isCurrentMonth && (
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Current Live
                  </span>
                )}
                {excludedSourceIds.length > 0 && (
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {excludedSourceIds.length} Excluded
                  </span>
                )}
              </h3>
              <p className="text-xs opacity-60 font-medium">
                {isCurrentMonth
                  ? "Showing current live balances. Click any account card below to exclude it from Total Net Assets."
                  : `Showing closing balances as of the end of ${dayjs(currentMonth).format("MMMM YYYY")}. Click any account card to exclude.`}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-base-200/30 border-b border-base-200 text-xs">
          <div className="p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-2xs">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block tracking-wider mb-1">
              {isCurrentMonth ? "Total Net Assets" : `Net Closing Assets (${dayjs(currentMonth).format("MMM 'YY")})`}
            </span>
            <span className={`text-xl font-extrabold font-mono ${netAssets < 0 ? 'text-error' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {netAssets < 0 ? `-₹${Math.abs(netAssets).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${netAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-2xs">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block tracking-wider mb-1">
              {isCurrentMonth ? "Bank Balances" : `Bank Balances (${dayjs(currentMonth).format("MMM 'YY")})`}
            </span>
            <span className="text-xl font-extrabold font-mono text-primary">
              ₹{totalBankBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-2xs">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block tracking-wider mb-1">
              {isCurrentMonth ? "Card Liabilities" : `Card Liabilities (${dayjs(currentMonth).format("MMM 'YY")})`}
            </span>
            <span className="text-xl font-extrabold font-mono text-error">
              -₹{totalCardSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search bank or account name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pl-8 text-xs font-semibold rounded-xl focus:input-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="join border border-base-300 rounded-xl p-0.5 bg-base-200/40 text-xs">
              {["all", "Bank", "Card", "Wallet"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`join-item btn btn-xs rounded-lg font-bold capitalize ${typeFilter === t ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"}`}
                >
                  {t === "all" ? "All Accounts" : `${t}s`}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-base-content/60">
              {filteredSources.length} Account{filteredSources.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Accounts Grid List */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSources.map((source) => {
            const style = getSourceTagStyle(source, sources);
            const isCard = source.type === "Card";
            const isWallet = source.type === "Wallet";
            const isExcluded = excludedSourceIds.includes(String(source._id));

            let cardSpent = isCard ? getCardDueAmount(source, transactions) : 0;
            const rawAmt = isCard ? cardSpent : (source.balance || 0);
            const isNegativeBank = !isCard && rawAmt < 0;
            const isErrorColor = isCard || isNegativeBank;

            return (
              <div
                key={source._id}
                onClick={() => toggleExcludeSource(source._id)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                  isExcluded
                    ? "bg-base-200/50 border-base-300 opacity-50 grayscale hover:opacity-75"
                    : `${style.bg} ${style.text} ${style.border} shadow-2xs hover:shadow-md`
                }`}
                title={isExcluded ? "Click to include in Total calculation" : "Click to exclude from Total calculation"}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.swatch}`}></span>
                    <CompanyLogo name={source.name} size="w-5 h-5" rounded="rounded-md" type="bank" />
                    <span className={`font-extrabold text-sm truncate ${isExcluded ? 'line-through' : ''}`}>{source.name}</span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${isExcluded ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-base-100/60 border border-base-300'}`}>
                    {isExcluded ? "Excluded" : (source.type || "Bank")}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-1">
                  <div>
                    <span className="text-[10px] opacity-70 font-semibold block uppercase tracking-wider">
                      {isCard
                        ? (isCurrentMonth ? "Card Balance / Due" : "Closing Due")
                        : (isCurrentMonth ? "Current Balance" : "Closing Balance")}
                    </span>
                    <span className={`text-xl font-extrabold font-mono tracking-tight ${isExcluded ? 'line-through opacity-60' : (isErrorColor ? 'text-error' : '')}`}>
                      {isCard ? `-₹${Math.abs(rawAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (rawAmt < 0 ? `-₹${Math.abs(rawAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₹${rawAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                    </span>
                  </div>

                  {isCard && source.limit > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] opacity-70 font-semibold block uppercase">Credit Limit</span>
                      <span className="text-xs font-bold font-mono opacity-80">
                        ₹{source.limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredSources.length === 0 && (
            <div className="col-span-full py-12 text-center text-base-content/40 italic">
              No accounts match "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-200 flex justify-end bg-base-200/40">
          <button onClick={onClose} className="btn btn-sm btn-ghost font-bold rounded-xl">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default BankBalancesModal;
