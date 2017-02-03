#!/usr/bin/env node
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const sysPath = require('path');
const fs = require('fs');
const yargs = require('yargs');

const PWMetrics = require('../lib/index');
const { getConfigFromFile } = require('../lib/utils/fs');
const { getMessageWithPrefix } = require('../lib/utils/messages');

const cliFlags = yargs
  .help('help')
  .version(() => require('../package').version)
  .showHelpOnFail(false, 'Specify --help for available options')

  .usage('$0 url')

  .describe({
    'json': 'Reports json details to stdout',
    'runs': 'Does n runs (eg. 3, 5), and reports the median run\'s numbers.',
    'expectations': 'Expectations from metrics results. Useful for CI. Config required.',
    'submit': 'Submit metric results into sheets. Config required.',
    'config': 'Read config form file.',
    'disable-cpu-throttling': 'Disable CPU throttling',
    'and more Lighthouse CLI options': 'Docs - https://github.com/GoogleChrome/lighthouse/#lighthouse-cli-options',
  })
  .default('disable-cpu-throttling', false)
  .default('runs', 1)

  // boolean values
  .boolean([
    'disable-cpu-throttling'
  ])
  .check(argv => {
    if (argv._.length === 0)
      throw new Error(getMessageWithPrefix('ERROR', 'NO_URL'));

    return true;
  })
  .argv;

const config = Object.assign({}, {flags: cliFlags});
const fileConfig = getConfigFromFile(cliFlags.config);
const url = fileConfig.url || cliFlags._[0];

// get only allowed properties from file config
Object.keys(fileConfig).forEach(configPropName => {
  switch(configPropName) {
    case 'expectations':
    case 'sheets':
      config[configPropName] = fileConfig[configPropName];
      break;
  }
});

const write = function(fileName, data) {
  const path = sysPath.join(process.cwd(), fileName);
  fs.writeFile(path, data, err => {
    if (err) throw err;

    console.log(getMessageWithPrefix('SUCCESS', 'SAVED_TO_JSON', path));
    process.exit(0);
  });
};

const pwMetrics = new PWMetrics(url, config);
pwMetrics.start()
  .then(data => {
    data = JSON.stringify(data, null, 2) + '\n';
    if (cliFlags.json && !cliFlags.json.length) {
      data && process.stdout.write(data);
      process.exit(0);
    } else if (cliFlags.json.length) {
      write(cliFlags.json, data);
    }
  })
  .catch(err => {
    console.error(err);
    return process.exit(1);
  });

