import { logger } from './logger';
import { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import axios from 'axios';
import MSTeamsNotificationConfig  from './msTeamNotificationConfig';

const RPClient = require('@reportportal/client-javascript');

interface NotificationPayload {
  '@type': string;
  '@context': string;
  themeColor: string;
  summary: string;
  sections: any[];
}
class TeamSummaryReport implements Reporter {
  private testResults: any = {};
  private suiteStartTime = 0;
  private suiteEndTime = 0;
  private notifications: Promise<void>[] = [];
  private failCount = 0;
  private passCount = 0;
  private launchUrl: string = '';
  private config: MSTeamsNotificationConfig;

  constructor(config: Partial<MSTeamsNotificationConfig> = {}) {
    this.config = config as MSTeamsNotificationConfig;
}

  /**
   * Sends a notification based on the MicrosoftTeamsNotificationSettings.notificationMode.
   *
   * @param {string} webhookUrl - The URL for the webhook used for MS team notification.
   * @param {string} summary - The summary of the test execution.
   * @param {string} status - The status of the test execution. It can be 'Success' or 'Fail'.
   * @param {string} [launchUrl] - The URL of the Report Portal launch. This is optional.
   *
   * @returns {Promise<void>} A Promise that resolves when the notification has been sent.
   *
   * Depending on the notificationMode, the function behaves as follows:
   * - 'off': Logs that the notification is turned off.
   * - 'onFailure': If the status is not 'Success', it sends a summary notification.
   * - 'always': It always sends a summary notification.
   */
  private async sendNotification(
    webhookUrl: string,
    summary: string,
    status: string,
    launchUrl?: string,
  ): Promise<void> {
    switch (this.config.notificationMode) {
      case 'off':
        logger.info('Notification is turned off.');
        break;
      case 'onFailure':
        if (status !== 'Success') {
          logger.info('NotificationOnlyOnFailure turned ON.');
          this.notifications.push(this.sendSummaryNotification(webhookUrl, summary, status, launchUrl));
        }
        break;
      case 'always':
        logger.info('NotificationAlwaysOn is turned ON.');
        this.notifications.push(this.sendSummaryNotification(webhookUrl, summary, status, launchUrl));
        break;
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.testResults[test.id] = test.outcome();
    const startTime = result.startTime.getTime();
    const duration = result.duration;
    const endTime = startTime + duration;
    this.suiteStartTime = this.suiteStartTime === 0 ? startTime : Math.min(this.suiteStartTime, startTime);
    this.suiteEndTime = Math.max(this.suiteEndTime, endTime);

    if (result.status !== 'passed') {
      this.failCount++;
    } else {
      this.passCount++;
    }
  }

  async onEnd(_result: FullResult): Promise<void> {
    logger.info('Sending notification to Teams channel...');
    logger.info('Notification Settings:', this.config);
    if (this.config.includeReportPortalLink) {
      await this.getLaunchURL();
    }
    let all = 0;
    const outcome: any = {
      skipped: 0,
      expected: 0,
      unexpected: 0,
      flaky: 0,
    };

    for (const id in this.testResults) {
      all++;
      const status = this.testResults[id];
      if (!outcome[status]) {
        outcome[status] = 0;
      }
      outcome[status]++;
    }

    const duration = this.suiteEndTime - this.suiteStartTime;
    const durationString = `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
    const summary = `
    Execution Summary:
     ✅ Total Test Cases: ${all}
     ✅ Passed: ${outcome['expected']}
     ❌ Failed: ${outcome['unexpected']}
     ⚠ Flaky: ${outcome['flaky']}
     ⏭ Skipped: ${outcome['skipped']}
     ⏱ Duration: ${durationString}
    `;
    logger.info(`Test Execution Summary :  ${summary}`);
    if (!this.config.webHookURL) {
      console.log('webHookURL config is missing');
    } else {
      await this.sendNotification(
        this.config.webHookURL,
        summary,
        outcome['unexpected'] === 0 ? 'Success' : 'Fail',
        this.launchUrl,
      );
    }
    await Promise.all(this.notifications);
  }

  private async getLaunchURL() {
    if (!this.config.reportPortalConfig) {
      return;
    }
    const { apiKey, endpoint, project } = this.config.reportPortalConfig;
    const rpClient = new RPClient({ apiKey, endpoint, project });

    if (!apiKey || !project) {
      logger.info(
        'Missing configuration value in playwright.config.ts file. Please ensure that both apiKey and project are set in the RPconfig object.',
      );
    }

    try {
      const { fullName } = await rpClient.checkConnect();
      logger.info('You have successfully connected to the Report Portal server.');
      logger.info(`You are using an account: ${fullName}`);

      const {
        data: { content: launches },
      } = await axios.get(`${endpoint}/${project}/launch/latest`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const latestLaunch = launches.sort((a: any, b: any) => b.id - a.id)[0];
      const baseUrl = endpoint.replace('/api/v1', '');
      this.launchUrl = `${baseUrl}/ui/#${project}/launches/all/${latestLaunch.id}/`;
      logger.info(`Launch URL: ${this.launchUrl}`);
    } catch (error) {
      logger.log('Error connecting to server:', error);
    }
  }

  private async sendSummaryNotification(webhookUrl: string, summary: string, status: string, launchUrl?: string) {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'Europe/Amsterdam',
    });

    const summaryTitle = status === 'Success' ? `Success : Test Execution Summary` : `Failed : Test Execution Summary`;

    const facts = [
      {
        name: 'Environment :',
        value: process.env.URL as string,
      },
      {
        name: 'Executed date :',
        value: formatter.format(date),
      },
      {
        name: 'Status',
        value: summary,
      },
    ];

    if (this.config.includeReportPortalLink) {
      facts.push({
        name: 'Report Portal URL :',
        value: `[Link](${launchUrl as string})`,
      });
    }

    const payload: NotificationPayload = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: '0076D7',
      summary: summaryTitle,
      sections: [
        {
          activityTitle: summaryTitle,
          activitySubtitle: 'Dashboard report status',
          activityImage: 'https://seeklogo.com/vector-logo/435674/playwright',
          facts: facts,
          markdown: true,
        },
      ],
    };

    try {
      const response = await axios.post(webhookUrl, payload);
      if (response.status === 200) {
        logger.info('Successfully Notification sent to Teams channel.');
        return;
      }
    } catch (error) {
      logger.error(`Failed to send Notification to Teams channel.: ${error}`);
    }
  }
}

export default TeamSummaryReport;