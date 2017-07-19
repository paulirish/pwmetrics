// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import { SheetsConfig, MetricsResults, Oauth2Client, AuthorizeCredentials, GSheetsValuesToAppend } from '../../types/types';

const GoogleOauth = require('../oauth/google-oauth');
import * as gsheets  from './gsheets';

// @todo add 'import' after moving all stuff to typescript
const { getMessage } = require('../utils/messages');
const metricsIds = require('../metrics').ids;

const SHEET_TYPES = {
  'GOOGLE_SHEETS': 'GOOGLE_SHEETS'
};
const VIEWER_URL_PREFIX = 'https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=drive://';

class Sheets {
  constructor(public config: SheetsConfig, public clientSecret: AuthorizeCredentials) {
    this.validateOptions(config, clientSecret);
  }

  validateOptions(config: SheetsConfig, clientSecret: AuthorizeCredentials) {
    if (!config || !Object.keys(config).length)
      throw new Error(getMessage('NO_GOOGLE_SHEET_OPTIONS'));

    const sheetType = config.type;
    if (!Object.keys(SHEET_TYPES).includes(sheetType)) {
      throw new Error(getMessage('NO_SHEET_TYPE', sheetType));
    }

    switch (sheetType) {
      case SHEET_TYPES.GOOGLE_SHEETS:
        if (!config.options.spreadsheetId || !config.options.tableName || !clientSecret)
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

  async appendResultsToGSheets(results: Array<MetricsResults>) {
    let valuesToAppend: Array<GSheetsValuesToAppend> = [];
    results.forEach(data => {
      const getTiming = (key: string) => data.timings.find(t => t.id === key).timing;
      const dateObj = new Date(data.generatedTime);
      let viewerUrl = '';

      if(typeof data.fileId !== 'undefined') {
          viewerUrl = VIEWER_URL_PREFIX + data.fileId;
      }

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
        getTiming(metricsIds.TTFI),
        getTiming(metricsIds.TTCI),
        getTiming(metricsIds.VC85),
        viewerUrl
      ]);
    });

    try {
      const googleOauth = new GoogleOauth();
      const oauth: Oauth2Client = await googleOauth.authenticate(this.clientSecret);
      await gsheets.appendResults(oauth, valuesToAppend, this.config.options);
    } catch(error) {
      throw error;
    }
  }
}

module.exports = Sheets;
