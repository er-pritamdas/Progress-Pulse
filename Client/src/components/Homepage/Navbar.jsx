import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/JwtAuthContext";

function Navbar() {
    const [activeSection, setActiveSection] = useState("");
    const { user, validToken } = useAuth();

    // Detect active section based on scroll position (Desktop navigation)
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['what', 'why', 'how'];
            let currentSection = "";
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;

            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= navbarHeight && rect.bottom >= navbarHeight) {
                        currentSection = section;
                    }
                }
            });
            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* ========================================================================= */}
            {/* 1. DESKTOP VIEW (md and up) - 100% ORIGINAL & UNTOUCHED                    */}
            {/* ========================================================================= */}
            <div className="hidden md:flex sticky top-0 w-full z-50 h-0 justify-center transition-all duration-300 bg-transparent">
                <div className="navbar container mx-auto px-6 bg-base-300/10 backdrop-blur-md border border-white/5 rounded-b-2xl shadow-lg mt-0">
                    <div className="navbar-start">
                        <Link to="/" className="btn btn-ghost text-xl flex items-center gap-2.5 ml-2 normal-case font-black">
                            <div className="w-8 h-8 rounded-xl bg-base-100 border border-base-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                                <img src="/favicon/favicon.svg" alt="Progress Pulse Logo" className="w-full h-full object-contain p-0.5" />
                            </div>
                            <span className="tracking-tight text-base-content">Progress Pulse</span>
                        </Link>
                    </div>
                    <div className="navbar-center flex">
                        <ul className="menu menu-horizontal px-1">
                            <li>
                                <a href="#what" className={activeSection === "what" ? "text-primary font-semibold" : "hover:text-primary transition-colors duration-300 ease-in-out"}>
                                    What
                                </a>
                            </li>
                            <li>
                                <a href="#why" className={activeSection === "why" ? "text-primary font-semibold" : "hover:text-primary transition-colors duration-300 ease-in-out"}>
                                    Why
                                </a>
                            </li>
                            <li>
                                <a href="#how" className={activeSection === "how" ? "text-primary font-semibold" : "hover:text-primary transition-colors duration-300 ease-in-out"}>
                                    How
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="navbar-end flex items-center gap-2">
                        <div className="flex">
                            <Link to="/signup" className="btn btn-primary mr-2 ml-2">Signup</Link>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. PHONE VIEW (< md) - FLUSH TOP PROFESSIONAL MOBILE NAVIGATION          */}
            {/* ========================================================================= */}
            <header className="md:hidden sticky top-0 left-0 right-0 w-full z-50 bg-base-100/90 backdrop-blur-xl border-b border-base-content/10 shadow-xs">
                {/* Primary Bar: Completely flush to top, zero gaps */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-2 font-black shrink-0 select-none">
                        <div className="w-7 h-7 rounded-lg bg-base-200 border border-base-content/10 flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
                            <img src="/favicon/favicon.svg" alt="Progress Pulse Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="tracking-tight text-base-content font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                            Progress Pulse
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </span>
                    </Link>

                    {/* Right Quick Actions */}
                    <div className="flex items-center gap-2">
                        {user && validToken ? (
                            <Link
                                to="/dashboard"
                                className="btn btn-xs btn-primary rounded-lg text-xs font-bold px-2.5 shadow-xs"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="btn btn-xs btn-ghost text-xs font-semibold px-2 text-base-content/75 hover:text-base-content"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn btn-xs btn-primary rounded-lg text-xs font-bold px-3 shadow-xs"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

export default Navbar;
