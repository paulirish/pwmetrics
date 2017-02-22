// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

import { SheetsConfig, MetricsResults } from '../types/types';

// @todo add 'import' after moving all stuff to typescript
const { getMessage } = require('./utils/messages');
const gsheets = require('./gsheets/gsheets');
const metricsIds = require('./metrics').ids;

const SHEET_TYPES = {
  'GOOGLE_SHEETS': 'GOOGLE_SHEETS'
};

class Sheets {
  constructor(public config: SheetsConfig) {
    this.validateOptions(config);
  }

  validateOptions(config: SheetsConfig) {
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

  appendResults(results: Array<MetricsResults>) {
    switch (this.config.type) {
      case SHEET_TYPES.GOOGLE_SHEETS:
        return this.appendResultsToGSheets(results);
    }
  }

  appendResultsToGSheets(results: Array<MetricsResults>): Promise<any[]> {
    let valuesToAppend: Array<Object> = [];
    results.forEach(data => {
      const getTiming = (key:string) => data.timings.find(t => t.id === key).timing;
      const dateObj = new Date(data.generatedTime);

      // order matters
      valuesToAppend.push([
        data.lighthouseVersion,
        data.url,
        `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`,
        getTiming(metricsIds.TTFCP),
        getTiming(metricsIds.TTFMP),
        getTiming(metricsIds.PSI),
        getTiming(metricsIds.FV),
        getTiming(metricsIds.VC100),
        getTiming(metricsIds.TTI),
        getTiming(metricsIds.VC85)
      ]);
    });

    return gsheets.authenticate(this.config.options.clientSecret).then((auth: any) =>
      gsheets.appendResults(auth, valuesToAppend, this.config.options)
    ).catch((error: string) => {
      throw new Error(error);
    });
  }
}

module.exports = Sheets;
