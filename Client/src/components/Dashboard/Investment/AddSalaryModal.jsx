import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  X,
  Briefcase,
  Calendar,
  Building2,
  Sparkles,
  Save,
  AlertCircle,
  Calculator,
  Coins,
  Receipt,
  Gift,
  CheckCircle2,
  Info,
  Award,
  TrendingUp,
} from "lucide-react";
import { evaluateMathExpression } from "../../../utils/mathExpression";

function AddSalaryModal({ isOpen, onClose, onSave, initialData = null, lastSalaryEntry = null }) {
  const [formData, setFormData] = useState({
    month: dayjs().format("YYYY-MM"),
    company: "",
    basicSalary: "",
    hra: "",
    flexi: "",
    bonus: "",
    erPf: "",
    taxes: "",
    gratuity: "",
    variablePay: "",
    ctc: "",
    notes: "",
  });

  const [isManualCtc, setIsManualCtc] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const initBasic = Number(initialData.basicSalary || 0);
      const initHra = Number(initialData.hra || 0);
      const initFlexi = Number(initialData.flexi || 0);
      const initBonus = Number(initialData.bonus || 0);
      const initGratuity = Number(initialData.gratuity || 0);
      const initVarPay = Number(initialData.variablePay || 0);
      const initErPf = Number(initialData.erPf || 0);
      const autoCtcVal =
        initBasic + initHra + initFlexi + initBonus + initGratuity + initVarPay + initErPf;

      const hasCustomCtc =
        initialData.ctc !== undefined &&
        initialData.ctc !== null &&
        initialData.ctc !== "" &&
        Math.abs(Number(initialData.ctc) - autoCtcVal) > 0.01;

      setFormData({
        month: initialData.month || dayjs().format("YYYY-MM"),
        company: initialData.company || "",
        basicSalary:
          initialData.basicSalary !== undefined && initialData.basicSalary !== null
            ? String(initialData.basicSalary)
            : "",
        hra:
          initialData.hra !== undefined && initialData.hra !== null
            ? String(initialData.hra)
            : "",
        flexi:
          initialData.flexi !== undefined && initialData.flexi !== null
            ? String(initialData.flexi)
            : "",
        bonus:
          initialData.bonus !== undefined && initialData.bonus !== null
            ? String(initialData.bonus)
            : "",
        erPf:
          initialData.erPf !== undefined && initialData.erPf !== null
            ? String(initialData.erPf)
            : "",
        taxes:
          initialData.taxes !== undefined && initialData.taxes !== null
            ? String(initialData.taxes)
            : "",
        gratuity:
          initialData.gratuity !== undefined && initialData.gratuity !== null
            ? String(initialData.gratuity)
            : "",
        variablePay:
          initialData.variablePay !== undefined && initialData.variablePay !== null
            ? String(initialData.variablePay)
            : "",
        ctc: hasCustomCtc ? String(initialData.ctc) : "",
        notes: initialData.notes || "",
      });
      setIsManualCtc(hasCustomCtc);
    } else if (lastSalaryEntry) {
      // Prefill with Previous data with Next month from the last entry
      const nextMonth = lastSalaryEntry.month
        ? dayjs(lastSalaryEntry.month).add(1, "month").format("YYYY-MM")
        : dayjs().format("YYYY-MM");

      setFormData({
        month: nextMonth,
        company: lastSalaryEntry.company || "",
        basicSalary:
          lastSalaryEntry.basicSalary !== undefined && lastSalaryEntry.basicSalary !== null
            ? String(lastSalaryEntry.basicSalary)
            : "",
        hra:
          lastSalaryEntry.hra !== undefined && lastSalaryEntry.hra !== null
            ? String(lastSalaryEntry.hra)
            : "",
        flexi:
          lastSalaryEntry.flexi !== undefined && lastSalaryEntry.flexi !== null
            ? String(lastSalaryEntry.flexi)
            : "",
        bonus:
          lastSalaryEntry.bonus !== undefined && lastSalaryEntry.bonus !== null
            ? String(lastSalaryEntry.bonus)
            : "",
        erPf:
          lastSalaryEntry.erPf !== undefined && lastSalaryEntry.erPf !== null
            ? String(lastSalaryEntry.erPf)
            : "",
        taxes:
          lastSalaryEntry.taxes !== undefined && lastSalaryEntry.taxes !== null
            ? String(lastSalaryEntry.taxes)
            : "",
        gratuity:
          lastSalaryEntry.gratuity !== undefined && lastSalaryEntry.gratuity !== null
            ? String(lastSalaryEntry.gratuity)
            : "",
        variablePay:
          lastSalaryEntry.variablePay !== undefined && lastSalaryEntry.variablePay !== null
            ? String(lastSalaryEntry.variablePay)
            : "",
        ctc: "",
        notes: lastSalaryEntry.notes || "",
      });
      setIsManualCtc(false);
    } else {
      setFormData({
        month: dayjs().format("YYYY-MM"),
        company: "",
        basicSalary: "",
        hra: "",
        flexi: "",
        bonus: "",
        erPf: "",
        taxes: "",
        gratuity: "",
        variablePay: "",
        ctc: "",
        notes: "",
      });
      setIsManualCtc(false);
    }
    setErrorMsg("");
  }, [initialData, lastSalaryEntry, isOpen]);

  // Helper to parse numeric values (supports math expressions)
  const parseVal = (val) => {
    if (!val) return 0;
    const mathVal = evaluateMathExpression(val);
    if (mathVal !== null) return mathVal;
    const num = Number(String(val).replace(/,/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Live calculations
  const calculated = useMemo(() => {
    const basic = parseVal(formData.basicSalary);
    const hra = parseVal(formData.hra);
    const flexi = parseVal(formData.flexi);
    const bonus = parseVal(formData.bonus);
    const erPf = parseVal(formData.erPf);
    const taxes = parseVal(formData.taxes);
    const gratuity = parseVal(formData.gratuity);
    const variablePay = parseVal(formData.variablePay);

    // Gross Cash Earnings = Basic + HRA + Flexi + Bonus
    const gross = basic + hra + flexi + bonus;
    // Total Earnings = Gross + Gratuity + Variable Pay
    const totalEarnings = gross + gratuity + variablePay;
    // Total Deductions = Employer PF + Taxes
    const deductions = erPf + taxes;
    // In Hand = Gross - Deductions
    const inHand = gross - deductions;
    // Auto CTC = Total Earnings + E6r PF (Gross + Gratuity + Variable Pay + Employer PF)
    const autoCtc = totalEarnings + erPf;

    return {
      basic,
      hra,
      flexi,
      bonus,
      gross,
      totalEarnings,
      erPf,
      taxes,
      deductions,
      inHand,
      gratuity,
      variablePay,
      autoCtc,
    };
  }, [
    formData.basicSalary,
    formData.hra,
    formData.flexi,
    formData.bonus,
    formData.erPf,
    formData.taxes,
    formData.gratuity,
    formData.variablePay,
  ]);

  const NUMERIC_FIELDS = new Set([
    "basicSalary",
    "hra",
    "flexi",
    "bonus",
    "erPf",
    "taxes",
    "gratuity",
    "variablePay",
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "ctc") {
      setIsManualCtc(true);
      setFormData((prev) => ({ ...prev, ctc: value }));
    } else if (NUMERIC_FIELDS.has(name)) {
      // Always reset manual CTC and recalculate automatically whenever ANY number changes
      setIsManualCtc(false);
      setFormData((prev) => ({ ...prev, [name]: value, ctc: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCtcBlur = () => {
    if (isManualCtc && (!formData.ctc || formData.ctc.trim() === "")) {
      setIsManualCtc(false);
      setFormData((prev) => ({ ...prev, ctc: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.month) {
      setErrorMsg("Please select a Month and Year.");
      return;
    }
    if (!formData.company.trim()) {
      setErrorMsg("Please enter the Company name.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        month: formData.month,
        company: formData.company.trim(),
        basicSalary: parseVal(formData.basicSalary),
        hra: parseVal(formData.hra),
        flexi: parseVal(formData.flexi),
        bonus: parseVal(formData.bonus),
        gross: calculated.gross,
        erPf: parseVal(formData.erPf),
        taxes: parseVal(formData.taxes),
        inHand: calculated.inHand,
        gratuity: parseVal(formData.gratuity),
        variablePay: parseVal(formData.variablePay),
        ctc: isManualCtc && formData.ctc ? parseVal(formData.ctc) : calculated.autoCtc,
        notes: formData.notes.trim(),
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save salary entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-6xl my-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP FLOATING HEADER CARD: Month, Company, Notes & Action Buttons */}
        <div className="bg-base-100 rounded-3xl border border-base-200 shadow-2xl p-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                <Briefcase size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-base-content flex items-center gap-2 flex-wrap">
                  <span>{initialData ? "Edit Salary Record" : "Add Monthly Salary Record"}</span>
                  <span className="badge badge-primary badge-sm font-semibold">
                    {initialData ? "Update" : "New Entry"}
                  </span>
                  {!initialData && lastSalaryEntry && (
                    <span className="badge badge-info badge-outline badge-sm font-semibold text-[10px]">
                      Prefilled from {dayjs(lastSalaryEntry.month).format("MMM YYYY")}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-base-content/60">
                  Track 3-part monthly breakdown: Earnings, Deductions & In-Hand Pay
                </p>
              </div>
            </div>

            {/* Top Action Buttons (Save, Cancel & Close) */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn btn-sm btn-ghost rounded-xl text-xs font-bold px-3 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5 px-5 shadow-md shadow-primary/25 cursor-pointer"
              >
                <Save size={15} />
                <span>{isSubmitting ? "Saving..." : initialData ? "Update Record" : "Save Record"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer ml-1"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Month, Company and Notes selector row */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label py-1 text-xs font-bold text-base-content flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" /> Month & Year *
              </label>
              <input
                type="month"
                name="month"
                required
                value={formData.month}
                onChange={handleChange}
                className="input input-bordered input-sm w-full rounded-xl font-medium bg-base-200/50 focus:bg-base-100"
              />
              <span className="text-[10px] text-base-content/50 mt-1 block">
                {formData.month ? dayjs(formData.month).format("MMMM YYYY") : "Select salary month"}
                {!initialData && lastSalaryEntry && (
                  <span className="text-primary font-semibold ml-1">
                    (Next month from {dayjs(lastSalaryEntry.month).format("MMM YYYY")})
                  </span>
                )}
              </span>
            </div>

            <div>
              <label className="label py-1 text-xs font-bold text-base-content flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" /> Company Name *
              </label>
              <input
                type="text"
                name="company"
                required
                placeholder="e.g. Google, Microsoft, TCS..."
                value={formData.company}
                onChange={handleChange}
                className="input input-bordered input-sm w-full rounded-xl font-medium bg-base-200/50 focus:bg-base-100"
              />
              <span className="text-[10px] text-base-content/50 mt-1 block">
                Employing company for this payslip
              </span>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label py-1 text-xs font-bold text-base-content flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Appraisal increment, Joining bonus..."
                value={formData.notes}
                onChange={handleChange}
                className="input input-bordered input-sm w-full rounded-xl text-xs bg-base-200/50 focus:bg-base-100"
              />
              <span className="text-[10px] text-base-content/50 mt-1 block">
                Additional remarks or slip reference
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-error text-xs py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-lg">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* 3 DISTINCT POPUP CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4.5 items-stretch">
            {/* -------------------------------------------------------------- */}
            {/* POPUP CARD 1: EARNINGS & BENEFITS (Left)                       */}
            {/* -------------------------------------------------------------- */}
            <div className="bg-base-100 rounded-3xl border border-base-200/90 shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:border-emerald-500/40">
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-base-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Coins size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-base-content">
                        1. Earnings & Benefits
                      </h4>
                      <p className="text-[11px] text-base-content/60">
                        Base, allowances, bonus & benefits
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-sm badge-outline badge-success text-[10px] font-bold">
                    Earnings
                  </span>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span>Basic Salary (₹)</span>
                      <span className="text-[10px] text-base-content/50 font-normal">Core Base</span>
                    </label>
                    <input
                      type="text"
                      name="basicSalary"
                      placeholder="0 or math (e.g. 50000)"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span>HRA (₹)</span>
                      <span className="text-[10px] text-base-content/50 font-normal">Rent Allowance</span>
                    </label>
                    <input
                      type="text"
                      name="hra"
                      placeholder="0 or math (e.g. 20000)"
                      value={formData.hra}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span>Flexi / RSA (₹)</span>
                      <span className="text-[10px] text-base-content/50 font-normal">Allowances</span>
                    </label>
                    <input
                      type="text"
                      name="flexi"
                      placeholder="0 or math (e.g. 15000)"
                      value={formData.flexi}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Gift size={12} /> Bonus (₹)
                      </span>
                      <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-normal">
                        Perf / Joining
                      </span>
                    </label>
                    <input
                      type="text"
                      name="bonus"
                      placeholder="0 or math (e.g. 25000)"
                      value={formData.bonus}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-emerald-500/5 border-emerald-500/30 focus:border-emerald-500 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Award size={12} className="text-primary" /> Gratuity (₹)
                      </span>
                      <span className="text-[10px] text-base-content/50 font-normal">Retirement</span>
                    </label>
                    <input
                      type="text"
                      name="gratuity"
                      placeholder="0 or math (e.g. 2400)"
                      value={formData.gratuity}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-primary" /> Variable Pay (₹)
                      </span>
                      <span className="text-[10px] text-base-content/50 font-normal">Incentive</span>
                    </label>
                    <input
                      type="text"
                      name="variablePay"
                      placeholder="0 or math (e.g. 10000)"
                      value={formData.variablePay}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Subtotal Box at Bottom of Left Popup */}
              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    Total Earnings
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{calculated.totalEarnings.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-700/80 dark:text-emerald-300/80 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                  <span>Gross Cash: ₹{calculated.gross.toLocaleString("en-IN")}</span>
                  <span>Benefits: ₹{(calculated.gratuity + calculated.variablePay).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* POPUP CARD 2: ALL DEDUCTIONS (Middle)                         */}
            {/* -------------------------------------------------------------- */}
            <div className="bg-base-100 rounded-3xl border border-base-200/90 shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:border-rose-500/40">
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-base-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-base-content">
                        2. All Deductions
                      </h4>
                      <p className="text-[11px] text-base-content/60">
                        Subtracted from Gross Pay
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-sm badge-outline badge-error text-[10px] font-bold">
                    Deductions
                  </span>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span>Employer PF (E6r PF) (₹)</span>
                      <span className="text-[10px] text-base-content/50 font-normal">PF Contribution</span>
                    </label>
                    <input
                      type="text"
                      name="erPf"
                      placeholder="0 or math (e.g. 1800)"
                      value={formData.erPf}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                    <span className="text-[10px] text-base-content/50 mt-1 block">
                      Employer's Provident Fund deduction
                    </span>
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                      <span>Tax + State Tax + Spl Allowance (₹)</span>
                      <span className="text-[10px] text-base-content/50 font-normal">TDS & Taxes</span>
                    </label>
                    <input
                      type="text"
                      name="taxes"
                      placeholder="0 or math (e.g. 8500)"
                      value={formData.taxes}
                      onChange={handleChange}
                      className="input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold"
                    />
                    <span className="text-[10px] text-base-content/50 mt-1 block">
                      Income TDS, Professional Tax & State taxes
                    </span>
                  </div>

                  {/* Informative Guidance Card */}
                  <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-xs text-base-content/70 flex items-start gap-2 mt-2">
                    <Info size={16} className="text-info shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      All statutory deductions entered here are subtracted directly from Gross pay to calculate your monthly In-Hand bank deposit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subtotal Box at Bottom of Middle Popup */}
              <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
                    Total Deductions
                  </span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                    -₹{calculated.deductions.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[10px] text-rose-700/70 dark:text-rose-300/70 mt-0.5">
                  Employer PF + Taxes
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* POPUP CARD 3: IN-HAND & CTC (Right)                            */}
            {/* -------------------------------------------------------------- */}
            <div className="bg-base-100 rounded-3xl border border-base-200/90 shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:border-primary/40">
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-base-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                      <Calculator size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-base-content">
                        3. Payout & Total CTC
                      </h4>
                      <p className="text-[11px] text-base-content/60">
                        In-Hand calculation & CTC
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-sm badge-outline badge-primary text-[10px] font-bold">
                    Payout
                  </span>
                </div>

                {/* PROMINENT AUTOMATIC IN-HAND DISPLAY BANNER */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-success/20 via-success/10 to-primary/10 border-2 border-success/40 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 text-success font-black text-[11px] uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Total In-Hand (Automatic)
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-success tracking-tight mt-1 font-mono">
                    ₹{calculated.inHand.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-base-content/60 mt-1 font-medium">
                    Gross Cash (₹{calculated.gross.toLocaleString("en-IN")}) − Deductions (₹{calculated.deductions.toLocaleString("en-IN")})
                  </div>
                </div>

                {/* Monthly CTC Input */}
                <div className="space-y-1.5">
                  <label className="label py-1 text-xs font-bold text-base-content flex items-center justify-between">
                    <span>Monthly CTC (₹)</span>
                    {isManualCtc ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualCtc(false);
                          setFormData((prev) => ({ ...prev, ctc: "" }));
                        }}
                        className="badge badge-xs badge-warning hover:badge-error cursor-pointer gap-1 font-bold text-[9px] transition-all"
                        title="Click to reset to auto-calculated CTC"
                      >
                        Custom ✕ (Reset to Auto)
                      </button>
                    ) : (
                      <span className="badge badge-xs badge-success/20 text-success border border-success/30 font-bold text-[9px]">
                        Auto-calculated
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="ctc"
                    placeholder={`Auto: ${calculated.autoCtc}`}
                    value={isManualCtc ? formData.ctc : (calculated.autoCtc > 0 ? calculated.autoCtc : "")}
                    onChange={handleChange}
                    onBlur={handleCtcBlur}
                    className={`input input-bordered input-sm w-full rounded-xl bg-base-200/40 focus:bg-base-100 font-mono text-xs font-semibold ${
                      isManualCtc ? "border-warning/60 focus:border-warning" : "border-base-300 focus:border-primary"
                    }`}
                  />
                  <div className="text-[10px] text-base-content/50 flex items-center justify-between px-0.5">
                    <span>
                      {isManualCtc
                        ? "Custom value active. Changing any component number will re-enable auto-calculation."
                        : "Always auto-calculated from Total Earnings + Employer PF."}
                    </span>
                  </div>
                </div>

                {/* CTC Formula Breakdown Card */}
                <div className="p-3 rounded-2xl bg-base-200/50 border border-base-200 text-xs space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">
                    CTC Breakdown
                  </div>
                  <div className="flex items-center justify-between text-base-content/70 text-[11px]">
                    <span>Total Earnings (Gross + Benefits):</span>
                    <span className="font-mono font-bold text-base-content">
                      ₹{calculated.totalEarnings.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base-content/70 text-[11px]">
                    <span>+ Employer PF (E6r PF):</span>
                    <span className="font-mono font-bold text-base-content">
                      ₹{calculated.erPf.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-t border-base-300/70 pt-1 flex items-center justify-between font-bold text-xs">
                    <span className="text-primary font-black">= Auto CTC:</span>
                    <span className="font-mono text-primary font-black">
                      ₹{calculated.autoCtc.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTC Subtotal Box at Bottom of Third Popup */}
              <div className="mt-5 p-3.5 rounded-2xl bg-base-200/60 border border-base-300">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-base-content/80 uppercase tracking-wider">
                    Total Cost To Company
                  </span>
                  <span className="text-base font-black text-base-content font-mono">
                    ₹{(isManualCtc && formData.ctc ? parseVal(formData.ctc) : calculated.autoCtc).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[10px] text-base-content/50 mt-0.5">
                  Total Earnings + Employer PF
                </div>
              </div>
            </div>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default AddSalaryModal;
