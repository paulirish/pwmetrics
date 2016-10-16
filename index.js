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

    const launcher = new ChromeLauncher();

    return launcher
    .isDebuggerReady()
    .catch(() => {
      console.log('Launching Chrome...');
      return launcher.run();
    })
    .then(() => this.recordLighthouseTrace())
    .then(() => launcher.kill());
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
      name: 'Perceptual Speed Index',
      value: resSIext && resSIext.value.speedline.perceptualSpeedIndex,
      color: colorVisual
    }, {
      name: 'First Visual Change',
      value: resSIext && resSIext.value.first,
      color: colorVisual
    },
    // {
    //   name: 'Visually Complete 100%',
    //   value: resSIext && resSIext.value.complete,
    //   color: colorVisual
    // },
     {
      name: 'Time to Interactive',
      value: resTTI.rawValue,
      color: colorP0
    },
    // {
    //   name: 'Visually Complete 85%',
    //   value: resTTIext && resTTIext.value.timings.visuallyReady,
    //   color: colorVisual
    // },
    // {
    //   name: 'Navigation Start',
    //   value: 0 // naturally.
    // }
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

    const fullWidthInMs = Math.max.apply(Math, data.map(result => result.value));
    const maxLabelWidth = Math.max.apply(Math, data.map(result => result.name.length));

    data.forEach(r => {
      if (r.value === undefined) {
        console.error(`Sorry, ${r.name} metric is unavailable`);
      }
    })

    const chartOps = {
      // 90% of terminal width to give some right margin
      width: process.stdout.columns * 0.9 - maxLabelWidth,
      xlabel: 'Time (ms) since navigation start',

      xmax: fullWidthInMs.toFixed(0),
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
