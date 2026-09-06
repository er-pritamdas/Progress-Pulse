import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  X,
  ArrowDownRight,
  Calendar,
  Wallet,
  AlertCircle,
  HelpCircle,
  FileText,
  Percent,
} from "lucide-react";

const REASON_OPTIONS = [
  "Medical Treatment",
  "House Construction / Purchase",
  "Higher Education",
  "Marriage / Family Function",
  "Special Emergency",
  "Retirement / Pre-retirement",
  "Other",
];

const AddPfWithdrawalModal = ({
  isOpen,
  onClose,
  onSaveWithdrawal,
  initialData = null,
  availableBalance = 0,
}) => {
  const isEdit = Boolean(initialData && (initialData.id || initialData._id));

  // Max withdrawable amount: if editing, add back the previously withdrawn amount
  const previousAmt = isEdit ? Number(initialData?.amount || 0) : 0;
  const maxWithdrawable = Math.max(0, availableBalance + previousAmt);

  const [formData, setFormData] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    amount: "",
    reason: "Medical Treatment",
    customReason: "",
    notes: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isStandardReason = REASON_OPTIONS.includes(initialData.reason);
        setFormData({
          date: initialData.date || dayjs().format("YYYY-MM-DD"),
          amount: String(initialData.amount || ""),
          reason: isStandardReason ? initialData.reason : "Other",
          customReason: isStandardReason ? "" : initialData.reason || "",
          notes: initialData.notes || "",
        });
      } else {
        setFormData({
          date: dayjs().format("YYYY-MM-DD"),
          amount: "",
          reason: "Medical Treatment",
          customReason: "",
          notes: "",
        });
      }
      setErrorMsg("");
      setSubmitting(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handlePercentageSelect = (pct) => {
    if (maxWithdrawable <= 0) return;
    const calcAmt = Math.round((maxWithdrawable * pct) / 100);
    setFormData((prev) => ({
      ...prev,
      amount: String(calcAmt),
    }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(formData.amount);

    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Please enter a valid withdrawal amount greater than ₹0.");
      return;
    }

    if (numAmount > maxWithdrawable) {
      setErrorMsg(
        `Withdrawal amount (₹${numAmount.toLocaleString("en-IN")}) exceeds available balance (₹${maxWithdrawable.toLocaleString("en-IN")}).`
      );
      return;
    }

    if (!formData.date) {
      setErrorMsg("Please select a valid withdrawal date.");
      return;
    }

    const finalReason =
      formData.reason === "Other" && formData.customReason.trim()
        ? formData.customReason.trim()
        : formData.reason;

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSaveWithdrawal(
        {
          ...(initialData?.id || initialData?._id
            ? { id: initialData.id || initialData._id }
            : {}),
          date: formData.date,
          amount: numAmount,
          reason: finalReason,
          notes: formData.notes.trim(),
        },
        isEdit
      );
      onClose();
    } catch (err) {
      console.error("Error saving PF withdrawal:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to record withdrawal. Please check your inputs and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open z-50 backdrop-blur-sm bg-black/60 transition-all duration-200">
      <div className="modal-box max-w-lg bg-base-100 p-0 rounded-3xl border border-base-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
              <ArrowDownRight size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-base-content">
                {isEdit ? "Edit PF Withdrawal" : "Withdraw from PF"}
              </h3>
              <p className="text-xs text-base-content/60">
                Liquidate / Withdraw from your available Provident Fund balance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
          >
            <X size={16} />
          </button>
        </div>

        {/* Available Balance Hero Banner */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3.5 rounded-2xl bg-base-200/70 border border-base-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Wallet size={18} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                  Available PF Balance
                </span>
                <span className="text-lg font-black text-success">
                  ₹{maxWithdrawable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <span className="badge badge-sm badge-success badge-soft font-semibold">
              Ready to Withdraw
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 text-xs">
          {errorMsg && (
            <div className="alert alert-error text-xs py-2 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-base-content">
                Withdrawal Amount (₹) <span className="text-error">*</span>
              </label>
              <span className="text-[11px] text-base-content/50">
                Max: ₹{maxWithdrawable.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-base-content/50 text-sm">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                max={maxWithdrawable}
                required
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  setErrorMsg("");
                }}
                placeholder="0"
                className="input input-sm pl-8 w-full rounded-xl bg-base-200/60 border-base-200 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageSelect(pct)}
                  className="btn btn-xs rounded-lg flex-1 bg-base-200 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 font-semibold text-[11px] border border-base-200 transition-colors"
                >
                  {pct === 100 ? "Max (100%)" : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Reason Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1">
              <label className="font-bold text-base-content">
                Withdrawal Date <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input input-sm pl-9 w-full rounded-xl bg-base-200/60 border-base-200 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="font-bold text-base-content">
                Reason / Purpose
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="select select-sm select-bordered rounded-xl text-xs w-full bg-base-200/60 font-medium"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Reason input if "Other" is chosen */}
          {formData.reason === "Other" && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="font-bold text-base-content">
                Specify Reason
              </label>
              <input
                type="text"
                value={formData.customReason}
                onChange={(e) =>
                  setFormData({ ...formData, customReason: e.target.value })
                }
                placeholder="e.g., Relocation, Medical Emergency, etc."
                className="input input-sm w-full rounded-xl bg-base-200/60 border-base-200 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-base-content flex items-center gap-1.5">
              <FileText size={13} className="text-base-content/50" />
              <span>Notes / Remarks (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Reference claim number, application approval ID..."
              className="textarea textarea-sm w-full rounded-xl bg-base-200/60 border-base-200 text-xs resize-none focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-base-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl px-4 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || maxWithdrawable <= 0}
              className="btn btn-sm btn-warning text-warning-content rounded-xl px-5 text-xs font-bold gap-1.5 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              <ArrowDownRight size={15} />
              <span>{submitting ? "Saving..." : isEdit ? "Update Withdrawal" : "Confirm Withdrawal"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPfWithdrawalModal;
