
const path = require('path');

function getConfigFromFile(fileName: string = 'package.json') {
  let resolved: string;
  try {
    resolved = require.resolve(`./${fileName}`);
  } catch (e) {
    const cwdPath = path.resolve(process.cwd(), fileName);
    resolved = require.resolve(cwdPath);
  }
  const config = require(resolved);
  if (resolved.endsWith('package.json'))
    return config.pwmetrics || {};
  else return config;
}

module.exports = { getConfigFromFile };
