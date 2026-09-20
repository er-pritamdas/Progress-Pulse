import React from "react";
import { Link } from "react-router-dom";

const LoginLeftCard = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-lg space-y-6">
      <Link to="/" className="flex items-center gap-3 mb-2 group">
        <div className="w-14 h-14 rounded-3xl bg-base-100 border border-base-content/10 shadow-xl p-3 flex items-center justify-center transition-transform group-hover:scale-105">
          <img src="/favicon/favicon.svg" alt="Progress Pulse Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-3xl font-black tracking-tight text-base-content">
          Progress Pulse
        </span>
      </Link>

      <h1 className="text-4xl lg:text-5xl font-black leading-tight text-base-content tracking-tight">
        Track. Reflect. <span className="text-primary">Improve.</span>
      </h1>

      <p className="text-base-content/70 text-base lg:text-lg font-medium leading-relaxed">
        Your personal operating system for daily discipline, tracking habits, mastering expenses, and driving continuous self-growth.
      </p>

      <div className="pt-2 flex items-center justify-center gap-4 text-xs font-bold text-base-content/50 uppercase tracking-widest">
        <span>Habits</span>
        <span>•</span>
        <span>Finances</span>
        <span>•</span>
        <span>Portfolio</span>
      </div>
    </div>
  );
};

export default LoginLeftCard;
