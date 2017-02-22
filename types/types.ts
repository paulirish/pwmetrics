interface SheetsConfig {
  type: string;
  options: {
    spreadsheetId: string;
    tableName: string;
    clientSecret: Object;
  };
}

interface MetricsResults {
  timestamps: Array<Timestamps>;
  timings: Array<Timings>;
  generatedTime: string;
  lighthouseVersion: string;
  url: string;
  initialUrl: string;
}

interface Timestamps {
  title: string;
  name: string;
  value: number;
}

interface Timings {
  title: string,
  name: string;
  value: number;
  color: string;
}
export {
  SheetsConfig,
  MetricsResults
};
