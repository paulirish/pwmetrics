// Copyright 2018 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

export const METRICS = {
  TTFCP: 'firstContentfulPaint',
  TTLCP: 'largestContentfulPaint',
  TBT: 'totalBlockingTime',
  TTI: 'interactive',
  SI: 'speedIndex',
  /** @deprecated */
  TTFMP: 'firstMeaningfulPaint',
  /** @deprecated */
  TTFCPUIDLE: 'firstCPUIdle',
  // @todo add in further improvements
  // VISUALLY_COMPLETE: 'observedLastVisualChange',
};

export const DEPRECATED_METRICS = [
  METRICS.TTFMP,
  METRICS.TTFCPUIDLE,
];
