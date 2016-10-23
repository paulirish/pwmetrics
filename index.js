// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

const Chart = require('cli-chart');
const lighthouse = require('lighthouse');
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher');
const perfConfig = require('lighthouse/lighthouse-core/config/perf.json')

const metrics = require('./metrics')

class PWMetrics {

  constructor(url, opts) {
    this.url = url;
    this.opts = opts;
    this.runsRemaining = opts.runs || 1;

    return this.run();
  }

  run() {
    return this.launchChrome()
      .then(() => this.recordLighthouseTrace())
      .then(data => {
        this.launcher.kill();
        return data;
      });
  }

  launchChrome() {
    this.launcher = new (ChromeLauncher.ChromeLauncher || ChromeLauncher)();
    return this.launcher.isDebuggerReady()
      .catch(() => {
        console.log('Launching Chrome...');
        return launcher.run();
      });
  }

  recordLighthouseTrace() {
    const lhOpts = {mobile: true, loadPage: true};
    return lighthouse(this.url, lhOpts, perfConfig)
      .then(res => metrics.prepareData(res))
      .then(data => this.displayOutput(data));
  }

  spitJSON(data) {
    data.timings = data.timings.map(r => {
      delete r.color;
      return r;
    });
    return data;
  }

  displayOutput(data) {
    if (this.opts.json) {
      return this.spitJSON(data);
    }

    data = data.timings.reverse();

    data = data.filter(r => {
      if (r.value === undefined) {
        console.error(`Sorry, ${r.name} metric is unavailable`);
      }
      // don't chart hidden metrics, but include in json
      return !metrics.hiddenMetrics.includes(r.name);
    })

    const fullWidthInMs = Math.max.apply(Math, data.map(result => result.value));
    const maxLabelWidth = Math.max.apply(Math, data.map(result => result.name.length));

    const chartOps = {
      // 90% of terminal width to give some right margin
      width: process.stdout.columns * 0.9 - maxLabelWidth,
      xlabel: 'Time (ms) since navigation start',

      // nearest second
      maxBound: Math.ceil(fullWidthInMs/1000)*1000,
      xmax: fullWidthInMs,
      lmargin: maxLabelWidth + 1,

      // 2 rows per bar, horitzonal plot
      height: data.length * 2,
      step: 2,
      direction: 'x'
    };

    var chart = new Chart(chartOps);
    data.forEach(result => {
      chart.addBar({
        size: result.value,
        label: result.name,
        barLabel: `${Math.floor(result.value).toLocaleString()}`,
        color: result.color
      })
    });
    chart.draw();
  }
}

module.exports = PWMetrics;
