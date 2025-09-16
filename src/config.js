/**
 * Configuration management for tocscrape application
 */

const config = {
  // Target website configuration
  scraping: {
    host: 'https://nph.onlinelibrary.wiley.com/',
    latestIssueSelector: 'ul.mostRecent > li.cover-image > div.hasDetails > a',
    userAgent: 'tocscrape/1.0.0 (+https://github.com/bmordue/tocscrape)'
  },

  // File system paths
  paths: {
    outputDir: './data',
    latestFile: './LATEST',
    articlesDir: './data/articles'
  },

  // Request configuration
  requests: {
    timeout: 30000,
    retries: 3,
    delay: 1000
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json'
  }
};

module.exports = config;