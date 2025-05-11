import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SuccessAlert({ message, top = 5 }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          className="alert alert-soft alert-success absolute right-5"
          style={{ top: `${top * 0.25}rem` }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessAlert;
