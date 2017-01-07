// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const { getConfigFromFile } = require('../utils/fs');
const { getMessage } = require('../utils/messages');

const SHEET_TYPES = {
  'GOOGLE_SHEETS': 'GOOGLE_SHEETS'
};

function getSheetsConfig(fileName) {
  try {
    const config = getConfigFromFile(fileName);

    validateTypes(config.type);
    validateOptions(config.type, config.options);

    return config.sheets;
  } catch (e) {
    console.error(e.message);
    process.exit(0);
  }
}

function validateTypes(sheetType) {
  if (!sheetType in Object.keys(SHEET_TYPES))
    console.error(getMessage('NO_SHEET_TYPE', sheetType, SHEET_TYPES));
}

function validateOptions(sheetType, options) {
  switch (sheetType) {
    case SHEET_TYPES.GOOGLE_SHEETS:
      if (!options.spreadsheetId || !options.tableName)
        console.error(getMessage('NO_GOOGLE_SHEET_OPTIONS'));
  }
}

module.exports = {getSheetsConfig};
