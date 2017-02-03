// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const childProcess = require('child_process');
const expect = require('chai').expect;

describe('CLI', function() {
  it('fails if a url is not provided', () => {
    expect(() => childProcess.execSync('node bin/cli.js')).to.throw('\u001b[31m✘\u001b[0m Error: \u001b[31mNo url entered..\u001b[0m\n\nSpecify --help for available options\n');
  });
});
