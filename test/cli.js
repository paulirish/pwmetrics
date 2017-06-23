// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const path = require('path');
const childProcess = require('child_process');
const expect = require('chai').expect;

/* eslint-env mocha */
describe('CLI', function() {
  describe('url', () => {
    it('should throw error if a url is not provided by cli', () => {
      return childProcess.exec('bin/cli.js', error => {
        expect(error.message).to.contain('No url entered..');
      });
    });

    it('should throw error if a url is not provided either by config or by cli', () => {
      return childProcess.exec('bin/cli.js --config=./test/fixtures/empty-config.js', error => {
        expect(error.message).to.contain('No url entered..');
      });
    });

    it('should not throw any error if a url is provided from cli', () => {
      return childProcess.exec('bin/cli.js https://example.com', error => {
        expect(error).to.be.null;
      });
    });

    it('should not throw any error if a url is provided from cli where package.json is absent', () => {
      return childProcess.exec('./cli.js https://example.com', {
        cwd: path.join(process.cwd(), 'bin')
      }, error => {
        expect(error).to.be.null;
      });
    });
  });
});
