# TocScrape

A robust web scraping application for automatically fetching journal table of contents and posting updates to social media platforms.

## Features

- 📚 **Automated Scraping**: Daily scheduled scraping of journal issues
- 🔄 **Retry Logic**: Built-in retry mechanism with exponential backoff  
- 📱 **Social Media Integration**: Post updates to Twitter, Mastodon, and LinkedIn
- 🏗️ **Modular Architecture**: Clean separation of concerns with dedicated modules
- 📊 **Comprehensive Logging**: Structured JSON logging with multiple levels
- ✅ **Full Test Coverage**: Unit tests and integration tests with Jest
- 🚀 **GitHub Actions**: Automated CI/CD pipelines
- 🔧 **Configuration Management**: Environment-based configuration

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── config.js          # Configuration management
├── logger.js           # Structured logging utility
├── scraper.js          # Web scraping functionality
├── file-manager.js     # File system operations  
├── social-poster.js    # Social media posting
├── index.js           # Main application orchestrator
└── post.js            # Social media posting script
```

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm

### Installation

```bash
npm install
```

### Usage

```bash
# Run the scraper
npm run scrape

# Post to social media
npm run post

# Run tests
npm test

# Run with development mode
npm run dev
```

### Environment Variables

```bash
# Logging
LOG_LEVEL=info|debug|warn|error

# Social Media (set to 'true' to enable)
TWITTER_ENABLED=false
MASTODON_ENABLED=false  
LINKEDIN_ENABLED=false

# API Credentials (add when enabling social media)
# TWITTER_API_KEY=your_key
# MASTODON_ACCESS_TOKEN=your_token
# LINKEDIN_ACCESS_TOKEN=your_token
```

## GitHub Actions Workflows

- **Daily Scrape**: Runs daily at 9 AM UTC to scrape latest content
- **Social Media Post**: Triggers when LATEST file is updated
- **CI/CD**: Runs tests and linting on all commits

## Development

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

### Code Quality

```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix style issues
```

### Manual Testing

The application includes comprehensive error handling and can be tested manually:

```bash
LOG_LEVEL=debug npm start
```

## API Documentation

### Scraper Class

Main scraping functionality with retry logic and error handling.

### FileManager Class  

Handles all file system operations including TOC and article file management.

### SocialPoster Class

Manages posting to multiple social media platforms (extensible for new platforms).

### Logger Class

Structured JSON logging with multiple levels and filtering.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality  
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
