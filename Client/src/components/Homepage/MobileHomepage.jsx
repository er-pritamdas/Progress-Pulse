import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap,
    BarChart2,
    ShieldCheck,
    Smile,
    FilePlus,
    Activity,
    TrendingUp,
    Award,
    Flame,
    Wallet,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    ChevronDown
} from 'lucide-react';

function MobileHomepage() {
    const [showFullPreview, setShowFullPreview] = useState(false);

    const reasons = [
        {
            icon: <Zap size={22} className="text-secondary" />,
            title: "Lightning Fast",
            description: "Quick logs & zero lag on phone."
        },
        {
            icon: <BarChart2 size={22} className="text-primary" />,
            title: "Deep Analytics",
            description: "Visual heatmaps and trends."
        },
        {
            icon: <ShieldCheck size={22} className="text-accent" />,
            title: "Privacy First",
            description: "End-to-end encrypted storage."
        },
        {
            icon: <Smile size={22} className="text-info" />,
            title: "Intuitive UX",
            description: "Simple, distraction-free design."
        }
    ];

    const steps = [
        {
            step: "01",
            title: "Add Data",
            description: "Quickly record daily habits, expenses, or income in seconds.",
            icon: <FilePlus size={18} className="text-primary" />
        },
        {
            step: "02",
            title: "Track Daily",
            description: "Build momentum with streak counters and daily accountability.",
            icon: <Activity size={18} className="text-secondary" />
        },
        {
            step: "03",
            title: "Analyze Progress",
            description: "Inspect interactive heatmaps, macro targets, and cash flows.",
            icon: <TrendingUp size={18} className="text-accent" />
        },
        {
            step: "04",
            title: "Level Up",
            description: "Optimize your routine with data-backed feedback loops.",
            icon: <Award size={18} className="text-success" />
        }
    ];

    return (
        <div className="w-full bg-base-300 text-base-content overflow-x-hidden">

            {/* 1. MOBILE HERO SECTION */}
            <section id="home" className="relative pt-6 pb-12 px-4 flex flex-col items-center text-center overflow-hidden">
                {/* Background Glow Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                <div className="absolute top-40 right-0 w-60 h-60 bg-secondary/15 rounded-full blur-[90px] pointer-events-none -z-10"></div>

                {/* Tag Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold mb-4 shadow-xs"
                >
                    <Sparkles size={13} className="animate-pulse" />
                    <span>Your Personal Operating System</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3"
                >
                    Master your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                        Life & Finance.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-sm text-base-content/75 leading-relaxed max-w-sm mb-6"
                >
                    Atomic habit streaks, smart expense tracking, and investment growth — unified into one effortless mobile experience.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-row items-center gap-3 w-full max-w-xs mb-8"
                >
                    <Link
                        to="/signup"
                        className="btn btn-primary rounded-xl flex-1 font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5"
                    >
                        <span>Get Started</span>
                        <ArrowRight size={15} />
                    </Link>
                    <Link
                        to="/login"
                        className="btn btn-outline rounded-xl flex-1 font-bold text-sm bg-base-100/40"
                    >
                        Login
                    </Link>
                </motion.div>

                {/* Mobile Interactive Pillars Preview Cards */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="w-full max-w-sm space-y-3 text-left"
                >
                    {/* Habit Streak Card */}
                    <div className="bg-base-100/70 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-orange-500/15 text-orange-500 rounded-lg">
                                    <Flame size={18} />
                                </div>
                                <span className="font-extrabold text-sm">Habit Tracker</span>
                            </div>
                            <span className="badge badge-sm badge-warning font-bold gap-1 text-[11px]">
                                🔥 14 Day Streak
                            </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs bg-base-200/50 px-2.5 py-1.5 rounded-lg">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 size={13} className="text-success" />
                                    Morning Workout
                                </span>
                                <span className="text-success font-semibold text-[11px]">Done</span>
                            </div>
                            <div className="flex items-center justify-between text-xs bg-base-200/50 px-2.5 py-1.5 rounded-lg">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 size={13} className="text-success" />
                                    Read 20 Pages
                                </span>
                                <span className="text-success font-semibold text-[11px]">Done</span>
                            </div>
                        </div>
                    </div>

                    {/* Expense Card */}
                    <div className="bg-base-100/70 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-500/15 text-emerald-500 rounded-lg">
                                    <Wallet size={18} />
                                </div>
                                <span className="font-extrabold text-sm">Smart Expenses</span>
                            </div>
                            <span className="badge badge-sm badge-success font-bold text-[11px]">
                                34% Saved
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-base-200/50 px-3 py-2 rounded-lg text-xs">
                            <div>
                                <div className="text-base-content/60 text-[10px] uppercase font-bold tracking-wider">Monthly Flow</div>
                                <div className="font-bold text-sm">₹28,450 spent</div>
                            </div>
                            <div className="text-right">
                                <div className="text-base-content/60 text-[10px] uppercase font-bold tracking-wider">Budget Status</div>
                                <div className="font-bold text-emerald-400 text-xs">On Track 🟢</div>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Web App Preview */}
                    <div className="pt-1">
                        <button
                            onClick={() => setShowFullPreview(!showFullPreview)}
                            className="btn btn-xs btn-ghost w-full flex items-center justify-center gap-1 text-base-content/70 hover:text-primary font-semibold text-xs"
                        >
                            <span>{showFullPreview ? "Hide Desktop App Preview" : "Tap to Preview Full Dashboard"}</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showFullPreview ? "rotate-180" : ""}`} />
                        </button>

                        {showFullPreview && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 rounded-2xl overflow-hidden border border-base-content/15 shadow-xl bg-base-200"
                            >
                                <div className="bg-base-300 px-3 py-1.5 flex items-center gap-1.5 border-b border-base-content/10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                    <span className="text-[10px] text-base-content/50 ml-2 font-mono">progress-pulse.com</span>
                                </div>
                                <img
                                    src="/Main_Dashboard.png"
                                    alt="Progress Pulse Dashboard"
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* 2. MOBILE FEATURES ("WHAT") */}
            <section id="what" className="py-12 px-4 bg-base-200/40 border-t border-base-content/5">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2.5">
                        Features
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                        Everything you need to <span className="text-primary">Level Up</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                        Integrated tools designed for high achievers wanting data-driven personal growth.
                    </p>
                </div>

                <div className="space-y-8 max-w-md mx-auto">
                    {/* Feature 1: Habits */}
                    <div className="bg-base-100/60 backdrop-blur-md rounded-2xl p-4 border border-base-content/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-6 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Feature 1</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1.5">Track Your Habits</h3>
                        <p className="text-xs text-base-content/70 mb-4 leading-relaxed">
                            Build habits that stick. Visualize consistency with heatmaps, streaks, and detailed logs.
                        </p>

                        {/* Interactive Diff Component */}
                        <div className="rounded-xl overflow-hidden border border-base-content/10 shadow-md">
                            <figure className="diff aspect-16/10 w-full bg-base-100" tabIndex={0}>
                                <div className="diff-item-1" role="img" tabIndex={0}>
                                    <img src="/HabitTracker_TableEntry.png" alt="Light Mode Habits" />
                                </div>
                                <div className="diff-item-2" role="img" tabIndex={0}>
                                    <img src="/HabitTracker_TableEntry_DimTheme.png" alt="Dark Mode Habits" />
                                </div>
                                <div className="diff-resizer"></div>
                            </figure>
                        </div>
                        <p className="text-[11px] text-center text-base-content/50 mt-2">
                            ↔ Drag slider horizontally to toggle Light & Dark theme
                        </p>
                    </div>

                    {/* Feature 2: Expenses */}
                    <div className="bg-base-100/60 backdrop-blur-md rounded-2xl p-4 border border-base-content/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-6 bg-gradient-to-r from-accent to-primary rounded-full"></div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Feature 2</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1.5">Track Your Expenses</h3>
                        <p className="text-xs text-base-content/70 mb-4 leading-relaxed">
                            Stop wondering where your money went. Categorize transactions, set budgets, and optimize savings.
                        </p>

                        {/* Interactive Diff Component */}
                        <div className="rounded-xl overflow-hidden border border-base-content/10 shadow-md">
                            <figure className="diff aspect-16/10 w-full bg-base-100" tabIndex={0}>
                                <div className="diff-item-1" role="img" tabIndex={0}>
                                    <img src="/ExpenseTracker_TableView.png" alt="Table View Expenses" />
                                </div>
                                <div className="diff-item-2" role="img" tabIndex={0}>
                                    <img src="/ExpenseTracker_TableEntry.png" alt="Entry Log Expenses" />
                                </div>
                                <div className="diff-resizer"></div>
                            </figure>
                        </div>
                        <p className="text-[11px] text-center text-base-content/50 mt-2">
                            ↔ Drag slider horizontally to compare Table & Entry views
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. MOBILE BENEFITS ("WHY") */}
            <section id="why" className="py-12 px-4">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2.5">
                        The Advantage
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                        Why <span className="text-primary">Progress Pulse?</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                        Engineered for speed and clarity with zero clutter.
                    </p>
                </div>

                {/* 2x2 Bento Mobile Grid */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {reasons.map((reason, index) => (
                        <div
                            key={index}
                            className="bg-base-100/50 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs"
                        >
                            <div className="p-2 rounded-xl bg-base-200 w-fit mb-3">
                                {reason.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold mb-1 text-base-content">{reason.title}</h3>
                                <p className="text-[11px] text-base-content/65 leading-tight">{reason.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. MOBILE WORKFLOW ("HOW") */}
            <section id="how" className="py-12 px-4 bg-base-200/30 border-t border-base-content/5">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2.5">
                        Workflow
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                        How it <span className="text-primary">Works</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                        A clean 4-step routine to transform chaos into structured progress.
                    </p>
                </div>

                {/* Vertical Step Timeline */}
                <div className="max-w-md mx-auto relative pl-4 border-l-2 border-primary/30 space-y-6 my-6">
                    {steps.map((item, index) => (
                        <div key={index} className="relative pl-6">
                            {/* Dot Badge on the Line */}
                            <div className="absolute -left-[27px] top-0.5 w-6 h-6 rounded-full bg-primary text-primary-content text-[11px] font-black flex items-center justify-center shadow-md">
                                {index + 1}
                            </div>

                            <div className="bg-base-100/60 backdrop-blur-md border border-base-content/10 rounded-xl p-3.5 shadow-xs">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 rounded-md bg-base-200">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-sm font-extrabold text-base-content">{item.title}</h4>
                                </div>
                                <p className="text-xs text-base-content/70 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Card */}
                <div className="max-w-md mx-auto mt-10 p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-base-100 to-secondary/15 border border-primary/30 text-center shadow-xl">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="text-lg font-black mb-1.5">Ready to take control?</h3>
                    <p className="text-xs text-base-content/70 mb-4 max-w-xs mx-auto leading-relaxed">
                        Join ambitious individuals building life-changing habits and financial momentum today.
                    </p>
                    <Link
                        to="/signup"
                        className="btn btn-primary w-full rounded-xl font-bold text-sm py-2.5 shadow-lg shadow-primary/30"
                    >
                        Start Your Journey Free
                    </Link>
                    <p className="text-[10px] text-base-content/50 mt-2">
                        Instant access • No credit card required
                    </p>
                </div>
            </section>

        </div>
    );
}

export default MobileHomepage;
