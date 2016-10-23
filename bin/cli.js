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

if (!url || flags.help) {
  if (!flags.help) console.error('No url entered.');
  console.error('Usage:');
  console.error('    pwmetrics http://goat.com');
  console.error('    pwmetrics --json http://goat.com');
  return;
}

const p = new PWMetrics(url, flags);
Promise.resolve(p)
  .then(data => {
    if (flags.json)
      data = JSON.stringify(data, null, 2) + '\n';

    data && process.stdout.write(data);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    return process.exit(1);
  });

