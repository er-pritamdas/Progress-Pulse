import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

function ErrorAlert({ message, onClose, top }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [message]);

  const handleDismiss = () => {
    setDismissed(true);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {message && !dismissed && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[999999] pointer-events-none flex justify-center w-full max-w-lg px-4"
          style={{ top: top !== undefined ? (typeof top === "number" ? `${top}px` : top) : "12px" }}
        >
          <motion.div
            role="alert"
            className="pointer-events-auto flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl border border-error/35 bg-base-100/70 text-base-content backdrop-blur-xl backdrop-saturate-150 ring-1 ring-error/25 w-auto max-w-full"
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="w-7 h-7 rounded-xl bg-error/25 text-error flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-md">
              <AlertCircle size={16} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-error">
                Notice / Error
              </span>
              <span className="text-xs sm:text-sm font-bold text-base-content leading-snug break-words">
                {message}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-base-content shrink-0 ml-1"
              title="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ErrorAlert;
