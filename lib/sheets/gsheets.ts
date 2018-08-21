// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const google = require('googleapis');
const promisify = require('micro-promisify');

const { getMessage } = require('../utils/messages');

import { Oauth2Client, GSheetsAppendResultsOptions, GSheetsValuesToAppend } from '../../types/types';

async function getRange(auth: Oauth2Client, range: number, spreadsheetId: string, logFunc: any): Promise<Array<GSheetsValuesToAppend>> {
  try {
    const sheets = google.sheets('v4');
    const response = await promisify(sheets.spreadsheets.values.get)({
      auth: auth,
      spreadsheetId: spreadsheetId,
      range: range
    });
    return response.values;
  } catch(error) {
    logFunc(getMessage('G_SHEETS_API_ERROR', error));
    throw new Error(error);
  }
}

const formatValues = (values: Array<GSheetsValuesToAppend>) => {
  let newValues = values.slice();
  return newValues.reduce((result: any, value: any) => {
    return result.concat(value.slice(3).join('\t')).concat('\n');
  }, []).join('');
};

async function appendResults(auth: Oauth2Client, valuesToAppend: Array<GSheetsValuesToAppend>, options:GSheetsAppendResultsOptions, logFunc: any):Promise<any> {
  try {
    const sheets = google.sheets('v4');
    // clone values to append
    const values = Object.assign([], valuesToAppend);
    logFunc(getMessage('G_SHEETS_APPENDING', formatValues(valuesToAppend)));

    const response = await promisify(sheets.spreadsheets.values.append)({
      auth: auth,
      spreadsheetId: options.spreadsheetId,
      range: `${options.tableName}!A1:C1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });
    const rangeValues: Array<GSheetsValuesToAppend> = await getRange(auth, response.updates.updatedRange, options.spreadsheetId, logFunc);
    logFunc(getMessage('G_SHEETS_APPENDED', formatValues(rangeValues)));
  } catch(error) {
    logFunc(getMessage('G_SHEETS_API_ERROR', error));
    throw new Error(error);
  }
}

export {
  appendResults
};
