/**
 * Test setup file
 */

// Global test timeout
jest.setTimeout(30000);

// Mock node-fetch globally for tests
jest.mock('node-fetch');

// Console log suppression during tests (optional)
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}