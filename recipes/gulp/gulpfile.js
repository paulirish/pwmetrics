// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

/* eslint-disable no-console */
const gulp = require('gulp');
const PWMetrics = require('../../lib/');
const METRICS = require('../../lib/metrics');

/**
 * Run pwmetrics
 */
const runPwmetrics = function() {
  const url = 'https://www.engadget.com/';
  return new PWMetrics(url, {
    flags: {
      runs: 3,
      expectations: true,
      chromeFlags: '--headless --enable-logging --no-sandbox',
    },
    expectations: {
      [METRICS.TTFMP]: {
        warn: '>=1000',
        error: '>=2000'
      },
      [METRICS.TTI]: {
        warn: '>=5000',
        error: '>=8000'
      },
      [METRICS.TTFCPUIDLE]: {
        warn: '>=1500',
        error: '>=2000'
      }
    }
  }).start();
};

/**
 * Handle ok result
 * @param {Object} results - Pwmetrics results obtained through Lighthouse
 */
const handleOk = function(results) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
};

/**
 * Handle error
 */
const handleError = function(e) {
  console.error(e); // eslint-disable-line no-console
  process.exit(1);
};

gulp.task('pwmetrics', function() {
  return runPwmetrics()
    .then(handleOk)
    .catch(handleError);
});

gulp.task('default', ['pwmetrics']);
