// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
import {METRICS} from '../metrics/metrics';

const GREEN = '\x1B[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1B[31m';
const RESET = '\x1B[0m';
const BOLD = '\x1b[1m';

const greenify = (str: string) => `${GREEN}${str}${RESET}`;
const redify = (str: string) => `${RED}${str}${RESET}`;
const yellowify = (str: string) => `${YELLOW}${str}${RESET}`;
const boldify = (str: string) => `${BOLD}${str}${RESET}`;

const GREEN_CHECK = greenify('✓');
const YELLOW_FLAG = yellowify('⚑');
const RED_X = redify('✘');
const getErrorPrefix = () => `  ${RED_X} Error: ${RED}`;
const getWarningPrefix = () => `  ${YELLOW_FLAG} Warning: ${YELLOW}`;
const getSuccessPrefix = () => `  ${GREEN_CHECK} Success: ${GREEN}`;

export const getMessage = function (messageType: string, ...args: any[]) {
  switch (messageType) {
    case 'NO_URL':
      return 'No url entered.';
    case 'LAUNCHING_CHROME':
      return 'Launching Chrome';
    case 'WAITING':
      return 'Waiting...';
    case 'CLOSING_CHROME':
      return '\nClosing Chrome';
    case 'CRI_TIMEOUT_RELAUNCH':
      return 'CRI_TIMEOUT error. Running Lighthouse one more time ...';
    case 'CRI_TIMEOUT_REJECT':
      return 'CRI_TIMEOUT error. Giving up running Lighthouse';
    case 'MEDIAN_RUN':
      return '        ☆  Median run  ☆';
    case 'SAVED_TO_JSON':
      return `Data was saved into file ${args[0]}`;
    case 'NO_METRICS':
      return 'No expectation metrics were found';
    case 'NO_EXPECTATION_ERROR':
      return `Metric ${args[0]} has to have warn and error values`;
    case 'NO_EXPECTATIONS_FOUND':
      return 'expectation flag set but no expectations found on config file';
    case 'NO_SHEET_TYPE':
      return `Sheet type ${args[0]} is not available.`;
    case 'NO_GOOGLE_SHEET_OPTIONS':
      return 'Some of options for submitting data to Google Sheets are absent';
    case 'NO_MESSAGE_PREFIX_TYPE':
      return `No matching message prefix: ${args[0]}`;
    case 'METRIC_IS_UNAVAILABLE':
      return `Sorry, ${args[0]} metric is unavailable`;
    case 'METRIC_IS_DEPRECATED':
      return `Sorry, ${args[0]} metric is deprecated and cannot be used`;
    case METRICS.TTFCP:
      return 'First Contentful Paint';
    case METRICS.TTFMP:
      return 'First Meaningful Paint';
    case METRICS.SI:
      return 'Speed Index';
    case METRICS.TTFCPUIDLE:
      return 'First CPU Idle';
    case METRICS.TTI:
      return 'Time to Interactive';
    case METRICS.TTLCP:
      return 'Largest Contentful Paint';
    case METRICS.TBT:
      return 'Total Blocking Time';
    case 'SUCCESS_RUN':
      return `Run ${args[0] + 1} of ${args[1]} finished successfully`;
    case 'FAILED_RUN':
      return `Unable to complete run ${args[0] + 1} of ${args[1]} due to ${args[2]}`;
    case 'G_OAUTH_ACCESS_ERROR':
      return `Error while trying to retrieve access token, ${args[0]}`;
    case 'G_OAUTH_ENTER_CODE':
      return `Authorize this app by visiting this url: ${args[0]}\nEnter the code from that page here: `;
    case 'G_OAUTH_STORED_TOKEN':
      return `Token stored to ${args[0]}`;
    case 'G_SHEETS_APPENDING':
      return `Appending...\n${args[0]}`;
    case 'G_SHEETS_APPENDED':
      return `Appended\n${args[0]}`;
    case 'G_SHEETS_API_ERROR':
      return `The API returned an error: ${args[0]}`;
    case 'G_DRIVE_UPLOADING':
      return 'Uploading trace to Google Drive...';
    case 'G_DRIVE_UPLOADED':
      return 'Trace uploaded to Google Drive...';
    case 'HAS_EXPECTATION_ERRORS':
      return 'Expectation with errors.';
    default:
      throw new Error(`No matching message ID: ${messageType}`);
  }
};

export const getAssertionMessage = function (assertionLevel: string,
                                             messageType: string,
                                             expectedValue: number,
                                             actualValue: number) {
  const message = getMessageWithPrefix(assertionLevel, messageType);
  const colorizer = assertionLevel === 'ERROR' ? redify : yellowify;

  const expectedStr = boldify(`${expectedValue} ms`);
  const actualStr = boldify(colorizer(`${actualValue} ms`));
  return `${message} Expected ${expectedStr}, but found ${actualStr}.`;
};

export const getMessageWithPrefix = function (assertionLevel: string,
                                              messageType: string,
                                              ...args: any[]) {
  let prefix;
  const message = getMessage(messageType, ...args);

  switch (assertionLevel) {
    case 'ERROR':
      prefix = getErrorPrefix();
      break;
    case 'WARNING':
      prefix = getWarningPrefix();
      break;
    case 'SUCCESS':
      prefix = getSuccessPrefix();
      break;
    default:
      throw new Error(getMessage(messageType, assertionLevel));
  }

  return `${prefix}${message}.${RESET}`;
};
