// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import {MetricsResults, Timing} from '../../types/types';
import {getMessage} from '../utils/messages';
import {Logger} from '../utils/logger';
import {METRICS} from './metrics';

const logger = Logger.getInstance();

const checkMetrics = (metrics: Record<string, LH.Audit.Result>) => {
  const errorMessage = metrics.errorMessage;
  const explanation = metrics.details.explanation;
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

  // has to be Record<string, LH.Audit.Result>
  const metricsAudit:any = auditResults.metrics;
  if (!metricsAudit || !metricsAudit.details || !metricsAudit.details.items)
    throw new Error('No metrics data');

  const metricsValues = metricsAudit.details.items[0];

  checkMetrics(metricsAudit);

  const colorP0 = 'yellow';
  const colorP2 = 'green';
  const colorVisual = 'blue';

  const timings: Timing[] = [];

  // @todo improve to Object.entries
  Object.keys(metricsValues).forEach(metricKey => {
    if (!Object.values(METRICS).includes(metricKey)) return;

    const metricTitle = getMetricTitle(metricKey);
    const resolvedMetric: Timing = {
      title: metricTitle,
      id: metricKey,
      timing: metricsValues[metricKey],
      color: colorVisual
    };

    switch (metricKey) {
      case METRICS.TTFCP:
      case METRICS.TTFMP:
        resolvedMetric.color = colorP2;
        break;
      case METRICS.TTFCPUIDLE:
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
