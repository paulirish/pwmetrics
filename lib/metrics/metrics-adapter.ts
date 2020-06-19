// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import {MetricsResults, Timing} from '../../types/types';
import {getMessage} from '../utils/messages';
import {Logger} from '../utils/logger';
import {METRICS, DEPRECATED_METRICS} from './metrics';

const logger = Logger.getInstance();

const checkMetrics = (metrics: LH.Audit.Result) => {
  const errorMessage = metrics.errorMessage;
  const explanation = metrics.explanation;
  if (errorMessage)
    logger.log(`${errorMessage} \n ${explanation}`);
};

const getMetricTitle = (metricId) => {
  try {
    return getMessage(metricId);
  } catch (e) {
    return '';
  }
};

export const adaptMetricsData = (res: LH.Result): MetricsResults => {
  const auditResults:Record<string, LH.Audit.Result> = res.audits;

  const metricsAudit = auditResults.metrics;
  if (!metricsAudit || !metricsAudit.details || !(metricsAudit.details.type === 'debugdata') || !metricsAudit.details.items)
    throw new Error('No metrics data');

  const metricsValues: LH.Artifacts.TimingSummary = metricsAudit.details.items[0];

  checkMetrics(metricsAudit);

  const colorP0 = 'yellow';
  const colorP2 = 'green';
  const colorVisual = 'blue';

  const timings: Timing[] = [];

  // @todo improve to Object.entries
  Object.keys(metricsValues).forEach((metricKey: keyof LH.Artifacts.TimingSummary) => {
    if (!Object.values(METRICS).includes(metricKey) || DEPRECATED_METRICS.includes(metricKey)) return;

    const metricTitle = getMetricTitle(metricKey);
    const resolvedMetric: Timing = {
      title: metricTitle,
      id: metricKey,
      timing: metricsValues[metricKey],
      color: colorVisual
    };

    switch (metricKey) {
      case METRICS.TTFCP:
      case METRICS.TTLCP:
        resolvedMetric.color = colorP2;
        break;
      case METRICS.TBT:
      case METRICS.TTI:
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
