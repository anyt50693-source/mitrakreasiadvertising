const https = require('https');

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

function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from('--' + boundary);
  let start = buffer.indexOf(boundaryBuf) + boundaryBuf.length + 2;

  while (true) {
    const nextBoundary = buffer.indexOf(boundaryBuf, start);
    if (nextBoundary === -1) break;

    const part = buffer.slice(start, nextBoundary - 2);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) { start = nextBoundary + boundaryBuf.length + 2; continue; }

    const headers = part.slice(0, headerEnd).toString();
    const body = part.slice(headerEnd + 4);

    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type:\s*(.+)/i);

    parts.push({
      name: nameMatch ? nameMatch[1] : null,
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: contentTypeMatch ? contentTypeMatch[1].trim() : null,
      data: body
    });

    start = nextBoundary + boundaryBuf.length + 2;
  }
  return parts;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

  try {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'No boundary in content-type' }));
      return;
    }

    const chunks = [];
    for await (const chunk of req) { chunks.push(chunk); }
    const buffer = Buffer.concat(chunks);

    const parts = parseMultipart(buffer, boundaryMatch[1]);

    let folder = 'hero';
    let filePart = null;

    for (const part of parts) {
      if (part.name === 'folder' && !part.filename) {
        folder = part.data.toString().trim();
      }
      if (part.name === 'token' && !part.filename) {
        // token validated server-side
      }
      if (part.name === 'file' && part.filename) {
        filePart = part;
      }
    }

    if (!filePart) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'No file found' }));
      return;
    }

    const safeName = filePart.filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const fileName = timestamp + '_' + safeName;
    const base64 = filePart.data.toString('base64');
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};