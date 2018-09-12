// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const {Logger} = require('../lib/utils/logger');
const expectations = require('../lib/expectations');
const {timings} = require('./fixtures/metrics-results.json');
const {normalizedExpectations} = require('./fixtures/mocks');
const expectationsData = require('./fixtures/run-expectations').expectations;
const logger = Logger.getInstance();

/* eslint-env mocha */
/* eslint-disable no-unused-expressions, no-console */
describe('Expectations', () => {
  describe('checkExpectations', () => {
    let logSpy;

    beforeEach(() => {
      logSpy = sinon.spy(logger, 'log');
    });
    afterEach(() => {
      logger.log.restore();
    });

    it('should normalize expectation', () => {
      const result = expectations.normalizeExpectationMetrics(expectationsData);
      expect(result).to.have.been.deep.equal(normalizedExpectations);
    });

    it('should show expectation messages', () => {
      const normExpectations = expectations.normalizeExpectationMetrics(expectationsData);
      expectations.checkExpectations(timings, normExpectations);
      expect(logSpy).to.have.been.called;
    });
  });
});
