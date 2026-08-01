import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getSourceTagStyle } from "../../utils/expenseTheme";
import {
  X,
  Building2,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Plus
} from "lucide-react";

const BankBalancesModal = ({ isOpen, onClose }) => {
  const { sources, transactions } = useSelector((state) => state.expense);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // Calculate totals
  const bankSources = sources.filter((s) => s.type === "Bank" || !s.type);
  const cardSources = sources.filter((s) => s.type === "Card");
  const walletSources = sources.filter((s) => s.type === "Wallet");

  const totalBankBalance = bankSources.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalWalletBalance = walletSources.reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalAssets = totalBankBalance + totalWalletBalance;

  const totalCardSpent = cardSources.reduce((sum, source) => {
    const cardSpent = transactions
      .filter((t) => t.type === "Debit" && String(t.sourceId?._id || t.sourceId) === String(source._id))
      .reduce((s, t) => s + (t.amount || 0), 0);
    return sum + cardSpent;
  }, 0);

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <span>Bank Accounts & Balances</span>
              </h3>
              <p className="text-xs opacity-60 font-medium">Complete breakdown of all registered accounts and liquid assets</p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-base-200/30 border-b border-base-200 text-xs">
          <div className="p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-2xs">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block tracking-wider mb-1">Total Assets</span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{totalAssets.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-2xs">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block tracking-wider mb-1">Bank Balances</span>
            <span className="text-xl font-extrabold font-mono text-primary">
              ₹{totalBankBalance.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-2xs">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block tracking-wider mb-1">Card Spending</span>
            <span className="text-xl font-extrabold font-mono text-rose-500">
              ₹{totalCardSpent.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 pt-4 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search bank or account name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pl-8 text-xs font-semibold rounded-xl focus:input-primary"
            />
          </div>
          <span className="text-xs font-bold text-base-content/60">
            {filteredSources.length} Account{filteredSources.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Accounts Grid List */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSources.map((source) => {
            const style = getSourceTagStyle(source, sources);
            const isCard = source.type === "Card";
            const isWallet = source.type === "Wallet";

            let cardSpent = 0;
            if (isCard) {
              cardSpent = transactions
                .filter((t) => t.type === "Debit" && String(t.sourceId?._id || t.sourceId) === String(source._id))
                .reduce((s, t) => s + (t.amount || 0), 0);
            }

            return (
              <div
                key={source._id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${style.bg} ${style.text} ${style.border} shadow-2xs hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${style.swatch}`}></span>
                    {isCard && <CreditCard size={15} className="shrink-0" />}
                    {isWallet && <Wallet size={15} className="shrink-0" />}
                    {!isCard && !isWallet && <Building2 size={15} className="shrink-0" />}
                    <span className="font-extrabold text-sm truncate">{source.name}</span>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-base-100/60 border border-base-300">
                    {source.type || "Bank"}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-1">
                  <div>
                    <span className="text-[10px] opacity-70 font-semibold block uppercase tracking-wider">
                      {isCard ? "Total Spent" : "Current Balance"}
                    </span>
                    <span className="text-xl font-extrabold font-mono tracking-tight">
                      {isCard ? `₹${cardSpent.toLocaleString()}` : `₹${(source.balance || 0).toLocaleString()}`}
                    </span>
                  </div>

                  {isCard && source.limit > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] opacity-70 font-semibold block uppercase">Credit Limit</span>
                      <span className="text-xs font-bold font-mono opacity-80">
                        ₹{source.limit.toLocaleString()}
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
