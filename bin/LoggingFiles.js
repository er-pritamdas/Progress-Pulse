// Import the 'winston' logging library
import winston from 'winston';

// Import 'path' and 'fs' to manage directories and paths
import path from 'path';
import fs from 'fs';

// Define the logs directory
const logDir = 'logs';

// Check if the logs directory exists, if not, create it
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir); // Makes a new 'logs' folder
}

// Define a custom log format using printf
// If it's an error, include the stack trace; otherwise just the message
const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Create the Winston logger instance
const logger = winston.createLogger({
  // Set the default logging level
  level: 'info',

  // Combine multiple formatters:
  // - timestamp: adds timestamp to each log
  // - errors({ stack: true }): ensures error stack trace is included
  // - logFormat: the custom format we created
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // e.g., 2025-04-14 15:10:01
    winston.format.errors({ stack: true }), // Include error stack traces
    logFormat // Apply our custom formatting
  ),

  // Define different output "transports"
  transports: [
    // Save only error logs to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'), // logs/error.log
      level: 'error', // Only logs error level
    }),

    // Save all logs (info, warn, error, etc.) to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'), // logs/combined.log
    }),
  ],
});

// During development, also log to the console with a simple format
// This doesn't write to a file, just displays in terminal
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(), // e.g., info: App started
  }));
}

// Export the logger so it can be used in other parts of the app
export default logger;
