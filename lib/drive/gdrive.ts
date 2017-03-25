// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const google = require('googleapis');
const promisify = require('micro-promisify');

import { Oauth2Client, AuthorizeCredentials, DriveResponse } from '../../types/types';
const GoogleOuth = require('../outh/google-outh');

async function sendToDrive(clientSecret: AuthorizeCredentials, data: any, fileName: string): Promise<DriveResponse> {
  try {
    const googleOuth = new GoogleOuth();
    const auth: Oauth2Client = await googleOuth.authenticate(clientSecret);

    const drive = google.drive({ version: 'v3', auth: auth });
    const options = {
      resource: {
        name: fileName,
        mimeType: 'text/plain'
      },
      media: {
        mimeType: 'text/plain',
        body: JSON.stringify(data)
      }
    };

    return await promisify(drive.files.create)(options);
  } catch(error) {
    throw new Error(error);
  }
}

export {
  sendToDrive
};
