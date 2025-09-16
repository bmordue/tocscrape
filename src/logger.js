/**
 * Logging utility with different levels and structured output
 */

class Logger {
  constructor(level = 'info') {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.level = level;
  }

  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  _formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...data
    });
  }

  error(message, data) {
    if (this._shouldLog('error')) {
      console.error(this._formatMessage('error', message, data));
    }
  }

  warn(message, data) {
    if (this._shouldLog('warn')) {
      console.warn(this._formatMessage('warn', message, data));
    }
  }

  info(message, data) {
    if (this._shouldLog('info')) {
      console.info(this._formatMessage('info', message, data));
    }
  }

  debug(message, data) {
    if (this._shouldLog('debug')) {
      console.debug(this._formatMessage('debug', message, data));
    }
  }
}

// Export singleton instance
module.exports = new Logger(process.env.LOG_LEVEL || 'info');