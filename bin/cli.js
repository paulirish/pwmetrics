#!/usr/bin/env node
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const PWMetrics = require('..');

const argv = process.argv.slice(2);
const url = argv.filter(f => !f.startsWith('-')).shift();

const flags = {};
argv
  .filter(f => f.startsWith('-'))
  .forEach(f => {
    var keyValue = f.split('=');
    const flagKey = keyValue[0].replace(/-*/, '');
    flags[flagKey] = keyValue[1] || true;
  });

const p = new PWMetrics(url, flags);
Promise.resolve(p)
  .then(data => {
    data && process.stdout.write(data);
    process.stdout.write('\n');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    return process.exit(1);
  });

