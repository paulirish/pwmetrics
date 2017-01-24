'use strict';

const lighthouseVersion = require('lighthouse/package.json').version;

const url = 'http://example.com/';

exports.metricsResult = {
  generatedTime: new Date().toISOString(),
  initialUrl: url,
  lighthouseVersion: lighthouseVersion,
  timestamps: [],
  timings: [],
  url: url
};

exports.metricsResults = [
  {
    "timings": [
      {
        "title": "First Contentful Paint",
        "name": "ttfcp",
        "value": 598.468,
        "color": "green"
      },
      {
        "title": "First Meaningful Paint",
        "name": "ttfmp",
        "value": 598.5,
        "color": "green"
      },
      {
        "title": "Perceptual Speed Index",
        "name": "psi",
        "value": 650,
        "color": "blue"
      },
      {
        "title": "First Visual Change",
        "name": "fv",
        "value": 649,
        "color": "blue"
      },
      {
        "title": "Visually Complete 100%",
        "name": "vc",
        "value": 649,
        "color": "blue"
      },
      {
        "title": "Time to Interactive",
        "name": "tti",
        "value": 635.9,
        "color": "yellow"
      },
      {
        "title": "Visually Complete 85%",
        "name": "vc85",
        "value": 635.872,
        "color": "blue"
      }
    ],
    "timestamps": [
      {
        "title": "Navigation Start",
        "name": "navstart",
        "value": 85880196188
      }
    ],
    "generatedTime": "2017-01-24T23:29:54.465Z",
    "lighthouseVersion": "1.4.1",
    "initialUrl": "http://example.com",
    "url": "http://example.com/"
  },
  {
    "timings": [
      {
        "title": "First Contentful Paint",
        "name": "ttfcp",
        "value": 598.468,
        "color": "green"
      },
      {
        "title": "First Meaningful Paint",
        "name": "ttfmp",
        "value": 598.5,
        "color": "green"
      },
      {
        "title": "Perceptual Speed Index",
        "name": "psi",
        "value": 650,
        "color": "blue"
      },
      {
        "title": "First Visual Change",
        "name": "fv",
        "value": 649,
        "color": "blue"
      },
      {
        "title": "Visually Complete 100%",
        "name": "vc",
        "value": 649,
        "color": "blue"
      },
      {
        "title": "Time to Interactive",
        "name": "tti",
        "value": 635.9,
        "color": "yellow"
      },
      {
        "title": "Visually Complete 85%",
        "name": "vc85",
        "value": 635.872,
        "color": "blue"
      }
    ],
    "timestamps": [
      {
        "title": "Navigation Start",
        "name": "navstart",
        "value": 85880196188
      }
    ],
    "generatedTime": "2017-01-24T23:29:54.465Z",
    "lighthouseVersion": "1.4.1",
    "initialUrl": "http://example.com",
    "url": "http://example.com/"
  }
];

