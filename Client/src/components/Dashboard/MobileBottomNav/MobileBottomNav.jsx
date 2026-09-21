import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ChevronUp, X, ArrowLeftRight, Calculator } from 'lucide-react';

import AlarmClockCheck from '../../../utils/Icons/AlarmClockCheck';
import CreditCard from '../../../utils/Icons/CreditCard';
import Wallet from '../../../utils/Icons/Wallet';
import TableView from '../../../utils/Icons/TableView';
import TableEntry from '../../../utils/Icons/TableEntry';
import Dashboard from '../../../utils/Icons/Dashboard';
import Settings from '../../../utils/Icons/Settings';
import Planner from '../../../utils/Icons/Planner';

const TRACKERS = [
  {
    id: "habit",
    name: "Habit Tracker",
    shortName: "Habit Tracker",
    icon: AlarmClockCheck,
    color: "text-emerald-500",
    activeColor: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    defaultRoute: "/dashboard/habit/table-entry",
    tabs: [
      { name: "Logging", route: "/dashboard/habit/table-entry", icon: TableEntry },
      { name: "Dashboard", route: "/dashboard/habit/dashboard", icon: Dashboard },
      { name: "Habit Profile", route: "/dashboard/habit/logging", icon: TableView },
      { name: "Settings", route: "/dashboard/habit/settings", icon: Settings },
    ],
  },
  {
    id: "expense",
    name: "Expense Tracker",
    shortName: "Expense Tracker",
    icon: CreditCard,
    color: "text-violet-500",
    activeColor: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    defaultRoute: "/dashboard/expense/table-entry",
    tabs: [
      { name: "Expenses", route: "/dashboard/expense/table-entry", icon: TableEntry },
      { name: "Dashboard", route: "/dashboard/expense/dashboard", icon: Dashboard },
      { name: "Budgeting", route: "/dashboard/expense/table-view", icon: TableView },
      { name: "Sources", route: "/dashboard/expense/settings", icon: Settings },
    ],
  },
  {
    id: "investment",
    name: "Investment Tracker",
    shortName: "Investment Tracker",
    icon: Wallet,
    color: "text-amber-500",
    activeColor: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    defaultRoute: "/dashboard/investment/table-entry",
    tabs: [
      { name: "Table Entry", route: "/dashboard/investment/table-entry", icon: TableEntry },
      { name: "Dashboard", route: "/dashboard/investment/dashboard", icon: Dashboard },
      { name: "Portfolio", route: "/dashboard/investment/portfolio", icon: TableView },
      { name: "Planner", route: "/dashboard/investment/planner", icon: Planner },
    ],
  },
];

function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Determine current active section
  const isHome = path === "/dashboard" || path === "/dashboard/" || path === "/";
  const isHabit = path.startsWith("/dashboard/habit");
  const isExpense = path.startsWith("/dashboard/expense");
  const isInvestment = path.startsWith("/dashboard/investment");

  let currentTracker = null;
  if (isHabit) currentTracker = TRACKERS[0];
  else if (isExpense) currentTracker = TRACKERS[1];
  else if (isInvestment) currentTracker = TRACKERS[2];

  const isTabActive = (tabRoute) => {
    if (
      (tabRoute === "/dashboard/investment/table-view" || tabRoute === "/dashboard/investment/portfolio") &&
      (path === "/dashboard/investment/table-view" || path === "/dashboard/investment/portfolio")
    ) {
      return true;
    }
    if (
      (tabRoute === "/dashboard/investment/planner" || tabRoute === "/dashboard/investment/settings") &&
      (path === "/dashboard/investment/planner" || path === "/dashboard/investment/settings")
    ) {
      return true;
    }
    return path === tabRoute;
  };

  return (
    <>
      {/* Fixed Bottom Navigation Container for Mobile (md:hidden) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-base-200/95 backdrop-blur-xl border-t border-base-300 shadow-2xl select-none">
        
        {/* CASE 1: Inside a Tracker (Habit / Expense / Investment) */}
        {currentTracker ? (
          <div>
            {/* Top Switcher & Home Action Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-base-300/70 border-b border-base-content/5 text-xs">
              {/* Home Button */}
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-base-content/80 hover:text-primary hover:bg-base-100 transition-colors"
              >
                <Home size={14} className="text-primary shrink-0" />
                <span>Home</span>
              </Link>

              {/* Right: Calculator (if on Expense) + Active Tracker Capsule */}
              <div className="flex items-center gap-2">
                {isExpense && (
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event("toggle_quick_calculator"))}
                    className="flex items-center justify-center h-7 w-7 rounded-full font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Quick Calculator"
                    aria-label="Quick Calculator"
                  >
                    <Calculator size={14} className="shrink-0" />
                  </button>
                )}

                {/* Active Tracker Capsule / Switcher Button */}
                <button
                  type="button"
                  onClick={() => setIsSwitcherOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-base-100 hover:bg-base-200 border border-base-content/10 shadow-xs transition-all active:scale-95 text-base-content"
                  title="Switch to another tracker"
                >
                  <span className={`w-2 h-2 rounded-full ${currentTracker.color.replace('text-', 'bg-')} animate-pulse shrink-0`} />
                  <span className="truncate max-w-[130px]">{currentTracker.name}</span>
                  <ChevronUp size={13} className="text-base-content/50 shrink-0" />
                </button>
              </div>
            </div>

            {/* 4 Bottom Tab Buttons for Current Tracker */}
            <div className="grid grid-cols-4 items-center px-1 py-1.5">
              {currentTracker.tabs.map((tab) => {
                const active = isTabActive(tab.route);
                const TabIcon = tab.icon;
                return (
                  <Link
                    key={tab.route}
                    to={tab.route}
                    className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
                      active
                        ? `${currentTracker.activeColor} font-bold bg-base-100/90 shadow-2xs`
                        : "text-base-content/60 hover:text-base-content"
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <TabIcon />
                      {active && (
                        <span className={`absolute -top-1 right-0 w-1.5 h-1.5 rounded-full ${currentTracker.color.replace('text-', 'bg-')}`} />
                      )}
                    </div>
                    <span className="text-[10px] leading-tight truncate max-w-full text-center">
                      {tab.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* CASE 2: Home Page (or outside trackers) -> 3 Main Tracker Buttons */
          <div className="grid grid-cols-3 items-center gap-1 px-2 py-2">
            {TRACKERS.map((tracker) => {
              const TrackerIcon = tracker.icon;
              return (
                <button
                  key={tracker.id}
                  type="button"
                  onClick={() => navigate(tracker.defaultRoute)}
                  className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-2xl transition-all active:scale-95 hover:bg-base-100/60 text-base-content/80 hover:text-base-content"
                >
                  <div className={`p-2 rounded-xl ${tracker.bg} ${tracker.color} shadow-xs`}>
                    <TrackerIcon />
                  </div>
                  <span className="text-[11px] font-bold truncate max-w-full text-center">
                    {tracker.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Tracker Switcher Bottom Sheet Modal */}
      {isSwitcherOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setIsSwitcherOpen(false)}
          />

          {/* Slide-Up Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-base-200 rounded-t-3xl border-t border-base-300 shadow-2xl p-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-base-content/20 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-content/10 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                  <ArrowLeftRight size={17} className="text-primary" /> Switch Tracker
                </h3>
                <p className="text-xs text-base-content/60">Navigate to any tracker or return home</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSwitcherOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>

            {/* Home Dashboard Shortcut */}
            <button
              type="button"
              onClick={() => {
                setIsSwitcherOpen(false);
                navigate("/dashboard");
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-base-100 hover:bg-base-300/70 border border-base-content/10 mb-4 transition-all text-left group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Home size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-base-content">Home Dashboard</div>
                  <div className="text-[11px] text-base-content/50">Daily summary & overview</div>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">Go Home →</span>
            </button>

            {/* Tracker Cards List */}
            <div className="space-y-3">
              {TRACKERS.map((tracker) => {
                const isCurrent = currentTracker?.id === tracker.id;
                const TrackerIcon = tracker.icon;

                return (
                  <div
                    key={tracker.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-base-100 border-primary/40 shadow-xs"
                        : "bg-base-100/70 border-base-content/10"
                    }`}
                  >
                    {/* Tracker Header Line */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSwitcherOpen(false);
                          navigate(tracker.defaultRoute);
                        }}
                        className="flex items-center gap-2.5 text-left flex-1"
                      >
                        <div className={`p-2 rounded-xl ${tracker.bg} ${tracker.color}`}>
                          <TrackerIcon />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-base-content block">
                            {tracker.name}
                          </span>
                          {isCurrent && (
                            <span className="badge badge-xs badge-primary font-semibold">Active Tracker</span>
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSwitcherOpen(false);
                          navigate(tracker.defaultRoute);
                        }}
                        className="btn btn-xs btn-ghost text-xs text-primary font-bold"
                      >
                        Open →
                      </button>
                    </div>

                    {/* 4 Direct Tab Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-base-content/5">
                      {tracker.tabs.map((tab) => {
                        const active = isTabActive(tab.route);
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.route}
                            type="button"
                            onClick={() => {
                              setIsSwitcherOpen(false);
                              navigate(tab.route);
                            }}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all text-left ${
                              active
                                ? "bg-primary text-primary-content font-bold shadow-xs"
                                : "bg-base-200/60 hover:bg-base-200 text-base-content/75 font-medium"
                            }`}
                          >
                            <TabIcon />
                            <span className="truncate">{tab.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MobileBottomNav;
