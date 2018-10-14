// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import * as path from 'path';
import * as fs from 'fs';
import * as promisify from 'micro-promisify';

import {getMessageWithPrefix} from './messages';
import {Logger} from './logger';

const logger = Logger.getInstance();


export function getConfigFromFile(fileName: string = 'package.json') {
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

export function writeToDisk(fileName: string, data: string) {
  return new Promise(async (resolve, reject) => {
    const filePath = path.join(process.cwd(), fileName);

    try {
      await promisify(fs.writeFile)(filePath, data);
    } catch (err) {
      reject(err);
    }

    logger.log(getMessageWithPrefix('SUCCESS', 'SAVED_TO_JSON', filePath));
    resolve();
  });
}
