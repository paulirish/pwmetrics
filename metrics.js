// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

module.exports = {
  hiddenMetrics : [
    'First Visual Change',
    'Visually Complete 100%',
    'Visually Complete 85%',
    'Navigation Start'
  ],
  prepareData
}

function prepareData(res) {
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
    name: 'Navigation Start',
    value: resFMPext && resFMPext.value.timings.navStart
  }];

  const timings = [
    {
      name: 'First Contentful Paint',
      value: resFMPext && resFMPext.value.timings.fCP,
      color: colorP2
    },
    {
      name: 'First Meaningful Paint',
      value: resFMP.rawValue,
      color: colorP2
    },
    {
      name: 'Perceptual Speed Index',
      value: resSI.rawValue,
      color: colorVisual
    },
    {
      name: 'First Visual Change',
      value: resSIext && resSIext.value.first,
      color: colorVisual
    },
    {
      name: 'Visually Complete 100%',
      value: resSIext && resSIext.value.complete,
      color: colorVisual
    },
    {
      name: 'Time to Interactive',
      value: resTTI.rawValue,
      color: colorP0
    },
    {
      name: 'Visually Complete 85%',
      value: resTTIext && parseFloat(resTTIext.value.timings.visuallyReady),
      color: colorVisual
    }
  ];
  return {
    timings,
    timestamps,
    generatedTime: res.generatedTime,
    lighthouseVersion: res.lighthouseVersion,
    initialUrl: res.initialUrl,
    url: res.url
  };
}
