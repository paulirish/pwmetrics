'use strict';
const {METRICS} = require('../../lib/metrics/metrics');

module.exports = {
  url: 'https://example.com/',
  flags: {
    expectations: true,
    runs: 2,
  },
  expectations: {
    [METRICS.TTFMP]: {
      warn: '>=500',
      error: '>=1000'
    },
    [METRICS.TTI]: {
      warn: '>=3000',
      error: '>=5000',
    },
    [METRICS.TTFCP]: {
      warn: '>=500',
      error: '>=1000',
    },
    [METRICS.SI]: {
      warn: '>=3000',
      error: '>=6000',
    },
  },
};
