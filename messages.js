// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const YELLOW = '\x1b[33m';
const RED = '\x1B[31m';
const RESET = '\x1B[0m';

const getMessage = function(messageType, ...args) {
  switch (messageType) {
    case 'NO_URL':
      return `No url entered.`;
    case 'LAUNCHING_CHROME':
      return `Launching Chrome`;
    case 'MEDIAN_RUN':
      return `                ☆  Median run  ☆`;
    case 'NO_EXPECTATION_METRICS':
      return `No expectation metrics were found`;
    case 'NO_EXPECTATION_WARN_ERROR':
      return `Metric ${args[0]} has to have warn and error values`;
    case 'METRIC_IS_UNAVAILABLE':
      return `Sorry, ${args[0]} metric is unavailable`;
    case 'ERROR_FIRST_CONTENTFUL_PAINT':
      return `Error: Expected ${args[0]} ms First Contentful Paint was not reached, actual result is ${args[1]} ms`;
    case 'WARN_FIRST_CONTENTFUL_PAINT':
      return `Warning: Expected ${args[0]} ms First Contentful Paint was not reached, actual result is ${args[1]} ms`;
    case 'ERROR_FIRST_MEANINGFUL_PAINT':
      return `Error: Expected ${args[0]} ms First Meaningful Paint was not reached, actual result is ${args[1]} ms`;
    case 'WARN_FIRST_MEANINGFUL_PAINT':
      return `Warning: Expected ${args[0]} ms First Meaningful Paint was not reached, actual result is ${args[1]} ms`;
    case 'ERROR_PERCEPTUAL_SPEED_INDEX':
      return `Error: Expected ${args[0]} ms Perceptual Speed Index was not reached, actual result is ${args[1]} ms`;
    case 'WARN_PERCEPTUAL_SPEED_INDEX':
      return `Warning: Expected ${args[0]} ms Perceptual Speed Index was not reached, actual result is ${args[1]} ms`;
    case 'ERROR_FIRST_VISUAL_CHANGE':
      return `Error: Expected ${args[0]} ms First Visual Change was not reached, actual result is ${args[1]} ms`;
    case 'WARN_FIRST_VISUAL_CHANGE':
      return `Warning: Expected ${args[0]} ms First Visual Change was not reached, actual result is ${args[1]} ms`;
    case 'ERROR_VISUALLY_COMPLETE_100':
      return `Error: Expected ${args[0]} ms Visually Complete 100% was not reached, actual result is ${args[1]} ms`;
    case 'WARN_VISUALLY_COMPLETE_100':
      return `Warning: Expected ${args[0]} ms Visually Complete 100% was not reached, actual result is ${args[1]} ms`;
    case 'ERROR_TIME_TO_INTERACTIVE':
      return `Error: Expected ${args[0]} ms Time to Interactive was not reached, actual result is ${args[1]} ms`;
    case 'WARN_TIME_TO_INTERACTIVE':
      return `Warning: Expected ${args[0]} ms Time to Interactive was not reached, actual result is ${args[1]} ms`;
    case 'ERROR_VISUALLY_COMPLETE_85':
      return `Error: Expected ${args[0]} ms Visually Complete 85% was not reached, actual result is ${args[1]} ms`;
    case 'WARN_VISUALLY_COMPLETE_85':
      return `Warning: Expected ${args[0]} ms Visually Complete 85% was not reached, actual result is ${args[1]} ms`;
    default:
      throw new Error('No matching message ID.');
  }
};

const getErrorMessage = function(messageType, ...args) {
  const message = getMessage(messageType, ...args);
  return `${RED}${message}${RESET}`;
};

const getWarningMessage = function(messageType, ...args) {
  const message = getMessage(messageType, ...args);
  return `${YELLOW}${message}${RESET}`;
};

module.exports = {
  getMessage,
  getErrorMessage,
  getWarningMessage
};
