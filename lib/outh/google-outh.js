// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const GoogleAuth = require('google-auth-library');
const readlineSync = require('readline-sync');
const { getMessage } = require('../utils/messages');
/* improve the bad polyfill that devtools-frontend did */
//@todo remove after https://github.com/GoogleChrome/lighthouse/issues/1535 will be closed
const globalAny = global;
const self = globalAny.self || this;
self.setImmediate = function (callback) {
    Promise.resolve().then(_ => callback.apply(null, [...arguments].slice(1)));
    return 0;
};
// If modifying these this.scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-pwmetrics.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const EEXIST = 'EEXIST';
class GoogleOuth {
    constructor() {
        this.tokenDir = path.join((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE), '/.credentials/');
        this.tokenPath = path.join(this.tokenDir, 'sheets.googleapis.com-nodejs-pwmetrics.json');
    }
    authenticate(clientSecret) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.authorize(clientSecret);
            }
            catch (error) {
                throw error;
            }
        });
    }
    authorize(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientSecret = credentials.installed.client_secret;
            const clientId = credentials.installed.client_id;
            const redirectUrl = credentials.installed.redirect_uris[0];
            const auth = new GoogleAuth();
            const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
            try {
                const token = this.getToken();
                oauth2Client.credentials = typeof token === 'string' ? JSON.parse(token) : token;
                return oauth2Client;
            }
            catch (error) {
                return yield this.getNewToken(oauth2Client);
            }
        });
    }
    getToken() {
        return fs.readFileSync(this.tokenPath, 'utf8');
    }
    getNewToken(oauth2Client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authUrl = oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES
                });
                const code = this.readline(authUrl);
                const token = yield this.getOauth2ClientToken(oauth2Client, code);
                oauth2Client.credentials = token;
                this.storeToken(token);
                return oauth2Client;
            }
            catch (error) {
                throw new Error(getMessage('G_OUTH_ACCESS_ERROR', error.message));
            }
        });
    }
    readline(authUrl) {
        return readlineSync.question(getMessage('G_OUTH_ENTER_CODE', authUrl), {
            hideEchoBack: true
        });
    }
    getOauth2ClientToken(oauth2Client, code) {
        return new Promise((resolve, reject) => {
            oauth2Client.getToken(code, (error, token) => {
                if (error)
                    return reject(error);
                else
                    return resolve(token);
            });
        });
    }
    storeToken(token) {
        try {
            fs.mkdirSync(this.tokenDir);
        }
        catch (error) {
            if (error.code !== EEXIST) {
                throw error;
            }
        }
        fs.writeFileSync(this.tokenPath, JSON.stringify(token));
        console.log(getMessage('G_OUTH_STORED_TOKEN', this.tokenPath));
    }
}
module.exports = GoogleOuth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLW91dGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnb29nbGUtb3V0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxrREFBa0Q7QUFDbEQsOERBQThEOzs7Ozs7Ozs7OztBQUU5RCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUU5QyxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFJcEQseURBQXlEO0FBQ3pELDBGQUEwRjtBQUMxRixNQUFNLFNBQVMsR0FBUSxNQUFNLENBQUM7QUFDOUIsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFDcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFTLFFBQVk7SUFDdkMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0UsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQztBQUVGLDJFQUEyRTtBQUMzRSxnRUFBZ0U7QUFDaEUsTUFBTSxNQUFNLEdBQUcsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4QjtJQUFBO1FBQ1UsYUFBUSxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdEgsY0FBUyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO0lBMEV0RyxDQUFDO0lBeEVPLFlBQVksQ0FBQyxZQUFpQzs7WUFDbEQsSUFBSSxDQUFDO2dCQUNILE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUFDLEtBQUssQ0FBQSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsTUFBTSxLQUFLLENBQUM7WUFDZCxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRWEsU0FBUyxDQUFDLFdBQWdDOztZQUN0RCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztZQUN6RCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUNqRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzlCLE1BQU0sWUFBWSxHQUFpQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUV4RixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixZQUFZLENBQUMsV0FBVyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDakYsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUN0QixDQUFDO1lBQUMsS0FBSyxDQUFBLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZCxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDSCxDQUFDO0tBQUE7SUFFTyxRQUFRO1FBQ2QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRWEsV0FBVyxDQUFDLFlBQXlCOztZQUNqRCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQztvQkFDM0MsV0FBVyxFQUFFLFNBQVM7b0JBQ3RCLEtBQUssRUFBRSxNQUFNO2lCQUNkLENBQUMsQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLEtBQUssR0FBUSxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLFlBQVksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QixNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ3RCLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7UUFDSCxDQUFDO0tBQUE7SUFFTyxRQUFRLENBQUMsT0FBZTtRQUM5QixNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDckUsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFlBQXlCLEVBQUUsSUFBWTtRQUNsRSxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFnQixFQUFFLE1BQWU7WUFDbkQsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFZLEVBQUUsS0FBWTtnQkFDckQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUNSLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUk7b0JBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFVBQVUsQ0FBQyxLQUFZO1FBQzdCLElBQUksQ0FBQztZQUNILEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixNQUFNLEtBQUssQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDO1FBQ0QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyJ9