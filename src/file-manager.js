/**
 * File system operations for managing scraped data
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const logger = require('./logger');

class FileManager {
  constructor() {
    this.outputDir = config.paths.outputDir;
    this.latestFile = config.paths.latestFile;
    this.articlesDir = config.paths.articlesDir;
  }

  /**
   * Ensure directory exists, create if it doesn't
   * @param {string} dirPath - Directory path to ensure
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
        logger.debug('Created directory', { path: dirPath });
      } else {
        throw error;
      }
    }
  }

  /**
   * Write the latest issue TOC file
   * @param {Object} issueData - Issue data to write
   */
  async writeLatestTocFile(issueData) {
    try {
      await this.ensureDirectory(this.outputDir);
      
      const content = JSON.stringify(issueData, null, 2);
      await fs.writeFile(this.latestFile, content, 'utf8');
      
      logger.info('Wrote latest TOC file', { 
        path: this.latestFile, 
        articleCount: issueData.articles.length 
      });

    } catch (error) {
      logger.error('Failed to write latest TOC file', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove all existing article files
   */
  async removeAllArticles() {
    try {
      await this.ensureDirectory(this.articlesDir);
      
      const files = await fs.readdir(this.articlesDir);
      const articleFiles = files.filter(file => file.endsWith('.json'));
      
      await Promise.all(
        articleFiles.map(file => 
          fs.unlink(path.join(this.articlesDir, file))
        )
      );

      logger.info('Removed article files', { count: articleFiles.length });

    } catch (error) {
      logger.error('Failed to remove article files', { error: error.message });
      throw error;
    }
  }

  /**
   * Write individual article file
   * @param {Object} article - Article data to write
   * @param {number} index - Article index for filename
   */
  async writeArticleFile(article, index) {
    try {
      await this.ensureDirectory(this.articlesDir);
      
      const filename = `article-${String(index).padStart(3, '0')}.json`;
      const filePath = path.join(this.articlesDir, filename);
      const content = JSON.stringify(article, null, 2);
      
      await fs.writeFile(filePath, content, 'utf8');
      
      logger.debug('Wrote article file', { path: filePath, title: article.title });

    } catch (error) {
      logger.error('Failed to write article file', { 
        error: error.message, 
        article: article.title 
      });
      throw error;
    }
  }

  /**
   * Write all article files
   * @param {Array} articles - Array of article data
   */
  async writeArticleFiles(articles) {
    try {
      await this.removeAllArticles();
      
      const writePromises = articles.map((article, index) => 
        this.writeArticleFile(article, index)
      );
      
      await Promise.all(writePromises);
      
      logger.info('Wrote all article files', { count: articles.length });

    } catch (error) {
      logger.error('Failed to write article files', { error: error.message });
      throw error;
    }
  }

  /**
   * Read the latest TOC file
   * @returns {Promise<Object>} Latest issue data
   */
  async readLatestTocFile() {
    try {
      const content = await fs.readFile(this.latestFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('Latest TOC file not found', { path: this.latestFile });
        return null;
      }
      logger.error('Failed to read latest TOC file', { error: error.message });
      throw error;
    }
  }
}

module.exports = FileManager;