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
  console.error('    pwmetrics http://goat.com --json  Reports json details to stdout.');
  console.error('    pwmetrics http://goat.com --runs=n  Does n runs (eg. 3, 5), and reports the median run\'s numbers.');
  console.error('    pwmetrics http://goat.com --ttfcp  Expected First Contentful Paint');
  console.error('    pwmetrics http://goat.com --ttfmp  Expected Meaningful Contentful Paint');
  console.error('    pwmetrics http://goat.com --psi  Expected Perceptual Speed Index');
  console.error('    pwmetrics http://goat.com --fv  Expected First Visual Change');
  console.error('    pwmetrics http://goat.com --vc  Expected Visually Complete 100%');
  console.error('    pwmetrics http://goat.com --tti  Expected Time to Interactive');
  console.error('    pwmetrics http://goat.com --vc85  Expected Visually Complete 85%');
  return;
}

const p = new PWMetrics(url, flags);
Promise.resolve(p)
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

