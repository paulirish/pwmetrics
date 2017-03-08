// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const childProcess = require('child_process');
const expect = require('chai').expect;

describe('CLI', function() {
  describe('url', () => {
    it('should throw error if a url is not provided by cli', () => {
      expect(() => childProcess.execSync('node bin/cli.js')).to.throw(Error, 'Error: No url entered.');
    });

    it('should throw error if a url is not provided either by config or by cli', () => {
      expect(() => childProcess.execSync('node bin/cli.js --config=./test/fixtures/empty-config.js'))
        .to.throw(Error, 'Error: No url entered.');
    });
  });
});
