// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

module.exports = {
  hiddenMetrics: [
    'fv',
    'vc',
    'vc85',
    'navstart'
  ],
  prepareData
};

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
  return {
    timings,
    timestamps,
    generatedTime: res.generatedTime,
    lighthouseVersion: res.lighthouseVersion,
    initialUrl: res.initialUrl,
    url: res.url
  };
}
