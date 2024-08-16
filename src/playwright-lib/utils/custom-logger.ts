import { Reporter, TestCase, TestError, TestResult } from '@playwright/test/reporter';
import winston from 'winston';
import { logger } from './logger';

const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  critical: 'magenta',
};

winston.addColors(customColors);

/**
 * CustomLogger class that implements the Reporter interface from Playwright
 * to provide detailed logs for test execution.
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
class CustomLogger implements Reporter {
  /**
   * Called when a test case begins.
   * @param test The test case that is starting.
   */
  onTestBegin(test: TestCase): void {
    logger.info(`Test Case Started : ${test.title}`);
  }

  /**
   * Called when a test case ends.
   * @param test The test case that has ended.
   * @param result The result of the test case.
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') {
      logger.info(`Test Case Passed : ${test.title}`);
    } else if (result.status === 'skipped') {
      logger.warn(`Test Case Skipped : ${test.title}`);
    } else if (result.status === 'failed' && result.error) {
      logger.error(`Test Case Failed: ${test.title} Error: ${result.error.message}`);
    }
  }

  /**
   * Called when an error occurs during testing.
   * @param error The error that occurred.
   */
  onError(error: TestError): void {
    logger.error(error.message);
  }
}
export default CustomLogger;