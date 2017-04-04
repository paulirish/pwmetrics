// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const PWMetrics = require('../../lib/');
const PORT = 8080;

/**
 * Start server
 */
const startServer = function() {
  return connect.server({
    root: './public',
    livereload: true,
    port: PORT
  });
};

/**
 * Stop server
 */
const stopServer = function() {
  connect.serverClose();
};

/**
 * Run pwmetrics
 */
const runPwmetrics = function() {
  const url = 'http://example.com';
  // `http://localhost:${PORT}/index.html`;
  return new PWMetrics(url, {
    flags: {
      expectations: true
    },
    expectations: {
      ttfmp: {
        warn: '>=1000',
        error: '>=2000'
      },
      tti: {
        warn: '>=2000',
        error: '>=3000'
      },
      ttfcp: {
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
  stopServer();
  return results;
};

/**
 * Handle error
 */
const handleError = function(e) {
  stopServer();
  console.error(e); // eslint-disable-line no-console
  throw e; // Throw to exit process with status 1.
};

gulp.task('pwmetrics', function() {
  startServer();
  return runPwmetrics()
    .then(handleOk)
    .catch(handleError);
});

gulp.task('default', ['pwmetrics']);
