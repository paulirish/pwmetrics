interface SheetsConfig {
  type: string;
  options: {
    spreadsheetId: string;
    tableName: string;
    clientSecret: Object;
  };
}

interface MetricsResults {
  timestamps: Array<any>;
  timings: Array<any>;
  generatedTime: string;
  lighthouseVersion: string;
  url: string;
  initialUrl: string;
}

export {
  SheetsConfig,
  MetricsResults
};
