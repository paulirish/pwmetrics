// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import {LHRunner} from "./lh-runner";

const opn = require('opn');
const path = require('path');

import Sheets from './sheets';
import METRICS from './metrics/metrics';
import adaptMetricsData from './metrics/metrics-adapter';
import {validateMetrics, normalizeMetrics, checkExpectations} from './expectations';
import {upload} from './upload';
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
    chromeFlags: ''
  };
  runs: number;
  sheets: SheetsConfig;
  normalizedExpectations: NormalizedExpectationMetrics;
  clientSecret: AuthorizeCredentials;
  parsedChromeFlags: Array<string>;

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
        this.normalizedExpectations = normalizeMetrics(expectations);
      } else throw new Error(getMessageWithPrefix('ERROR', 'NO_EXPECTATIONS_FOUND'));
    }
  }

  async start() {
    const runs = Array.apply(null, {length: +this.runs}).map(Number.call, Number);
    let metricsResults: MetricsResults[] = [];

    let resultHasExpectationErrors = false;

    for (let runIndex of runs) {
      try {
        const lhRunner = new LHRunner(this.url, this.flags);
        const lhTrace = await lhRunner.run();
        const currentMetricResult: MetricsResults = await this.recordLighthouseTrace(lhTrace);
        if (!resultHasExpectationErrors && this.flags.expectations) {
          resultHasExpectationErrors = this.resultHasExpectationErrors(currentMetricResult);
        }
        metricsResults[runIndex] = currentMetricResult;
        console.log(getMessageWithPrefix('SUCCESS', 'SUCCESS_RUN', runIndex, runs.length));
      } catch (error) {
        metricsResults[runIndex] = error;
        console.error(getMessageWithPrefix('ERROR', 'FAILED_RUN', runIndex, runs.length, error.message));
      }
    }

    let results: PWMetricsResults = {runs: metricsResults.filter(r => !(r instanceof Error))};
    if (results.runs.length > 0) {
      if (this.runs > 1 && !this.flags.submit) {
        results.median = this.findMedianRun(results.runs);
        console.log(getMessage('MEDIAN_RUN'));
        this.displayOutput(results.median);
      } else if (this.flags.submit) {
        const sheets = new Sheets(this.sheets, this.clientSecret);
        await sheets.appendResults(results.runs);
      }
    }

    if (resultHasExpectationErrors && this.flags.expectations) {
      throw new Error(getMessage('HAS_EXPECTATION_ERRORS'));
    }

    return results;
  }

  resultHasExpectationErrors(metrics: MetricsResults): boolean {
    return metrics.timings.some((timing: Timing) => {
      const expectation = this.normalizedExpectations[timing.id];
      if (!expectation) {
        return false;
      }
      const expectedErrorLimit = expectation.error;
      return expectedErrorLimit !== undefined && timing.timing >= expectedErrorLimit;
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

      if (this.flags.expectations) {
        checkExpectations(preparedData.timings, this.normalizedExpectations);
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
        console.error(getMessageWithPrefix('ERROR', 'METRIC_IS_UNAVAILABLE', r.title));
        return false;
      }
    });

    const fullWidthInMs = Math.max(...timings.map(result => result.timing));
    const maxLabelWidth = Math.max(...timings.map(result => result.title.length));
    const stdout = process.stdout;

    drawChart(timings, {
      // 90% of terminal width to give some right margin
      width: stdout.columns * 0.9 - maxLabelWidth,
      xlabel: 'Time (ms) since navigation start',

      xmin: 0,
      // nearest second
      xmax: Math.ceil(fullWidthInMs / 1000) * 1000,
      lmargin: maxLabelWidth + 1,
    });

    return data;
  }

  findMedianRun(results: MetricsResults[]): MetricsResults {
    const ttfiValues = results.map(r => r.timings.find(timing => timing.id === METRICS.TTF_CPU_IDLE).timing);
    const medianTTFI = this.median(ttfiValues);
    // in the case of duplicate runs having the exact same TTFI, we naively pick the first
    // @fixme, but any for now...
    return results.find((result: any) => result.timings.find((timing: any) =>
      timing.id === METRICS.TTF_CPU_IDLE && timing.timing === medianTTFI
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
}

module.exports = PWMetrics;
