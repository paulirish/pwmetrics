// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

import * as fs from 'fs';
import * as path from 'path';

const GoogleAuth = require('google-auth-library');
const readlineSync = require('readline-sync');

const { getMessage } = require('../utils/messages');

import { AuthorizeCredentials, Oauth2Client } from '../../types/types';
import Logger from '../utils/logger';
const logger = Logger.getInstance();

/* improve the bad polyfill that devtools-frontend did */
//@todo remove after https://github.com/GoogleChrome/lighthouse/issues/1535 will be closed
const globalAny: any = global;
const self = globalAny.self || this;
self.setImmediate = function(callback:any) {
  Promise.resolve().then(_ => callback.apply(null, [...arguments].slice(1)));
  return 0;
};

// If modifying these this.scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-pwmetrics.json
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];
const EEXIST = 'EEXIST';

class GoogleOauth {
  private tokenDir: string = path.join((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE), '/.credentials/');
  private tokenPath: string = path.join(this.tokenDir, 'sheets.googleapis.com-nodejs-pwmetrics.json');

  async authenticate(clientSecret:AuthorizeCredentials): Promise<Oauth2Client> {
    try {
      return await this.authorize(clientSecret);
    } catch(error) {
      throw error;
    }
  }

  private async authorize(credentials:AuthorizeCredentials): Promise<Oauth2Client> {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new GoogleAuth();
    const oauth2Client: Oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    try {
      const token = this.getToken();
      oauth2Client.credentials = typeof token === 'string' ? JSON.parse(token) : token;
      return oauth2Client;
    } catch(error) {
      return await this.getNewToken(oauth2Client);
    }
  }

  private getToken(): string|object {
    return fs.readFileSync(this.tokenPath, 'utf8');
  }

  private async getNewToken(oauth2Client:Oauth2Client): Promise<Oauth2Client> {
    try {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      });
      const code: string = this.readline(authUrl);
      const token: any = await this.getOauth2ClientToken(oauth2Client, code);
      oauth2Client.credentials = token;
      this.storeToken(token);
      return oauth2Client;
    } catch (error) {
      throw new Error(getMessage('G_OAUTH_ACCESS_ERROR',  error.message));
    }
  }

  private readline(authUrl: string): string {
    return readlineSync.question(getMessage('G_OAUTH_ENTER_CODE', authUrl), {
      hideEchoBack: true
    });
  }

  private getOauth2ClientToken(oauth2Client:Oauth2Client, code: string): Promise<any> {
    return new Promise((resolve:Function, reject:Function) => {
      oauth2Client.getToken(code, (error:Object, token:Object) => {
        if (error)
          return reject(error);
        else
          return resolve(token);
      });
    });
  }

  private storeToken(token:string): void {
    try {
      fs.mkdirSync(this.tokenDir);
    } catch (error) {
      if (error.code !== EEXIST) {
        throw error;
      }
    }
    fs.writeFileSync(this.tokenPath, JSON.stringify(token));
    logger.log(getMessage('G_OAUTH_STORED_TOKEN', this.tokenPath));
  }
}

module.exports = GoogleOauth;
