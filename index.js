// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
"use strict";

const util = require('util');
const fs = require('fs');
const path = require('path');

const Chart = require('cli-chart');
const lighthouse = require('lighthouse');
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher');

const perfConfig = require('lighthouse/lighthouse-core/config/perf.json')

class PWMetrics {

  constructor(url, opts) {
    this.url = url;
    this.opts = opts;
    this.hiddenMetrics = [
      'First Visual Change',
      'Visually Complete 100%',
      'Visually Complete 85%',
      'Navigation Start'
    ];

    const launcher = new (ChromeLauncher.ChromeLauncher || ChromeLauncher)();

    return launcher
    .isDebuggerReady()
    .catch(() => {
      console.log('Launching Chrome...');
      return launcher.run();
    })
    .then(() => this.recordLighthouseTrace())
    .then(data => {
      launcher.kill();
      return data;
    });
  }

  recordLighthouseTrace() {
    const lhOpts = {mobile: true, loadPage: true};
    return lighthouse(this.url, lhOpts, perfConfig)
      .then(res => this.prepareData(res))
      .then(data => this.displayOutput(data));
  }

  prepareData(res) {
    const audits = res.audits;

    const resFMP = audits['first-meaningful-paint'];
    const resFMPext = resFMP.extendedInfo;
    const resSI = audits['speed-index-metric'];
    const resSIext = resSI.extendedInfo;
    const resTTI = audits['time-to-interactive'];
    const resTTIext = resTTI.extendedInfo;

    const colorP0 = 'yellow';
    const colorP2 = 'green';
    const colorVisual = 'blue';

    const timestamps = [{
      name: 'Navigation Start',
      value: resFMPext && resFMPext.value.timings.navStart
    }];

    const timings = [{
      name: 'First Contentful Paint',
      value: resFMPext && resFMPext.value.timings.fCP,
      color: colorP2
    }, {
      name: 'First Meaningful Paint',
      value: resFMP.rawValue,
      color: colorP2
    }, {
      name: 'Perceptual Speed Index',
      value: resSI.rawValue,
      color: colorVisual
    },
    {
      name: 'First Visual Change',
      value: resSIext && resSIext.value.first,
      color: colorVisual
    },
    {
      name: 'Visually Complete 100%',
      value: resSIext && resSIext.value.complete,
      color: colorVisual
    },
     {
      name: 'Time to Interactive',
      value: resTTI.rawValue,
      color: colorP0
    },
    {
      name: 'Visually Complete 85%',
      value: resTTIext && parseFloat(resTTIext.value.timings.visuallyReady),
      color: colorVisual
    }
    ];
    return {
      timings,
      timestamps,
      generatedTime: res.generatedTime,
      lighthouseVersion: res.lighthouseVersion,
      initialUrl: res.initialUrl,
      url: res.url
    };
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
      return !this.hiddenMetrics.includes(r.name);
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
