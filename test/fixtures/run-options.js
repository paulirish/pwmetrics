'use strict';
const METRICS = require('../../lib/metrics/metrics').default;
const url = 'http://example.com/';

exports.publicVariables = {
  url: url,
  opts: {}
};

exports.publicVariablesWithDisabledThrottling = {
  url: url,
  opts: {
    flags: {
      disableCpuThrottling: true
    }
  }
};

exports.startWithOneRun = {
  url: url,
  opts: {
    flags: {
      runs: 1
    }
  }
};

exports.startWithMoreThenOneRun = {
  url: url,
  opts: {
    flags: {
      runs: 2
    }
  }
};

exports.publicVariablesWithExpectations = {
  url: url,
  flags: {
    expectations: true
  },
  opts: {
    expectations: {}
  }
};

exports.startWithOneRunWithExpectations = {
  url: url,
  opts: {
    flags: {
      runs: 1,
      expectations: true
    },
    expectations: {
      [METRICS.TTFCP]: {
        warn: '>=1500',
        error: '>=3000',
      }
    }
  }
};

exports.startWithChromeFlags = {
  url: url,
  opts: {
    flags: {
      chromeFlags: '--no-sandbox --disable-setuid-sandbox'
    }
  }
};

exports.sheets = {
  type: 'GOOGLE_SHEETS',
  options: {
    spreadsheetId: '123456',
    tableName: 'data'
  }
};

exports.clientSecret = {};
