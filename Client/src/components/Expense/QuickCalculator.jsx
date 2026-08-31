import React, { useState, useEffect, useMemo, useRef } from "react";
import { Calculator, X, Delete, Equal, RotateCcw, GripHorizontal } from "lucide-react";

const QuickCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mainBounds, setMainBounds] = useState({ right: 24, bottom: 24 });
  const [position, setPosition] = useState(null);
  
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ offsetX: 0, offsetY: 0 });
  const containerRef = useRef(null);

  // Calculate default initial spawn position (bottom-right near floating button)
  const getDefaultPosition = () => {
    const calcWidth = 320;
    const calcHeight = 490;
    const x = Math.max(16, window.innerWidth - calcWidth - (mainBounds?.right || 24) - 20);
    const y = Math.max(16, window.innerHeight - calcHeight - (mainBounds?.bottom || 24) - 50);
    return { x, y };
  };

  // When opened without existing position, initialize to default position
  useEffect(() => {
    if (isOpen && !position) {
      setPosition(getDefaultPosition());
    }
  }, [isOpen]);

  // Main window context positioning for floating button (Left of scrollbar)
  useEffect(() => {
    const getScrollContainer = (element) => {
      let parent = element?.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        if (["auto", "scroll"].includes(style.overflowY)) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return window;
    };

    const container = getScrollContainer(containerRef.current);

    const updatePosition = () => {
      if (container && container !== window) {
        const containerRect = container.getBoundingClientRect();
        const innerRight = containerRect.left + container.clientWidth;
        const rightOffset = Math.max(16, window.innerWidth - innerRight + 16);
        const bottomOffset = Math.max(24, window.innerHeight - containerRect.bottom + 24);
        setMainBounds({ right: rightOffset, bottom: bottomOffset });
      }
    };

    updatePosition();

    if (container === window) {
      window.addEventListener("scroll", updatePosition, { passive: true });
    } else {
      container.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("scroll", updatePosition, { passive: true });
    }
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      if (container === window) {
        window.removeEventListener("scroll", updatePosition);
      } else {
        container.removeEventListener("scroll", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      }
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  // Pointer drag handler for moving the calculator window
  const handlePointerDown = (e) => {
    // Do not initiate drag if user clicked an action button inside the header
    if (e.target.closest("button")) return;

    e.preventDefault();
    isDraggingRef.current = true;
    const currentPos = position || getDefaultPosition();

    dragOffsetRef.current = {
      offsetX: e.clientX - currentPos.x,
      offsetY: e.clientY - currentPos.y,
    };

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const calcWidth = 320;
      const calcHeight = 490;
      const maxX = Math.max(0, window.innerWidth - calcWidth - 10);
      const maxY = Math.max(0, window.innerHeight - calcHeight - 10);

      const newX = Math.min(Math.max(10, moveEvent.clientX - dragOffsetRef.current.offsetX), maxX);
      const newY = Math.min(Math.max(10, moveEvent.clientY - dragOffsetRef.current.offsetY), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Real-time auto-calculation preview of expression before clicking "="
  const liveResult = useMemo(() => {
    if (!display || display === "0" || display === "Error" || isEvaluated) return null;

    // Check if contains math operator (+, -, ×, ÷, *, /)
    if (!/[\+\-\×\÷\*\//]/.test(display)) return null;

    try {
      let evalExpr = display.replace(/×/g, "*").replace(/÷/g, "/");
      // Trim trailing operators or whitespace for clean evaluation preview
      while (["+", "-", "*", "/", " "].includes(evalExpr.slice(-1))) {
        evalExpr = evalExpr.slice(0, -1);
      }
      if (!evalExpr) return null;

      const res = new Function(`return (${evalExpr})`)();
      if (isNaN(res) || !isFinite(res)) return null;

      const formatted = Number.isInteger(res)
        ? res.toLocaleString("en-IN")
        : Number(res.toFixed(6)).toLocaleString("en-IN", { maximumFractionDigits: 4 });
      return formatted;
    } catch {
      return null;
    }
  }, [display, isEvaluated]);

  // Dynamic Font Size Scaling based on characters length
  const getDynamicFontSize = (text) => {
    const len = String(text || "").length;
    if (len <= 7) return "text-3xl"; // ~30px
    if (len <= 10) return "text-2xl"; // ~24px
    if (len <= 14) return "text-xl"; // ~20px
    if (len <= 18) return "text-lg"; // ~18px
    if (len <= 22) return "text-base"; // ~16px
    return "text-xs"; // ~12px
  };

  const handleDigit = (digit) => {
    if (display === "0" || display === "Error" || isEvaluated) {
      setDisplay(digit);
      setIsEvaluated(false);
      if (isEvaluated) setExpression("");
    } else {
      setDisplay((prev) => prev + digit);
    }
  };

  const handleDecimal = () => {
    if (display === "Error" || isEvaluated) {
      setDisplay("0.");
      setIsEvaluated(false);
      if (isEvaluated) setExpression("");
      return;
    }
    const parts = display.split(/[\+\-\*\÷\/×]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const handleOperator = (op) => {
    if (display === "Error") return;
    setIsEvaluated(false);
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
    setIsEvaluated(false);
  };

  const handleBackspace = () => {
    if (isEvaluated) {
      handleClear();
      return;
    }
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
      while (["+", "-", "*", "/", " "].includes(evalExpr.slice(-1))) {
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
        setIsEvaluated(true);
      }
    } catch (err) {
      setExpression(`${display} =`);
      setDisplay("Error");
    }
  };

  // Keyboard support when calculator is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't capture keyboard if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        return;
      }

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
      } else if (e.key === "c" || e.key === "C") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, display, isEvaluated]);

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div
        ref={containerRef}
        style={{
          right: `${mainBounds.right}px`,
          bottom: `${mainBounds.bottom}px`,
        }}
        className="fixed z-[99998] transition-all duration-300 animate-in fade-in zoom-in-90"
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`btn btn-primary btn-circle shadow-2xl border-2 border-primary-content/20 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${
            isOpen ? "ring-4 ring-primary/40 scale-110" : ""
          }`}
          title="Quick Calculator (+ - × ÷)"
        >
          <Calculator size={22} />
        </button>
      </div>

      {/* Draggable / Movable Standalone Calculator Window */}
      {isOpen && (
        <div
          style={{
            left: position ? `${position.x}px` : undefined,
            top: position ? `${position.y}px` : undefined,
            right: !position ? `${mainBounds.right + 60}px` : undefined,
            bottom: !position ? `${mainBounds.bottom + 60}px` : undefined,
          }}
          className="fixed z-[999999] w-80 bg-base-100/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-base-300 p-4 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Draggable Header */}
          <div
            onPointerDown={handlePointerDown}
            className="flex justify-between items-center mb-2.5 pb-2 border-b border-base-200 cursor-grab active:cursor-grabbing select-none group"
            title="Click and drag to move calculator anywhere"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/15 text-primary shrink-0">
                <Calculator size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-base-content uppercase tracking-wider leading-tight">
                  Quick Calculator
                </span>
                <span className="text-[9px] text-base-content/40 font-semibold flex items-center gap-0.5">
                  <GripHorizontal size={10} /> Drag to move
                </span>
              </div>
            </div>

            {/* Close Button (Only way to close besides toggling trigger) */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-xs btn-ghost btn-circle rounded-full opacity-60 hover:opacity-100 hover:bg-base-200 text-base-content cursor-pointer"
              title="Close Calculator"
            >
              <X size={15} />
            </button>
          </div>

          {/* High Visibility Dynamic Auto-Calculating Digital Screen */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 mb-3 text-right border border-slate-700/60 shadow-inner flex flex-col justify-between h-24 overflow-hidden">
            {/* Top Subline: Previous Expression OR Real-Time Auto-Calculation Preview */}
            <div className="flex items-center justify-between text-xs font-mono h-5 overflow-hidden">
              {liveResult !== null ? (
                <div className="w-full flex items-center justify-between">
                  <span className="text-[9.5px] uppercase font-black tracking-wider text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Auto =
                  </span>
                  <span className="font-mono font-black text-emerald-400 text-sm tracking-wide animate-pulse">
                    {liveResult}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-400 font-semibold w-full text-right truncate">
                  {expression || "\u00A0"}
                </div>
              )}
            </div>

            {/* Main Primary Display with Dynamic Font Size */}
            <div
              className={`font-mono font-black tracking-wider text-emerald-400 overflow-x-auto [scrollbar-width:none] whitespace-nowrap transition-all duration-150 ${getDynamicFontSize(
                display
              )}`}
            >
              {display}
            </div>
          </div>

          {/* High Contrast Professional Keypad */}
          <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono">
            {/* Row 1: AC, Backspace, Divide */}
            <button
              type="button"
              onClick={handleClear}
              className="col-span-2 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-500 dark:text-rose-400 font-extrabold text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              AC
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-extrabold flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
              title="Backspace"
            >
              <Delete size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleOperator("÷")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              ÷
            </button>

            {/* Row 2: 7, 8, 9, Multiply */}
            <button
              type="button"
              onClick={() => handleDigit("7")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleDigit("8")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleDigit("9")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleOperator("×")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              ×
            </button>

            {/* Row 3: 4, 5, 6, Subtract */}
            <button
              type="button"
              onClick={() => handleDigit("4")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleDigit("5")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleDigit("6")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleOperator("-")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              -
            </button>

            {/* Row 4: 1, 2, 3, Add */}
            <button
              type="button"
              onClick={() => handleDigit("1")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleDigit("2")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleDigit("3")}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleOperator("+")}
              className="py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-black text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              +
            </button>

            {/* Row 5: 0, Decimal, Equals */}
            <button
              type="button"
              onClick={() => handleDigit("0")}
              className="col-span-2 py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDecimal}
              className="py-2.5 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 text-base-content font-bold text-base transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              .
            </button>
            <button
              type="button"
              onClick={handleCalculate}
              className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            >
              =
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickCalculator;
