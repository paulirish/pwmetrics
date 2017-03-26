// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const google = require('googleapis');
const promisify = require('micro-promisify');

import { Oauth2Client, AuthorizeCredentials, DriveResponse } from '../../types/types';
const GoogleOuth = require('../outh/google-outh');

class GDrive {
  private outh: Oauth2Client;

  constructor(public clientSecret: AuthorizeCredentials) {}

  async getOuth(): Promise<Oauth2Client> {
    try {
      if (this.outh) return this.outh;

      const googleOuth = new GoogleOuth();
      return this.outh = await googleOuth.authenticate(this.clientSecret);
    }catch (error) {
      throw error;
    }
  }

  async sendToDrive(data: any, fileName: string): Promise<DriveResponse> {
    try {
      const drive = google.drive({
        version: 'v3',
        auth: await this.getOuth()
      });

      const body = {
        resource: {
          name: fileName,
          mimeType: 'text/plain',
        },
        media: {
          mimeType: 'text/plain',
          body: JSON.stringify(data)
        }
      };

      const driveResponse: DriveResponse = await promisify(drive.files.create)(body);
      await this.shareFile(driveResponse.id);
      return driveResponse;
    } catch (error) {
      throw new Error(error);
    }
  }

  async shareFile(fileId: string): Promise<any> {
    try {
      const drive = google.drive({
        version: 'v3',
        auth: await this.getOuth()
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
