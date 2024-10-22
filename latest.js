const cheerio = require('cheerio');

async function fetchAndparseIssueDetails(url) {
  const $ = await cheerio.fromUrl(url);

  // TOC
  await writeLatestTocFile();
  
  // articles
  const articles = [];
  // clear last issue's articles
  await removeAllArticles();
  await Promise.all(articles.forEach(writeArticleFile));
}

async function writeLatestTocFile(content) {
  
}

async function removeAllArticles() {
}

async function writeArticleFile(content) {
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
