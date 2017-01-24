#!/usr/bin/env node
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const PWMetrics = require('../lib/index');
const { getConfigFromFile } = require('../lib/utils/fs');
const { getMessageWithPrefix } = require('../lib/utils/messages');

const argv = process.argv.slice(2);

const flags = {};
argv
  .filter(f => f.startsWith('-'))
  .forEach(f => {
    var keyValue = f.split('=');
    const flagKey = keyValue[0].replace(/-*/, '');
    flags[flagKey] = keyValue[1] || true;
  });

const config = Object.assign({}, getConfigFromFile(flags.config), { flags: flags });

const url = config.url || argv.filter(f => !f.startsWith('-')).shift();

if (!url || flags.help) {
  if (!flags.help) console.error(getMessageWithPrefix('ERROR', 'NO_URL'));
  console.error('Usage:');
  console.error('    pwmetrics http://example.com/');
  console.error('    pwmetrics http://example.com/ --json  Reports json details to stdout.');
  console.error('    pwmetrics http://example.com/ --runs=n  Does n runs (eg. 3, 5), and reports the median run\'s numbers.');
  console.error('    pwmetrics --expectations  Expectations from metrics results. Useful for CI. Config required.');
  console.error('    pwmetrics --submit  Submit metric results into sheets. Config required.');
  console.error('    pwmetrics --config  Read config form file.');

  return;
}


const pwMetrics = new PWMetrics(url, config);
pwMetrics.start()
  .then(data => {
    if (flags.json) {
      data = JSON.stringify(data, null, 2) + '\n';
      data && process.stdout.write(data);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    return process.exit(1);
  });

