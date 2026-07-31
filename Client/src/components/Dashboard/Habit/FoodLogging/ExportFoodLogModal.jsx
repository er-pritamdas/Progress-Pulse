import React, { useState, useEffect } from "react";
import { X, FileSpreadsheet, Calendar, Mail, Loader2, Utensils } from "lucide-react";

function ExportFoodLogModal({ isOpen, onClose, onExport, isExporting }) {
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const getFirstDayOfMonthStr = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getFirstDayOfMonthStr());
  const [toDate, setToDate] = useState(getTodayStr());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Preset Handlers
  const handlePreset = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setToDate(todayStr);

    if (preset === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setFromDate(d.toISOString().split("T")[0]);
    } else if (preset === "30days") {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      setFromDate(d.toISOString().split("T")[0]);
    } else if (preset === "month") {
      setFromDate(getFirstDayOfMonthStr());
    } else if (preset === "all") {
      setFromDate("2020-01-01");
    }
  };

  const handleSubmit = () => {
    onExport(fromDate, toDate);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-base-200 w-full max-w-lg h-[500px] rounded-3xl shadow-2xl border border-base-300 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between bg-base-100/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-base-content">
                Export Food Logs
              </h2>
              <p className="text-xs text-base-content/60">Generate 3-sheet Excel report & email to inbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-between">
          
          {/* Quick Range Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-2 block">
              Quick Range Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                className="btn btn-xs btn-soft btn-primary"
                onClick={() => handlePreset("7days")}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                className="btn btn-xs btn-soft btn-primary"
                onClick={() => handlePreset("30days")}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                className="btn btn-xs btn-soft btn-primary"
                onClick={() => handlePreset("month")}
              >
                This Month
              </button>
              <button
                type="button"
                className="btn btn-xs btn-soft btn-primary"
                onClick={() => handlePreset("all")}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Custom Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-medium text-base-content/70">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="input input-sm input-bordered w-full text-sm font-medium"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label text-xs font-medium text-base-content/70">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="input input-sm input-bordered w-full text-sm font-medium"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Report Breakdown Info Card */}
          <div className="p-3 bg-base-100/70 border border-base-300/80 rounded-2xl text-xs flex flex-col gap-1.5">
            <span className="font-bold text-emerald-500 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5" /> What's Included in Excel Workbook:
            </span>
            <div className="text-base-content/70 space-y-1 pl-1">
              <p>• <strong>Sheet 1 (Logged Food)</strong>: Transposed logs with serving sizes & all DB nutrients</p>
              <p>• <strong>Sheet 2 (Nutrition Stats)</strong>: Average, Min, Max & Total daily nutrition</p>
              <p>• <strong>Sheet 3 (Meal Category Summary)</strong>: Category breakdown & macro summation</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-base-300 bg-base-100/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-sm btn-success text-white flex items-center gap-2 px-5"
            disabled={isExporting || !fromDate || !toDate}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating & Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Export & Email Report
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ExportFoodLogModal;
