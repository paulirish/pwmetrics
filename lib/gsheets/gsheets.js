var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var GoogleAuth = require('google-auth-library');
var process = require('process');

/* improve the bad polyfill that devtools-frontend did */
var self = global.self || this;
self.setImmediate = function(callback) {
  Promise.resolve().then(_ => callback.apply(null, [...arguments].slice(1)));
  return 0;
}

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-pwmetrics.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-pwmetrics.json';

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
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new GoogleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, 'utf8', function(err, token) {
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
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
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
    var sheets = google.sheets('v4');
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
  var sheets = google.sheets('v4');
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

// if run from CLI
if (require.main === module) {
  return authenticate().then(auth => {
    console.log('Successfully authenticated');
    console.log('Post values, space delimited, in this order:');
    return getRange(auth, '1:1').then(values => {
      console.log(values.toString());
    });
  });
}

module.exports = {
  authenticate,
  appendResults
}
