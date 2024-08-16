import winston from 'winston';

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  critical: 4,
};

/**
 * Create a new Winston logger with custom log levels and colors
 * 
 * After adding the CustomLogger as a reporter, it will create a log folder under the parent directory
 * and store all the logs information within a file named info.log. This allows for easy access and
 * review of test execution logs, facilitating debugging and test result analysis.
 * 
 * @example
 * Example usage in playwright.config.ts:
 * reporters: [
 *  ['@nn/playwright-helper/custom-logger'], // Custom logger for the test cases.
 * ],
 * 
 */
export const logger = winston.createLogger({
  levels: customLevels,
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
  ],
});