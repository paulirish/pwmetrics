// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const PWMetrics = require('../../lib/');
const port = 8080;

const connectServer = function() {
  return connect.server({
    root: '../public',
    livereload: true,
    port: port
  });
};

function handleError() {
  process.exit(1);
}

gulp.task('pwmetrics', function() {
  connectServer();

  const url = `http://localhost:${port}/index.html`;
  const pwMetrics = new PWMetrics(url, {
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
  });
  return pwMetrics.start()
    .then(_ => {
      connect.serverClose();
    })
    .catch(_ => handleError);
});

gulp.task('default', ['pwmetrics']);
