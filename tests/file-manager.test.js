/**
 * Tests for FileManager class
 */

const fs = require('fs').promises;
const path = require('path');
const FileManager = require('../src/file-manager');

// Mock fs methods
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
    unlink: jest.fn()
  }
}));

describe('FileManager', () => {
  let fileManager;
  const mockIssueData = {
    title: 'Test Issue',
    volume: 'Volume 1',
    url: 'https://example.com',
    articles: [
      { title: 'Article 1', authors: 'Author 1', doi: 'doi1' },
      { title: 'Article 2', authors: 'Author 2', doi: 'doi2' }
    ],
    scrapedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    fileManager = new FileManager();
    jest.clearAllMocks();
  });

  describe('ensureDirectory', () => {
    test('should not create directory if it exists', async () => {
      fs.access.mockResolvedValueOnce();

      await fileManager.ensureDirectory('/test/path');

      expect(fs.access).toHaveBeenCalledWith('/test/path');
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    test('should create directory if it does not exist', async () => {
      const error = new Error('Directory not found');
      error.code = 'ENOENT';
      fs.access.mockRejectedValueOnce(error);
      fs.mkdir.mockResolvedValueOnce();

      await fileManager.ensureDirectory('/test/path');

      expect(fs.mkdir).toHaveBeenCalledWith('/test/path', { recursive: true });
    });

    test('should throw error for non-ENOENT errors', async () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      fs.access.mockRejectedValueOnce(error);

      await expect(fileManager.ensureDirectory('/test/path'))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('writeLatestTocFile', () => {
    test('should write latest TOC file successfully', async () => {
      fs.access.mockResolvedValueOnce();
      fs.writeFile.mockResolvedValueOnce();

      await fileManager.writeLatestTocFile(mockIssueData);

      expect(fs.writeFile).toHaveBeenCalledWith(
        './LATEST',
        JSON.stringify(mockIssueData, null, 2),
        'utf8'
      );
    });
  });

  describe('readLatestTocFile', () => {
    test('should read latest TOC file successfully', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockIssueData));

      const result = await fileManager.readLatestTocFile();

      expect(result).toEqual(mockIssueData);
    });

    test('should return null if file does not exist', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValueOnce(error);

      const result = await fileManager.readLatestTocFile();

      expect(result).toBeNull();
    });

    test('should throw error for non-ENOENT errors', async () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      fs.readFile.mockRejectedValueOnce(error);

      await expect(fileManager.readLatestTocFile())
        .rejects.toThrow('Permission denied');
    });
  });

  describe('removeAllArticles', () => {
    test('should remove all article files', async () => {
      fs.access.mockResolvedValueOnce();
      fs.readdir.mockResolvedValueOnce(['article-001.json', 'article-002.json', 'other.txt']);
      fs.unlink.mockResolvedValue();

      await fileManager.removeAllArticles();

      expect(fs.unlink).toHaveBeenCalledTimes(2);
      expect(fs.unlink).toHaveBeenCalledWith(path.join('./data/articles', 'article-001.json'));
      expect(fs.unlink).toHaveBeenCalledWith(path.join('./data/articles', 'article-002.json'));
    });
  });

  describe('writeArticleFiles', () => {
    test('should write all article files', async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValueOnce([]);
      fs.writeFile.mockResolvedValue();

      await fileManager.writeArticleFiles(mockIssueData.articles);

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join('./data/articles', 'article-000.json'),
        JSON.stringify(mockIssueData.articles[0], null, 2),
        'utf8'
      );
    });
  });
});