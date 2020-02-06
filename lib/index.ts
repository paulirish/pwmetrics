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
import {validateMetrics, normalizeExpectationMetrics, checkExpectations} from './expectations';
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
    metric: 'TTFCPUIDLE',
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
        this.normalizedExpectations = normalizeExpectationMetrics(expectations);
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

  findMedianRun(results: MetricsResults[]): MetricsResults {
    const clone = o => JSON.parse(JSON.stringify(o));
    const metric = this.flags.metric;
    const metricValues = Object.entries(METRICS)
      .reduce((acc, [metric, metricId]) => Object.assign(acc, {
        [metric]: results.map(r => r.timings.find(({ id }) => id === metricId).timing),
      }), {});

    if (metric === 'all') {
      // User requested the average value for all metrics, deep-clone and fill in the medians
      const result = clone(results[0]);
      result.timings.forEach(timing => {
        const metric = Object.keys(METRICS).find(k => METRICS[k] === timing.id);
        const idx = this.medianIndex(metricValues[metric]);
        timing.timing = results[idx].timings.find(t => t.id === timing.id).timing;
      });
      return result;
    } else if (metric === 'average') {
      // User requested the average value for all metrics, deep-clone and fill in the averages
      const result = clone(results[0]);
      result.timings.forEach(timing => {
        const metric = Object.keys(METRICS).find(k => METRICS[k] === timing.id);
        const sum = metricValues[metric].reduce((acc, v) => acc + v, 0);
        timing.timing = sum / metricValues[metric].length;
      });
      return result;
    }
    const medianIndex = this.medianIndex(metricValues[metric]);
    return results[medianIndex]
  }

  medianIndex(values: Array<number>) {
    if (values.length === 1) return 0;
    const mappedValues = values.map((v, i) => ({ index: i, value: v }));
    mappedValues.sort((a, b) => a.value - b.value);
    const medianIndex = Math.floor(mappedValues.length / 2);
    return mappedValues[medianIndex].index;
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
