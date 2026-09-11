import React, { useEffect } from "react";
import {
  Banknote,
  ShieldCheck,
  PieChart,
  TrendingUp,
  Landmark,
  PiggyBank,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LayoutGrid
} from "lucide-react";

export const DASHBOARDS_LIST = [
  {
    id: "SALARY",
    title: "Salary & Income",
    subtitle: "Compensation & Earnings",
    description:
      "Track monthly salary slips, in-hand earnings, tax deductions, basic pay, and annual compensation trends.",
    icon: Banknote,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    activeRing: "ring-emerald-500 border-emerald-500 bg-emerald-500/5",
    hoverBorder: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
    badgeLabel: "Income Stream",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "PF",
    title: "Provident Fund (PF)",
    subtitle: "EPF & PPF Retirement",
    description:
      "Monitor EPF corpus balance, employer & employee contributions, cumulative compound interest, and withdrawals.",
    icon: ShieldCheck,
    colorClass: "text-teal-500",
    bgClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    activeRing: "ring-teal-500 border-teal-500 bg-teal-500/5",
    hoverBorder: "hover:border-teal-500/50 hover:bg-teal-500/5",
    badgeLabel: "Retirement",
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  {
    id: "MF",
    title: "Mutual Funds",
    subtitle: "SIP & Lumpsum Portfolios",
    description:
      "Multi-folio intelligence, automated SIPs, scheme allocations, NAV performance, and asset diversification.",
    icon: PieChart,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    activeRing: "ring-purple-500 border-purple-500 bg-purple-500/5",
    hoverBorder: "hover:border-purple-500/50 hover:bg-purple-500/5",
    badgeLabel: "SIP Portfolios",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "STOCKS",
    title: "Stocks & Equity",
    subtitle: "Demat, Delivery & Intraday",
    description:
      "Demat holdings ledger, delivery trades, intraday orders, capital allocations, share prices, and trade journal.",
    icon: TrendingUp,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    activeRing: "ring-blue-500 border-blue-500 bg-blue-500/5",
    hoverBorder: "hover:border-blue-500/50 hover:bg-blue-500/5",
    badgeLabel: "Equities",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "FD",
    title: "Fixed Deposits (FD)",
    subtitle: "Bank Term Deposits",
    description:
      "Term deposits across banks, guaranteed compounding yields, maturity countdowns, days left, and payouts.",
    icon: Landmark,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    activeRing: "ring-amber-500 border-amber-500 bg-amber-500/5",
    hoverBorder: "hover:border-amber-500/50 hover:bg-amber-500/5",
    badgeLabel: "Term Deposits",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "RD",
    title: "Recurring Deposits (RD)",
    subtitle: "Systematic Bank Savings",
    description:
      "Systematic monthly recurring deposits, cumulative interest calculation, installment ledgers, and maturity payouts.",
    icon: PiggyBank,
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    activeRing: "ring-orange-500 border-orange-500 bg-orange-500/5",
    hoverBorder: "hover:border-orange-500/50 hover:bg-orange-500/5",
    badgeLabel: "Recurring",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
];

export default function SelectDashboardModal({
  isOpen,
  onClose,
  activeDashboard,
  onSelectDashboard,
  counts = {},
}) {
  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-base-100 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-base-300/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-200/80 bg-base-100/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <LayoutGrid size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-base-content">
                  Investment Dashboards
                </h2>
                <span className="badge badge-sm font-semibold bg-base-200 text-base-content/70">
                  {DASHBOARDS_LIST.length} Portfolios
                </span>
              </div>
              <p className="text-xs text-base-content/60 font-medium">
                Choose an asset class or portfolio intelligence view to explore
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content hover:bg-base-200"
            title="Close modal (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dashboard Cards Grid Container */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DASHBOARDS_LIST.map((item) => {
              const Icon = item.icon;
              const isSelected = activeDashboard === item.id;
              const countVal = counts[item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectDashboard(item.id)}
                  className={`group text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative cursor-pointer ${
                    isSelected
                      ? `ring-2 shadow-md ${item.activeRing}`
                      : `border-base-200/80 bg-base-100 hover:bg-base-200/50 hover:shadow-lg hover:-translate-y-0.5 ${item.hoverBorder}`
                  }`}
                >
                  {/* Top Row: Icon & Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black border transition-transform duration-200 group-hover:scale-105 shadow-xs ${item.bgClass}`}
                      >
                        <Icon size={22} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isSelected ? (
                          <span className="badge badge-primary badge-sm font-bold gap-1 shadow-xs">
                            <CheckCircle2 size={12} />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span
                            className={`badge badge-sm font-semibold border ${item.badgeClass}`}
                          >
                            {item.badgeLabel}
                          </span>
                        )}

                        {countVal !== undefined && countVal > 0 && (
                          <span className="badge badge-xs font-mono font-bold bg-base-200 text-base-content/70">
                            {countVal}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-0.5 mb-2">
                      <h3
                        className={`text-base font-extrabold tracking-tight transition-colors ${
                          isSelected
                            ? "text-primary"
                            : "text-base-content group-hover:text-primary"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-base-content/50">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-base-content/65 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Action Hint */}
                  <div className="mt-4 pt-3 border-t border-base-200/60 flex items-center justify-between text-xs">
                    {isSelected ? (
                      <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Currently Active
                      </span>
                    ) : (
                      <span className="font-medium text-base-content/50 group-hover:text-primary transition-colors text-[11px]">
                        Click to view
                      </span>
                    )}

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-primary-content"
                          : "bg-base-200 text-base-content/40 group-hover:bg-primary/20 group-hover:text-primary group-hover:translate-x-0.5"
                      }`}
                    >
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-base-200/40 border-t border-base-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-base-content/60">
            <Sparkles size={14} className="text-primary shrink-0" />
            <span>
              Select any card to instantly switch portfolio metrics and charts.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content font-bold"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
