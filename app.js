const cheerio = require('cheerio');

function parseIssueDetails(html) {
  const $ = cheerio.load(html);

  // TOC
  // articles
}

function main() {
  const response = await fetch("https://nph.onlinelibrary.wiley.com/");
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const latestIssueUrl = $('ul.mostRecent > li.cover-image > div.hasDetails > a').attr('href');
  
  const latestIssueHtml = await fetch(latestIssueUrl);
  parseIssueDetails(latestIssueHtml);
}

main();
