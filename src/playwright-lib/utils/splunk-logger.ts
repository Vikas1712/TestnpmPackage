import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import axios from 'axios';
import https from 'https';
import SplunkLoggerConfig from './splunkLoggerConfig';

//write interface for storing the test case details for the splunk
interface SplunkTestCase {
  title: string;
  status: string;
  error?: string;
}

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * SplunkLogger class implements the Reporter interface.
 * It provides methods for logging test case events and errors to Splunk.
 * @example
 * Example usage in playwright.config.ts:
 * const splunkLoggerConfig : SplunkLoggerConfig = {
 *   token: process.env.SPLUNK_TOKEN as string,
 *   sourceType: 'e2e-tests-pw'
 *  };
 * reporters: [
 *  ['@nn/playwright-helper/Splunk-logger', splunkLoggerConfig], // Splunk logger for the test cases.
 * ],
 */
class SplunkLogger implements Reporter {
  /**
   * Called when a test case begins.
   * @param test The test case that is starting.
   */

  private config: SplunkLoggerConfig;

  constructor(config: Partial<SplunkLoggerConfig> = {}) {
    this.config = config as SplunkLoggerConfig;
  }
  /**
   * Called when a test case ends.
   * @param test The test case that has ended.
   * @param result The result of the test case.
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    const SplunkTestCase: SplunkTestCase = {
      title: test.title,
      status: result.status,
      error: result.error ? result.error.message : ''
    };
    axios.post(this.config.url, {
      event: SplunkTestCase,
        sourcetype: this.config.sourceType // Use the sourcetype from the config,
    }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Splunk ${this.config.token}`,
        },
        httpsAgent
    })
    .then(response => {
        // Handle the successful response here
        console.log(`Data sent to Splunk Dashboard successfully: ${response.data.text}`);
     })
    .catch(error => {
        // Handle errors here
        console.error(`Error making POST request:`, error);
    });
  }

}
export default SplunkLogger;