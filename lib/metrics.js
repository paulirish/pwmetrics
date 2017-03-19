// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const metricsDefinitions = require('lighthouse/lighthouse-core/lib/traces/pwmetrics-events.js').metricsDefinitions;

const metricsIds = {
  NAVSTART: 'navstart',
  TTFCP: 'ttfcp',
  TTFMP: 'ttfmp',
  PSI: 'psi',
  FV: 'fv',
  VC85: 'vc85',
  VC100: 'vc100',
  TTI: 'tti'
};

module.exports = {
  hiddenMetrics: [
    metricsIds.NAVSTART
  ],
  ids: metricsIds,
  prepareData
};

const checkAudits = audits => Object.keys(audits).forEach(key => {
  const debugString = audits[key].debugString;
  if (audits[key].debugString)
    throw new Error(`${debugString} Audit key: ${key}`);
});

function prepareData(res, desiredMetrics = []) {
  const audits = res.audits;

  checkAudits(audits);

  const colorP0 = 'yellow';
  const colorP2 = 'green';
  const colorVisual = 'blue';

  const timings = [];
  const navStart = metricsDefinitions.find(def => def.id === metricsIds.NAVSTART);
  const timestamps = [{
    title: navStart.name,
    id: navStart.id,
    timestamp: navStart.getTs(audits)
  }];


  let filteredDefinitions = metricsDefinitions;

  if (desiredMetrics.length)
    filteredDefinitions = metricsDefinitions.filter((def) => desiredMetrics.includes(def.id));

  filteredDefinitions
    .filter(def => def.id !== metricsIds.NAVSTART)
    .forEach(metric => {
      const resolvedMetric = {
        title: metric.name,
        id: metric.id,
        timestamp: metric.getTs(audits),
        timing: (metric.getTs(audits) - navStart.getTs(audits)) / 1000
      };

      switch (metric.id) {
        case metricsIds.TTFCP:
        case metricsIds.TTFMP:
          resolvedMetric.color = colorP2;
          break;
        case metricsIds.PSI:
        case metricsIds.FV:
        case metricsIds.VC85:
        case metricsIds.VC100:
          resolvedMetric.color = colorVisual;
          break;
        case metricsIds.TTI:
          resolvedMetric.color = colorP0;
          break;
      }

      timings.push(resolvedMetric);
    });

  return {
    timings,
    timestamps,
    generatedTime: res.generatedTime,
    lighthouseVersion: res.lighthouseVersion,
    initialUrl: res.initialUrl,
    url: res.url
  };
}
