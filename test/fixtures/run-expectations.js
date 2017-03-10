'use strict';

module.exports = {
  url: 'http://example.com/',
  flags: {
    expectations: true,
    runs: 2,
  },
  expectations: {
    ttfmp: {
      warn: '>=3000',
      error: '>=2000'
    },
    tti: {
      warn: '>=3000',
      error: '>=5000',
    },
    ttfcp: {
      warn: '>=1500',
      error: '>=3000',
    },
    psi: {
      warn: '>=3000',
      error: '>=6000',
    },
    vc85: {
      warn: '>=3000',
      error: '>=5000',
    }
  },
};
