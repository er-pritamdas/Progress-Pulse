import React, { useState, useEffect } from 'react';

const Loader = ({ message = "Please wait..." }) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setDisplayMessage(message);

    const msg = message.toLowerCase();
    if (msg.includes("building") || msg.includes("dashboard")) {
      setStepIndex(4);
    } else if (msg.includes("gathering") || msg.includes("data")) {
      setStepIndex(3);
    } else if (msg.includes("logged in")) {
      setStepIndex(2);
    } else if (msg.includes("logging in")) {
      setStepIndex(1);
    } else {
      setStepIndex(0);
    }

    // If initial message is "Logging in..." and takes more than 2 seconds, advance progressively
    if (msg.includes("logging in")) {
      const timer1 = setTimeout(() => {
        setDisplayMessage((prev) => (prev.toLowerCase().includes("logging in") ? "Logged in!" : prev));
        setStepIndex((prev) => (prev === 1 ? 2 : prev));
      }, 2000);

      const timer2 = setTimeout(() => {
        setDisplayMessage((prev) =>
          prev === "Logged in!" || prev.toLowerCase().includes("logging in") ? "Gathering your data..." : prev
        );
        setStepIndex((prev) => (prev <= 2 ? 3 : prev));
      }, 3000);

      const timer3 = setTimeout(() => {
        setDisplayMessage((prev) =>
          prev === "Gathering your data..." || prev === "Logged in!" || prev.toLowerCase().includes("logging in")
            ? "Building your dashboard..."
            : prev
        );
        setStepIndex((prev) => (prev <= 3 ? 4 : prev));
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [message]);

  return (
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-base-100/95 border border-base-300 shadow-2xl rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-4 max-w-xs w-full text-center animate-in zoom-in-95 duration-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <div className="space-y-2 w-full">
          <p
            key={displayMessage}
            className="text-base font-semibold text-base-content tracking-wide min-h-[1.75rem] flex items-center justify-center transition-all duration-300"
          >
            {displayMessage}
          </p>

          {stepIndex > 0 && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4].map((step) => (
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
        </div>
      </div>
    </div>
  );
};

export default Loader;
  
  