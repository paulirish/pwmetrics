const defaultConfig = require('lighthouse/lighthouse-core/config/default-config.js');

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: defaultConfig.categories.performance.auditRefs
      .filter(a => a.group && a.group === 'metrics')
      .map(a => a.id)
  },
};
