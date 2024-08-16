export default interface MSTeamsNotificationConfig {
    webHookURL: string;
    notificationMode: 'always' | 'onFailure' | 'off';
    includeReportPortalLink: boolean;
    reportPortalConfig?: {
      apiKey: string;
      endpoint: string;
      project: string;
    };
  }