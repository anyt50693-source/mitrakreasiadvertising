const https = require('https');
const formidable = require('formidable');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || 'anyt50693-source/mitrakreasiadvertising';
const BRANCH = 'master';

function githubUpload(filePath, content, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      content: content,
      branch: BRANCH
    });
    const options = {
      hostname: 'api.github.com',
      path: '/repos/' + REPO + '/contents/' + filePath,
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mitra-Kreasi-Admin',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { resolve({ message: body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

  try {
    const form = formidable({ multiples: false, maxFileSize: 2 * 1024 * 1024 });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const folder = fields.folder || 'hero';
    const file = files.file;
    if (!file) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'No file' }));
      return;
    }

    const originalName = file.originalFilename || file.name || 'upload.jpg';
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const fileName = timestamp + '_' + safeName;

    const fs = require('fs');
    const content = fs.readFileSync(file.filepath || file.path);
    const base64 = content.toString('base64');

    const filePath = 'images/' + folder + '/' + fileName;
    const result = await githubUpload(filePath, base64, 'Admin: upload ' + fileName + ' to ' + folder);

    if (result.content) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, url: result.content.download_url, name: fileName }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: result.message || 'Upload failed' }));
    }
  } catch(e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};