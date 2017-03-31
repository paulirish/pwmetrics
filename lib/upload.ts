// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const opn = require('opn');
const { prepareAssets } = require('lighthouse/lighthouse-core/lib/asset-saver');

import { AuthorizeCredentials, LighthouseResults, PreparedAssets } from '../types/types';
const GDrive = require('./drive/gdrive');

const upload = async function(metricsData: LighthouseResults, clientSecret: AuthorizeCredentials) {
  try {
    const assets: PreparedAssets[] = await prepareAssets(metricsData.artifacts, metricsData.audits);
    const trace = assets.map(data => {
      return data.traceData;
    });
    const fileName = `lighthouse-results-${Date.now()}.json`;
    const gDrive = new GDrive(clientSecret);
    const driveResponse = await gDrive.uploadToDrive(trace[0], fileName);
    opn(`https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://drive.google.com/file/d//${driveResponse.id}/view?usp=drivesdk`);
  } catch(error) {
    throw error;
  }
};

module.exports = {
  upload
};
