// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import {launch, LaunchedChrome} from 'chrome-launcher';
const lighthouse = require('lighthouse');
const perfConfig: any = require('./lh-config');
const opn = require('opn');

const Sheets = require('./sheets/index');
const Chart = require('./chart/chart');
const metrics = require('./metrics');
const expectations = require('./expectations');
const {upload} = require('./upload');
const messages = require('./utils/messages');

import {
  MainOptions,
  FeatureFlags,
  AuthorizeCredentials,
  LighthouseResults,
  MetricsResults,
  TermWritableStream,
  PWMetricsResults,
  SheetsConfig,
  ExpectationMetrics
} from '../types/types';

const MAX_LIGHTHOUSE_TRIES = 2;
const getTimelineViewerUrl = (id: string) => `https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://drive.google.com/file/d//${id}/view?usp=drivesdk`

class PWMetrics {
  flags: FeatureFlags = {
    runs: 1,
    submit: false,
    upload: false,
    view: false,
    expectations: false,
    output: false,
    chromeFlags: []
  };
  runs: number;
  sheets: SheetsConfig;
  expectations: ExpectationMetrics;
  clientSecret: AuthorizeCredentials;
  tryLighthouseCounter: number;
  launcher: LaunchedChrome;

  constructor(public url: string, opts: MainOptions) {
    this.flags = Object.assign({}, this.flags, opts.flags);
    this.runs = this.flags.runs;
    this.sheets = opts.sheets;
    this.expectations = opts.expectations;
    this.clientSecret = opts.clientSecret;
    this.tryLighthouseCounter = 0;

    if (this.flags.expectations) {
      if (this.expectations) {
        expectations.validateMetrics(this.expectations);
        this.expectations = expectations.normalizeMetrics(this.expectations);
      } else throw new Error(getMessageWithPrefix('ERROR', 'NO_EXPECTATIONS_FOUND'));
    }
  }

  async start() {
    const runs = Array.apply(null, {length: +this.runs}).map(Number.call, Number);
    let metricsResults: MetricsResults[] = [];

    for (let runIndex of runs) {
      try {
        metricsResults[runIndex] = await this.run();
        console.log(messages.getMessageWithPrefix('SUCCESS', 'SUCCESS_RUN', runIndex, runs.length));
      } catch (error) {
        metricsResults[runIndex] = error;
        console.error(messages.getMessageWithPrefix('ERROR', 'FAILED_RUN', runIndex, runs.length, error.message));
      }
    }

    let results: PWMetricsResults = { runs: metricsResults.filter(r => !(r instanceof Error)) };
    if (results.runs.length > 0) {
      if (this.runs > 1 && !this.flags.submit) {
        results.median = this.findMedianRun(results.runs);
        console.log(messages.getMessage('MEDIAN_RUN'));
        this.displayOutput(results.median);
      } else if (this.flags.submit) {
        const sheets = new Sheets(this.sheets, this.clientSecret);
        await sheets.appendResults(results.runs);
      }
    }
    return results;
  }

  async run(): Promise<MetricsResults> {
    try {
      let lhResults: LighthouseResults;
      await this.launchChrome();

      if (process.env.CI) {
        // handling CRI_TIMEOUT issue - https://github.com/GoogleChrome/lighthouse/issues/833
        this.tryLighthouseCounter = 0;
        lhResults = await this.runLighthouseOnCI().then((lhResults:LighthouseResults) => {
          // fix for https://github.com/paulirish/pwmetrics/issues/63
          return new Promise<LighthouseResults>(resolve => {
            console.log(messages.getMessage('WAITING'));
            setTimeout(_ => {
              return resolve(lhResults);
            }, 2000);
          });
        });
      } else {
        lhResults = await lighthouse(this.url, this.flags, perfConfig);
      }

      const metricsResults: MetricsResults = await this.recordLighthouseTrace(lhResults);
      await this.killLauncher();

      return metricsResults;
    } catch (error) {
      await this.killLauncher();
      throw error;
    }
  }

  async killLauncher() {
    if (typeof this.launcher !== 'undefined') {
      await this.launcher!.kill();
    }
  }

  async runLighthouseOnCI(): Promise<LighthouseResults> {
    try {
      return await lighthouse(this.url, this.flags, perfConfig);
    } catch(error) {
      if (error.code === 'CRI_TIMEOUT' && this.tryLighthouseCounter <= MAX_LIGHTHOUSE_TRIES) {
        return await this.retryLighthouseOnCI();
      }

      if (this.tryLighthouseCounter > MAX_LIGHTHOUSE_TRIES) {
        throw new Error(messages.getMessage('CRI_TIMEOUT_REJECT'));
      }
    }
  }

  async retryLighthouseOnCI(): Promise<LighthouseResults> {
    this.tryLighthouseCounter++;
    console.log(messages.getMessage('CRI_TIMEOUT_RELAUNCH'));

    try {
      return await this.runLighthouseOnCI();
    } catch(error) {
      console.error(error.message);
      console.error(messages.getMessage('CLOSING_CHROME'));
      await this.killLauncher();
    }
  }

  async launchChrome(): Promise<LaunchedChrome|Error> {
    try {
      console.log(messages.getMessage('LAUNCHING_CHROME'));
      this.launcher = await launch({
        port: this.flags.port,
        chromeFlags: this.flags.chromeFlags
      });
      this.flags.port = this.launcher.port;
      return this.launcher;
    } catch(error) {
      await this.killLauncher();
      return error;
    }
  }

  async recordLighthouseTrace(data: LighthouseResults): Promise<MetricsResults> {
    try {
      const preparedData = metrics.prepareData(data);

      if (this.flags.upload) {
        const driveResponse = await upload(data, this.clientSecret);
        this.view(driveResponse.id);
      }

      if (!this.flags.submit && this.runs <= 1) {
        this.displayOutput(preparedData);
      }

      if (this.flags.expectations) {
        expectations.checkExpectations(preparedData.timings, this.expectations);
      }

      return preparedData;
    } catch (error) {
      throw error;
    }
  }

  displayOutput(data: MetricsResults): MetricsResults {
    if (this.flags.output) {
      return data;
    } else {
      this.showChart(data);
    }
    return data;
  }

  showChart(data: MetricsResults) {
    // reverse to preserve the order, because cli-chart.
    let timings = data.timings;

    timings = timings.filter(r => {
      if (r.timing === undefined) {
        console.error(messages.getMessageWithPrefix('ERROR', 'METRIC_IS_UNAVAILABLE', r.title));
      }
      // don't chart hidden metrics, but include in json
      return !metrics.hiddenMetrics.includes(r.id);
    });

    const fullWidthInMs = Math.max(...timings.map(result => result.timing));
    const maxLabelWidth = Math.max(...timings.map(result => result.title.length));
    const stdout = <TermWritableStream>(process.stdout);
    const chartOps = {
      // 90% of terminal width to give some right margin
      width: stdout.columns * 0.9 - maxLabelWidth,
      xlabel: 'Time (ms) since navigation start',

      // nearest second
      maxBound: Math.ceil(fullWidthInMs / 1000) * 1000,
      xmax: fullWidthInMs,
      lmargin: maxLabelWidth + 1,

      // 2 rows per bar, horitzonal plot
      height: timings.length * 2,
      step: 2,
      direction: 'x'
    };

    const chart = new Chart(chartOps);
    timings.forEach(result => {
      chart.addBar({
        size: result.timing,
        label: result.title,
        barLabel: `${Math.floor(result.timing).toLocaleString()}`,
        color: result.color
      });
    });
    chart.draw();
    return data;
  }

  findMedianRun(results: MetricsResults[]): MetricsResults {
    const ttfiValues = results.map(r => r.timings.find(timing => timing.id === metrics.ids.TTFI).timing);
    const medianTTFI = this.median(ttfiValues);
    // in the case of duplicate runs having the exact same TTFI, we naively pick the first
    // @fixme, but any for now...
    return results.find((result: any) => result.timings.find((timing:any) =>
        timing.id === metrics.ids.TTFI && timing.timing === medianTTFI
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
