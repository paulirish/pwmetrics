// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

interface SheetsConfig {
  type: string;
  options: {
    spreadsheetId: string;
    tableName: string;
    clientSecret: AuthorizeCredentials;
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

interface AuthorizeCredentials {
  installed: {
    client_secret: number;
    client_id: number;
    redirect_uris: Array<any>;
  }
}

interface Oauth2Client {
  generateAuthUrl: Function;
  getToken: Function;
  credentials: any;
}

interface GSheetsValuesToAppend {
  0: string; // lighthouseVersion
  1: string; // url
  2: string; // time
  3: number; // TTFCP timing
  4: number; // TTFMP timing
  5: number; // PSI timing
  6: number; // FV timing
  7: number; // VC100 timing
  8: number; // TTI timing
  9: number; // VC85 timing
}

interface GSheetsAppendResultsOptions {
  spreadsheetId: string;
  tableName: string;
}

interface ExpectationMetrics {
  [key: string]: {
    warn: string;
    error: string;
  }
}

interface NormalizedExpectationMetrics {
  [key: string]: {
    warn: number;
    error: number;
  }
}

type MessageType =
    'NO_URL'
    |'LAUNCHING_CHROME'
    | 'CLOSING_CHROME'
    | 'CRI_TIMEOUT_RELAUNCH'
    | 'CRI_TIMEOUT_REJECT'
    | 'MEDIAN_RUN'
    | 'SAVED_TO_JSON'
    | 'NO_METRICS'
    | 'NO_EXPECTATION_ERROR'
    | 'NO_EXPECTATIONS_FOUND'
    | 'NO_SHEET_TYPE'
    | 'NO_GOOGLE_SHEET_OPTIONS'
    | 'NO_MESSAGE_PREFIX_TYPE'
    | 'METRIC_IS_UNAVAILABLE'
    | 'ttfcp'
    | 'ttfmp'
    | 'psi'
    | 'fv'
    | 'vc'
    | 'tti'
    | 'vc85'
    | 'SUCCESS_RUN'
    | 'FAILED_RUN'
    | 'G_OUTH_ACCESS_ERROR'
    | 'G_OUTH_ENTER_CODE'
    | 'G_OUTH_STORED_TOKEN'
    | 'G_SHEETS_APPENDING'
    | 'G_SHEETS_APPENDED'
    | 'G_SHEETS_API_ERROR';

    type MessageLevel = 
    'ERROR' | 'WARNING' | 'SUCCESS';

export {
  Timings,
  SheetsConfig,
  AuthorizeCredentials,
  Oauth2Client,
  MetricsResults,
  GSheetsValuesToAppend,
  GSheetsAppendResultsOptions,
  ExpectationMetrics,
  NormalizedExpectationMetrics,
  MessageType,
  MessageLevel
};
