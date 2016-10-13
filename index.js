// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
"use strict";

const lighthouse = require('lighthouse');
const Chart = require('cli-chart');
const util = require('util');
const fs = require('fs');
const path = require('path');

const perfConfig = require('lighthouse/lighthouse-core/config/perf.json')

class PWMetrics {

  constructor(url, opts) {
    this.url = url;
    this.opts = opts;

    if (this.opts.data) {
      const filename = this.opts.data;
      const savedResults = JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf8'));
      return this.displayResults(savedResults.audits);
    }

    if (!this.url) {
      return new Error('Please provide a URL');
    }

    return this.recordLighthouseTrace();
  }

  recordLighthouseTrace() {
    const lhOpts = {mobile: true, loadPage: true};
    return lighthouse(this.url, lhOpts, perfConfig)
      .then(res => this.prepareData(res))
      .then(data => this.displayOutput(data));
  }


  prepareData(res) {
    res = res.audits;

    const resFMP = res['first-meaningful-paint'];
    const resFMPext = resFMP.extendedInfo;
    const resSI = res['speed-index-metric'];
    const resSIext = resSI.extendedInfo;
    const resTTI = res['time-to-interactive'];
    const resTTIext = resTTI.extendedInfo;

    const colorP0 = 'yellow';
    const colorP2 = 'green';
    const colorVisual = 'blue';

    const timestamps = [
      resFMPext && resFMPext.value.timings.navStart
    ];
    const timings = [{
      name: 'First Contentful Paint',
      value: resFMPext && resFMPext.value.timings.fCP,
      color: colorP2
    }, {
      name: 'First Meaningful Paint',
      value: resFMP.rawValue,
      color: colorP0
    }, {
      name: 'Median Visual Completion',
      value: resSI.rawValue,
      color: colorVisual
    }, {
      name: 'First Visual Change',
      value: resSIext && resSIext.value.first,
      color: colorVisual
    }, {
      name: 'Visually Complete 100%',
      value: resSIext && resSIext.value.complete,
      color: colorVisual
    }, {
      name: 'Time to Interactive',
      value: resTTI.rawValue,
      color: colorP0
    }, {
      name: 'Visually Complete 85%',
      value: resTTIext && resTTIext.value.timings.visuallyReady,
      color: colorVisual
    }, {
      name: 'Navigation Start',
      value: 0 // naturally.
    }
    ];
    return {
      timings,
      timestamps
    };
  }

  spitJSON(data) {
    data.timings = data.timings.map(r => {
      delete r.color;
      return r;
    });
    var resultsStr = JSON.stringify(data, null, 2);
    return resultsStr;
  }

  displayOutput(data) {
    if (this.opts.json) {
      return this.spitJSON(data);
    }

    data = data.timings.sort((a,b) => b.value - a.value);
    const chart_width = 80;
    const fullWidthInMs = 7000;
    const maxLabelWidth = Math.max.apply(Math, data.map(r => r.name.length));

    data.forEach(r => {
      if (r.value === undefined) {
        console.error(`Sorry, ${r.name} metric is unavailable`);
      }
    })

    const chartOps = {
      width: process.stdout.columns * 0.75, // 75% of terminal  width
      xlabel: 'Time (ms) since navigation start',
      xmax: fullWidthInMs,
      lmargin: maxLabelWidth + 1,
      height: data.length * 2,
      step: 2,
      direction: 'x',
    };

    var chart = new Chart(chartOps);
    data.forEach(result => {
      chart.addBar({
        size: result.value,
        label: result.name,
        color: result.color
      })
    });
    chart.draw();
  }
}

module.exports = PWMetrics;
