// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const util = require('util');
const fs = require('fs');

const median = require('median');
const lighthouse = require('lighthouse');
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher');
const perfConfig = require('lighthouse/lighthouse-core/config/perf.json');

const Sheets = require('./sheets');
const Chart = require('./chart/chart');
const metrics = require('./metrics');
const expectations = require('./expectations');
const { getMessage, getMessageWithPrefix } = require('./utils/messages');

const MAX_LIGHTHOUSE_TRIES = 2;

class PWMetrics {

  constructor(url, opts) {
    this.url = url;
    this.flags = opts.flags || {};
    this.flags.disableCpuThrottling = this.flags.disableCpuThrottling || false;
    this.runs = this.flags.runs || 1;
    this.sheets = opts.sheets;
    this.expectations = opts.expectations || false;
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

    // do our runs in sequence
    const allDone = results.reduce((chain, run, index) => {
      return chain.then(_ => {
        return this.run().then(data => {
          results[index] = data;
        });
      });
    }, Promise.resolve());

    return allDone.then(_ => {
      const ret = { runs: results };
      if (this.runs > 1 && !this.flags.submit) {
        ret.median = this.findMedianRun(results);
        console.log(getMessage('MEDIAN_RUN'));
        this.displayOutput(ret.median);
      } else if (this.flags.submit) {
        const sheets = new Sheets(this.sheets);
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
      .then(() => this.recordLighthouseTrace())
      .then(data => {
        return this.launcher.kill().then(_ => data);
      });
  }

  runLighthouseOnCI(url, lhOpts, perfConfig) {
    return new Promise((resolve, reject) => {
      return lighthouse(url, lhOpts, perfConfig)
        .then(resolve)
        .catch(error => {
          if (error.code === 'CRI_TIMEOUT' && this.tryLighthouseCounter <= MAX_LIGHTHOUSE_TRIES) {
            this.tryLighthouseCounter++;
            console.log(getMessage('CRI_TIMEOUT_RELAUNCH'));
            return this.runLighthouse().catch(error => {
              console.error(error.message);
              console.error(getMessage('CLOSING_CHROME'));
              return this.launcher.kill();
            });
          }
          if (this.tryLighthouseCounter > MAX_LIGHTHOUSE_TRIES) {
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

  recordLighthouseTrace() {
    const lhOpts = Object.assign({}, this.flags); // pass along all CLI flags
    return lighthouse(this.url, lhOpts, perfConfig)
      .then(res => metrics.prepareData(res))
      .then(data => {
        if (!this.flags.submit && this.runs <= 1) {
          this.displayOutput(data);
        }
        return data;
      });
  }

  displayOutput(data) {
    if (this.flags.output) {
      return data;
    } else {
      this.showChart(data);
      if (this.flags.expectations) {
        expectations.checkExpectations(data.timings, this.expectations);
      }
    }
    return data;
  }

  showChart(data) {
    // reverse to preserve the order, because cli-chart.
    let timings = data.timings;

    timings = timings.filter(r => {
      if (r.value === undefined) {
        console.error(getMessageWithPrefix('ERROR', 'METRIC_IS_UNAVAILABLE', r.title));
      }
      // don't chart hidden metrics, but include in json
      return !metrics.hiddenMetrics.includes(r.name);
    });

    const fullWidthInMs = Math.max.apply(Math, timings.map(result => result.value));
    const maxLabelWidth = Math.max.apply(Math, timings.map(result => result.title.length));

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
        size: result.value,
        label: result.title,
        barLabel: `${Math.floor(result.value).toLocaleString()}`,
        color: result.color
      })
    });
    chart.draw();
    return data;
  }

  findMedianRun(results) {
    const ttiValues = results.map(r => r.timings.find(timing => timing.name === 'tti').value);
    const medianTTI = median(ttiValues);
    // in the case of duplicate runs having the exact same TTI, we naively pick the first
    const medianRun = results.find(result => result.timings.find(timing => {
      return timing.name === 'tti' && timing.value === medianTTI;
    }));
    return medianRun;
  }
}

module.exports = PWMetrics;
