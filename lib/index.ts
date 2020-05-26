// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

declare var process: {
  stdout: {
    columns: string;
    write: Function;
  }
};

const opn = require('open');
const os = require('os');
const path = require('path');


import {METRICS} from './metrics/metrics';
import {Logger} from './utils/logger';
import {LHRunner} from './lh-runner';
import {Sheets} from './sheets';
import {adaptMetricsData} from './metrics/metrics-adapter';
import {validateMetrics, clarifyMetrics, normalizeExpectationMetrics, checkExpectations} from './expectations';
import {upload} from './upload';
import {writeToDisk} from './utils/fs';
import {getMessage, getMessageWithPrefix} from './utils/messages';
import {drawChart} from './chart/chart';

import {
  MainOptions,
  FeatureFlags,
  AuthorizeCredentials,
  MetricsResults,
  PWMetricsResults,
  SheetsConfig,
  ExpectationMetrics,
  NormalizedExpectationMetrics,
  Timing
} from '../types/types';

const getTimelineViewerUrl = (id: string) => `https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://drive.google.com/file/d//${id}/view?usp=drivesdk`;

class PWMetrics {
  flags: FeatureFlags = {
    runs: 1,
    submit: false,
    upload: false,
    view: false,
    expectations: false,
    json: false,
    chromeFlags: '',
    showOutput: true,
    failOnError: false,
    outputPath: 'stdout',
  };
  runs: number;
  sheets: SheetsConfig;
  normalizedExpectations: NormalizedExpectationMetrics;
  clientSecret: AuthorizeCredentials;
  logger: any;

  constructor(public url: string, opts: MainOptions) {
    this.flags = Object.assign({}, this.flags, opts.flags);
    this.runs = this.flags.runs;
    this.sheets = opts.sheets;
    this.clientSecret = opts.clientSecret;
    const expectations: ExpectationMetrics = opts.expectations;

    // normalize path if provided
    if (this.flags.chromePath) {
      this.flags.chromePath = path.normalize(this.flags.chromePath);
    }

    if (this.flags.expectations) {
      if (expectations) {
        validateMetrics(expectations);
        const actualExpectationMetrics = clarifyMetrics(expectations);
        this.normalizedExpectations = normalizeExpectationMetrics(actualExpectationMetrics);
      } else throw new Error(getMessageWithPrefix('ERROR', 'NO_EXPECTATIONS_FOUND'));
    }

    this.logger = Logger.getInstance({showOutput: this.flags.showOutput});
  }

  async start() {
    const runs = Array.apply(null, {length: +this.runs}).map(Number.call, Number);
    let metricsResults: MetricsResults[] = [];

    for (let runIndex of runs) {
      try {
        const lhRunner = new LHRunner(this.url, this.flags);
        const lhTrace = await lhRunner.run();
        metricsResults[runIndex] = await this.recordLighthouseTrace(lhTrace);
        this.logger.log(getMessageWithPrefix('SUCCESS', 'SUCCESS_RUN', runIndex, runs.length));
      } catch (error) {
        metricsResults[runIndex] = error;
        this.logger.error(getMessageWithPrefix('ERROR', 'FAILED_RUN', runIndex, runs.length, error.message));
      }
    }

    const results: PWMetricsResults = {runs: metricsResults.filter(r => !(r instanceof Error))};
    if (this.runs > 1 && !this.flags.submit) {
      results.median = this.findMedianRun(results.runs);
      this.logger.log(getMessage('MEDIAN_RUN'));
      this.displayOutput(results.median);
    } else if (this.flags.submit) {
      const sheets = new Sheets(this.sheets, this.clientSecret);

      if (this.sheets.options.uploadMedian) {
        results.median = this.findMedianRun(results.runs);
        await sheets.appendResults([results.median]);
      }
      else {
        await sheets.appendResults(results.runs);
      }
    }

    await this.outputData(results);

    if (this.flags.expectations) {
      const resultsToCompare = this.runs > 1 ? results.median.timings : results.runs[0].timings;
      const hasExpectationsWarnings = this.resultHasExpectationIssues(resultsToCompare, 'warn');
      const hasExpectationsErrors = this.resultHasExpectationIssues(resultsToCompare, 'error');

      if (hasExpectationsWarnings || hasExpectationsErrors) {
        checkExpectations(resultsToCompare, this.normalizedExpectations);

        if (hasExpectationsErrors && this.flags.failOnError) {
          throw new Error(getMessage('HAS_EXPECTATION_ERRORS'));
        }
        else {
          this.logger.warn(getMessage('HAS_EXPECTATION_ERRORS'));
        }
      }
    }

    return results;
  }

  resultHasExpectationIssues(timings: Timing[], issueType: 'warn' | 'error'): boolean {
    return timings.some((timing: Timing) => {
      const expectation = this.normalizedExpectations[timing.id];
      if (!expectation) {
        return false;
      }
      const expectedLimit = expectation[issueType];
      return expectedLimit !== undefined && timing.timing >= expectedLimit;
    });
  }

  async recordLighthouseTrace(data: LH.RunnerResult): Promise<MetricsResults> {
    try {
      const preparedData = adaptMetricsData(data.lhr);

      if (this.flags.upload) {
        const driveResponse = await upload(data, this.clientSecret);
        this.view(driveResponse.id);
      }

      if (!this.flags.submit && this.runs <= 1) {
        this.displayOutput(preparedData);
      }

      return preparedData;
    } catch (error) {
      throw error;
    }
  }

  displayOutput(data: MetricsResults): MetricsResults {
    if (!this.flags.json)
      this.showChart(data);

    return data;
  }

  showChart(data: MetricsResults) {
    // reverse to preserve the order, because cli-chart.
    let timings = data.timings;

    timings = timings.filter(r => {
      // filter out metrics that failed to record
      if (r.timing === undefined || isNaN(r.timing)) {
        this.logger.error(getMessageWithPrefix('ERROR', 'METRIC_IS_UNAVAILABLE', r.title));
        return false;
      } else {
        return true;
      }
    });

    const fullWidthInMs = Math.max(...timings.map(result => result.timing));
    const maxLabelWidth = Math.max(...timings.map(result => result.title.length));
    const terminalWidth = +process.stdout.columns || 90;

    drawChart(timings, {
      // 90% of terminal width to give some right margin
      width: terminalWidth * 0.9 - maxLabelWidth,
      xlabel: 'Time (ms) since navigation start',

      xmin: 0,
      // nearest second
      xmax: Math.ceil(fullWidthInMs / 1000) * 1000,
      lmargin: maxLabelWidth + 1,
    });

    return data;
  }

  /** Median run selected by run with the median TTI. */
  findMedianRun(results: MetricsResults[]): MetricsResults {
    const TTIValues = results.map(r => r.timings.find(timing => timing.id === METRICS.TTI).timing);
    const medianTTI = this.median(TTIValues);
    // in the case of duplicate runs having the exact same TTFI, we naively pick the first
    // @fixme, but any for now...
    return results.find((result: any) => result.timings.find((timing: any) =>
      timing.id === METRICS.TTI && timing.timing === medianTTI
      )
    );
  }

  median(values: Array<number>) {
    if (values.length === 1) return values[0];
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    return values[half];
  }

  view(id: string) {
    if (this.flags.view) {
      opn(getTimelineViewerUrl(id));
    }
  }

  outputData(data: PWMetricsResults) {
    if (this.flags.json) {
      // serialize accordingly
      const formattedData = JSON.stringify(data, null, 2) + os.EOL;
      // output to file.
      if (this.flags.outputPath !== 'stdout') {
        return writeToDisk(this.flags.outputPath, formattedData);
      // output to stdout
      } else if (formattedData) {
        return Promise.resolve(process.stdout.write(formattedData));
      }
    }
  }
}

export = PWMetrics;
