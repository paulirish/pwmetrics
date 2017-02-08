#!/usr/bin/env node
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const sysPath = require('path');
const fs = require('fs');
const yargs = require('yargs');

const PWMetrics = require('../lib/index');
const { getConfigFromFile } = require('../lib/utils/fs');
const { getMessageWithPrefix } = require('../lib/utils/messages');
const { mergeDeep } = require('../lib/utils/object');

const cliFlags = yargs
  .help('help')
  .version(() => require('../package').version)
  .showHelpOnFail(false, 'Specify --help for available options')
  .wrap(yargs.terminalWidth())
  .usage('Usage: $0 <url>')
  .command('url', 'URL to test')
  .option('json', {
    'describe': 'JSON output defaults to stdout.',
    'type': 'boolean',
    'default': false,
    'group': 'Output:'
  })
  .option('output-path', {
    'describe': 'The file path to output the results',
    'type': 'string',
    'default': '',
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
    'describe': 'Path to json config file',
    'coerce': (arg) => getConfigFromFile(arg),
    'type': 'string'
  })
  .option('disable-cpu-throttling', {
    'describe': 'Disable CPU throttling',
    'type': 'boolean',
    'default': false
  })
  .epilogue('For more Lighthouse CLI options see https://github.com/GoogleChrome/lighthouse/#lighthouse-cli-options')
  .check(argv => {
    //test possible url locations, first from cmd line then from config file
    if (argv._.length !== 0 || (argv.config !== undefined && argv.config.url))
      return true;

    throw new Error(getMessageWithPrefix('ERROR', 'NO_URL'));
  }).argv;

//Get all explicitly terminal set options, does not include url because url has no default option
const terminalOptions = Object.keys(yargs.getOptions().default).reduce((accum, prop) => {
  if (cliFlags[prop] !== yargs.getOptions().default[prop])
    accum[prop] = cliFlags[prop];
  return accum;
}, {});

//Merge options from all sources. Order indicates precedence (last => most important)
const options = mergeDeep(yargs.getOptions().default, cliFlags.config, terminalOptions);

//Get url first from cmd line then from config file.
options.url = cliFlags._[0] || options.url;

const writeJSONtoDisk = function (fileName, data) {
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
    if (cliFlags.json) {
      data = JSON.stringify(data, null, 2) + '\n';
      if (cliFlags.json.length) return writeJSONtoDisk(cliFlags.json, data);
      else data && process.stdout.write(data);
    }
  }).then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });