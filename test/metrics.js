// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const metrics = require('../lib/metrics');

const events = require('./fixtures/events.json');
const metricsResults = require('./fixtures/metrics-results.json');

describe('Metrics', () => {
  describe('prepareData', () => {
    it('should prepare data', () => {
      expect(metrics.prepareData(events)).to.be.deep.equal(metricsResults);
    });

    it('should throw error if audit has debugString', () => {
      const eventsWithDebugString = Object.assign({}, events);
      eventsWithDebugString.audits['first-meaningful-paint'].debugString = `Cannot read property \'ts\' of undefined`;
      expect(() => metrics.prepareData(events)).to.throw(Error, 'Cannot read property \'ts\' of undefined Audit key: first-meaningful-paint');
    });
  });
});
