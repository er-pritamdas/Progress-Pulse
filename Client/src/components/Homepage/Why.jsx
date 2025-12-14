import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, BarChart2, Smile } from 'lucide-react';

function Why() {
    const reasons = [
        {
            icon: <Zap size={32} className="text-secondary" />,
            title: "Lightning Fast",
            description: "Built for speed. Log habits and transactions in seconds with our optimized keyboard-first interface."
        },
        {
            icon: <BarChart2 size={32} className="text-primary" />,
            title: "Deep Analytics",
            description: "Go beyond basic tracking. Visualize trends, correlations, and insights that actually help you improve."
        },
        {
            icon: <ShieldCheck size={32} className="text-accent" />,
            title: "Privacy First",
            description: "Your data is yours. We employ enterprise-grade encryption and never sell your personal information."
        },
        {
            icon: <Smile size={32} className="text-info" />,
            title: "User Friendly",
            description: "Complex power, simple design. An intuitive interface that gets out of your way and lets you focus."
        }
    ];

    return (
        <section id="why" className="w-full bg-base-300 py-32 relative">
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Why <span className="text-primary">Progress Pulse?</span></h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        Designed for those who demand more from their tools. Experience the difference of a platform built for performance.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            className="bg-base-100/50 backdrop-blur-md p-8 rounded-2xl border border-base-content/5 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="mb-6 p-4 rounded-xl bg-base-200 w-fit group-hover:bg-base-300 transition-colors">
                                {reason.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{reason.title}</h3>
                            <p className="text-base-content/70 leading-relaxed text-sm">
                                {reason.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Why;
