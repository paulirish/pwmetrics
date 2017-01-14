// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const GoogleAuth = require('google-auth-library');
const process = require('process');

/* improve the bad polyfill that devtools-frontend did */
const self = global.self || this;
self.setImmediate = function(callback) {
  Promise.resolve().then(_ => callback.apply(null, [...arguments].slice(1)));
  return 0;
};

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-pwmetrics.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-pwmetrics.json';

function authenticate(clientSecret) {
  return new Promise((resolve, reject) => {
    try {
      authorize(clientSecret, resolve);
    } catch(err) {
      return reject(err);
    }
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new GoogleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, 'utf8', (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      debugger;
      oauth2Client.credentials = typeof token === 'string' ? JSON.parse(token) : token;
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

// logs the a specifed row of the spreadsheet
function getRange(auth, range, spreadsheetId) {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
      auth: auth,
      spreadsheetId: spreadsheetId,
      range: range
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return reject();
      }
      resolve(response.values[0]);
    });
  });
}

const formatValues = values => values.slice(3).join('\t');
/**
 * Adds data to the provided spreadsheet
 * @param {google.auth.OAuth2} auth The OAuth2 client
 * @param {Array} valuesToAppend Array of values to add to the spreadsheet
 * @param {Object} options Sheet options
 * @param {String} options.spreadsheetId Sheet id
 * @param {String} options.tableName Name of a table where results will be appended
 * @return {Promise}
 */
function appendResults(auth, valuesToAppend, options) {
  const sheets = google.sheets('v4');
  const values = [valuesToAppend];

  console.log(`Appending...\n${formatValues(valuesToAppend)}`);

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.append({
      auth: auth,
      spreadsheetId: options.spreadsheetId,
      range: `${options.tableName}!A1:C1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        console.log(response);
        return reject();
      }
      return getRange(auth, response.updates.updatedRange, options.spreadsheetId)
        .then(values => {
          console.log('Appended:');
          console.log(formatValues(values));
        })
        .then(resolve);
    });
  });
}

module.exports = {
  authenticate,
  appendResults
};
