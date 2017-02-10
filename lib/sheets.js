// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const { getMessage } = require('./utils/messages');
const gsheets = require('./gsheets/gsheets');

const SHEET_TYPES = {
  'GOOGLE_SHEETS': 'GOOGLE_SHEETS'
};

class Sheets {
  constructor(config) {
    this.validateOptions(config);

    this.config = config;
  }

  validateOptions(config) {
    if (!config || !Object.keys(config).length)
      throw new Error(getMessage('NO_GOOGLE_SHEET_OPTIONS'));

    const sheetType = config.type;
    if (!Object.keys(SHEET_TYPES).includes(sheetType)) {
      throw new Error(getMessage('NO_SHEET_TYPE', sheetType));
    }

    switch (sheetType) {
      case SHEET_TYPES.GOOGLE_SHEETS:
        if (!config.options.spreadsheetId || !config.options.tableName || !config.options.clientSecret)
          throw new Error(getMessage('NO_GOOGLE_SHEET_OPTIONS'));
        break;
      default:
        throw new Error(getMessage('NO_GOOGLE_SHEET_OPTIONS'));
    }
  }

  appendResults(results) {
    switch (this.config.type) {
      case SHEET_TYPES.GOOGLE_SHEETS:
        return this.appendResultsToGSheets(results);
    }
  }

  appendResultsToGSheets(results) {
    let valuesToAppend = [];
    results.forEach(data => {
      const getTiming = key => data.timings.find(t => t.name === key).value;
      const dateObj = new Date(data.generatedTime);

      // order matters
      valuesToAppend.push([
        data.lighthouseVersion,
        data.url,
        `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`,
        getTiming('ttfcp'),
        getTiming('ttfmp'),
        getTiming('psi'),
        getTiming('fv'),
        getTiming('vc'),
        getTiming('tti'),
        getTiming('vc85')
      ]);
    });

    return gsheets.authenticate(this.config.options.clientSecret).then(auth =>
      gsheets.appendResults(auth, valuesToAppend, this.config.options)
    ).catch(e => {
      console.error(e);
    });
  }
}

module.exports = Sheets;
