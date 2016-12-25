// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const path = require('path');

const {getErrorMessage, getWarningMessage} = require('./messages');

const errorMessages = {
  'ttfcp': 'ERROR_FIRST_CONTENTFUL_PAINT',
  'ttfmp': 'ERROR_FIRST_MEANINGFUL_PAINT',
  'psi': 'ERROR_PERCEPTUAL_SPEED_INDEX',
  'fv': 'ERROR_FIRST_VISUAL_CHANGE',
  'vc': 'ERROR_VISUALLY_COMPLETE_100',
  'tti': 'ERROR_TIME_TO_INTERACTIVE',
  'vc85': 'ERROR_VISUALLY_COMPLETE_85',
};

const warningMessages = {
  'ttfcp': 'WARN_FIRST_CONTENTFUL_PAINT',
  'ttfmp': 'WARN_FIRST_MEANINGFUL_PAINT',
  'psi': 'WARN_PERCEPTUAL_SPEED_INDEX',
  'fv': 'WARN_FIRST_VISUAL_CHANGE',
  'vc': 'WARN_VISUALLY_COMPLETE_100',
  'tti': 'WARN_TIME_TO_INTERACTIVE',
  'vc85': 'WARN_VISUALLY_COMPLETE_85',
};

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
    console.error(getErrorMessage('NO_EXPECTATION_METRICS'));
    process.exit(0);
  }

  metricsKeys.forEach(key => {
    if (!metrics[key] || !metrics[key].warn || !metrics[key].error) {
      console.error(getErrorMessage('NO_EXPECTATION_WARN_ERROR', key));
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

    if (expectationValue) {
      showMessage(metricName, metricValue, expectationValue)
    }
  });
}

function showMessage(metricName, metricValue, expectationValue) {
  if (metricValue >= expectationValue.error) {
    console.log(getErrorMessage(errorMessages[metricName], expectationValue.error, metricValue));
  } else if (metricValue >= expectationValue.warn && metricValue < expectationValue.error) {
    console.log(getWarningMessage(warningMessages[metricName], expectationValue.warn, metricValue));
  }
}

module.exports = {
  getConfig,
  checkExpectations
};
