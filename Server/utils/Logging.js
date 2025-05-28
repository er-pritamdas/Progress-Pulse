// Import necessary modules
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import 'winston-daily-rotate-file'; // For rotating log files daily

// Directory to store log files
const logDir = 'logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  if(message == ""){
    return `${"\n"}`;
  }
  return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
});

// Helper to create daily rotating file transport
const dailyRotateTransport = (filename, level) => new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: `${filename}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,       // Compress old logs
  maxSize: '5m',             // Max size of a single log file
  maxFiles: '2d',            // Keep logs for 2 days
  level: level,              // Logging level (error/info)
});

// Create the main logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Include stack trace for errors
    logFormat                                // Apply custom formatting
  ),
  transports: [
    dailyRotateTransport('error', 'error'),    // Save error logs
    dailyRotateTransport('combined', 'info')   // Save all logs (info and above)
  ],
});

// Add console output when not in production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(                       
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      logFormat
    )
  }));
}

export default logger;
