// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const opn = require('opn');
const {prepareAssets} = require('lighthouse/lighthouse-core/lib/asset-saver');

import { AuthorizeCredentials, DriveResponse} from '../types/types';
import { sendToDrive } from './drive/gdrive';

const shareWithTimelineViewer = async function(metricsData: any, clientSecret: AuthorizeCredentials) {
  try {
    const assets: any = await prepareAssets(metricsData.artifacts, metricsData.audits);
    const trace = assets.map((data: any) => {
      return data.traceData;
    });
    const fileName = `lighthouse-results-${Date.now()}`;
    const driveResponse: DriveResponse = await sendToDrive(clientSecret, trace[0], fileName);
    opn(`https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://drive.google.com/file/d//${driveResponse.id}/view?usp=drivesdk`);
  } catch(error) {
    throw error;
  }
};

module.exports = {
  shareWithTimelineViewer
};
