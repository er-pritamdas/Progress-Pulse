import React from "react";
import { FaInstagram, FaTwitter, FaPinterest, FaLinkedin } from "react-icons/fa";

const SignupLeftCard = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="relative max-w-xl p-10">
                {/* Main Content */}
                <div className="relative z-10 text-center space-y-6">
                    <h1 className="text-6xl font-extrabold leading-tight text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text opacity-60">
                    Turn Intentions Into Action
                    </h1>

                    <p className="text-gray-300 text-xl font-medium opacity-80">
                        Join <span className="text-teal-400">Progress Pulse</span> – your personal dashboard to develop habits, track progress, and become your best self.
                    </p>

                    <div className="mt-4">
                        <h2 className="text-md uppercase tracking-wide text-indigo-400 font-semibold">Pulse of Progress</h2>
                        <p className="text-gray-400 mt-1 text-md">
                            Consistency. Clarity. Confidence.
                        </p>
                        <div className="w-10 h-1 mt-4 mx-auto bg-indigo-500 rounded-full"></div>
                    </div>

                    {/* Social Icons */}
                    {/* <div className="mt-6 flex justify-center gap-6 text-2xl text-gray-400">
            <a href="#"><FaInstagram className="hover:text-pink-500 transition duration-200" /></a>
            <a href="#"><FaTwitter className="hover:text-blue-400 transition duration-200" /></a>
            <a href="#"><FaPinterest className="hover:text-red-500 transition duration-200" /></a>
            <a href="#"><FaLinkedin className="hover:text-blue-600 transition duration-200" /></a>
          </div> */}
                </div>
            </div>
        </div>
    );
};

export default SignupLeftCard;
