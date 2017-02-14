// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const GREEN = '\x1B[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1B[31m';
const RESET = '\x1B[0m';
const BOLD = '\x1b[1m';

const greenify = str => `${GREEN}${str}${RESET}`;
const redify = str => `${RED}${str}${RESET}`;
const yellowify = str => `${YELLOW}${str}${RESET}`;
const boldify = str => `${BOLD}${str}${RESET}`;

const getMessage = function(messageType, ...args) {
  switch (messageType) {
  case 'NO_URL':
    return 'No url entered.';
  case 'LAUNCHING_CHROME':
    return 'Launching Chrome';
  case 'MEDIAN_RUN':
    return '                ☆  Median run  ☆';
  case 'SAVED_TO_JSON':
    return `Data was saved into file ${args[0]}`;
  case 'NO_METRICS':
    return 'No expectation metrics were found';
  case 'NO_EXPECTATION_ERROR':
    return `Metric ${args[0]} has to have warn and error values`;
  case 'NO_EXPECTATIONS_FOUND':
    return `expectation flag set but no expectations found on config file`;
  case 'NO_SHEET_TYPE':
    return `Sheet type ${args[0]} is not available.`;
  case 'NO_GOOGLE_SHEET_OPTIONS':
    return `Some of options for submitting data to Google Sheets are absent`;
  case 'NO_MESSAGE_PREFIX_TYPE':
    return `No matching message prefix: ${args[0]}`;
  case 'METRIC_IS_UNAVAILABLE':
    return `Sorry, ${args[0]} metric is unavailable`;
  case 'ttfcp':
    return 'First Contentful Paint';
  case 'ttfmp':
    return 'First Meaningful Paint';
  case 'psi':
    return 'Perceptual Speed Index';
  case 'fv':
    return 'First Visual Change';
  case 'vc':
    return 'Visually Complete 100%';
  case 'tti':
    return 'Time to Interactive';
  case 'vc85':
    return 'Visually Complete 85%';
  default:
    throw new Error(`No matching message ID: ${messageType}`);
  }
};

const getAssertionMessage = function(assertionLevel, messageType, expectedValue, actualValue) {
  const message = getMessageWithPrefix(assertionLevel, messageType);
  const colorizer = assertionLevel === 'ERROR' ? redify : yellowify;

  const expectedStr = boldify(expectedValue + 'ms');
  const actualStr = boldify(colorizer(actualValue + 'ms'));
  return `${message} Expected ${expectedStr}, but found ${actualStr}.`;
};

const getMessageWithPrefix = function(assertionLevel, messageType, ...args) {
  let prefix;
  const message = getMessage(messageType, args);

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


const GREEN_CHECK = greenify('✓');
const YELLOW_FLAG = yellowify('⚑');
const RED_X = redify('✘');
const getErrorPrefix = _ => `  ${RED_X} Error: ${RED}`;
const getWarningPrefix = _ => `  ${YELLOW_FLAG} Warning: ${YELLOW}`;
const getSuccessPrefix = _ => `  ${GREEN_CHECK} Success: ${GREEN}`;


module.exports = {
  getMessage,
  getAssertionMessage,
  getMessageWithPrefix
};
