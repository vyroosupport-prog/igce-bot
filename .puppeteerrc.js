const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Change the cache location for Puppeteer to your project folder
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  
  // Download Chrome (default: false for puppeteer-core)
  chrome: {
    skipDownload: false,
  },
};