const cheerio = require('cheerio');

async function fetchAndparseIssueDetails(url) {
  const $ = await cheerio.fromUrl(url);

  // TOC
  // articles
}

async function main() {
  const host = "https://nph.onlinelibrary.wiley.com/";
  const response = await fetch(host);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const latestIssuePath = $('ul.mostRecent > li.cover-image > div.hasDetails > a').attr('href');
  
  fetchAndparseIssueDetails(`${host}${latestIssuePath}`);
}

main();
