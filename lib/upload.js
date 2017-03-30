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
const opn = require('opn');
const { prepareAssets } = require('lighthouse/lighthouse-core/lib/asset-saver');
const GDrive = require('./drive/gdrive');
const upload = function (metricsData, clientSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const assets = yield prepareAssets(metricsData.artifacts, metricsData.audits);
            const trace = assets.map(data => {
                return data.traceData;
            });
            const fileName = `lighthouse-results-${Date.now()}.json`;
            const gDrive = new GDrive(clientSecret);
            const driveResponse = yield gDrive.uploadToDrive(trace[0], fileName);
            opn(`https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://drive.google.com/file/d//${driveResponse.id}/view?usp=drivesdk`);
        }
        catch (error) {
            throw error;
        }
    });
};
module.exports = {
    upload
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXBsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtEQUFrRDtBQUNsRCw4REFBOEQ7Ozs7Ozs7Ozs7QUFFOUQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUdoRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUV6QyxNQUFNLE1BQU0sR0FBRyxVQUFlLFdBQThCLEVBQUUsWUFBa0M7O1FBQzlGLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFxQixNQUFNLGFBQWEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUk7Z0JBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO1lBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckUsR0FBRyxDQUFDLDBHQUEwRyxhQUFhLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3RKLENBQUM7UUFBQyxLQUFLLENBQUEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2QsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztDQUFBLENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2YsTUFBTTtDQUNQLENBQUMifQ==