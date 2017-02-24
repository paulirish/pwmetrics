// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const { getAssertionMessage, getMessageWithPrefix } = require('./utils/messages');

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
    const metricName = metric.id;
    const expectationValue = expectationMetrics[metricName];
    const metricValue = metric.timing;
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
  checkExpectations,
  validateMetrics,
  normalizeMetrics
};
