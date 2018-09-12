// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const PWMetrics = require('../lib');
const runOptions = require('./fixtures/run-options');
const dataMocks = require('./fixtures/mocks');

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
describe('PWMetrics', () => {
  describe('public variables', () => {
    it('should set class variables', () => {
      const pwMetrics = new PWMetrics(runOptions.publicVariables.url, runOptions.publicVariables.opts);

      expect(pwMetrics.url).to.be.equal(runOptions.publicVariables.url);
      expect(pwMetrics.runs).to.be.equal(1);
    });

    it('should set more then one run', () => {
      const opts = Object.assign({}, runOptions.publicVariables.opts);
      opts.flags = {};
      opts.flags.runs = 2;
      const pwMetrics = new PWMetrics(runOptions.publicVariables.url, opts);
      expect(pwMetrics.runs).to.be.equal(2);
    });
  });

  describe('findMedianRun method', () => {
    const pwMetrics = new PWMetrics(runOptions.startWithOneRun.url, runOptions.startWithMoreThenOneRun.opts);
    const runs = dataMocks.metricsResults;

    it('for 1 run, return only element', () => {
      expect(pwMetrics.findMedianRun([runs[0]])).to.be.deep.equal(runs[0]);
    });

    it('for 2 runs, return largest element', () => {
      expect(pwMetrics.findMedianRun([runs[0], runs[1]])).to.be.deep.equal(runs[0]);
    });

    it('for odd number of runs, return middle element of sorted array', () => {
      expect(pwMetrics.findMedianRun([runs[0], runs[1], runs[2]])).to.be.deep.equal(runs[2]);
    });

    it('for even runs, return n/2+1 element element of sorted array', () => {
      expect(pwMetrics.findMedianRun(runs)).to.be.deep.equal(runs[2]);
    });
  });
});
