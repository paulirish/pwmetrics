// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const childProcess = require('child_process');
const expect = require('chai').expect;

describe('CLI', function() {
  describe('url', () => {
    it('should throw error if a url is not provided by cli', () => {
      try {
        childProcess.execSync('node bin/cli.js --config');
      } catch (e) {
        expect(e.message).to.contain('No url entered..');
      }
    });
    it('should throw error if a url is not provided either by config or by cli', () => {
      try {
        childProcess.execSync('node bin/cli.js --config=./test/fixtures/empty-config.js');
      } catch (e) {
        expect(e.message).to.contain('No url entered..');
      }
    });
  });
});
