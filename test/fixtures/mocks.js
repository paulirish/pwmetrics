'use strict';

const lighthouseVersion = require('lighthouse/package.json').version;
const METRICS = require('../../lib/metrics/metrics').default;
const url = 'http://example.com/';

exports.metricsResult = {
  generatedTime: new Date().toISOString(),
  initialUrl: url,
  lighthouseVersion: lighthouseVersion,
  timestamps: [],
  timings: [],
  url: url
};

exports.failedMetricResult = new Error('Failed run');

exports.metricsResults = [
  {
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'first-contentful-paint',
        'timing': 1059.9194,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'first-meaningful-paint',
        'timing': 1575.1898999999999,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'speed-index',
        'timing': 3314.811689134387,
        'color': 'blue'
      },
      {
        'title': 'Estimated Input Latency',
        'id': 'estimated-input-latency',
        'timing': 369.8,
        'color': 'blue'
      },
      {
        'title': 'First CPU Idle',
        'id': 'first-cpu-idle',
        'timing': 5629.956099999999,
        'color': 'yellow'
      },
      {
        'title': 'Time to Interactive',
        'id': 'interactive',
        'timing': 5629.956099999999,
        'color': 'yellow'
      }
    ],
    'generatedTime': '2018-06-08T19:36:07.375Z',
    'lighthouseVersion': '3.0.0-beta.0',
    'requestedUrl': 'https://www.paulirish.com/',
    'finalUrl': 'https://www.paulirish.com/'
  }, {
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'first-contentful-paint',
        'timing': 1059.9194,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'first-meaningful-paint',
        'timing': 1575.1898999999999,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'speed-index',
        'timing': 3314.811689134387,
        'color': 'blue'
      },
      {
        'title': 'Estimated Input Latency',
        'id': 'estimated-input-latency',
        'timing': 369.8,
        'color': 'blue'
      },
      {
        'title': 'First CPU Idle',
        'id': 'first-cpu-idle',
        'timing': 5629.956099999999,
        'color': 'yellow'
      },
      {
        'title': 'Time to Interactive',
        'id': 'interactive',
        'timing': 5629.956099999999,
        'color': 'yellow'
      }
    ],
    'generatedTime': '2018-06-08T19:36:07.375Z',
    'lighthouseVersion': '3.0.0-beta.0',
    'requestedUrl': 'https://www.paulirish.com/',
    'finalUrl': 'https://www.paulirish.com/'
  }, {
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'first-contentful-paint',
        'timing': 1059.9194,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'first-meaningful-paint',
        'timing': 1575.1898999999999,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'speed-index',
        'timing': 3314.811689134387,
        'color': 'blue'
      },
      {
        'title': 'Estimated Input Latency',
        'id': 'estimated-input-latency',
        'timing': 369.8,
        'color': 'blue'
      },
      {
        'title': 'First CPU Idle',
        'id': 'first-cpu-idle',
        'timing': 5629.956099999999,
        'color': 'yellow'
      },
      {
        'title': 'Time to Interactive',
        'id': 'interactive',
        'timing': 5629.956099999999,
        'color': 'yellow'
      }
    ],
    'generatedTime': '2018-06-08T19:36:07.375Z',
    'lighthouseVersion': '3.0.0-beta.0',
    'requestedUrl': 'https://www.paulirish.com/',
    'finalUrl': 'https://www.paulirish.com/'
  }
];

module.exports.googleOauthCredentials = {
  installed: {
    client_secret: '0123456789',
    client_id: '0123456789',
    redirect_uris: []
  }
};

module.exports.googleOauthToken = {
  token: '0123456789'
};

module.exports.normalizedExpectations = {
  [METRICS.TTFMP]: {
    warn: 500,
    error: 1000
  },
  [METRICS.TTCI]: {
    warn: 3000,
    error: 5000,
  },
  [METRICS.TTFCP]: {
    warn: 500,
    error: 1000,
  },
  [METRICS.PSI]: {
    warn: 3000,
    error: 6000,
  },
};
