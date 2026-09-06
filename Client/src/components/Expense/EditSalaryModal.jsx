import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  X,
  Banknote,
  Building2,
  Calendar,
  Percent,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
  Coins,
  IndianRupee,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../../Context/AxiosInstance";
import { message } from "antd";

/**
 * EditSalaryModal allows the user to:
 * 1. Manually enter or update the salary for the selected month in Expense Tracker.
 * 2. Fetch and import the In Hand Salary from the Investment Tracker salary slip for the selected month.
 * 3. Choose whether to include PF (Employer / Total PF) in the monthly salary calculation.
 */
const EditSalaryModal = ({
  isOpen,
  onClose,
  currentMonth,
  currentSalary = 0,
  onSaveSalary,
}) => {
  const [salaryInput, setSalaryInput] = useState("");
  const [includePf, setIncludePf] = useState(false);
  const [pfType, setPfType] = useState("employer"); // "employer" | "total"
  const [salariesList, setSalariesList] = useState([]);
  const [loadingSalaries, setLoadingSalaries] = useState(false);
  const [selectedSlipId, setSelectedSlipId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch salary slips from Investment Tracker when modal opens
  useEffect(() => {
    if (isOpen) {
      setSalaryInput(currentSalary > 0 ? String(currentSalary) : "");
      setIncludePf(false);
      setPfType("employer");
      fetchInvestmentSalaries();
    }
  }, [isOpen, currentMonth, currentSalary]);

  const fetchInvestmentSalaries = async () => {
    try {
      setLoadingSalaries(true);
      const res = await axiosInstance.get("/v1/dashboard/investment/salary");
      if (res.data && res.data.success) {
        const list = res.data.data || [];
        setSalariesList(list);

        // Check if there is an exact match for the selected month
        const match = list.find((s) => s.month === currentMonth);
        if (match) {
          setSelectedSlipId(match.id || match._id);
        } else {
          setSelectedSlipId("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch investment salary records:", err);
    } finally {
      setLoadingSalaries(false);
    }
  };

  // Find exact match for the current month
  const exactMonthSlip = useMemo(() => {
    return salariesList.find((s) => s.month === currentMonth) || null;
  }, [salariesList, currentMonth]);

  // The active slip being used (selected or exact match)
  const activeSlip = useMemo(() => {
    if (selectedSlipId) {
      return (
        salariesList.find((s) => (s.id || s._id) === selectedSlipId) || null
      );
    }
    return exactMonthSlip;
  }, [selectedSlipId, salariesList, exactMonthSlip]);

  // Derived values from activeSlip
  const slipInHand = Number(activeSlip?.inHand || 0);
  const slipErPf = Number(activeSlip?.erPf || 0);
  const slipEePf =
    activeSlip?.eePf !== undefined &&
    activeSlip?.eePf !== null &&
    activeSlip?.eePf !== ""
      ? Number(activeSlip.eePf) || 0
      : slipErPf;
  const slipTotalPf = slipErPf + slipEePf;

  const currentPfAmount = pfType === "total" ? slipTotalPf : slipErPf;
  const calculatedSalaryWithPf = slipInHand + currentPfAmount;

  // Handle applying slip data into the salaryInput
  const handleApplySlipSalary = (withPf = includePf, chosenPfType = pfType) => {
    if (!activeSlip) return;
    const baseInHand = Number(activeSlip.inHand || 0);
    if (withPf) {
      const pfAmt = chosenPfType === "total" ? slipTotalPf : slipErPf;
      setSalaryInput(String(baseInHand + pfAmt));
    } else {
      setSalaryInput(String(baseInHand));
    }
  };

  // Toggle PF checkbox
  const handleTogglePf = (checked) => {
    setIncludePf(checked);
    if (activeSlip) {
      handleApplySlipSalary(checked, pfType);
    }
  };

  // Change PF Type (employer vs total)
  const handlePfTypeChange = (type) => {
    setPfType(type);
    if (includePf && activeSlip) {
      handleApplySlipSalary(true, type);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const num = Number(salaryInput);
    if (isNaN(num) || num < 0) {
      message.error("Please enter a valid salary amount (0 or greater)");
      return;
    }

    try {
      setIsSaving(true);
      await onSaveSalary(num);
      onClose();
    } catch (err) {
      console.error("Error saving salary:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formattedMonth = dayjs(currentMonth).format("MMMM YYYY");

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="card bg-base-100 shadow-2xl border border-primary/30 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 rounded-3xl">
        {/* Header */}
        <div className="shrink-0 p-5 bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 border-b border-base-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary text-primary-content shadow-md">
              <Banknote size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <span>Monthly Salary & Budget</span>
                <span className="badge badge-primary badge-sm font-mono text-[11px]">
                  {formattedMonth}
                </span>
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Set monthly salary or import from your verified Salary slip
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:thin]">
          {/* Current Saved Salary Overview */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-base-200/60 border border-base-300/40 text-xs">
            <span className="text-base-content/70 font-medium">
              Current Saved Salary for {dayjs(currentMonth).format("MMM YYYY")}:
            </span>
            <span className="font-mono font-extrabold text-sm text-primary">
              ₹{(Number(currentSalary) || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* SECTION 1: Selected Month Salary Slip Card from Investment DB */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-base-content/80 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" />
                <span>Salary Slip ({formattedMonth})</span>
              </span>
              {loadingSalaries && (
                <span className="flex items-center gap-1.5 text-primary text-[11px] normal-case font-normal">
                  <span className="loading loading-spinner loading-xs"></span>
                  Checking slip...
                </span>
              )}
            </div>

            {loadingSalaries ? (
              <div className="p-4 rounded-2xl bg-base-200/40 border border-base-200 flex items-center justify-center gap-2 text-xs text-base-content/60">
                <span className="loading loading-spinner loading-sm text-primary"></span>
                <span>Fetching salary records from Investment Tracker...</span>
              </div>
            ) : exactMonthSlip ? (
              /* Exact Salary Slip Found for currentMonth */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-success/10 via-base-100 to-primary/5 border border-success/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success badge-sm font-bold text-success-content gap-1">
                      <Check size={11} /> Slip Found
                    </span>
                    <span className="font-bold text-base-content text-sm">
                      {exactMonthSlip.company}
                    </span>
                  </div>
                  <span className="text-[11px] text-base-content/60 font-mono">
                    {dayjs(exactMonthSlip.month).format("MMMM YYYY")}
                  </span>
                </div>

                {/* Slip Figures Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-base-100/90 border border-base-200">
                    <span className="text-[10px] text-base-content/60 uppercase font-semibold block">
                      In Hand Salary
                    </span>
                    <span className="text-base font-black text-success font-mono block mt-0.5">
                      ₹{Number(exactMonthSlip.inHand || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-base-100/90 border border-base-200">
                    <span className="text-[10px] text-base-content/60 uppercase font-semibold block">
                      Employer PF
                    </span>
                    <span className="text-base font-bold text-info font-mono block mt-0.5">
                      ₹{Number(exactMonthSlip.erPf || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-base-100/90 border border-base-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-base-content/60 uppercase font-semibold block">
                      Total PF (Er + Ee)
                    </span>
                    <span className="text-base font-bold text-secondary font-mono block mt-0.5">
                      ₹{slipTotalPf.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Action button to populate input */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-base-content/60">
                    Gross: ₹{Number(exactMonthSlip.gross || 0).toLocaleString("en-IN")}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleApplySlipSalary(includePf, pfType)}
                    className="btn btn-xs btn-primary font-bold rounded-lg gap-1.5 shadow-sm hover:scale-102 transition-transform cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>
                      Use In Hand (₹
                      {Number(exactMonthSlip.inHand || 0).toLocaleString("en-IN")}
                      )
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* No Salary Slip Found for currentMonth */
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/60 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-base-content/70">
                  <AlertCircle
                    size={16}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-base-content block">
                      No Salary Slip for {formattedMonth}
                    </span>
                    <span className="text-[11px] text-base-content/60">
                      No salary record has been added for this month in the
                      Investment Tracker. You can enter the salary manually below
                      or import from another recent month's slip.
                    </span>
                  </div>
                </div>

                {/* Option to select from other months if available */}
                {salariesList.length > 0 && (
                  <div className="pt-2 border-t border-base-300/40 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-base-content/70 font-medium">
                        Use previous slip:
                      </span>
                      <select
                        value={selectedSlipId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedSlipId(id);
                          const chosen = salariesList.find(
                            (s) => (s.id || s._id) === id
                          );
                          if (chosen) {
                            const base = Number(chosen.inHand || 0);
                            const chosenEr = Number(chosen.erPf || 0);
                            const chosenEe =
                              chosen.eePf !== undefined && chosen.eePf !== null && chosen.eePf !== ""
                                ? Number(chosen.eePf) || 0
                                : chosenEr;
                            const chosenTot = chosenEr + chosenEe;
                            const pfAmt =
                              pfType === "total" ? chosenTot : chosenEr;
                            setSalaryInput(
                              includePf ? String(base + pfAmt) : String(base)
                            );
                          }
                        }}
                        className="select select-xs select-bordered rounded-lg text-xs font-mono font-bold"
                      >
                        <option value="">-- Choose Recent Slip --</option>
                        {salariesList.map((s) => (
                          <option key={s.id || s._id} value={s.id || s._id}>
                            {dayjs(s.month).format("MMM YYYY")} - {s.company} (₹
                            {Number(s.inHand || 0).toLocaleString("en-IN")})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Include PF Option */}
          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/60 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    includePf
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-base-300 text-base-content/60"
                  }`}
                >
                  <Percent size={18} />
                </div>
                <div>
                  <label
                    htmlFor="include-pf-toggle"
                    className="text-xs font-bold text-base-content cursor-pointer block"
                  >
                    Include PF in Salary?
                  </label>
                  <span className="text-[11px] text-base-content/60 block">
                    Add Provident Fund savings contribution to your monthly
                    income
                  </span>
                </div>
              </div>

              <input
                id="include-pf-toggle"
                type="checkbox"
                checked={includePf}
                onChange={(e) => handleTogglePf(e.target.checked)}
                className="toggle toggle-primary toggle-sm"
              />
            </div>

            {/* If Include PF is checked: Choose PF Type & Show Breakdown */}
            {includePf && (
              <div className="pt-3 border-t border-base-300/50 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/70 font-medium">
                    PF Component to Add:
                  </span>
                  <div className="flex items-center gap-1.5 bg-base-100 p-0.5 rounded-xl border border-base-300/60">
                    <button
                      type="button"
                      onClick={() => handlePfTypeChange("employer")}
                      className={`btn btn-xs rounded-lg font-bold transition-all ${
                        pfType === "employer"
                          ? "btn-primary shadow-xs"
                          : "btn-ghost text-base-content/70 hover:bg-base-200"
                      }`}
                    >
                      Employer Only
                      {activeSlip && (
                        <span className="font-mono text-[10px] opacity-80">
                          (₹{slipErPf.toLocaleString("en-IN")})
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePfTypeChange("total")}
                      className={`btn btn-xs rounded-lg font-bold transition-all ${
                        pfType === "total"
                          ? "btn-primary shadow-xs"
                          : "btn-ghost text-base-content/70 hover:bg-base-200"
                      }`}
                    >
                      Total (Er + Ee)
                      {activeSlip && (
                        <span className="font-mono text-[10px] opacity-80">
                          (₹{slipTotalPf.toLocaleString("en-IN")})
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Math preview equation */}
                {activeSlip && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-base-content/80">
                      <span>In Hand: ₹{slipInHand.toLocaleString("en-IN")}</span>
                      <span>+</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        PF: ₹{currentPfAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-black text-xs text-primary">
                      <span>=</span>
                      <span>₹{calculatedSalaryWithPf.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: Monthly Salary Input (Manual / Final Amount) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="salary-amount-input"
                className="text-xs font-bold text-base-content flex items-center gap-1.5"
              >
                <span>Final Salary for {dayjs(currentMonth).format("MMM YYYY")}</span>
                <span className="text-primary font-mono">*</span>
              </label>

              {salaryInput && Number(salaryInput) > 0 && (
                <span className="text-[11px] text-base-content/60 font-mono">
                  ₹{Number(salaryInput).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">
                ₹
              </div>
              <input
                id="salary-amount-input"
                type="number"
                min="0"
                step="1"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                placeholder="Enter monthly salary amount (e.g. 75000)"
                autoFocus
                className="input input-bordered w-full pl-8 pr-10 rounded-2xl font-mono text-base font-bold bg-base-200/40 focus:bg-base-100 transition-colors"
              />
              {salaryInput && (
                <button
                  type="button"
                  onClick={() => setSalaryInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Presets / Actions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-base-content/50 font-medium">Quick:</span>

              {activeSlip && (
                <button
                  type="button"
                  onClick={() => setSalaryInput(String(slipInHand))}
                  className="badge badge-sm badge-ghost hover:badge-primary font-mono cursor-pointer transition-colors"
                >
                  In Hand (₹{slipInHand.toLocaleString("en-IN")})
                </button>
              )}

              {activeSlip && (
                <button
                  type="button"
                  onClick={() =>
                    setSalaryInput(String(slipInHand + currentPfAmount))
                  }
                  className="badge badge-sm badge-ghost hover:badge-warning font-mono cursor-pointer transition-colors"
                >
                  With PF (₹
                  {(slipInHand + currentPfAmount).toLocaleString("en-IN")})
                </button>
              )}

              {currentSalary > 0 && (
                <button
                  type="button"
                  onClick={() => setSalaryInput(String(currentSalary))}
                  className="badge badge-sm badge-ghost hover:badge-neutral font-mono cursor-pointer transition-colors"
                >
                  Previous (₹{Number(currentSalary).toLocaleString("en-IN")})
                </button>
              )}

              <button
                type="button"
                onClick={() => setSalaryInput("0")}
                className="badge badge-sm badge-ghost hover:badge-error font-mono cursor-pointer transition-colors"
              >
                Clear (₹0)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 bg-base-200/50 border-t border-base-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl font-medium"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-sm btn-primary rounded-xl font-bold gap-2 shadow-md hover:scale-102 transition-transform cursor-pointer px-5"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>
                    Save Salary (₹
                    {Number(salaryInput || 0).toLocaleString("en-IN")})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSalaryModal;
