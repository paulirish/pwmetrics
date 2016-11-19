'use strict';

module.exports = function(messageType, ...args) {
  switch (messageType) {
    case 'LAUNCHING_CHROME':
      return `Launching Chrome`;
    case 'MEDIAN_RUN':
      return `                ☆  Median run  ☆`;
    case 'METRIC_IS_UNAVAILABLE':
      return `Sorry, ${args[0]} metric is unavailable`;
    case 'FIRST_CONTENTFUL_PAINT':
      return `Expected ${args[0]} ms First Contentful Paint was not reached, actual result is ${args[1]} ms`;
    case 'FIRST_MEANINGFUL_PAINT':
      return `Expected ${args[0]} ms First Meaningful Paint was not reached, actual result is ${args[1]} ms`;
    case 'PERCEPTUAL_SPEED_INDEX':
      return `Expected ${args[0]} ms Perceptual Speed Index was not reached, actual result is ${args[1]} ms`;
    case 'FIRST_VISUAL_CHANGE':
      return `Expected ${args[0]} ms First Visual Change was not reached, actual result is ${args[1]} ms`;
    case 'VISUALLY_COMPLETE_100':
      return `Expected ${args[0]} ms Visually Complete 100% was not reached, actual result is ${args[1]} ms`;
    case 'TIME_TO_INTERACTIVE':
      return `Expected ${args[0]} ms Time to Interactive was not reached, actual result is ${args[1]} ms`;
    case 'VISUALLY_COMPLETE_85':
      return `Expected ${args[0]} ms Visually Complete 85% was not reached, actual result is ${args[1]} ms`;
    default:
      throw new Error('No matching message ID.');
  }

};
