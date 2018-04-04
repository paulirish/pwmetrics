// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const {getConfigFromFile} = require('../lib/utils/fs');
const packageJSON = require('../package.json');
const expectations = require('./fixtures/run-expectations');

/* eslint-env mocha */
describe('Config', () => {
  describe('validate input', () => {
    context('from package.json as default parameter', () => {
      it('should return empty object if pwmetrics property not defined', () => {
        expect(getConfigFromFile()).to.be.deep.equal({});
      });
    });
    context('with pwmetrics property defined', () => {
      it('should return the pwmetrics data', () => {
        packageJSON.pwmetrics = expectations;
        expect(getConfigFromFile()).to.be.deep.equal(expectations);
        delete packageJSON.pwmetrics;
      });
    });

    context('from specific config path', () => {
      it('should return object in specified path', () => {
        expect(getConfigFromFile('./test/fixtures/run-expectations')).to.be.deep.equal(expectations);
      });

      it('should throw if invalid path to file', () => {
        expect(() => getConfigFromFile('./some/invalid/path')).to.throw(Error, 'Cannot find module');
      });

      it('should throw if file in path is not a json', () => {
        expect(() => getConfigFromFile('./test/fixtures/invalid-config')).to.throw(Error, 'Invalid config from');
      });
    });
  });
});
