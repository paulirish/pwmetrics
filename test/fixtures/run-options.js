'use strict';

const url = 'http://example.com/';

exports.publicVariables = {
  url: url,
  opts: {}
};

exports.startWithOneRun = {
  url: url,
  opts: {
    runs: 1
  }
};

exports.startWithMoreThenOneRun = {
  url: url,
  opts: {
    runs: 2
  }
};
