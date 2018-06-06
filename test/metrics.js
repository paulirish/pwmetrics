// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const metrics = require('../lib/metrics/metrics-adapter');

const events = require('./fixtures/events.json');
const metricsResults = require('./fixtures/metrics-results.json');

/* eslint-env mocha */
describe('Metrics', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = sinon.spy(console, 'log');
  });

  afterEach(() => {
    logSpy.restore();
  });

  describe('prepareData', () => {
    it('should prepare data', () => {
      expect(metrics.prepareData(events)).to.be.deep.equal(metricsResults);
    });

    it('should log error if audit has debugString', () => {
      const eventsWithDebugString = Object.assign({}, events);
      eventsWithDebugString.audits['first-meaningful-paint'].debugString = 'Cannot read property \'ts\' of undefined';
      metrics.prepareData(events);
      expect(logSpy).to.be.calledWith('Cannot read property \'ts\' of undefined Audit key: first-meaningful-paint');
    });
  });
});
