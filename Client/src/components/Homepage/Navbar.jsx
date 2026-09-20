import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

function Navbar() {
    const [activeSection, setActiveSection] = useState("");

    // Detect the active section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['what', 'why', 'how'];
            let currentSection = "";
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
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

        // Listen to scroll events
        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            {/* Desktop View (md and up) - EXACT ORIGINAL (No ThemeSwitcher) */}
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

            {/* Phone View (< md) - Redesigned Mobile Navigation */}
            <div className="md:hidden sticky top-0 w-full z-50 px-3 pt-2 pb-1 bg-transparent">
                <div className="w-full bg-base-300/90 backdrop-blur-xl border border-base-content/10 rounded-2xl shadow-lg px-3.5 py-2.5 flex flex-col gap-2">
                    {/* Row 1: Logo & Brand on Left, Login & Signup on Right */}
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 font-black shrink-0">
                            <div className="w-7 h-7 rounded-xl bg-base-100 border border-base-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                                <img src="/favicon/favicon.svg" alt="Progress Pulse Logo" className="w-full h-full object-contain p-0.5" />
                            </div>
                            <span className="tracking-tight text-base-content font-extrabold text-base">
                                Progress Pulse
                            </span>
                        </Link>

                        <div className="flex items-center gap-1.5">
                            <Link to="/login" className="btn btn-xs btn-ghost border border-base-content/15 rounded-lg text-xs font-semibold px-2.5">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-xs btn-primary rounded-lg text-xs font-bold px-3 shadow-xs">
                                Signup
                            </Link>
                        </div>
                    </div>

                    {/* Row 2: What, Why, How Navigation Pills */}
                    <nav className="flex items-center justify-around border-t border-base-content/5 pt-1.5">
                        <a
                            href="/#what"
                            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                                activeSection === "what" ? "bg-primary text-primary-content font-bold shadow-xs" : "text-base-content/70 hover:text-primary"
                            }`}
                        >
                            What
                        </a>
                        <a
                            href="/#why"
                            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                                activeSection === "why" ? "bg-primary text-primary-content font-bold shadow-xs" : "text-base-content/70 hover:text-primary"
                            }`}
                        >
                            Why
                        </a>
                        <a
                            href="/#how"
                            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                                activeSection === "how" ? "bg-primary text-primary-content font-bold shadow-xs" : "text-base-content/70 hover:text-primary"
                            }`}
                        >
                            How
                        </a>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default Navbar;
