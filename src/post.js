/**
 * Social media posting script - triggers social media posts based on LATEST file
 */

const SocialPoster = require('./social-poster');
const FileManager = require('./file-manager');
const logger = require('./logger');

class PostApp {
  constructor() {
    this.socialPoster = new SocialPoster();
    this.fileManager = new FileManager();
  }

  /**
   * Main posting workflow
   */
  async run() {
    try {
      logger.info('Starting social media posting');
      
      // Read the latest issue data
      const issueData = await this.fileManager.readLatestTocFile();
      
      if (!issueData) {
        logger.warn('No latest issue data found, skipping social media posting');
        return;
      }

      // Post to social media platforms
      const results = await this.socialPoster.postToAll(issueData);
      
      logger.info('Social media posting completed', { results });
      
      return results;

    } catch (error) {
      logger.error('Social media posting failed', { error: error.message });
      process.exit(1);
    }
  }
}

// Allow running as standalone script
if (require.main === module) {
  const app = new PostApp();
  app.run();
}

module.exports = PostApp;