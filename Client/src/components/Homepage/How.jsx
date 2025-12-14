import React from 'react';
import { motion } from 'framer-motion';
import { FilePlus, Activity, TrendingUp, Award } from 'lucide-react';

function How() {
  const steps = [
    {
      id: 1,
      title: "Add Data",
      description: "Quickly log your habits, expenses, or investments manually or via bulk import.",
      icon: <FilePlus size={24} className="text-primary" />
    },
    {
      id: 2,
      title: "Track Daily",
      description: "Build consistency by checking in daily. Our streaks and reminders keep you accountable.",
      icon: <Activity size={24} className="text-secondary" />
    },
    {
      id: 3,
      title: "Analyze Progress",
      description: "Dive into the dashboards. View heatmaps, spending breakdowns, and net worth charts.",
      icon: <TrendingUp size={24} className="text-accent" />
    },
    {
      id: 4,
      title: "Improve Consistently",
      description: "Adjust your goals based on data. Optimize your routine and watch your life upgrade.",
      icon: <Award size={24} className="text-success" />
    }
  ];

  return (
    <section id="how" className="min-h-screen w-full bg-base-100 py-32 relative flex flex-col items-center">
      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">How it <span className="text-primary">Works</span></h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            A simple, proven workflow designed to take you from chaos to clarity in four steps.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative flex flex-col md:flex-row justify-between items-start w-full max-w-6xl mx-auto gap-12 md:gap-4">

          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[28px] left-0 w-full h-0.5 bg-gradient-to-r from-base-300 via-primary/50 to-base-300 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center w-full md:w-1/4 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Icon Circle */}
              <div className="w-14 h-14 rounded-full bg-base-200 border border-base-content/10 flex items-center justify-center mb-6 shadow-xl relative z-10 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
                {step.icon}
                {/* Step Number Badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center border-2 border-base-100">
                  {step.id}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-base-content/60 leading-relaxed px-4">
                {step.description}
              </p>
            </motion.div>
          ))}

        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button className="btn btn-primary btn-lg rounded-full px-12 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
            Start Your Journey Now
          </button>
          <p className="mt-4 text-xs text-base-content/40">No credit card required for demo.</p>
        </motion.div>

      </div>
    </section>
  );
}

export default How;
