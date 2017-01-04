// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const util = require('util');
const fs = require('fs');

const Chart = require('cli-chart');
const median = require('median');
const lighthouse = require('lighthouse');
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher');
const perfConfig = require('lighthouse/lighthouse-core/config/perf.json');

const metrics = require('./metrics');
const expectations = require('./expectations');
const {getMessage, getErrorMessage} = require('./messages');

class PWMetrics {

  constructor(url, opts) {
    this.url = url;
    this.opts = opts;
    this.metrics = opts.metrics;
    this.runs = opts.runs || 1;

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
      if (this.runs > 1) {
        ret.median = this.findMedianRun(results);
        console.log(getMessage('MEDIAN_RUN'));
        this.displayOutput(ret.median);
      }
      return ret;
    })
  }

  run() {
    return this.launchChrome()
      .then(() => this.recordLighthouseTrace())
      .then(data => {
        return this.launcher.kill().then(_ => data);
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
    const lhOpts = Object.assign({}, this.opts); // pass along all CLI flags
    return lighthouse(this.url, lhOpts, perfConfig)
      .then(res => metrics.prepareData(res))
      .then(data => this.displayOutput(data));
  }

  displayOutput(data) {
    if (this.opts.json) {
      return data;
    } else if (this.opts.expectations) {
      expectations.checkExpectations(data.timings, this.opts.metrics)
    } else {
      this.showChart(data);
    }
  }

  showChart(data) {
    // reverse to preserve the order, because cli-chart.
    let timings = data.timings.reverse();

    timings = timings.filter(r => {
      if (r.value === undefined) {
        console.error(getErrorMessage('METRIC_IS_UNAVAILABLE', r.title));
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
      maxBound: Math.ceil(fullWidthInMs/1000)*1000,
      xmax: fullWidthInMs,
      lmargin: maxLabelWidth + 1,

      // 2 rows per bar, horitzonal plot
      height: timings.length * 2,
      step: 2,
      direction: 'x'
    };

    var chart = new Chart(chartOps);
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
