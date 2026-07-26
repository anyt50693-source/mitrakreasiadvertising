const https = require('https');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || 'anyt50693-source/mitrakreasiadvertising';
const BRANCH = 'master';

function githubApi(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'token ' + GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mitra-Kreasi-Admin'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');

  const folders = ['hero', 'portfolio', 'blog'];
  const result = {};

  for (const folder of folders) {
    try {
      const files = await githubApi('/repos/' + REPO + '/contents/images/' + folder + '?ref=' + BRANCH);
      if (Array.isArray(files)) {
        result[folder] = files
          .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name))
          .sort((a, b) => b.name.localeCompare(a.name))
          .map(f => f.download_url);
      } else {
        result[folder] = [];
      }
    } catch(e) {
      result[folder] = [];
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
};