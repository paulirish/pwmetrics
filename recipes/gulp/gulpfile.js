var gulp = require('gulp');
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const connect = require('gulp-connect');
const PWMetrics = require('../../lib/');
const port = 8080;

const connectServer = function() {
  return connect.server({
    root: '../public',
    port: port
  });
};

function handleError(err) {
  console.log(err.toString());
  process.exit(1);
}

gulp.task('pagespeed', function() {
  connectServer();

  const url = `http://localhost:${port}/index.html`;
  const pwMetrics = new PWMetrics(url, {
    flags: {
      expectations: true
    },
    expectations: {
      metrics: {
        ttfcp: {
          warn: '>=3000',
          error: '>=5000'
        },
        ttfmp: {
          warn: '>=300',
          error: '>=50'
        },
        psi: {
          warn: '>=1500',
          error: '>=3200'
        }
      }
    }
  });
  return pwMetrics.start()
    .then(_ => process.exit(0))
    .catch(_ => handleError);
});

gulp.task('default', ['pagespeed']);
