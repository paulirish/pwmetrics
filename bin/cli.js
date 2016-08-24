#!/usr/bin/env node

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

