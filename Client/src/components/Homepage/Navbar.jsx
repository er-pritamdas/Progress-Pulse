import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import ThemeSwitcher from '../../utils/ThemeSwitches';

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
        <div className="sticky top-0 w-full z-50 h-0 flex justify-center transition-all duration-300 bg-transparent">
            <div className="navbar container mx-auto px-6 bg-base-300/10 backdrop-blur-md border border-white/5 rounded-b-2xl shadow-lg mt-0">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                        >
                            <li><a href="#what" className={activeSection === "what" ? "text-primary" : ""}>What</a></li>
                            <li><a href="#why" className={activeSection === "why" ? "text-primary" : ""}>Why</a></li>
                            <li><a href="#how" className={activeSection === "how" ? "text-primary" : ""}>How</a></li>
                            <li><Link to="/signup">Signup</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </div>
                    <div class="avatar avatar-placeholder ml-4">
                        <div class="bg-neutral text-neutral-content w-8 rounded-full">
                            <a href="/">
                                <img src="/favicon/favicon.svg" />
                            </a>
                        </div>
                    </div>
                    <a href="/" className="btn btn-ghost text-xl">Progress Pulse</a>
                </div>
                <div className="navbar-center hidden lg:flex">
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
                <div className="navbar-end">
                    <ThemeSwitcher />
                    <div className="hidden lg:flex">
                        <Link to="/signup" className="btn btn-primary mr-2 ml-2">Signup</Link>
                        <Link to="/login" className="btn btn-outline">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
