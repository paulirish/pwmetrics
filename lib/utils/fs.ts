// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import * as path from 'path';

function getConfigFromFile(fileName: string) {
  let resolved: string;
  try {
    resolved = require.resolve(`./${fileName}`);
  } catch (e) {
    const cwdPath = path.resolve(process.cwd(), fileName);
    resolved = require.resolve(cwdPath);
  }
  const config = require(resolved);
  if(config !== null && typeof config === 'object') {
    if (resolved.endsWith('package.json'))
      return config.pwmetrics || {};
    else return config;
  } else throw new Error(`Invalid config from ${fileName}`);

}

module.exports = { getConfigFromFile };
