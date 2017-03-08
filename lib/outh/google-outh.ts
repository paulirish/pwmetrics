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

const EEXIST = 'EEXIST';

class GoogleOuth {
  scopes: Array<string>;
  tokenDir: string;
  tokenPath: string;

  constructor() {
    // If modifying these this.scopes, delete your previously saved credentials
    // at ~/.credentials/sheets.googleapis.com-nodejs-pwmetrics.json
    this.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
    this.tokenDir = path.join((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE), '/.credentials/');
    this.tokenPath = path.join(this.tokenDir, 'sheets.googleapis.com-nodejs-pwmetrics.json');
  }

  async authenticate(clientSecret:AuthorizeCredentials): Promise<any> {
    try {
      return await this.authorize(clientSecret);
    } catch(error) {
      return Promise.reject(error);
    }
  }

  async authorize(credentials:AuthorizeCredentials): Promise<any> {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    try {
      const token = await fsReadFile(this.tokenPath, 'utf8');
      oauth2Client.credentials = typeof token === 'string' ? JSON.parse(token) : token;
      return oauth2Client;
    } catch(error) {
      return await this.getNewToken(oauth2Client);
    }
  }

  async getNewToken(oauth2Client:any): Promise<any> {
    try {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.scopes
      });

      console.log('Authorize this app by visiting this url: ', authUrl);

      const code = readlineSync.question('Enter the code from that page here: ', {
        hideEchoBack: true
      });
      const token:any = await this.getOauth2ClientToken(oauth2Client, code);
      oauth2Client.credentials = token;
      await this.storeToken(token);
      return oauth2Client;
    } catch (error) {
      throw new Error(`Error while trying to retrieve access token,  ${error.message}`);
    }
  }

  getOauth2ClientToken(oauth2Client:any, code:any): Promise<any> {
    return new Promise((resolve:Function, reject:Function) => {
      oauth2Client.getToken(code, (error:Object, token:Object) => {
        if (error)
          return reject(error);
        else
          return resolve(token);
      });
    });
  }

  async storeToken(token:string): Promise<any> {
    try {
      fs.mkdirSync(this.tokenDir);
    } catch (error) {
      if (error.code !== EEXIST) {
        throw error;
      }
    }
    await fsWriteFile(this.tokenPath, JSON.stringify(token));
    console.log('Token stored to ' + this.tokenPath);
  }
}

export default GoogleOuth;
