const https = require('https');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || 'anyt50693-source/mitrakreasiadvertising';
const BRANCH = 'master';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mitrakreasi2026';

function githubApi(path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method || 'GET',
      headers: {
        'Authorization': 'token ' + GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mitra-Kreasi-Admin',
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ message: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = new URL(req.url, 'http://localhost');
  const params = url.searchParams;

  // Auth check
  const token = params.get('token');
  const pw = params.get('pw');

  // Login
  if (pw) {
    if (pw === ADMIN_PASSWORD) {
      const t = crypto.createHash('sha256').update(pw + Date.now()).digest('hex').slice(0, 32);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, token: t }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false }));
    }
    return;
  }

  // Token required for other actions
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'No token' }));
    return;
  }

  // Delete image
  const deleteName = params.get('delete');
  const folder = params.get('folder');

  if (req.method === 'DELETE' && deleteName && folder) {
    try {
      const filePath = 'images/' + folder + '/' + deleteName;
      const existing = await githubApi('/repos/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH);
      if (existing.sha) {
        await githubApi('/repos/' + REPO + '/contents/' + filePath, 'DELETE', {
          message: 'Admin: delete ' + deleteName,
          sha: existing.sha,
          branch: BRANCH
        });
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch(e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // List images in folder
  if (folder) {
    try {
      const files = await githubApi('/repos/' + REPO + '/contents/images/' + folder + '?ref=' + BRANCH);
      if (Array.isArray(files)) {
        const images = files
          .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name))
          .map(f => ({ name: f.name, url: f.download_url, size: f.size }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, files: images }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, files: [] }));
      }
    } catch(e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, files: [] }));
    }
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false }));
};