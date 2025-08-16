const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Use dynamic import for node-fetch v3 in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Allowlist external hosts we proxy
const ALLOWED_HOSTS = new Set([
  'pixabay.com',
  'cdn.pixabay.com',
  'images.unsplash.com',
  'via.placeholder.com'
]);

// Optional map of cached images created by scripts; enables serving local files instead of upstream
const MAP_PATH = path.join(__dirname, '..', 'public', 'images', 'map.json');
let cachedMap = null;
let cachedMapMtime = 0;
function loadMapIfChanged() {
  try {
    const stat = fs.statSync(MAP_PATH);
    if (!cachedMap || stat.mtimeMs !== cachedMapMtime) {
      cachedMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
      cachedMapMtime = stat.mtimeMs;
    }
  } catch (e) {
    // ignore if missing
  }
}

router.get('/proxy', async (req, res) => {
  const { url } = req.query || {};
  if (!url) return res.status(400).send('Missing url');

  try {
    // Serve local cached file if available
    loadMapIfChanged();
    if (cachedMap && cachedMap[url]) {
      const localPath = path.join(__dirname, '..', 'public', 'images', cachedMap[url]);
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }
    }

    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const allowed = Array.from(ALLOWED_HOSTS).some(h => host === h || host.endsWith('.' + h));
    if (!allowed) {
      return res.status(400).send('Host not allowed');
    }

    // Fetch with headers that mimic a browser. Some CDNs (Pixabay) reject minimal programmatic requests.
    const defaultHeaders = {
      'User-Agent': 'SmartCart-ImageProxy/1.0 (+http://localhost)',
      'Accept': 'image/*,*/*;q=0.8',
      'Referer': 'https://pixabay.com'
    };

    let upstream = await fetch(url, {
      redirect: 'follow',
      headers: defaultHeaders
    });

    // If upstream rejects, retry with a common browser UA (helps bypass simple bot checks)
    if (!upstream.ok) {
      console.warn(`Image proxy: upstream returned ${upstream.status} ${upstream.statusText} for ${url} — retrying with browser UA`);
      upstream = await fetch(url, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': 'https://pixabay.com'
        }
      });
    }

    if (!upstream.ok) {
      // Try to capture a short upstream message for diagnostics
      let upstreamMsg = null;
      try {
        upstreamMsg = await upstream.text();
      } catch (e) {
        upstreamMsg = null;
      }
      console.error('Image proxy: upstream fetch failed', { url, status: upstream.status, statusText: upstream.statusText, snippet: upstreamMsg ? upstreamMsg.slice(0,200) : null });
      return res.status(upstream.status || 502).send('Upstream fetch failed');
    }

    // Prepare response headers before piping
    const ct = upstream.headers.get('content-type') || 'image/jpeg';
    const cl = upstream.headers.get('content-length');
    res.setHeader('Content-Type', ct);
    if (cl) res.setHeader('Content-Length', cl);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    // Help browsers allow this resource cross-origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Explicit CORS for images so <img> from the frontend can load without issues
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');

    // Stream the upstream response to the client to avoid buffering issues
    if (upstream.body && typeof upstream.body.pipe === 'function') {
      upstream.body.on('error', (e) => {
        // Reduce error logging spam
        if (!res.headersSent) {
          res.status(502).end('Bad gateway');
        } else {
          res.end();
        }
      });

      // If client aborts, destroy upstream
      req.on('aborted', () => {
        if (upstream.body && typeof upstream.body.destroy === 'function') {
          upstream.body.destroy();
        }
      });

      return upstream.body.pipe(res);
    } else {
      // Fallback: buffer and send
      const buf = Buffer.from(await upstream.arrayBuffer());
      return res.status(200).end(buf);
    }
  } catch (err) {
    // Reduce error logging for common network issues
    if (!err.message.includes('ENOTFOUND') && !err.message.includes('ECONNRESET')) {
      console.error('Image proxy error:', err.message);
    }
    return res.status(500).send('Image proxy error');
  }
});

module.exports = router;
