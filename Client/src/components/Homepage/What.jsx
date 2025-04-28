import React from 'react';
import { motion } from 'framer-motion';

function What() {
    return (
        <section
            id="what"
            className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-20 bg-base-100 pt-20 mb-20">

            {/* Intro Section */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h2 className="text-5xl font-bold mb-6 text-primary">What is Progress Pulse?</h2>
                <p className="text-base-content text-lg max-w-3xl mx-auto mb-8">
                    Progress Pulse is your all-in-one platform to track daily habits, investments, and expenses,
                    with powerful dashboards and table views to keep you organized and in control.
                </p>
            </motion.div>

            {/* Images Section */}
            <div className="w-full">
                {/* Picture 1 */}
                <motion.div
                    className="flex flex-col items-center mb-12"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <h3 className="divider text-2xl font-bold mb-6 text-primary">Track Your Habits</h3>
                    <figure className="diff aspect-20/9" tabIndex="0">
                        <div className="diff-item-1" role="img" tabIndex="0">
                            <img alt="Habits Dashboard" src="/Dashboard.png" />
                        </div>
                        <div className="diff-item-2" role="img">
                            <img alt="Habits Dashboard Dark" src="/Dashboard-Dark.png" />
                        </div>
                        <div className="diff-resizer"></div>
                    </figure>
                </motion.div>

                {/* Picture 2 */}
                <motion.div
                    className="flex flex-col items-center mb-12"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <h3 className="divider text-2xl font-bold mb-6 text-primary">Track Your Investment</h3>
                    <figure className="diff aspect-20/9" tabIndex="0">
                        <div className="diff-item-1" role="img" tabIndex="0">
                            <img alt="Investment Dashboard Dark" src="/Dashboard-Dark.png" />
                        </div>
                        <div className="diff-item-2" role="img">
                            <img alt="Investment Dashboard" src="/Dashboard.png" />
                        </div>
                        <div className="diff-resizer"></div>
                    </figure>
                </motion.div>

                {/* Picture 3 */}
                <motion.div
                    className="flex flex-col items-center mb-12"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                >
                    <h3 className="divider text-2xl font-bold mb-6 text-primary">Track Your Expenses</h3>
                    <figure className="diff aspect-20/9" tabIndex="0">
                        <div className="diff-item-1" role="img" tabIndex="0">
                            <img alt="Expenses Dashboard" src="/Dashboard.png" />
                        </div>
                        <div className="diff-item-2" role="img">
                            <img alt="Expenses Dashboard Dark" src="/Dashboard-Dark.png" />
                        </div>
                        <div className="diff-resizer"></div>
                    </figure>
                </motion.div>
            </div>
        </section>
    );
}

export default What;
