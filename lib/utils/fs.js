// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const path = require('path');

function getConfigFromFile(fileName='package.json') {
  let resolved;
  try {
    resolved = require.resolve('./' + fileName);
  } catch (e) {
    const cwdPath = path.resolve(process.cwd(), fileName);
    resolved = require.resolve(cwdPath);
  }

  const config = require(resolved);
  return config.pwmetrics || config;
}

module.exports = { getConfigFromFile };
