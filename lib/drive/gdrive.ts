// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const google = require('googleapis');
const promisify = require('micro-promisify');

import { Oauth2Client, AuthorizeCredentials, DriveResponse } from '../../types/types';
const GoogleOauth = require('../oauth/google-oauth');

class GDrive {
  private oauth: Oauth2Client;

  constructor(public clientSecret: AuthorizeCredentials) {}

  async getOauth(): Promise<Oauth2Client> {
    try {
      if (this.oauth) return this.oauth;

      const googleOauth = new GoogleOauth();
      return this.oauth = await googleOauth.authenticate(this.clientSecret);
    }catch (error) {
      throw error;
    }
  }

  async uploadToDrive(data: any, fileName: string): Promise<DriveResponse> {
    try {
      const drive = google.drive({
        version: 'v3',
        auth: await this.getOauth()
      });

      const body = {
        resource: {
          name: fileName,
          mimeType: 'application/json',
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(data)
        }
      };

      const driveResponse: DriveResponse = await promisify(drive.files.create)(body);
      await this.setSharingPermissions(driveResponse.id);
      return driveResponse;
    } catch (error) {
      throw new Error(error);
    }
  }

  async setSharingPermissions(fileId: string): Promise<any> {
    try {
      const drive = google.drive({
        version: 'v3',
        auth: await this.getOauth()
      });

      const body = {
        resource: {
          'type': 'anyone',
          'role': 'writer'
        },
        fileId: fileId
      };

      return await promisify(drive.permissions.create)(body);
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = GDrive;
