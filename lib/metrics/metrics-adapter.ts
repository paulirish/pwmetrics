// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import {getMessage} from '../utils/messages';
import {MetricsResults, Timing} from '../../types/types';
import METRICS from './metrics';

const checkAudits = (audits: Record<string, LH.Audit.Result>) => Object.keys(audits).forEach(key => {
  const errorMessage = audits[key].errorMessage;
  if (errorMessage)
    console.log(`${errorMessage} Audit key: ${key}`);
});

const getMetricTitle = (metricId) => {
  try {
    return getMessage(metricId);
  } catch (e) {
    return '';
  }
};

export const adaptMetricsData = (res: LH.Result): MetricsResults => {
  const audits:Record<string, LH.Audit.Result>  = res.audits;

  checkAudits(audits);

  const colorP0 = 'yellow';
  const colorP2 = 'green';
  const colorVisual = 'blue';

  const timings: Timing[] = [];

  Object.keys(audits).forEach(metricKey => {
    const metric = audits[metricKey];

    if (!Object.values(METRICS).includes(metric.id)) return;

    const metricTitle = getMetricTitle(metric.id);
    const resolvedMetric: Timing = {
      title: metricTitle.length ? metricTitle : metric.title,
      id: metric.id,
      timing: typeof metric.rawValue === 'boolean' ? 0 : metric.rawValue,
      color: colorVisual
    };

    switch (metric.id) {
      case METRICS.TTFCP:
      case METRICS.TTFMP:
        resolvedMetric.color = colorP2;
        break;
      case METRICS.TTF_CPU_IDLE:
      case METRICS.TTCI:
        resolvedMetric.color = colorP0;
        break;
    }

    timings.push(resolvedMetric);
  });

  return {
    timings,
    generatedTime: res.fetchTime,
    lighthouseVersion: res.lighthouseVersion,
    requestedUrl: res.requestedUrl,
    finalUrl: res.finalUrl,
  };
};
