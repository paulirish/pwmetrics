// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

export interface SheetsConfig {
  type: string;
  options: {
    spreadsheetId: string;
    tableName: string;
    clientSecret: AuthorizeCredentials;
    uploadMedian?: boolean;
  };
}

export interface MainOptions {
  flags?: Partial<FeatureFlags>;
  sheets?: SheetsConfig;
  expectations?: ExpectationMetrics;
  clientSecret?: AuthorizeCredentials;
}

export interface FeatureFlags {
  runs: number;
  submit: Boolean;
  upload: Boolean;
  view: Boolean;
  expectations: Boolean;
  json: Boolean;
  chromeFlags: string;
  chromePath?: string;
  port?: number;
  showOutput: Boolean;
  failOnError: Boolean;
  outputPath: string;
}

export interface MetricsResults {
  timings: Timing[];
  generatedTime: string;
  lighthouseVersion: string;
  requestedUrl: string;
  finalUrl: string;
}

export interface PWMetricsResults {
  runs: MetricsResults[];
  median?: MetricsResults;
}

export interface Timing {
  title: string;
  id: string;
  timing: number;
  color: string;
}

export interface AuthorizeCredentials {
  installed: {
    client_secret: number;
    client_id: number;
    redirect_uris: Array<any>;
  }
}

export interface Oauth2Client {
  generateAuthUrl: Function;
  getToken: Function;
  credentials: any;
}

export interface GSheetsValuesToAppend {
  0: string; // lighthouseVersion
  1: string; // url
  2: string; // time
  3: number; // TTFCP timing
  4: number; // TTLCP timing
  5: number; // SI timing
  6: number; // TBT timing
  7: number; // TTI timing
}

export interface GSheetsAppendResultsOptions {
  spreadsheetId: string;
  tableName: string;
}

export interface ExpectationMetrics {
  [key: string]: {
    warn: string;
    error: string;
  }
}

export interface NormalizedExpectationMetrics {
  [key: string]: {
    warn: number;
    error: number;
  }
}

export interface DriveResponse {
  id: string
}

export interface PreparedAssets {
  traceData: Array<any>
}

export interface ChartOptions {
  width: number;
  xlabel: string;
  xmin: number;
  xmax: number;
  lmargin: number;
}

export interface LoggerOptions {
  showOutput: Boolean;
}

export interface LHFlags extends LH.Flags {
  chromePath: string;
}
