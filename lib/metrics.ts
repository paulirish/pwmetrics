// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import {MetricsResults, Timing} from '../types/types';

const metricsIds = {
  TTFMP: 'first-meaningful-paint',
  TTFI: 'first-cpu-idle',
  TTCI: 'interactive',
  PSI: 'speed-index',
  EIL: 'estimated-input-latency',
};

module.exports = {
  ids: metricsIds,
  prepareData
};

const checkAudits = (audits: Record<string, LH.Audit.Result>) => Object.keys(audits).forEach(key => {
  const errorMessage = audits[key].errorMessage;
  if (errorMessage)
    console.log(`${errorMessage} Audit key: ${key}`);
});

function prepareData(res: LH.Result): MetricsResults {
  const audits:Record<string, LH.Audit.Result>  = res.audits;

  checkAudits(audits);

  const colorP0 = 'yellow';
  const colorP2 = 'green';
  const colorVisual = 'blue';

  const timings: Timing[] = [];

  Object.keys(audits).forEach(metricKey => {
    const metric = audits[metricKey];
    const resolvedMetric: Timing = {
      title: metric.title,
      id: metric.id,
      timing: typeof metric.rawValue === 'boolean' ? 0 : metric.rawValue,
      color: colorVisual
    };

    switch (metric.id) {
      case metricsIds.TTFMP:
        resolvedMetric.color = colorP2;
        break;
      case metricsIds.TTFI:
      case metricsIds.TTCI:
        resolvedMetric.color = colorP0;
        break;
    }

    timings.push(resolvedMetric);
  });

  return {
    timings,
    generatedTime: res.fetchTime,
    lighthouseVersion: res.lighthouseVersion,
    initialUrl: res.finalUrl,
    url: res.requestedUrl
  };
}
