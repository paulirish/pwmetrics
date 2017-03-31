// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

//@todo remove stuff after https://github.com/GoogleChrome/lighthouse/pull/1882 be merged and version released
import {Results, AuditResult} from 'lighthouse/lighthouse-cli/types/types';

interface LighthouseResults extends Results {
  generatedTime: string;
  initialUrl: string;
  audits: LighthouseAudits;
}

interface LighthouseAudits {
  [metric: string]: AuditResult;
}

interface SheetsConfig {
  type: string;
  options: {
    spreadsheetId: string;
    tableName: string;
    clientSecret: AuthorizeCredentials;
  };
}

interface MetricsResults {
  timestamps: Timestamp[];
  timings: Timing[];
  generatedTime: string;
  lighthouseVersion: string;
  url: string;
  initialUrl: string;
}

interface MetricsDefinition {
  name: string;
  id: string;
  getTs(audits: LighthouseAudits): number;
}

interface Timestamp {
  title: string;
  id: string;
  timestamp: number;
}

interface Timing {
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

interface DriveResponse {
  id: string
}

interface PreparedAssets {
  traceData: Array<any>
}

export {
  Timing,
  Timestamp,
  SheetsConfig,
  AuthorizeCredentials,
  Oauth2Client,
  MetricsDefinition,
  MetricsResults,
  LighthouseResults,
  LighthouseAudits,
  GSheetsValuesToAppend,
  GSheetsAppendResultsOptions,
  DriveResponse,
  ExpectationMetrics,
  NormalizedExpectationMetrics,
  PreparedAssets
};
