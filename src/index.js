/**
 * Main application entry point - orchestrates scraping and file management
 */

const fetch = require('node-fetch');
const Scraper = require('./scraper');
const FileManager = require('./file-manager');
const logger = require('./logger');

class TocScrapeApp {
  constructor() {
    this.scraper = new Scraper();
    this.fileManager = new FileManager();
  }

  /**
   * Main application workflow
   */
  async run() {
    try {
      logger.info('Starting TocScrape application');
      
      // Get the latest issue URL
      const latestIssueUrl = await this.scraper.getLatestIssueUrl();
      
      // Parse issue details
      const issueData = await this.scraper.parseIssueDetails(latestIssueUrl);
      
      // Write TOC file
      await this.fileManager.writeLatestTocFile(issueData);
      
      // Write individual article files
      await this.fileManager.writeArticleFiles(issueData.articles);
      
      logger.info('TocScrape application completed successfully', {
        issueTitle: issueData.title,
        articleCount: issueData.articles.length,
        url: issueData.url
      });

      return issueData;

    } catch (error) {
      logger.error('TocScrape application failed', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      // Test network connectivity
      const response = await fetch('https://nph.onlinelibrary.wiley.com/');
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      logger.info('Health check passed');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Allow running as standalone script
if (require.main === module) {
  const app = new TocScrapeApp();
  app.run();
}

module.exports = TocScrapeApp;