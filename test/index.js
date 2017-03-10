// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const PWMetrics = require('../lib');
const runOptions = require('./fixtures/run-options');
const dataMocks = require('./fixtures/mocks');

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

    describe('flags', () => {
      it('should have enabled CPU throttling property for lighthouse by default', () => {
        const pwMetrics = new PWMetrics(runOptions.publicVariables.url, runOptions.publicVariables.opts);
        expect(pwMetrics.flags.disableCpuThrottling).to.be.false;
      });

      it('should disable CPU throttling property for lighthouse', () => {
        const pwMetrics = new PWMetrics(runOptions.publicVariables.url, runOptions.publicVariablesWithDisabledThrottling.opts);
        expect(pwMetrics.flags.disableCpuThrottling).to.be.true;
      });
    });

    describe('expectations', () => {
      it('should set expectations', () => {
        const pwMetrics = new PWMetrics(runOptions.publicVariables.url, runOptions.publicVariablesWithExpectations.opts);
        expect(pwMetrics.expectations).to.be.equal(runOptions.publicVariablesWithExpectations.opts.expectations);
      });
    });
  });

  describe('start method', () => {
    let pwMetrics;
    let runStub;
    let findMedianRunStub;
    let displayOutputStub;

    describe('with one run', () => {
      beforeEach(() => {
        pwMetrics = new PWMetrics(runOptions.startWithOneRun.url, runOptions.startWithOneRun.opts);
        runStub = sinon.stub(pwMetrics, 'run', () => Promise.resolve({timings: []}));
        findMedianRunStub = sinon.stub(pwMetrics, 'findMedianRun');
        displayOutputStub = sinon.stub(pwMetrics, 'displayOutput');
      });

      it('should calculate results', () => {
        const expected = {runs: [{timings: []}]};

        return pwMetrics.start().then(data => {
          expect(data).to.be.deep.equal(expected);
        });
      });

      it('should call "run" method', () => {
        return pwMetrics.start().then(() => {
          expect(runStub).to.have.been.calledOnce;
        });
      });

      it('should not call methods for calculating median results', () => {
        return pwMetrics.start().then(_ => {
          expect(findMedianRunStub).to.not.have.been.called;
          expect(displayOutputStub).to.not.have.been.called;
        });
      });

      afterEach(() => {
        runStub.restore();
        findMedianRunStub.restore();
        displayOutputStub.restore();
      });
    });

    describe('with more then one run', () => {
      let medianResults;
      let runResult;

      beforeEach(() => {
        const medianResult = dataMocks.metricsResult;
        const run1Result = dataMocks.metricsResult;
        const run2Result = dataMocks.metricsResult;
        runResult = dataMocks.metricsResult;

        medianResults = {
          median: medianResult,
          runs: [
            run1Result, run2Result
          ]
        };

        pwMetrics = new PWMetrics(runOptions.startWithOneRun.url, runOptions.startWithMoreThenOneRun.opts);
        runStub = sinon.stub(pwMetrics, 'run', () => Promise.resolve(runResult));
        findMedianRunStub = sinon.stub(pwMetrics, 'findMedianRun', () => medianResult);
        displayOutputStub = sinon.stub(pwMetrics, 'displayOutput');
      });

      it('should calculate median results', () => {
        return pwMetrics.start().then(data => {
          expect(data).to.be.deep.equal(medianResults);
        });
      });

      it('should call "run" method', () => {
        return pwMetrics.start().then(_ => {
          expect(runStub).to.have.been.calledTwice;
        });
      });

      it('should call method for calculating median results', () => {
        return pwMetrics.start().then(_ => {
          expect(findMedianRunStub).to.have.been.calledOnce;
          expect(displayOutputStub).to.have.been.calledOnce;
        });
      });
    });
  });
});
