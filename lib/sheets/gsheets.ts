// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const google = require('googleapis');
const promisify = require('micro-promisify');

const { getMessage } = require('../utils/messages');

import { AuthorizeCredentials, GSheetsAppendResultsOptions, GSheetsValuesToAppend } from '../../types/types';

async function getRange(auth: AuthorizeCredentials, range: number, spreadsheetId: string): Promise<any> {
  try {
    const sheets = google.sheets('v4');
    const response = await promisify(sheets.spreadsheets.values.get)({
      auth: auth,
      spreadsheetId: spreadsheetId,
      range: range
    });
    return response.values;
  } catch(error) {
    console.log(getMessage('G_SHEETS_API_ERROR', error));
    throw new Error(error);
  }
}

const formatValues = (values: any) => {
  let newValues = values.slice();
  return newValues.reduce((result: any, value: any) => {
    return result.concat(value.slice(3).join('\t')).concat('\n');
  }, []).join('');
};

async function appendResults(auth:AuthorizeCredentials, valuesToAppend: Array<GSheetsValuesToAppend>, options:GSheetsAppendResultsOptions):Promise<any> {
  try {
    const sheets = google.sheets('v4');
    // clone values to append
    const values = Object.assign([], valuesToAppend);
    console.log(getMessage('G_SHEETS_APPENDING', formatValues(valuesToAppend)));

    const response = await promisify(sheets.spreadsheets.values.append)({
      auth: auth,
      spreadsheetId: options.spreadsheetId,
      range: `${options.tableName}!A1:C1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });
    const rangeValues = await getRange(auth, response.updates.updatedRange, options.spreadsheetId);
    console.log(getMessage('G_SHEETS_APPENDED', formatValues(rangeValues)));
  } catch(error) {
    console.log(getMessage('G_SHEETS_API_ERROR', error));
    throw new Error(error);
  }
}

export {
  appendResults
};
