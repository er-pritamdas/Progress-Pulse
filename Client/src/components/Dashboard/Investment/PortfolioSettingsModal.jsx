import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  X,
  Settings2,
  Calendar,
  Target,
  Flag,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Info
} from "lucide-react";

const PRESET_LIMITS = [
  { label: "₹10 Lakh", value: 1000000 },
  { label: "₹25 Lakh", value: 2500000 },
  { label: "₹50 Lakh", value: 5000000 },
  { label: "₹1 Crore", value: 10000000 },
  { label: "₹2 Crore", value: 20000000 },
  { label: "₹5 Crore", value: 50000000 },
];

export const calculateExactAge = (dobString) => {
  if (!dobString) return { years: 0, months: 0, days: 0 };
  const birthDate = dayjs(dobString);
  const today = dayjs();
  if (!birthDate.isValid() || birthDate.isAfter(today)) {
    return { years: 0, months: 0, days: 0 };
  }

  let years = today.year() - birthDate.year();
  let months = today.month() - birthDate.month();
  let days = today.date() - birthDate.date();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = today.subtract(1, "month").daysInMonth();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
};

export default function PortfolioSettingsModal({
  isOpen,
  onClose,
  upperLimit = 5000000,
  milestones = [],
  dob = "1998-05-15",
  onSave,
}) {
  const [localLimit, setLocalLimit] = useState(upperLimit);
  const [localDob, setLocalDob] = useState(dob);
  const [localMilestones, setLocalMilestones] = useState(milestones);
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("");
  const [newMilestoneLabel, setNewMilestoneLabel] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLocalLimit(upperLimit);
      setLocalDob(dob);
      setLocalMilestones(milestones && milestones.length > 0 ? [...milestones] : generateDefaultMilestones(upperLimit));
      setNewMilestoneAmount("");
      setNewMilestoneLabel("");
    }
  }, [isOpen, upperLimit, dob, milestones]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function generateDefaultMilestones(limit) {
    const lim = Number(limit) || 5000000;
    return [
      { id: "m1", label: "25% Milestone", amount: Math.round(lim * 0.25) },
      { id: "m2", label: "50% Halfway Mark", amount: Math.round(lim * 0.5) },
      { id: "m3", label: "75% Three-Quarter Goal", amount: Math.round(lim * 0.75) },
      { id: "m4", label: "100% Target Portfolio", amount: lim },
    ];
  }

  const handleAutoGenerate = (steps = 4) => {
    const lim = Number(localLimit) || 5000000;
    const generated = [];
    for (let i = 1; i <= steps; i++) {
      const pct = (i / steps) * 100;
      const amt = Math.round((lim * i) / steps);
      generated.push({
        id: `auto-${i}-${Date.now()}`,
        label: `${pct}% Milestone`,
        amount: amt,
      });
    }
    setLocalMilestones(generated);
  };

  const handleAddMilestone = () => {
    const amt = Number(newMilestoneAmount);
    if (!amt || amt <= 0) return;
    if (amt > Number(localLimit)) {
      alert(`Milestone amount (₹${amt.toLocaleString("en-IN")}) cannot exceed upper limit (₹${Number(localLimit).toLocaleString("en-IN")})`);
      return;
    }

    const newM = {
      id: `m-${Date.now()}`,
      label: newMilestoneLabel.trim() || `Milestone ₹${amt.toLocaleString("en-IN")}`,
      amount: amt,
    };

    const updated = [...localMilestones, newM].sort((a, b) => a.amount - b.amount);
    setLocalMilestones(updated);
    setNewMilestoneAmount("");
    setNewMilestoneLabel("");
  };

  const handleRemoveMilestone = (id) => {
    setLocalMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    const finalLimit = Number(localLimit) || 5000000;
    const finalDob = localDob || "1998-05-15";
    const sortedMilestones = [...localMilestones].sort((a, b) => a.amount - b.amount);

    onSave({
      upperLimit: finalLimit,
      milestones: sortedMilestones,
      dob: finalDob,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setLocalLimit(5000000);
    setLocalDob("1998-05-15");
    setLocalMilestones(generateDefaultMilestones(5000000));
  };

  const previewAge = calculateExactAge(localDob);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-base-100 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-base-300/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-200/80 bg-base-100/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-base-content">
                Portfolio & Goal Settings
              </h2>
              <p className="text-xs text-base-content/60 font-medium">
                Customize your upper limit, target milestones, and birth date
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content hover:bg-base-200"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(92vh-140px)]">
          {/* 1. Date of Birth Section */}
          <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> User Date of Birth (DOB)
              </label>
              <span className="badge badge-sm font-mono font-bold bg-primary/10 text-primary border-primary/20">
                {previewAge.years}y {previewAge.months}m {previewAge.days}d
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full font-bold font-mono bg-base-100 text-xs rounded-xl"
                  value={localDob}
                  max={dayjs().format("YYYY-MM-DD")}
                  onChange={(e) => setLocalDob(e.target.value)}
                />
              </div>
              <div className="text-xs text-base-content/70 bg-base-100 p-2.5 rounded-xl border border-base-300/40">
                <span className="font-bold text-base-content">Calculated Age: </span>
                <span className="font-mono text-primary font-extrabold">
                  {previewAge.years} Years, {previewAge.months} Months, {previewAge.days} Days
                </span>
              </div>
            </div>
          </div>

          {/* 2. Portfolio Upper Limit (Goal Target) */}
          <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <Target size={14} className="text-emerald-500" /> Upper Limit (Target Net Worth Goal)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ₹{Number(localLimit || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-base-content/60">₹</span>
              <input
                type="number"
                min="100000"
                step="50000"
                className="input input-bordered input-sm w-full font-mono font-extrabold text-sm rounded-xl bg-base-100"
                value={localLimit}
                onChange={(e) => setLocalLimit(Math.max(0, Number(e.target.value)))}
                placeholder="Enter target portfolio upper limit in INR"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-base-content/50 mr-1">Presets:</span>
              {PRESET_LIMITS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setLocalLimit(p.value)}
                  className={`btn btn-xs rounded-lg font-mono font-bold transition-all ${
                    Number(localLimit) === p.value
                      ? "btn-primary text-primary-content shadow-xs"
                      : "bg-base-100 hover:bg-base-300 border-base-300 text-base-content/70"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Achievement Points / Milestones */}
          <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/50 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <Flag size={14} className="text-amber-500" /> Achievement Points (0 to Upper Limit)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutoGenerate(4)}
                  className="btn btn-ghost btn-xs font-bold text-primary gap-1 border border-primary/20 rounded-lg hover:bg-primary/10"
                  title="Auto generate 4 equal milestone steps (25%, 50%, 75%, 100%)"
                >
                  <Sparkles size={11} /> 4 Steps
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoGenerate(5)}
                  className="btn btn-ghost btn-xs font-bold text-primary gap-1 border border-primary/20 rounded-lg hover:bg-primary/10"
                  title="Auto generate 5 equal milestone steps (20%, 40%, 60%, 80%, 100%)"
                >
                  <Sparkles size={11} /> 5 Steps
                </button>
              </div>
            </div>

            <p className="text-xs text-base-content/60">
              Define checkpoint targets to visualize your portfolio progression along the semi-circle gauge.
            </p>

            {/* Current Milestones List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {localMilestones.length === 0 ? (
                <div className="text-center py-4 bg-base-100 rounded-xl border border-dashed border-base-300 text-xs text-base-content/50">
                  No achievement milestones set. Click "4 Steps" above or add below.
                </div>
              ) : (
                localMilestones.map((m, idx) => {
                  const pct = localLimit > 0 ? ((m.amount / localLimit) * 100).toFixed(0) : 0;
                  return (
                    <div
                      key={m.id || idx}
                      className="flex items-center justify-between gap-2 p-2.5 bg-base-100 rounded-xl border border-base-300/40 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-base-content">{m.label}</span>
                          <span className="text-[10px] text-base-content/50 ml-1.5">({pct}%)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(m.amount).toLocaleString("en-IN")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(m.id)}
                          className="btn btn-ghost btn-xs btn-circle text-rose-500 hover:bg-rose-500/10"
                          title="Remove milestone"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Milestone */}
            <div className="bg-base-100 p-3 rounded-xl border border-base-300/60 space-y-2">
              <span className="text-[11px] font-bold text-base-content/70">
                + Add Custom Achievement Point:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    className="input input-bordered input-xs w-full text-xs font-medium rounded-lg"
                    placeholder="Milestone Label (e.g. 1st Goal)"
                    value={newMilestoneLabel}
                    onChange={(e) => setNewMilestoneLabel(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="number"
                    min="1000"
                    max={localLimit}
                    step="25000"
                    className="input input-bordered input-xs w-full text-xs font-mono font-bold rounded-lg"
                    placeholder="Amount in ₹"
                    value={newMilestoneAmount}
                    onChange={(e) => setNewMilestoneAmount(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    disabled={!newMilestoneAmount || Number(newMilestoneAmount) <= 0}
                    className="btn btn-primary btn-xs w-full rounded-lg gap-1 font-bold"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-base-200/40 border-t border-base-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content gap-1 font-bold"
          >
            <RotateCcw size={12} /> Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-base-content/70 hover:bg-base-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm rounded-xl gap-2 font-bold shadow-md shadow-primary/20"
            >
              <CheckCircle2 size={14} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
