const fetch = require('node-fetch');

/**
 * Search you.com and return structured results with titles, URLs, and snippets.
 * Claude uses the URLs to include real links in responses.
 *
 * @param {object} opts
 * @param {string}   opts.query
 * @param {number}   [opts.count=5]           — results to return (max 10)
 * @param {string}   [opts.freshness]         — 'day', 'week', 'month', 'year'
 * @param {string[]} [opts.includeDomains]    — restrict to these domains
 */
async function searchWeb({ query, count = 5, freshness = 'month', includeDomains } = {}) {
  const params = new URLSearchParams({
    query,
    num_web_results: String(count),
  });

  params.set('freshness', freshness);

  // you.com supports include_domains as comma-separated via GET
  if (includeDomains?.length) {
    params.set('include_domains', includeDomains.join(','));
  }

  const url = `https://api.ydc-index.io/search?${params}`;
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.YDC_API_KEY },
  });

  const data = await response.json();

  // API returns either data.hits or data.results.web depending on version
  const hits = data.hits || data.results?.web || [];

  return hits.map(h => ({
    title:   h.title || '',
    url:     h.url || '',
    snippet: (h.snippets || []).join(' ').slice(0, 400) || h.description || '',
  }));
}

module.exports = { searchWeb };
