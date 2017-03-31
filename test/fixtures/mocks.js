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
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'ttfcp',
        'timing': 598.468,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'ttfmp',
        'timing': 598.5,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'psi',
        'timing': 650,
        'color': 'blue'
      },
      {
        'title': 'First Visual Change',
        'id': 'fv',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Visually Complete 100%',
        'id': 'vc',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Time to Interactive',
        'id': 'tti',
        'timing': 625.9,
        'color': 'yellow'
      },
      {
        'title': 'Visually Complete 85%',
        'id': 'vc85',
        'timing': 635.872,
        'color': 'blue'
      }
    ],
    'timestamps': [
      {
        'title': 'Navigation Start',
        'id': 'navstart',
        'timing': 85880196188
      }
    ],
    'generatedTime': '2017-01-24T23:29:54.465Z',
    'lighthouseVersion': '1.4.1',
    'initialUrl': 'http://example.com',
    'url': 'http://example.com/'
  },
  {
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'ttfcp',
        'timing': 598.468,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'ttfmp',
        'timing': 598.5,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'psi',
        'timing': 650,
        'color': 'blue'
      },
      {
        'title': 'First Visual Change',
        'id': 'fv',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Visually Complete 100%',
        'id': 'vc',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Time to Interactive',
        'id': 'tti',
        'timing': 635.9,
        'color': 'yellow'
      },
      {
        'title': 'Visually Complete 85%',
        'id': 'vc85',
        'timing': 635.872,
        'color': 'blue'
      }
    ],
    'timestamps': [
      {
        'title': 'Navigation Start',
        'id': 'navstart',
        'timing': 85880196188
      }
    ],
    'generatedTime': '2017-01-24T23:29:54.465Z',
    'lighthouseVersion': '1.4.1',
    'initialUrl': 'http://example.com',
    'url': 'http://example.com/'
  },
  {
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'ttfcp',
        'timing': 598.468,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'ttfmp',
        'timing': 598.5,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'psi',
        'timing': 650,
        'color': 'blue'
      },
      {
        'title': 'First Visual Change',
        'id': 'fv',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Visually Complete 100%',
        'id': 'vc',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Time to Interactive',
        'id': 'tti',
        'timing': 645.9,
        'color': 'yellow'
      },
      {
        'title': 'Visually Complete 85%',
        'id': 'vc85',
        'timing': 635.872,
        'color': 'blue'
      }
    ],
    'timestamps': [
      {
        'title': 'Navigation Start',
        'id': 'navstart',
        'timing': 85880196188
      }
    ],
    'generatedTime': '2017-01-24T23:29:54.465Z',
    'lighthouseVersion': '1.4.1',
    'initialUrl': 'http://example.com',
    'url': 'http://example.com/'
  },
  {
    'timings': [
      {
        'title': 'First Contentful Paint',
        'id': 'ttfcp',
        'timing': 598.468,
        'color': 'green'
      },
      {
        'title': 'First Meaningful Paint',
        'id': 'ttfmp',
        'timing': 598.5,
        'color': 'green'
      },
      {
        'title': 'Perceptual Speed Index',
        'id': 'psi',
        'timing': 650,
        'color': 'blue'
      },
      {
        'title': 'First Visual Change',
        'id': 'fv',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Visually Complete 100%',
        'id': 'vc',
        'timing': 649,
        'color': 'blue'
      },
      {
        'title': 'Time to Interactive',
        'id': 'tti',
        'timing': 655.9,
        'color': 'yellow'
      },
      {
        'title': 'Visually Complete 85%',
        'id': 'vc85',
        'timing': 635.872,
        'color': 'blue'
      }
    ],
    'timestamps': [
      {
        'title': 'Navigation Start',
        'id': 'navstart',
        'timing': 85880196188
      }
    ],
    'generatedTime': '2017-01-24T23:29:54.465Z',
    'lighthouseVersion': '1.4.1',
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
    warn: 3000,
    error: 2000
  },
  tti: {
    warn: 3000,
    error: 5000,
  },
  ttfcp: {
    warn: 1500,
    error: 3000,
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
