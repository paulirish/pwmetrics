// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const path = require('path');

const { getAssertionMessage, getMessageWithPrefix } = require('./messages');

function getConfig(fileName) {
  if (fileName === true) fileName='package.json';

  try {
    const cwdPath = path.resolve(process.cwd(), fileName);
    const resolved = require.resolve(cwdPath);
    const config = require(resolved);
    const expectations = config.expectations || config.pwmetrics.expectations;

    validateMetrics(expectations.metrics);
    normalizeMetrics(expectations.metrics);

    return expectations;
  } catch(e) {
    console.error(e.message);
    process.exit(0);
  }
}

function validateMetrics(metrics) {
  const metricsKeys = Object.keys(metrics);

  if (!metrics || !metricsKeys.length) {
    console.error(getMessageWithPrefix('ERROR', 'NO_METRICS'));
    process.exit(0);
  }

  metricsKeys.forEach(key => {
    if (!metrics[key] || !metrics[key].warn || !metrics[key].error) {
      console.error(getMessageWithPrefix('ERROR', 'NO_EXPECTATION_ERROR', key));
      process.exit(0);
    }
  });
}

function normalizeMetrics(metrics) {
  Object.keys(metrics).forEach(key => {
    const metric = metrics[key];
    metric.warn = metric.warn.replace('>=', '');
    metric.error = metric.error.replace('>=', '');
  });

  return metrics;
}

function checkExpectations(metricsData, expectationMetrics) {
  metricsData.forEach(metric => {
    const metricName = metric.name;
    const expectationValue = expectationMetrics[metricName];
    const metricValue = metric.value;
    let msg;

    if (!expectationValue) return;

    if (metricValue >= expectationValue.error) {
      msg = getAssertionMessage('ERROR', metricName, expectationValue.error, metricValue);
    } else if (metricValue >= expectationValue.warn && metricValue < expectationValue.error) {
      msg = getAssertionMessage('WARNING', metricName, expectationValue.warn, metricValue);
    }

    if (msg)
      console.log(msg);
  });
}


module.exports = {
  getConfig,
  checkExpectations
};
