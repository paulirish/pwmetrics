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
  });
});
