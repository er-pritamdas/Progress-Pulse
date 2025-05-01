import React from "react";
import { FaInstagram, FaTwitter, FaPinterest, FaLinkedin } from "react-icons/fa";

const CatchSeconds = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="relative max-w-xl p-10">
        {/* Main Content */}
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text opacity-70">
            Track Reflect Improve Repeat
          </h1>

          <p className="text-gray-300 text-xl font-medium">
            Welcome to <span className="text-teal-400">Progress Pulse</span> - your companion for building better habits, staying accountable, and owning your progress one second at a time.
          </p>

          <div className="mt-4">
            <h2 className="text-md uppercase tracking-wide text-indigo-400 font-semibold">Discipline in Motion</h2>
            <p className="text-gray-400 mt-1 text-md">
              Small actions. Daily wins. Long-term growth.
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

export default CatchSeconds;
