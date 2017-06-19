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

exports.failedMetricResult = new Error('Failed run');

exports.metricsResults = [
  {
    'timings': [{
      'title': 'First Contentful Paint',
      'id': 'ttfcp',
      'timestamp': 38340021362,
      'timing': 1006.643,
      'color': 'green'
    }, {
      'title': 'First Meaningful Paint',
      'id': 'ttfmp',
      'timestamp': 38340021379,
      'timing': 1006.66,
      'color': 'green'
    }, {
      'title': 'Perceptual Speed Index',
      'id': 'psi',
      'timestamp': 38340062085,
      'timing': 1047.366,
      'color': 'blue'
    }, {
      'title': 'First Visual Change',
      'id': 'fv',
      'timestamp': 38340061719,
      'timing': 1047,
      'color': 'blue'
    }, {
      'title': 'Visually Complete 85%',
      'id': 'vc85',
      'timestamp': 38340062085,
      'timing': 1047.366,
      'color': 'blue'
    }, {
      'title': 'Visually Complete 100%',
      'id': 'vc100',
      'timestamp': 38340061719,
      'timing': 1047,
      'color': 'blue'
    }, {
      'title': 'First Interactive (vBeta)',
      'id': 'ttfi',
      'timestamp': 38340021379,
      'timing': 1006.66,
      'color': 'yellow'
    }, {
      'title': 'Time to Consistently Interactive (vBeta)',
      'id': 'ttci',
      'timestamp': 38340021379,
      'timing': 1006.66,
      'color': 'yellow'
    }],
    'timestamps': [{'title': 'Navigation Start', 'id': 'navstart', 'timestamp': 38339014719}],
    'generatedTime': '2017-06-19T20:39:08.057Z',
    'lighthouseVersion': '2.1.0',
    'initialUrl': 'http://example.com',
    'url': 'http://example.com/'
  }, {
    'timings': [{
      'title': 'First Contentful Paint',
      'id': 'ttfcp',
      'timestamp': 38351240693,
      'timing': 894.788,
      'color': 'green'
    }, {
      'title': 'First Meaningful Paint',
      'id': 'ttfmp',
      'timestamp': 38351240870,
      'timing': 894.965,
      'color': 'green'
    }, {
      'title': 'Perceptual Speed Index',
      'id': 'psi',
      'timestamp': 38351260183,
      'timing': 914.278,
      'color': 'blue'
    }, {
      'title': 'First Visual Change',
      'id': 'fv',
      'timestamp': 38351259905,
      'timing': 914,
      'color': 'blue'
    }, {
      'title': 'Visually Complete 85%',
      'id': 'vc85',
      'timestamp': 38351260183,
      'timing': 914.278,
      'color': 'blue'
    }, {
      'title': 'Visually Complete 100%',
      'id': 'vc100',
      'timestamp': 38351259905,
      'timing': 914,
      'color': 'blue'
    }, {
      'title': 'First Interactive (vBeta)',
      'id': 'ttfi',
      'timestamp': 38351240870,
      'timing': 894.965,
      'color': 'yellow'
    }, {
      'title': 'Time to Consistently Interactive (vBeta)',
      'id': 'ttci',
      'timestamp': 38351240870,
      'timing': 894.965,
      'color': 'yellow'
    }],
    'timestamps': [{'title': 'Navigation Start', 'id': 'navstart', 'timestamp': 38350345905}],
    'generatedTime': '2017-06-19T20:39:19.070Z',
    'lighthouseVersion': '2.1.0',
    'initialUrl': 'http://example.com',
    'url': 'http://example.com/'
  }, {
    'timings': [{
      'title': 'First Contentful Paint',
      'id': 'ttfcp',
      'timestamp': 38362423762,
      'timing': 903.559,
      'color': 'green'
    }, {
      'title': 'First Meaningful Paint',
      'id': 'ttfmp',
      'timestamp': 38362423774,
      'timing': 903.571,
      'color': 'green'
    }, {
      'title': 'Perceptual Speed Index',
      'id': 'psi',
      'timestamp': 38362441101,
      'timing': 920.898,
      'color': 'blue'
    }, {
      'title': 'First Visual Change',
      'id': 'fv',
      'timestamp': 38362440203,
      'timing': 920,
      'color': 'blue'
    }, {
      'title': 'Visually Complete 85%',
      'id': 'vc85',
      'timestamp': 38362441101,
      'timing': 920.898,
      'color': 'blue'
    }, {
      'title': 'Visually Complete 100%',
      'id': 'vc100',
      'timestamp': 38362440203,
      'timing': 920,
      'color': 'blue'
    }, {
      'title': 'First Interactive (vBeta)',
      'id': 'ttfi',
      'timestamp': 38362423774,
      'timing': 903.571,
      'color': 'yellow'
    }, {
      'title': 'Time to Consistently Interactive (vBeta)',
      'id': 'ttci',
      'timestamp': 38362423774,
      'timing': 903.571,
      'color': 'yellow'
    }],
    'timestamps': [{'title': 'Navigation Start', 'id': 'navstart', 'timestamp': 38361520203}],
    'generatedTime': '2017-06-19T20:39:30.261Z',
    'lighthouseVersion': '2.1.0',
    'initialUrl': 'http://example.com',
    'url': 'http://example.com/'
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
  ttfmp: {
    warn: 500,
    error: 1000
  },
  tti: {
    warn: 3000,
    error: 5000,
  },
  ttfcp: {
    warn: 500,
    error: 1000,
  },
  psi: {
    warn: 3000,
    error: 6000,
  },
  vc85: {
    warn: 3000,
    error: 5000,
  }
};
