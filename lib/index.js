// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const lighthouse = require('lighthouse');
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher');
const perfConfig = require('lighthouse/lighthouse-core/config/perf.json');
const opn = require('opn');

const Sheets = require('./sheets/index');
const Chart = require('./chart/chart');
const metrics = require('./metrics');
const expectations = require('./expectations');
const {upload} = require('./upload');
const {getMessage, getMessageWithPrefix} = require('./utils/messages');

const _MAX_LIGHTHOUSE_TRIES = 2;
const _SIGINT = 'SIGINT';
const _SIGINT_EXIT_CODE = 130;

class PWMetrics {

  constructor(url, opts) {
    this.url = url;
    this.flags = opts.flags || {};
    // @todo remove when new lighthouse version be released, because -https://github.com/GoogleChrome/lighthouse/pull/1778
    this.flags.disableCpuThrottling = this.flags.disableCpuThrottling || false;
    this.runs = this.flags.runs || 1;
    this.sheets = opts.sheets;
    this.expectations = opts.expectations || false;
    this.clientSecret = opts.clientSecret;
    this.tryLighthouseCounter = 0;

    if (this.flags.expectations) {
      if (this.expectations) {
        expectations.validateMetrics(this.expectations);
        expectations.normalizeMetrics(this.expectations);
      } else throw new Error(getMessageWithPrefix('ERROR', 'NO_EXPECTATIONS_FOUND'));
    }
  }

  start() {
    const results = new Array(parseInt(this.runs, 10)).fill(false);

    // Kill spawned Chrome process in case of ctrl-C.
    process.on(_SIGINT, () => {
      if (this.launcher) {
        this.launcher.kill().then(() => process.exit(_SIGINT_EXIT_CODE), console.log(getMessage('CLOSING_CHROME')));
      }
    });

    // do our runs in sequence
    const allDone = results.reduce((chain, run, index) => {
      return chain.then(_ => {
        return this.run().then(data => {
          console.log(getMessageWithPrefix('SUCCESS', 'SUCCESS_RUN', index, results.length));
          results[index] = data;
        }).catch(error => {
          console.error(getMessageWithPrefix('ERROR', 'FAILED_RUN', index, results.length, error.message));
          results[index] = error;
        });
      });
    }, Promise.resolve());

    return allDone.then(_ => {
      const ret = {runs: results.filter(r => !(r instanceof Error))};
      if (this.runs > 1 && !this.flags.submit) {
        ret.median = this.findMedianRun(results);
        console.log(getMessage('MEDIAN_RUN'));
        this.displayOutput(ret.median);
      } else if (this.flags.submit) {
        const sheets = new Sheets(this.sheets, this.clientSecret);
        return sheets.appendResults(ret.runs).then(_ => ret);
      }
      return ret;
    });
  }

  run() {
    return this.launchChrome()
      .then(() => {
        const lhOpts = Object.assign({}, this.flags); // pass along all CLI flags
        if (process.env.CI) {
          // handling CRI_TIMEOUT issue - https://github.com/GoogleChrome/lighthouse/issues/833
          this.tryLighthouseCounter = 0;
          return this.runLighthouseOnCI(this.url, lhOpts, perfConfig);
        } else {
          return lighthouse(this.url, lhOpts, perfConfig);
        }
      })
      .then(data => {
        return this.recordLighthouseTrace(data);
      })
      .then(data => {
        return this.launcher.kill().then(_ => data);
      })
      .catch(error => {
        throw new Error(error);
      });
  }

  runLighthouseOnCI(url, lhOpts, perfConfig) {
    return new Promise((resolve, reject) => {
      return lighthouse(url, lhOpts, perfConfig)
        .then(resolve)
        .catch(error => {
          if (error.code === 'CRI_TIMEOUT' && this.tryLighthouseCounter <= _MAX_LIGHTHOUSE_TRIES) {
            this.tryLighthouseCounter++;
            console.log(getMessage('CRI_TIMEOUT_RELAUNCH'));
            return this.runLighthouseOnCI().catch(error => {
              console.error(error.message);
              console.error(getMessage('CLOSING_CHROME'));
              return this.launcher.kill();
            });
          }
          if (this.tryLighthouseCounter > _MAX_LIGHTHOUSE_TRIES) {
            return reject(new Error(getMessage('CRI_TIMEOUT_REJECT')));
          }
        });
    });
  }

  launchChrome() {
    this.launcher = new (ChromeLauncher.ChromeLauncher || ChromeLauncher)();
    return this.launcher.isDebuggerReady()
      .catch(() => {
        console.log(getMessage('LAUNCHING_CHROME'));
        return this.launcher.run();
      });
  }

  recordLighthouseTrace(data) {
    try {
      const preparedData = metrics.prepareData(data);

      if (this.flags.upload) {
        return upload(data, this.clientSecret)
          .then(driveResponse => this.view(driveResponse.id))
          .then(_ => preparedData);
      }

      if (!this.flags.submit && this.runs <= 1) {
        this.displayOutput(preparedData);
      }

      if (this.flags.expectations) {
        expectations.checkExpectations(preparedData.timings, this.expectations);
      }

      return Promise.resolve(preparedData);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  displayOutput(data) {
    if (this.flags.output) {
      return data;
    } else {
      this.showChart(data);
    }
    return data;
  }

  showChart(data) {
    // reverse to preserve the order, because cli-chart.
    let timings = data.timings;

    timings = timings.filter(r => {
      if (r.timing === undefined) {
        console.error(getMessageWithPrefix('ERROR', 'METRIC_IS_UNAVAILABLE', r.title));
      }
      // don't chart hidden metrics, but include in json
      return !metrics.hiddenMetrics.includes(r.id);
    });

    const fullWidthInMs = Math.max(...timings.map(result => result.timing));
    const maxLabelWidth = Math.max(...timings.map(result => result.title.length));

    const chartOps = {
      // 90% of terminal width to give some right margin
      width: process.stdout.columns * 0.9 - maxLabelWidth,
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

  findMedianRun(results) {
    const ttiValues = results.map(r => r.timings.find(timing => timing.id === metrics.ids.TTI).timing);
    const medianTTI = this.median(ttiValues);
    // in the case of duplicate runs having the exact same TTI, we naively pick the first
    return results.find(result => result.timings.find(timing =>
      timing.id === metrics.ids.TTI && timing.timing === medianTTI
    ));
  }

  median(values) {
    if (values.length === 1) return values[0];

    values.sort((a, b) => a - b);

    const half = Math.floor(values.length / 2);

    return values[half];
  }

  view(id) {
    if (this.flags.view) {
      opn(`https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://drive.google.com/file/d//${id}/view?usp=drivesdk`);
    }
  }
}

module.exports = PWMetrics;
