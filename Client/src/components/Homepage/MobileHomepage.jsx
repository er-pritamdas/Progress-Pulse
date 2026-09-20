import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../Context/JwtAuthContext';
import { useLoading } from '../../Context/LoadingContext';
import {
    Sparkles,
    ArrowRight,
    Flame,
    Wallet,
    TrendingUp,
    CheckCircle2,
    ShieldCheck,
    Zap,
    Award,
    ChevronDown,
    Target,
    Layers,
    Check,
    X,
    BarChart2
} from 'lucide-react';

export default function MobileHomepage() {
    const navigate = useNavigate();
    const { setvalidToken } = useAuth();
    const { setLoading } = useLoading();
    const [isLoggingInDemo, setIsLoggingInDemo] = useState(false);
    const [demoError, setDemoError] = useState("");

    const handleDemoLogin = async () => {
        try {
            setIsLoggingInDemo(true);
            setDemoError("");
            setLoading(true, "Launching Demo Account...");

            const response = await axios.post(
                "/api/v1/users/loggedin",
                { username: "Demo", password: "Demo@321" },
                { withCredentials: true }
            );

            const responseData = response.data?.data;
            const accessToken = responseData?.accessToken;
            const refreshToken = responseData?.refreshToken;
            const loggedInUser = responseData?.user;

            if (accessToken) localStorage.setItem("token", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("username", "Demo");
            if (loggedInUser?.email) localStorage.setItem("email", loggedInUser.email);
            if (loggedInUser?.fullName) localStorage.setItem("fullName", loggedInUser.fullName);
            if (loggedInUser?.profilePic) localStorage.setItem("profilePic", loggedInUser.profilePic);
            if (loggedInUser) {
                try {
                    localStorage.setItem("user_profile", JSON.stringify(loggedInUser));
                } catch (e) {}
            }

            setTimeout(() => {
                setLoading(false);
                if (setvalidToken) setvalidToken(true);
                navigate("/dashboard", { replace: true });
            }, 600);
        } catch (err) {
            setLoading(false);
            setIsLoggingInDemo(false);
            const errMsg = err?.response?.data?.message || "Demo login failed. Please try again.";
            setDemoError(errMsg);
        }
    };

    // Single active accordion pillar (expanding one collapses the rest)
    const [activePillar, setActivePillar] = useState('habits');

    const togglePillar = (id) => {
        setActivePillar((curr) => (curr === id ? null : id));
    };

    // FAQ Accordion Open State
    const [openFaq, setOpenFaq] = useState(null);

    const pillars = [
        {
            id: "habits",
            title: "Habit Tracker",
            subtitle: "Routines, consistency scores & wellness tracking",
            icon: Flame,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/25",
            points: [
                "Daily routine checklist with 1-tap habit completion",
                "Active streak counters & 0–100% daily consistency scores",
                "Calorie target tracking & macro split (Protein, Carbs, Fats)",
                "Hydration intake logger (8 glasses / 2.5L daily target)",
                "Sleep duration & sleep quality rest metrics",
                "365-day GitHub-style consistency heatmaps",
                "Table entry mode for logging and past routine history"
            ]
        },
        {
            id: "expenses",
            title: "Expense & Cashflow Tracker",
            subtitle: "Income, spending, bank accounts & CC dues",
            icon: Wallet,
            color: "text-accent",
            bgColor: "bg-accent/10",
            borderColor: "border-accent/25",
            points: [
                "Consolidated net available balance & monthly cash flow",
                "Live multi-bank account balances (HDFC, ICICI, SBI)",
                "Credit card dues & payment deadline countdowns",
                "Category budget limits with color-coded overbudget alerts",
                "10-second quick transaction logging",
                "Filterable and searchable transaction table ledger"
            ]
        },
        {
            id: "investments",
            title: "Investment & Net Worth Hub",
            subtitle: "Stocks, ETFs, Mutual Funds & SGB Gold",
            icon: TrendingUp,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/25",
            points: [
                "Consolidated net worth valuation & all-time returns",
                "Live stocks & ETFs holding tracker with real-time P&L",
                "Mutual funds portfolio & active SIP tracking",
                "Sovereign Gold Bonds (SGB) & Fixed Deposit yields",
                "Multi-timeframe compounding performance (1D, 1W, 1M, 1Y, ALL)",
                "Visual asset allocation distribution across Equities, Debt & Gold"
            ]
        }
    ];

    const faqs = [
        {
            question: "What exactly is Progress Pulse?",
            answer: "Progress Pulse is an all-in-one personal operating system that integrates atomic habit tracking, daily income/expense management, bank balance oversight, and investment portfolio growth into a single, lightning-fast dashboard."
        },
        {
            question: "Why should I track habits and finances together?",
            answer: "High achievers recognize that daily discipline directly fuels wealth. When you track your morning routines, work blocks, impulse spending, and investments in one place, you gain instant clarity on how your daily habits compound into long-term net worth."
        },
        {
            question: "Can I track multiple bank accounts & credit cards?",
            answer: "Yes! Progress Pulse lets you organize debits and credits across different bank accounts (e.g. HDFC, ICICI, SBI) and monitor upcoming credit card dues so you never get hit with late fees or unexpected balances."
        },
        {
            question: "Is my personal data secure and private?",
            answer: "Your security is our highest priority. All data is protected with strict authentication, industry-standard TLS/SSL encryption in transit, and isolated tenant storage. We never sell or share your financial data."
        },
        {
            question: "Is Progress Pulse free to use?",
            answer: "Yes! You can get started completely free today with full access to daily habit tracking, expense logging, and basic investment monitoring without providing any credit card."
        }
    ];

    return (
        <div className="w-full bg-base-300 text-base-content overflow-x-hidden selection:bg-primary/20 selection:text-primary">

            {/* ========================================================================= */}
            {/* 1. HERO SECTION: VALUE PROPOSITION                                         */}
            {/* ========================================================================= */}
            <section id="home" className="relative pt-6 pb-12 px-4 flex flex-col items-center text-center overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[110px] pointer-events-none -z-10"></div>
                <div className="absolute top-48 right-0 w-64 h-64 bg-secondary/15 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {/* Eyebrow Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold mb-4 shadow-xs"
                >
                    <Sparkles size={13} className="animate-pulse" />
                    <span>where every step forward beats with purpose.</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.15] mb-3 text-base-content"
                >
                    Master your habits. <br />
                    Control your money. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                        One Unified Pulse.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-sm text-base-content/75 leading-relaxed max-w-sm mb-6 font-medium"
                >
                    Replace scattered habit apps, forgotten spreadsheets, and disconnected portfolio tools. Progress Pulse unites your routines, expenses, and wealth growth into one effortless mobile command center.
                </motion.p>

                {/* Dual Mobile CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-row items-center gap-3 w-full max-w-xs mb-3"
                >
                    <Link
                        to="/signup"
                        className="btn btn-primary rounded-xl flex-1 font-extrabold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5"
                    >
                        <span>Start Free</span>
                        <ArrowRight size={15} />
                    </Link>
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isLoggingInDemo}
                        className="btn btn-outline rounded-xl flex-1 font-bold text-sm bg-base-100/40 border-base-content/20 flex items-center justify-center gap-1.5"
                    >
                        {isLoggingInDemo ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <span>View Demo</span>
                        )}
                    </button>
                </motion.div>

                {demoError && (
                    <div className="text-rose-500 text-xs font-bold mb-3">
                        {demoError}
                    </div>
                )}

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center justify-center gap-4 text-[11px] text-base-content/60 font-semibold pt-1"
                >
                    <span className="flex items-center gap-1">
                        <Check size={13} className="text-success" /> 100% Free Starter
                    </span>
                    <span className="flex items-center gap-1">
                        <Check size={13} className="text-success" /> No Credit Card
                    </span>
                    <span className="flex items-center gap-1">
                        <Check size={13} className="text-success" /> Instant Access
                    </span>
                </motion.div>
            </section>

            {/* ========================================================================= */}
            {/* 2. EXPANDABLE & COLLAPSIBLE 3 SECTIONS: WHAT YOU GET AFTER LOGIN          */}
            {/* ========================================================================= */}
            <section id="what" className="py-10 px-4 bg-base-200/50 border-t border-base-content/5">
                <div className="text-center max-w-sm mx-auto mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
                        Inside Progress Pulse
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mb-1.5">
                        What you get <span className="text-primary">after login</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed font-medium">
                        Tap any section below to see the exact tools and features included.
                    </p>
                </div>

                {/* 3 Expandable Cards Container (Expanding one collapses the rest) */}
                <div className="max-w-md mx-auto space-y-3">
                    {pillars.map((pillar) => {
                        const isOpen = activePillar === pillar.id;
                        const IconComponent = pillar.icon;

                        return (
                            <div
                                key={pillar.id}
                                className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                                    isOpen
                                        ? `bg-base-100 border-base-content/20 shadow-md ring-1 ring-base-content/5`
                                        : `bg-base-100/80 hover:bg-base-100 border-base-content/10`
                                }`}
                            >
                                {/* Collapsible Header Bar (No Discipline/Cashflow/Wealth badges) */}
                                <button
                                    type="button"
                                    onClick={() => togglePillar(pillar.id)}
                                    className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2.5 rounded-xl border shrink-0 ${pillar.bgColor} ${pillar.color} ${pillar.borderColor}`}>
                                            <IconComponent size={20} />
                                        </div>
                                        <div className="truncate">
                                            <h3 className="font-extrabold text-sm sm:text-base text-base-content truncate leading-tight">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-[11px] text-base-content/60 font-medium truncate mt-0.5">
                                                {pillar.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`p-1.5 rounded-lg bg-base-200/60 text-base-content/60 transition-transform duration-200 shrink-0 ${
                                        isOpen ? 'rotate-180 text-primary bg-primary/10' : ''
                                    }`}>
                                        <ChevronDown size={16} />
                                    </div>
                                </button>

                                {/* Expanded Content: Crisp, Short One-Line Points */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.22, ease: "easeInOut" }}
                                            className="border-t border-base-content/10 bg-base-200/30 px-4 pb-4 pt-3 space-y-3"
                                        >
                                            {/* Short & Crisp 1-Line Points List */}
                                            <div className="space-y-1.5">
                                                {pillar.points.map((pt, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-base-100 px-3 py-2 rounded-xl border border-base-content/5 shadow-2xs flex items-center gap-2"
                                                    >
                                                        <Check size={13} className="text-primary shrink-0" />
                                                        <span className="text-xs font-semibold text-base-content/90 leading-snug">
                                                            {pt}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Direct Action Link */}
                                            <div className="pt-1.5">
                                                <Link
                                                    to="/signup"
                                                    className="btn btn-primary btn-sm w-full rounded-xl font-black text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                                                >
                                                    <span>Unlock {pillar.title} Free</span>
                                                    <ArrowRight size={13} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. PROBLEM & TRANSFORMATION: BEFORE VS WITH PROGRESS PULSE                 */}
            {/* ========================================================================= */}
            <section id="why" className="py-12 px-4">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
                        The Transformation
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mb-2">
                        Why high achievers switch to <span className="text-primary">Progress Pulse</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed font-medium">
                        Stop burning mental energy switching between disconnected apps and messy trackers.
                    </p>
                </div>

                <div className="max-w-md mx-auto space-y-3.5">
                    {/* The Old Way Card */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center gap-2 mb-2.5 text-rose-500 font-black text-sm">
                            <X size={18} className="shrink-0" />
                            <span>Without Progress Pulse (The Chaos)</span>
                        </div>
                        <ul className="space-y-2 text-xs text-base-content/75 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">•</span>
                                <span><strong>3+ Fragmented Apps:</strong> One for habits, an Excel sheet for expenses, and another app for stocks.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">•</span>
                                <span><strong>Mystery Cash Drain:</strong> Salary disappears by mid-month with zero clarity on where it went.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">•</span>
                                <span><strong>Broken Streaks & Guilt:</strong> Missing one day causes you to abandon habits completely.</span>
                            </li>
                        </ul>
                    </div>

                    {/* The Progress Pulse Way Card */}
                    <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-4 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center gap-2 mb-2.5 text-primary font-black text-sm">
                            <CheckCircle2 size={18} className="shrink-0" />
                            <span>With Progress Pulse (The Powerhouse)</span>
                        </div>
                        <ul className="space-y-2 text-xs text-base-content/90 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">✓</span>
                                <span><strong>1 Unified Command Center:</strong> Routines, bank accounts, and portfolio compounding in one spot.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">✓</span>
                                <span><strong>10-Second Daily Check-Ins:</strong> Sub-second mobile logging built for speed and zero cognitive friction.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">✓</span>
                                <span><strong>Clarity & Peace of Mind:</strong> Connect daily discipline directly with personal net worth growth.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 4. HOW IT WORKS: 3 SIMPLE STEPS                                            */}
            {/* ========================================================================= */}
            <section id="how" className="py-12 px-4 bg-base-200/40 border-t border-base-content/5">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
                        Quick Setup
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mb-2">
                        How it works in <span className="text-primary">3 steps</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed font-medium">
                        Go from scattered tracking to effortless daily clarity in under 2 minutes.
                    </p>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                    {[
                        {
                            step: "01",
                            title: "Define Your Baselines",
                            desc: "Pick your top 3 daily habits, set monthly spending limits, and log your starting investments.",
                            icon: <Target size={18} className="text-primary" />
                        },
                        {
                            step: "02",
                            title: "10-Second Daily Check-ins",
                            desc: "Tap off routines in the morning, log purchases in seconds, and watch your consistency score tick upward.",
                            icon: <Zap size={18} className="text-secondary" />
                        },
                        {
                            step: "03",
                            title: "Watch Your Life Compound",
                            desc: "Review weekly summaries, spot spending leaks, and see how consistent discipline builds tangible net worth.",
                            icon: <Award size={18} className="text-success" />
                        }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-base-100/70 backdrop-blur-md rounded-2xl p-4 border border-base-content/10 shadow-xs flex items-start gap-3.5"
                        >
                            <div className="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center shrink-0 border border-base-content/5 font-black text-sm text-primary">
                                {item.step}
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-base-content mb-1">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-base-content/70 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. BENTO GRID: CAPABILITIES                                                */}
            {/* ========================================================================= */}
            <section className="py-12 px-4">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
                        Engineered For Excellence
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mb-2">
                        Crafted for the <span className="text-primary">Modern Phone</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed font-medium">
                        No bloated downloads or clunky menus. Built for pure velocity.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="bg-base-100/60 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit mb-2">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-base-content mb-0.5">Instant Speed</h4>
                            <p className="text-[11px] text-base-content/65 leading-tight font-medium">
                                Sub-second logging with zero lag on mobile networks.
                            </p>
                        </div>
                    </div>

                    <div className="bg-base-100/60 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                        <div className="p-2 rounded-xl bg-accent/10 text-accent w-fit mb-2">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-base-content mb-0.5">Encrypted & Private</h4>
                            <p className="text-[11px] text-base-content/65 leading-tight font-medium">
                                Bank-grade isolation. Your finances belong solely to you.
                            </p>
                        </div>
                    </div>

                    <div className="bg-base-100/60 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                        <div className="p-2 rounded-xl bg-secondary/10 text-secondary w-fit mb-2">
                            <BarChart2 size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-base-content mb-0.5">Deep Analytics</h4>
                            <p className="text-[11px] text-base-content/65 leading-tight font-medium">
                                Heatmaps, cash burn rates, and asset allocation pie charts.
                            </p>
                        </div>
                    </div>

                    <div className="bg-base-100/60 backdrop-blur-md border border-base-content/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-2">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-base-content mb-0.5">Theme Chameleon</h4>
                            <p className="text-[11px] text-base-content/65 leading-tight font-medium">
                                Harmonizes effortlessly with your favorite DaisyUI themes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 6. FAQ ACCORDION SECTION                                                   */}
            {/* ========================================================================= */}
            <section className="py-12 px-4 bg-base-200/30 border-t border-base-content/5">
                <div className="text-center max-w-sm mx-auto mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
                        Common Questions
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mb-2">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed font-medium">
                        Everything you need to know before getting started.
                    </p>
                </div>

                <div className="max-w-md mx-auto space-y-2.5">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div
                                key={index}
                                className="bg-base-100/80 backdrop-blur-md border border-base-content/10 rounded-2xl overflow-hidden shadow-2xs transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenFaq(isOpen ? null : index)}
                                    className="w-full p-3.5 text-left flex items-center justify-between gap-2 cursor-pointer"
                                >
                                    <span className="font-bold text-xs text-base-content leading-snug">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`shrink-0 text-base-content/50 transition-transform duration-200 ${
                                            isOpen ? 'rotate-180 text-primary' : ''
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="px-3.5 pb-3.5 pt-0 text-xs text-base-content/75 leading-relaxed font-medium border-t border-base-content/5 mt-1 pt-2">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}
