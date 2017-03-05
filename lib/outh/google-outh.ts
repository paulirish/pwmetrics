// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const fs = require('fs');
const path = require('path');
const GoogleAuth = require('google-auth-library');
const promisify = require('micro-promisify');
const readlineSync = require('readline-sync');

import { AuthorizeCredentials } from '../../types/types';

const fsReadFile = promisify(require('fs').readFile);
const fsWriteFile = promisify(require('fs').writeFile);

/* improve the bad polyfill that devtools-frontend did */
//@todo remove after https://github.com/GoogleChrome/lighthouse/issues/1535 will be closed
const globalAny:any = global;
const self = globalAny.self || this;
self.setImmediate = function(callback:any) {
  Promise.resolve().then(_ => callback.apply(null, [...arguments].slice(1)));
  return 0;
};

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-pwmetrics.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = path.join((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE), '/.credentials/');
const TOKEN_PATH = path.join(TOKEN_DIR, 'sheets.googleapis.com-nodejs-pwmetrics.json');
const EEXIST = 'EEXIST';

async function authenticate(clientSecret:AuthorizeCredentials): Promise<any> {
  try {
    return await authorize(clientSecret);
  } catch(error) {
    return Promise.reject(error);
  }
}

async function authorize(credentials:AuthorizeCredentials): Promise<any> {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new GoogleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  try {
    const token = await fsReadFile(TOKEN_PATH, 'utf8');
    oauth2Client.credentials = typeof token === 'string' ? JSON.parse(token) : token;
    return oauth2Client;
  } catch(error) {
    return await getNewToken(oauth2Client);
  }
}

async function getNewToken(oauth2Client:any): Promise<any> {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);

    const code = readlineSync.question('Enter the code from that page here: ', {
      hideEchoBack: true
    });
    const token:any = await getOauth2ClientToken(oauth2Client, code);
    oauth2Client.credentials = token;
    await storeToken(token);
    return oauth2Client;
  } catch (error) {
    throw new Error(`Error while trying to retrieve access token,  ${error.message}`);
  }
}

function getOauth2ClientToken(oauth2Client:any, code:any): Promise<any> {
  return new Promise((resolve:Function, reject:Function) => {
    oauth2Client.getToken(code, (error:Object, token:Object) => {
      if (error)
        return reject(error);
      else
        return resolve(token);
    });
  });
}

async function storeToken(token:string): Promise<any> {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (error) {
    if (error.code !== EEXIST) {
      throw error;
    }
  }
  await fsWriteFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

export {
  authenticate
};
