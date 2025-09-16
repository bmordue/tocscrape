/**
 * Tests for Scraper class
 */

const fetch = require('node-fetch');
const Scraper = require('../src/scraper');

// Mock node-fetch
jest.mock('node-fetch');

// Mock fetch
const mockHtml = `
<html>
  <body>
    <ul class="mostRecent">
      <li class="cover-image">
        <div class="hasDetails">
          <a href="/toc/15698625/2024/1">Latest Issue</a>
        </div>
      </li>
    </ul>
  </body>
</html>
`;

const mockIssueHtml = `
<html>
  <body>
    <h1 class="citation__title">Test Journal Volume 1</h1>
    <div class="epub-section">
      <div class="meta-info">Volume 1, Issue 1</div>
    </div>
    <div class="issue-item">
      <h3 class="issue-item__title">
        <a href="/doi/10.1111/test.123">Test Article Title</a>
      </h3>
      <div class="issue-item__authors">John Doe, Jane Smith</div>
      <div class="issue-item__doi">DOI: 10.1111/test.123</div>
    </div>
  </body>
</html>
`;

describe('Scraper', () => {
  let scraper;

  beforeEach(() => {
    scraper = new Scraper();
    fetch.mockClear();
  });

  describe('fetchWithRetry', () => {
    test('should fetch content successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await scraper.fetchWithRetry('https://example.com');
      expect(result).toBe(mockHtml);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });

      const result = await scraper.fetchWithRetry('https://example.com', 1);
      expect(result).toBe(mockHtml);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('should throw error after max retries', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(scraper.fetchWithRetry('https://example.com', 1))
        .rejects.toThrow('Failed to fetch');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLatestIssueUrl', () => {
    test('should extract latest issue URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await scraper.getLatestIssueUrl();
      expect(result).toBe('https://nph.onlinelibrary.wiley.com//toc/15698625/2024/1');
    });

    test('should throw error if no issue found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><body></body></html>')
      });

      await expect(scraper.getLatestIssueUrl())
        .rejects.toThrow('Could not find latest issue link');
    });
  });

  describe('parseIssueDetails', () => {
    test('should parse issue details correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockIssueHtml)
      });

      const result = await scraper.parseIssueDetails('https://example.com/issue');
      
      expect(result.title).toBe('Test Journal Volume 1');
      expect(result.volume).toBe('Volume 1, Issue 1');
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('Test Article Title');
      expect(result.articles[0].authors).toBe('John Doe, Jane Smith');
      expect(result.articles[0].doi).toBe('DOI: 10.1111/test.123');
    });
  });

  describe('delay', () => {
    test('should delay for specified time', async () => {
      const start = Date.now();
      await scraper.delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(95); // Allow for small timing variations
    });
  });
});