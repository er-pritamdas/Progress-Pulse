import React from 'react';
import { motion } from 'framer-motion';

function Banner() {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-base-300 overflow-hidden pt-20">
            {/* Background Glow Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
            </div>

            <div className="container mx-auto px-6 flex flex-col items-center relative z-10">

                {/* Text Content */}
                <div className="text-center max-w-4xl mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            Master your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">
                                Life & Finance.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-lg md:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        The all-in-one productivity platform for high achievers. Track habits, monitor investments, and manage expenses with unparalleled clarity.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    >
                        <button className="btn btn-primary btn-lg rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                            Get Started
                        </button>
                        <button className="btn btn-outline btn-lg rounded-full px-8 hover:bg-base-content/5 transition-all hover:scale-105">
                            View Demo
                        </button>
                    </motion.div>
                </div>

                {/* Hero Image */}
                <motion.div
                    className="w-full max-w-6xl relative"
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="mockup-browser border border-base-content/10 bg-base-200 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden relative">
                        <div className="mockup-browser-toolbar">
                            <div className="input border border-base-content/10 bg-base-100">https://progress-pulse.com</div>
                        </div>
                        <div className="relative bg-base-100 flex justify-center border-t border-base-content/10">
                            {/* Gradient Overlay on Image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-base-300/80 via-transparent to-transparent z-10 pointer-events-none"></div>

                            <img
                                src="/Main_Dashboard.png"
                                alt="Progress Pulse Dashboard"
                                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                            />
                        </div>
                    </div>

                    {/* Decorative Elements behind dashboard */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-primary/10 to-secondary/10 blur-3xl rounded-full opacity-60"></div>
                </motion.div>

            </div>
        </div>
    );
}

export default Banner;