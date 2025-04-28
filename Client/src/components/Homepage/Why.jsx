import React from 'react';
import { motion } from 'framer-motion';

function Why() {
    return (
        <section id="why" className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-20 bg-base-200 py-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Left Side - Heading and Description */}
                <motion.div 
                    className="md:w-2/5 text-center md:text-left"
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl font-bold mb-6 text-primary">Why Progress Pulse?</h2>
                    <p className="text-base-content text-lg max-w-3xl mx-auto md:mx-0">
                        Because consistency beats intensity. Progress Pulse helps you maintain small daily wins that eventually build into life-changing results.
                        Plus, it's customizable, lightweight, and designed to suit your journey — whether it's building habits, managing investments, or tracking expenses!
                    </p>
                </motion.div>

                {/* Right Side - Tabs Section */}
                <motion.div 
                    className="flex flex-col justify-center items-center md:w-3/5"
                    initial={{ x: 100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className="tabs tabs-lift w-full">
                        <input type="radio" name="why_tabs" className="tab text-primary hover:text-primary font-semibold text-1xl" aria-label="Consistency" defaultChecked />
                        <div className="tab-content border-base-300 bg-base-100 p-8 shadow-md">
                            <img src="/Dashboard.png" alt="image3" />
                            <h3 className="text-2xl font-bold mb-4 mt-4 text-primary">Consistency Wins</h3>
                            <p className="text-base-content">
                                Building tiny habits every day leads to massive success over time. Progress Pulse keeps you accountable in small, powerful steps.
                            </p>
                        </div>

                        <input type="radio" name="why_tabs" className="tab text-primary hover:text-primary font-semibold text-1xl" aria-label="All-In-One" />
                        <div className="tab-content border-base-300 bg-base-100 p-8 shadow-md">
                            <img src="/Dashboard-Dark.png" alt="image3" />
                            <h3 className="text-2xl font-bold mb-4 mt-4 text-primary">All-In-One Tracking</h3>
                            <p className="text-base-content">
                                Track habits, investments, and expenses — all from a clean, intuitive dashboard designed for clarity and control.
                            </p>
                        </div>

                        <input type="radio" name="why_tabs" className="tab text-primary hover:text-primary font-semibold text-1xl" aria-label="Customizable" />
                        <div className="tab-content border-base-300 bg-base-100 p-8 shadow-md">
                            <img src="/Dashboard.png" alt="image3" />
                            <h3 className="text-2xl font-bold mb-4 mt-4 text-primary">Tailored to You</h3>
                            <p className="text-base-content">
                                Progress Pulse adapts to your goals — whether you're growing your wealth, mastering habits, or managing spending, your dashboard evolves with you.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

export default Why;
