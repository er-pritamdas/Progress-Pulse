import React, { useState, useEffect } from 'react';

const Loader = ({ message = "Please wait...", onClose }) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [stepIndex, setStepIndex] = useState(0);
  const [showDismiss, setShowDismiss] = useState(false);

  useEffect(() => {
    setDisplayMessage(message);

    const msg = message.toLowerCase();
    if (msg.includes("building") || msg.includes("dashboard")) {
      setStepIndex(3);
    } else if (msg.includes("gathering") || msg.includes("data")) {
      setStepIndex(2);
    } else if (msg.includes("logged in") || msg.includes("verified")) {
      setStepIndex(1);
    } else {
      setStepIndex(0);
    }

    // Progressively update status if waiting on a slow/sleeping server (Render cold start)
    const isWaiting =
      msg.includes("logging in") ||
      msg.includes("please wait") ||
      msg.includes("connecting") ||
      msg.includes("verifying") ||
      msg.includes("loading");

    if (isWaiting) {
      const timer1 = setTimeout(() => {
        setDisplayMessage((prev) => {
          const p = prev.toLowerCase();
          return p.includes("logging in") || p.includes("please wait") || p.includes("connecting")
            ? "Connecting to server..."
            : prev;
        });
      }, 3000);

      const timer2 = setTimeout(() => {
        setDisplayMessage((prev) => {
          const p = prev.toLowerCase();
          return p.includes("connecting") || p.includes("logging in") || p.includes("please wait")
            ? "Server is waking up on Render... (free tier sleeps after 15m)"
            : prev;
        });
      }, 7000);

      const timer3 = setTimeout(() => {
        setDisplayMessage((prev) => {
          const p = prev.toLowerCase();
          return p.includes("waking up") || p.includes("connecting") || p.includes("render")
            ? "Almost ready! Finalizing server spin-up..."
            : prev;
        });
      }, 22000);

      const dismissTimer = setTimeout(() => {
        setShowDismiss(true);
      }, 15000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(dismissTimer);
      };
    } else {
      setShowDismiss(false);
    }
  }, [message]);

  return (
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-base-100/95 border border-base-300 shadow-2xl rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-4 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <div className="space-y-2 w-full">
          <p
            key={displayMessage}
            className="text-sm sm:text-base font-semibold text-base-content tracking-wide min-h-[2rem] flex items-center justify-center transition-all duration-300"
          >
            {displayMessage}
          </p>

          {stepIndex > 0 && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === stepIndex
                      ? "w-6 bg-primary"
                      : step < stepIndex
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-base-300"
                  }`}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-base-content/50 pt-1">
            Progress Pulse
          </p>

          {showDismiss && onClose && (
            <button
              onClick={onClose}
              type="button"
              className="mt-2 text-xs text-base-content/50 hover:text-base-content underline cursor-pointer"
            >
              Dismiss loading popup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loader;