#!/usr/bin/env node
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const sysPath = require('path');
const fs = require('fs');
const yargs = require('yargs');

const PWMetrics = require('../lib/index');
const { getConfigFromFile } = require('../lib/utils/fs');
const { getMessageWithPrefix, getMessage } = require('../lib/utils/messages');

const cliFlags = yargs
  .help('help')
  .version(() => require('../package').version)
  .showHelpOnFail(false, 'Specify --help for available options')
  .wrap(yargs.terminalWidth())
  .usage('Usage: $0 <url>')
  .command('url', 'URL to test')
  .option('json', {
    'describe': 'Output as json',
    'type': 'boolean',
    'default': 'false',
    'group': 'Output:'
  })
  .option('output-path', {
    'describe': 'The file path to output the results',
    'type': 'string',
    'default': 'stdout',
    'group': 'Output:'
  })
  .option('runs', {
    'describe': 'Does n runs (eg. 3, 5), and reports the median run\'s numbers.',
    'type': 'number',
    'default': 1,
  })
  .option('expectations', {
    'describe': 'Expectations from metrics results. Useful for CI. Config required.',
    'type': 'boolean',
    'default': false
  })
  .option('submit', {
    'describe': 'Submit metric results into google sheets. Config required.',
    'type': 'boolean',
    'default': false
  })
  .option('config', {
    'describe': 'Path to config file',
    'type': 'string',
  })
  .option('disable-cpu-throttling', {
    'describe': 'Disable CPU throttling',
    'type': 'boolean',
    'default': false
  })
  .epilogue('For more Lighthouse CLI options see https://github.com/GoogleChrome/lighthouse/#lighthouse-cli-options')
  .argv;

const config = getConfigFromFile(cliFlags.config);

//Merge options from all sources. Order indicates precedence (last one wins)
let options = Object.assign({}, {flags: cliFlags}, config);

//Get url first from cmd line then from config file.
options.url = cliFlags._[0] || options.url;

if (!options.url || !options.url.length)
  throw new Error(getMessage('NO_URL'));

const writeToDisk = function (fileName, data) {
  return new Promise((resolve, reject) => {
    const path = sysPath.join(process.cwd(), fileName);
    fs.writeFile(path, data, err => {
      if (err) reject(err);
      console.log(getMessageWithPrefix('SUCCESS', 'SAVED_TO_JSON', path));
      resolve();
    });
  });
};

const pwMetrics = new PWMetrics(options.url, options);
pwMetrics.start()
  .then(data => {
    if (options.flags.json) {
      // serialize accordingly
      data = JSON.stringify(data, null, 2) + '\n';
      // output to file.
      if (options.flags.outputPath != 'stdout')
        return writeToDisk(options.flags.outputPath, data);
      // output to stdout
      else if (data)
        process.stdout.write(data);
    }
  }).then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
