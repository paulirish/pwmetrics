// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import { Timing, ExpectationMetrics, NormalizedExpectationMetrics } from '../types/types';
const { getAssertionMessage, getMessageWithPrefix } = require('./utils/messages');

function validateMetrics(metrics: ExpectationMetrics) {
  const metricsKeys = Object.keys(metrics);

  if (!metrics || !metricsKeys.length) {
    console.error(getMessageWithPrefix('ERROR', 'NO_METRICS'));
    process.exit(1);
  }

  metricsKeys.forEach(key => {
    if (!metrics[key] || !metrics[key].warn || !metrics[key].error) {
      console.error(getMessageWithPrefix('ERROR', 'NO_EXPECTATION_ERROR', key));
      process.exit(1);
    }
  });
}

function normalizeMetrics(metrics: ExpectationMetrics) {
  let normalizedMetrics: NormalizedExpectationMetrics = {};
  Object.keys(metrics).forEach(key => {
    normalizedMetrics[key] = {
      warn: parseInt(metrics[key].warn.replace('>=', ''), 10),
      error: parseInt(metrics[key].error.replace('>=', ''), 10)
    };
  });
  return normalizedMetrics;
}

function checkExpectations(metricsData: Timing[], expectationMetrics: NormalizedExpectationMetrics) {
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

    if (msg) {
      console.log(msg);
    }
  });
}

module.exports = {
  validateMetrics: validateMetrics,
  normalizeMetrics: normalizeMetrics,
  checkExpectations: checkExpectations
};
