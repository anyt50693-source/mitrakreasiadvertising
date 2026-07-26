module.exports = (req, res) => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liTcrOcMBpXPUoX4';
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const SITE_URL = 'https://mitrakreasiindonesia.vercel.app';

  const { code } = req.query || {};

  if (!code) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user`;
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  if (!CLIENT_SECRET) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'GITHUB_CLIENT_SECRET not set' }));
    return;
  }

  const https = require('https');
  const postData = JSON.stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: code
  });

  const options = {
    hostname: 'github.com',
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mitra-Kreasi-Admin',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const tokenReq = https.request(options, (tokenRes) => {
    let body = '';
    tokenRes.on('data', (chunk) => body += chunk);
    tokenRes.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
    });
  });

  tokenReq.on('error', (e) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });

  tokenReq.write(postData);
  tokenReq.end();
};