// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const {adaptMetricsData} = require('../lib/metrics/metrics-adapter');

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
      expect(adaptMetricsData(events)).to.be.deep.equal(metricsResults);
    });

    it('should log error if audit has debugString', () => {
      const {audits} = events;
      audits.metrics.errorMessage = 'Cannot read property \'ts\' of undefined';
      audits.metrics.explanation = 'Explanation of error';
      adaptMetricsData(events);
      expect(logSpy).to.be.calledWith('Cannot read property \'ts\' of undefined \n Explanation of error');
    });
  });
});
