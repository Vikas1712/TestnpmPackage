import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
// import { ACTION_TIMEOUT, EXPECT_TIMEOUT, MSTeamsNotificationConfig, NAVIGATION_TIMEOUT, SplunkLoggerConfig, TEST_TIMEOUT } from '@vikasnl/playwright-helper';
config({
  // path: `./env/.env.${process.env.test_env}`,
  path: `./env/.env.test`,
  override: true,
});

// const WORKERSPROCESS = undefined;
// const PARALLELPROCESS = 5;
// const CI_RETRIES = 0;
// const LOCAL_RETRIES = 0;
/**
 * Configuration object for ReportPortal.
 */
// export const RPconfig = {
//   apiKey: process.env.RP_APIKEY,
//   endpoint: process.env.RP_ENDPOINT,
//   project: process.env.RP_PROJECT,
//   launch: process.env.RP_LAUNCHNAME,
//   includeTestSteps: true,
//   uploadTrace: true,
//   uploadVideo: true,
//   launchUuidPrint: true,
//   description: process.env.URL,
// };

/**
 * Configuration settings for Microsoft Teams notifications.
 */
// const notificationSettings : MSTeamsNotificationConfig={
//   webHookURL: process.env.MS_TEAM_WEBHOOK_URL as string,
//   notificationMode: 'off', // Can be 'always', 'onFailure', or 'off'
//   includeReportPortalLink: false, // Include Report Portal link in the notification
//   reportPortalConfig: {
//     apiKey: RPconfig.apiKey as string,
//     endpoint: RPconfig.endpoint as string,
//     project: RPconfig.project as string,
//   }
// };

// const splunkLoggerConfig : SplunkLoggerConfig = {
//   token: process.env.SPLUNK_TOKEN as string,
//   sourceType: 'e2e-tests-pw'
// };

export default defineConfig({
  testDir: './tests',
  outputDir: './.tmp/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // retries: process.env.CI ? CI_RETRIES : LOCAL_RETRIES,
  // workers: process.env.CI ? PARALLELPROCESS : WORKERSPROCESS,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: './.tmp/report' }],
    // ['./src/nn-playwright-lib/utils/teamSummaryReport.ts',notificationSettings], // Sends a notification to Microsoft Teams if any test case fails.
    ['./src/nn-playwright-lib/utils/custom-logger.ts'], // Use the custom logger from the npm package.
    // ['./src/nn-playwright-lib/utils/splunk-logger.ts',splunkLoggerConfig], // Use the custom logger from the npm package.
  ],
  // timeout: TEST_TIMEOUT,
  // expect: {
  //   timeout: EXPECT_TIMEOUT,
  // },
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL: process.env.URL,
    trace: { mode: 'retain-on-failure', sources: true },
    video: 'on',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    // actionTimeout: ACTION_TIMEOUT,
    // navigationTimeout: NAVIGATION_TIMEOUT,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
