import React from 'react';
import { motion } from 'framer-motion';

function What() {
    const features = [
        {
            title: "Track Your Habits",
            description: "Build atomic habits that stick. visualize your consistency with heatmaps, streaks, and detailed logs. Whether it's reading, water intake, or sleep - we've got you covered.",
            image1: "/HabitTracker_TableEntry.png",
            image2: "/HabitTracker_TableEntry_DimTheme.png",
            label1: "Light Mode",
            label2: "Dark Mode",
            gradient: "from-primary to-secondary",
            url: "https://progress-pulse.com/habits"
        },
        {
            title: "Track Your Expenses",
            description: "Stop wondering where your money went. Categorize every transaction, set monthly budgets, and analyze spending patterns to optimize your savings rate.",
            image1: "/ExpenseTracker_TableView.png",
            image2: "/ExpenseTracker_TableEntry.png",
            label1: "Table View",
            label2: "Entry Log",
            gradient: "from-accent to-primary",
            url: "https://progress-pulse.com/expenses"
        },
        // {
        //     title: "Track Your Investment",
        //     description: "Watch your wealth grow. Monitor your portfolio performance, asset allocation, and net worth evolution in real-time. Make data-driven decisions for your financial future.",
        //     image1: "/Main_Dashboard.png",
        //     image2: "/Main_Dashboard_SunsetTheme.png",
        //     label1: "Classic",
        //     label2: "Sunset Theme",
        //     gradient: "from-secondary to-accent",
        //     url: "https://progress-pulse.com/investments"
        // },
    ];

    return (
        <section id="what" className="w-full bg-base-300 py-32 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">

                {/* Section Header */}
                <motion.div
                    className="text-center mb-32 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Everything you need to <span className="text-primary">Level Up</span>
                    </h2>
                    <p className="text-lg text-base-content/70">
                        Progress Pulse isn't just a tracker; it's your personal operating system for growth.
                        Seamlessly integrated tools to manage every aspect of your life.
                    </p>
                </motion.div>

                {/* Feature Blocks */}
                <div className="flex flex-col gap-32">
                    {features.map((feature, index) => (
                        <FeatureBlock key={index} feature={feature} index={index} />
                    ))}
                </div>

            </div>
        </section>
    );
}

const FeatureBlock = ({ feature, index }) => {
    return (
        <div className="flex flex-col items-center w-full">

            {/* Text Content */}
            <motion.div
                className="text-center max-w-2xl mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                    <span className={`text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient}`}>
                        Feature {index + 1}
                    </span>
                    <div className={`h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                </div>

                <h3 className="text-3xl md:text-5xl font-bold mb-6">
                    {feature.title}
                </h3>
                <p className="text-lg text-base-content/70 leading-relaxed">
                    {feature.description}
                </p>
            </motion.div>

            {/* Visual Diff Component with Browser Mockup */}
            <motion.div
                className="w-full max-w-6xl relative group"
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* Glow Effect */}
                {/* <div className={`absolute -z-10 -inset-1 bg-gradient-to-r ${feature.gradient} opacity-20 blur-2xl rounded-[2rem] group-hover:opacity-30 transition-opacity duration-700`}></div> */}

                <div className="mockup-browser border border-base-content/10 bg-base-200 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden relative">
                    <div className="mockup-browser-toolbar">
                        <div className="input border border-base-content/10 bg-base-100">{feature.url}</div>
                    </div>
                    {/* Content Container */}
                    <div className="relative bg-base-100 flex justify-center border-t border-base-content/10">
                        <figure className="diff aspect-16/9 w-full h-full bg-base-100" tabIndex={0}>
                            <div className="diff-item-1" role="img" tabIndex={0}>
                                <img src={feature.image1} alt={feature.label1} />
                            </div>
                            <div className="diff-item-2" role="img" tabIndex={0} >
                                <img src={feature.image2} alt={feature.label2} />
                            </div>
                            <div className="diff-resizer"></div>

                            {/* Labels */}
                            {/* <div className="absolute top-6 left-6 z-20 pointer-events-none">
                                <div className="badge badge-lg bg-base-100/30 backdrop-blur-md border border-white/10 text-white shadow-lg">{feature.label1}</div>
                            </div>
                            <div className="absolute top-6 right-6 z-20 pointer-events-none">
                                <div className="badge badge-lg bg-black/30 backdrop-blur-md border border-white/10 text-white shadow-lg">{feature.label2}</div>
                            </div> */}
                        </figure>
                    </div>
                </div>

            </motion.div>

        </div>
    );
};

export default What;
