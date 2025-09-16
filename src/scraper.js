/**
 * Web scraping functionality with error handling and retry logic
 */

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const config = require('./config');
const logger = require('./logger');

class Scraper {
  constructor() {
    this.retryDelay = config.requests.delay;
    this.maxRetries = config.requests.retries;
    this.timeout = config.requests.timeout;
  }

  /**
   * Fetch HTML content with retry logic
   * @param {string} url - URL to fetch
   * @param {number} retries - Number of retries remaining
   * @returns {Promise<string>} HTML content
   */
  async fetchWithRetry(url, retries = this.maxRetries) {
    try {
      logger.debug('Fetching URL', { url, retries });
      
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': config.scraping.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      logger.debug('Successfully fetched content', { url, contentLength: html.length });
      return html;

    } catch (error) {
      logger.warn('Fetch attempt failed', { url, error: error.message, retriesLeft: retries });
      
      if (retries > 0) {
        await this.delay(this.retryDelay);
        return this.fetchWithRetry(url, retries - 1);
      }
      
      throw new Error(`Failed to fetch ${url} after ${this.maxRetries} attempts: ${error.message}`);
    }
  }

  /**
   * Get the latest issue URL from the main page
   * @returns {Promise<string>} Latest issue URL
   */
  async getLatestIssueUrl() {
    try {
      logger.info('Fetching latest issue URL', { host: config.scraping.host });
      
      const html = await this.fetchWithRetry(config.scraping.host);
      const $ = cheerio.load(html);
      
      const latestIssuePath = $(config.scraping.latestIssueSelector).attr('href');
      
      if (!latestIssuePath) {
        throw new Error('Could not find latest issue link');
      }

      const fullUrl = `${config.scraping.host}${latestIssuePath}`;
      logger.info('Found latest issue URL', { url: fullUrl });
      return fullUrl;

    } catch (error) {
      logger.error('Failed to get latest issue URL', { error: error.message });
      throw error;
    }
  }

  /**
   * Parse issue details from issue page
   * @param {string} url - Issue page URL
   * @returns {Promise<Object>} Parsed issue data
   */
  async parseIssueDetails(url) {
    try {
      logger.info('Parsing issue details', { url });
      
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      // Extract issue metadata
      const issueTitle = $('h1.citation__title').text().trim();
      const issueVolume = $('.epub-section .meta-info').text().trim();
      
      // Extract articles
      const articles = [];
      $('.issue-item').each((index, element) => {
        const $article = $(element);
        const title = $article.find('.issue-item__title a').text().trim();
        const authors = $article.find('.issue-item__authors').text().trim();
        const link = $article.find('.issue-item__title a').attr('href');
        const doi = $article.find('.issue-item__doi').text().trim();

        if (title) {
          articles.push({
            title,
            authors,
            link: link ? `${config.scraping.host}${link}` : null,
            doi
          });
        }
      });

      const issueData = {
        title: issueTitle,
        volume: issueVolume,
        url,
        articles,
        scrapedAt: new Date().toISOString()
      };

      logger.info('Successfully parsed issue', { 
        articleCount: articles.length, 
        title: issueTitle 
      });

      return issueData;

    } catch (error) {
      logger.error('Failed to parse issue details', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Utility method to add delay
   * @param {number} ms - Milliseconds to wait
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Scraper;