import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import Spline from '@splinetool/react-spline';

function Banner() {
    return (
        <div className="bg-base-300 flex flex-col md:flex-row w-full h-screen p-6">

            {/* Left Section */}
            <div className="flex flex-col justify-center w-full md:w-1/2 p-8">
                <motion.h1
                    className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-base-content"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Welcome to <span className="text-primary">Progress Pulse</span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl mb-8 text-base-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    Track your habits. Manage your goals. Build your best self.
                </motion.p>

                <motion.div
                    className="flex gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    <button className="btn btn-primary">
                        Get Started
                    </button>
                    <button className="btn btn-outline">
                        Learn More
                    </button>
                </motion.div>
            </div>

            {/* Right Section */}
            <motion.div
                className="w-full md:w-1/2 flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
            >
                {/* <Spline scene="https://prod.spline.design/ygWsrKKNKB2jrrog/scene.splinecode" /> */}
                {/* <Spline scene="https://prod.spline.design/q6cctcncdNPywGIE/scene.splinecode" />  */}
                {/* <Spline scene="https://prod.spline.design/ZqRMNBQACiEVDTee/scene.splinecode" />  */}
            </motion.div>

        </div>
    );
}

export default Banner;



{/* Use Spline or Image */ }

{/* Delivery Pipeline */ }
{/* <Spline scene="https://prod.spline.design/ZqRMNBQACiEVDTee/scene.splinecode" /> */ }

{/* Brain */ }
{/* <Spline scene="https://prod.spline.design/q6cctcncdNPywGIE/scene.splinecode" /> */ }

{/* Pulse */ }