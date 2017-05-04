// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import * as path from 'path';

function getConfigFromFile(fileName: string) {
  if (fileName.endsWith('package.json')) return getConfigFromPkgFile(fileName);
  else return getConfigFromFilePath(fileName);
}

const getConfigFromPkgFile = function(fileName: string) {
  let resolved: string;
  try {
    const cwdPath = path.resolve(process.cwd(), fileName);
    resolved = require.resolve(cwdPath);
  } catch (e) {
    // if there no package.json for current process.cwd then return empty config
    return {};
  }

  const config = require(resolved);
  return config.pwmetrics || {};
};

const getConfigFromFilePath = function(fileName: string) {
  let resolved: string;
  try {
    resolved = require.resolve(`./${fileName}`);
  } catch (e) {
    const cwdPath = path.resolve(process.cwd(), fileName);
    resolved = require.resolve(cwdPath);
  }

  const config = require(resolved);
  return (config !== null && typeof config === 'object') ? config : {};
};

module.exports = { getConfigFromFile };
