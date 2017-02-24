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
  id: string;
  timestamp: number;
}

interface Timings {
  title: string,
  id: string;
  timestamp: number;
  timing: number;
  color: string;
}
export {
  SheetsConfig,
  MetricsResults
};
