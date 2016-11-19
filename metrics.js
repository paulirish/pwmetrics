// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const messages = require('./messages');

module.exports = {
  hiddenMetrics: [
    'fv',
    'vc',
    'vc85',
    'navstart'
  ],
  prepareData
};

const errorMessages = {
  'ttfcp': 'FIRST_CONTENTFUL_PAINT',
  'ttfmp': 'FIRST_MEANINGFUL_PAINT',
  'psi': 'PERCEPTUAL_SPEED_INDEX',
  'fv': 'FIRST_VISUAL_CHANGE',
  'vc': 'VISUALLY_COMPLETE_100',
  'tti': 'TIME_TO_INTERACTIVE',
  'vc85': 'VISUALLY_COMPLETE_85',
};

function prepareData(res, expectations) {
  const audits = res.audits;

  const resFMP = audits['first-meaningful-paint'];
  const resFMPext = resFMP.extendedInfo;
  const resSI = audits['speed-index-metric'];
  const resSIext = resSI.extendedInfo;
  const resTTI = audits['time-to-interactive'];
  const resTTIext = resTTI.extendedInfo;

  const colorP0 = 'yellow';
  const colorP2 = 'green';
  const colorVisual = 'blue';

  const timestamps = [{
    title: 'Navigation Start',
    name: 'navstart',
    value: resFMPext && resFMPext.value.timings.navStart
  }];

  const timings = [
    {
      title: 'First Contentful Paint',
      name: 'ttfcp',
      value: resFMPext && resFMPext.value.timings.fCP,
      color: colorP2
    },
    {
      title: 'First Meaningful Paint',
      name: 'ttfmp',
      value: resFMP.rawValue,
      color: colorP2
    },
    {
      title: 'Perceptual Speed Index',
      name: 'psi',
      value: resSI.rawValue,
      color: colorVisual
    },
    {
      title: 'First Visual Change',
      name: 'fv',
      value: resSIext && resSIext.value.first,
      color: colorVisual
    },
    {
      title: 'Visually Complete 100%',
      name: 'vc',
      value: resSIext && resSIext.value.complete,
      color: colorVisual
    },
    {
      title: 'Time to Interactive',
      name: 'tti',
      value: resTTI.rawValue,
      color: colorP0
    },
    {
      title: 'Visually Complete 85%',
      name: 'vc85',
      value: resTTIext && parseFloat(resTTIext.value.timings.visuallyReady),
      color: colorVisual
    }
  ];

  const expectationResult = checkExpectations(timings, expectations);

  let result = {
    timings,
    timestamps,
    generatedTime: res.generatedTime,
    lighthouseVersion: res.lighthouseVersion,
    initialUrl: res.initialUrl,
    url: res.url
  };

  if (expectationResult.error) {
    result.expectationErrorMessage = expectationResult.errorMessage;
  }

  return result;
}


function checkExpectations(metrics, expectations) {
  let result = {
    error: false
  };

  metrics.forEach((metric) => {
    const name = metric.name;
    const expectationValue = expectations[name];
    const metricValue =  metric.value;

    if (expectationValue < metricValue) {
      result.errorMessage = messages(errorMessages[name], expectationValue, metricValue);
      result.error = true;
    }
  });

  return result;
}
