// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const {google} = require('googleapis');

const { getMessage } = require('../utils/messages');

import { Oauth2Client, GSheetsAppendResultsOptions, GSheetsValuesToAppend } from '../../types/types';
import { Logger } from '../utils/logger';
const logger = Logger.getInstance();


const formatValues = (values: Array<GSheetsValuesToAppend>) => {
  let newValues = values.slice();
  return newValues.reduce((result: any, value: any) => {
    return result.concat(value.slice(3).join('\t')).concat('\n');
  }, []).join('');
};

export class GSheets {
  private sheets: any;
  private auth: Oauth2Client;

  constructor() {
    this.sheets = google.sheets('v4');
  }

  public async getRange(range: number, spreadsheetId: string): Promise<Array<GSheetsValuesToAppend>> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId: spreadsheetId,
        range: range
      });
      return response.values;
    } catch(error) {
      logger.error(getMessage('G_SHEETS_API_ERROR', error));
      throw new Error(error);
    }
  }

  async sendResultsToGoogle(valuesToAppend: Array<GSheetsValuesToAppend>, options:GSheetsAppendResultsOptions):Promise<any> {
    logger.log(getMessage('G_SHEETS_APPENDING', formatValues(valuesToAppend)));
    const response = await this.sheets.spreadsheets.values.append({
      auth: this.auth,
      spreadsheetId: options.spreadsheetId,
      range: `${options.tableName}!A1:C1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: valuesToAppend,
      },
    });

    return response;
  }

  public async appendResults (auth: Oauth2Client, valuesToAppend: Array<GSheetsValuesToAppend>, options:GSheetsAppendResultsOptions):Promise<any> {
    this.auth = auth;

    try {
      // clone values to append
      const values = Object.assign([], valuesToAppend);
      const response = await this.sendResultsToGoogle(values, options);

      const rangeValues: Array<GSheetsValuesToAppend> = await this.getRange(response.data.updates.updatedRange, options.spreadsheetId);
      logger.log(getMessage('G_SHEETS_APPENDED', formatValues(rangeValues)));
    } catch(error) {
      logger.error(getMessage('G_SHEETS_API_ERROR', error));
      throw new Error(error);
    }
  }
}
