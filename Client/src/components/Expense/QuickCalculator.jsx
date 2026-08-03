import React, { useState, useEffect, useRef } from "react";
import { Calculator, X, Delete, Equal, RotateCcw } from "lucide-react";

const QuickCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDigit = (digit) => {
    if (display === "0" || display === "Error") {
      setDisplay(digit);
    } else {
      setDisplay((prev) => prev + digit);
    }
  };

  const handleDecimal = () => {
    if (display === "Error") {
      setDisplay("0.");
      return;
    }
    const parts = display.split(/[\+\-\*\÷\/]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const handleOperator = (op) => {
    if (display === "Error") return;
    const lastChar = display.slice(-1);
    if (["+", "-", "×", "÷", "*", "/"].includes(lastChar)) {
      setDisplay((prev) => prev.slice(0, -1) + op);
    } else {
      setDisplay((prev) => prev + op);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleBackspace = () => {
    if (display === "Error" || display.length <= 1) {
      setDisplay("0");
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    try {
      if (display === "Error") return;
      let evalExpr = display.replace(/×/g, "*").replace(/÷/g, "/");
      if (["+", "-", "*", "/"].includes(evalExpr.slice(-1))) {
        evalExpr = evalExpr.slice(0, -1);
      }
      if (!evalExpr) return;

      const result = new Function(`return (${evalExpr})`)();

      if (isNaN(result) || !isFinite(result)) {
        setExpression(`${display} =`);
        setDisplay("Error");
      } else {
        setExpression(`${display} =`);
        const formatted = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(4)));
        setDisplay(formatted);
      }
    } catch (err) {
      setExpression(`${display} =`);
      setDisplay("Error");
    }
  };

  // Keyboard support when dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "+") {
        handleOperator("+");
      } else if (e.key === "-") {
        handleOperator("-");
      } else if (e.key === "*") {
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "c" || e.key === "C") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, display]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button in Sub-Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-xs sm:btn-sm gap-1.5 rounded-xl border font-bold transition-all shadow-xs ${
          isOpen
            ? "btn-primary shadow-md scale-105"
            : "btn-outline border-base-300 hover:border-primary text-base-content/80 hover:text-primary"
        }`}
        title="Quick Calculator (+ - × ÷)"
      >
        <Calculator size={16} className="text-primary" />
        <span className="text-xs font-bold hidden sm:inline">Calculator</span>
      </button>

      {/* Professional Popover Window */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-[999999] w-80 bg-base-100 rounded-3xl shadow-2xl border-2 border-base-300 p-4.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-base-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                <Calculator size={16} />
              </div>
              <span className="text-xs font-extrabold text-base-content uppercase tracking-wider">
                Quick Calculator
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-xs btn-ghost btn-circle rounded-full opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* High Visibility Digital Screen */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-3.5 mb-4 text-right border border-slate-700/60 shadow-inner flex flex-col justify-between h-20">
            <div className="text-[11px] font-mono text-emerald-400/70 h-4 overflow-hidden truncate font-semibold">
              {expression || "\u00A0"}
            </div>
            <div className="text-3xl font-mono font-black tracking-wider text-emerald-400 overflow-x-auto [scrollbar-width:none]">
              {display}
            </div>
          </div>

          {/* High Contrast Professional Keypad */}
          <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono">
            {/* Row 1: AC, Backspace, Divide */}
            <button
              type="button"
              onClick={handleClear}
              className="col-span-2 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-500 dark:text-rose-400 font-extrabold text-xs transition-all active:scale-95 shadow-2xs"
            >
              AC
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-extrabold flex items-center justify-center transition-all active:scale-95 shadow-2xs"
              title="Backspace"
            >
              <Delete size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleOperator("÷")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs"
            >
              ÷
            </button>

            {/* Row 2: 7, 8, 9, Multiply */}
            <button
              type="button"
              onClick={() => handleDigit("7")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleDigit("8")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleDigit("9")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleOperator("×")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs"
            >
              ×
            </button>

            {/* Row 3: 4, 5, 6, Subtract */}
            <button
              type="button"
              onClick={() => handleDigit("4")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleDigit("5")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleDigit("6")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleOperator("-")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs"
            >
              -
            </button>

            {/* Row 4: 1, 2, 3, Add */}
            <button
              type="button"
              onClick={() => handleDigit("1")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleDigit("2")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleDigit("3")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleOperator("+")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs"
            >
              +
            </button>

            {/* Row 5: 0, Decimal, Equals */}
            <button
              type="button"
              onClick={() => handleDigit("0")}
              className="col-span-2 py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDecimal}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs"
            >
              .
            </button>
            <button
              type="button"
              onClick={handleCalculate}
              className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all active:scale-95 shadow-md flex items-center justify-center"
            >
              =
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCalculator;
