// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const PWMetrics = require('../lib');
const runOptions = require('./fixtures/run-options');
const dataMocks = require('./fixtures/mocks');

/* eslint-env mocha */
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
    let runResult;

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
      beforeEach(() => {
        const medianResult = dataMocks.metricsResult;
        runResult = dataMocks.metricsResult;

        pwMetrics = new PWMetrics(runOptions.startWithOneRun.url, runOptions.startWithMoreThenOneRun.opts);
        runStub = sinon.stub(pwMetrics, 'run', () => Promise.resolve(runResult));
        findMedianRunStub = sinon.stub(pwMetrics, 'findMedianRun', () => medianResult);
        displayOutputStub = sinon.stub(pwMetrics, 'displayOutput');
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

    describe('with only failed runs', () => {
      beforeEach(() => {
        const medianResult = dataMocks.metricsResult;
        runResult = dataMocks.failedMetricResult;

        pwMetrics = new PWMetrics(runOptions.startWithOneRun.url, runOptions.startWithMoreThenOneRun.opts);
        runStub = sinon.stub(pwMetrics, 'run', () => Promise.reject(runResult));
        findMedianRunStub = sinon.stub(pwMetrics, 'findMedianRun', () => medianResult);
      });

      it('should not call findMedianRun', () => {
        return pwMetrics.start().then(_ => {
          expect(findMedianRunStub).to.not.have.been.called;
        });
      });
    });

    describe('with one run with expectations', () => {
      beforeEach(() => {
        const {opts} = runOptions.startWithOneRunWithExpectations;
        pwMetrics = new PWMetrics(runOptions.startWithOneRunWithExpectations.url, opts);
        runStub = sinon.stub(pwMetrics, 'run', () => Promise.resolve({timings: []}));
      });

      it('should call method for calculating median results', () => {
        return pwMetrics.start().catch(error => {
          expect(error.message).to.contain('Expectation with errors.');
        });
      });
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
