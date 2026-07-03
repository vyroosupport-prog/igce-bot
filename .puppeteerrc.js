const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Change the cache location for Puppeteer to a place Railway can keep
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
    
    // Tell Puppeteer to download Chrome if it's not found
    chrome: {
        skipDownload: false,
    },
};