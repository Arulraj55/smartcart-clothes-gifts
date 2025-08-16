/*
  Fetch images via Pixabay API and cache locally under backend/public/images, with mapping.
  - Targets: 1000 clothes, 54 home, 500 gifts (total 1554)
  - Uses categories/queries appropriate for each segment.

  Usage:
    $env:PIXABAY_API_KEY="<your_key>"; node backend/scripts/fetch_from_pixabay_api.js  # PowerShell

  The script writes backend/public/images/map.json mapping downloaded image URLs -> local filenames.
*/

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Get API key from env or CLI arg --key <value> or --key=<value>
function getArgKey(argv) {
  const i = argv.indexOf('--key');
  if (i !== -1 && argv[i+1]) return argv[i+1];
  const kv = argv.find(a => a.startsWith('--key='));
  if (kv) return kv.split('=')[1];
  return null;
}

const argv = process.argv;
const API_KEY = getArgKey(argv) || process.env.PIXABAY_API_KEY;
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');
const MAP_FILE = path.join(OUT_DIR, 'map.json');
const AUTHORS_FILE = path.join(OUT_DIR, 'authors.json');

if (!API_KEY) {
  console.error('Missing Pixabay API key. Provide with --key <value> or set PIXABAY_API_KEY environment variable or put PIXABAY_API_KEY in backend/.env');
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function sanitizeFilename(name) { return name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 200); }
async function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

async function withAbort(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function queryPixabay(params, attempt = 1) {
  const base = 'https://pixabay.com/api/';
  const url = new URL(base);
  url.searchParams.set('key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await withAbort(url.toString(), {
    headers: {
      'User-Agent': 'SmartCart-Fetch/1.0',
      'Accept': 'application/json, text/plain, */*'
    }
  }, 20000);
  const ct = res.headers.get('content-type') || '';
  const bodyText = await res.text();

  if (!res.ok) {
    // Include response snippet for diagnostics
    throw new Error(`API ${res.status} ${res.statusText} • ct=${ct} • body=${bodyText.slice(0, 200)}`);
  }

  try {
    const json = JSON.parse(bodyText);
    if (!json || typeof json !== 'object' || !Array.isArray(json.hits)) {
      throw new Error('Missing hits array');
    }
    return json;
  } catch (e) {
    if (attempt < 3) {
      await sleep(1000 * attempt);
      return queryPixabay(params, attempt + 1);
    }
    throw new Error(`API JSON parse failed after ${attempt} tries • ct=${ct} • err=${e.message} • body=${bodyText.slice(0, 200)}`);
  }
}

async function download(url, fname) {
  const outPath = path.join(OUT_DIR, fname);
  if (fs.existsSync(outPath)) return outPath;
  const res = await withAbort(url, { headers: { 'Referer': 'https://pixabay.com', 'User-Agent': 'SmartCart-Fetch/1.0' }, redirect: 'follow' }, 20000);
  if (!res.ok) throw new Error(`GET ${res.status}`);
  await streamPipeline(res.body, fs.createWriteStream(outPath));
  return outPath;
}

async function downloadWithRetries(url, fname, maxRetries = 5) {
  let attempt = 0;
  while (true) {
    try {
      return await download(url, fname);
    } catch (e) {
      const is429 = (e && typeof e.message === 'string' && e.message.includes('429'));
      if (!is429 || attempt >= maxRetries) {
        throw e;
      }
      const wait = Math.min(15000, 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500));
      console.warn(`  rate limit 429, retrying in ${wait}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(wait);
      attempt++;
    }
  }
}

async function fetchBucket(label, keywords, count) {
  console.log(`\nBucket: ${label} -> target ${count}`);
  // Tunables (CLI): --fast, --perPage N, --concurrency N, --delayMs N, --pageDelayMs N
  const FAST = argv.includes('--fast');
  const getNum = (name, def) => {
    const i = argv.indexOf(`--${name}`);
    if (i !== -1 && argv[i+1] && !argv[i+1].startsWith('--')) return Number(argv[i+1]);
    const kv = argv.find(a => a.startsWith(`--${name}=`));
    if (kv) return Number(kv.split('=')[1]);
    return def;
  };
  const perPage = getNum('perPage', FAST ? 200 : 100);
  const concurrency = getNum('concurrency', FAST ? 4 : 3);
  const delayMs = getNum('delayMs', FAST ? 75 : 150);
  const pageDelayMs = getNum('pageDelayMs', FAST ? 250 : 600);
  const allowSamePhotographer = argv.includes('--allowSamePhotographer');
  const strictUniquePhotographers = !allowSamePhotographer;
  const MIN_PER_PAGE = 3;
  const MAX_PER_PAGE = 200;

  let recent429 = 0;
  async function runWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let idx = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (true) {
        const i = idx++;
        if (i >= items.length) return;
        try {
          results[i] = await worker(items[i], i);
        } catch (e) {
          results[i] = undefined;
        }
        // simple adaptive backoff when 429s recently observed
        const extra = recent429 > 0 ? Math.min(1000, recent429 * 50) : 0;
        if (delayMs || extra) await sleep((delayMs || 0) + extra + Math.floor(Math.random() * 25));
      }
    });
    await Promise.all(workers);
    return results;
  }
  const orientation = 'all';
  const image_type = 'photo';
  const safesearch = true;
  let remaining = count;
  let map = {};
  // Load existing URL map so we don't duplicate URLs across runs
  try {
    if (fs.existsSync(MAP_FILE)) {
      const raw = fs.readFileSync(MAP_FILE, 'utf8').trim();
      map = raw ? JSON.parse(raw) : {};
    }
  } catch (e) {
    console.warn('map.json was invalid; resetting to empty');
    map = {};
    try { fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2)); } catch {}
  }
  // Load seen photographers (persisted across runs)
  let seenPhotographers = new Set();
  try {
    if (fs.existsSync(AUTHORS_FILE)) {
      const raw = fs.readFileSync(AUTHORS_FILE, 'utf8').trim();
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach(id => seenPhotographers.add(String(id)));
      }
    }
  } catch (e) {
    console.warn('authors.json invalid; resetting');
    try { fs.writeFileSync(AUTHORS_FILE, JSON.stringify([], null, 2)); } catch {}
  }
  const persistAuthors = () => {
    try { fs.writeFileSync(AUTHORS_FILE, JSON.stringify(Array.from(seenPhotographers), null, 2)); } catch {}
  };

  for (const kw of keywords) {
    if (remaining <= 0) break;
    const toGet = Math.min(remaining, perPage);
    
    // Pixabay API: page up to 100, per_page up to 200
    let page = 1;
    let maxPages = Infinity; // will be set after first response that includes totalHits
    let lastPerPageUsed = Math.max(MIN_PER_PAGE, Math.min(MAX_PER_PAGE, toGet));
    while (remaining > 0) {
      const requested = Math.min(remaining, perPage);
      // Clamp per_page to API range [3, 200]; if remaining < 3, still request 3 and trim to remaining when adding
      const batch = Math.max(MIN_PER_PAGE, Math.min(MAX_PER_PAGE, requested));
      if (page > maxPages) { break; }
      console.log(`Query \"${kw}\" page ${page} (need ${batch})`);
      let json;
      try {
        const category = (label === 'clothes') ? 'fashion' : undefined;
        json = await queryPixabay({ q: kw, image_type, orientation, safesearch, per_page: batch, page, category });
      } catch (e) {
        const msg = String(e && e.message || '');
        if (msg.includes('"page"') && msg.includes('out of valid range')) {
          // No more pages for this query
          break;
        }
        if (msg.includes('"per_page"') && msg.includes('out of valid range')) {
          // Force minimal allowed and retry once
          console.warn('API per_page out of range. Forcing per_page=3');
          try {
            json = await queryPixabay({ q: kw, image_type, orientation, safesearch, per_page: MIN_PER_PAGE, page, category: (label === 'clothes') ? 'fashion' : undefined });
          } catch (e2) {
            console.warn('API error:', e2.message, '- backing off 3s');
            await sleep(3000);
            continue;
          }
        } else {
          console.warn('API error:', e.message, '- backing off 3s');
          await sleep(3000);
          continue;
        }
      }
      const hits = json.hits || [];
      if (json.totalHits != null && isFinite(json.totalHits)) {
        lastPerPageUsed = batch;
        maxPages = Math.max(1, Math.ceil(json.totalHits / lastPerPageUsed));
      }
      if (hits.length === 0) break;

      // Filter hits by uniqueness (URL + photographer)
      const sliceCount = hits.length; // we'll trim by remaining after filtering
      const slice = hits.slice(0, sliceCount);
    const results = await runWithConcurrency(slice, concurrency, async (hit) => {
        // Prefer slightly smaller image to reduce bandwidth and rate limit likelihood
        const src = hit.webformatURL || hit.largeImageURL || hit.previewURL;
        if (!src) return { ok: false };
        // Enforce unique URL across runs
        if (map[src] && fs.existsSync(path.join(OUT_DIR, map[src]))) {
          return { ok: true, src, fname: map[src], cached: true };
        }
        // Enforce unique photographer across whole run (strict by default)
        const photographerId = hit.user_id != null ? String(hit.user_id) : (hit.user ? String(hit.user) : null);
        if (strictUniquePhotographers && photographerId && seenPhotographers.has(photographerId)) {
          return { ok: false, reason: 'dupPhotographer' };
        }
        const id = hit.id;
        const fname = sanitizeFilename(`${label}_${id}_${path.basename(new URL(src).pathname)}`);
        try {
      await downloadWithRetries(src, fname);
          return { ok: true, src, fname, photographerId };
        } catch (e) {
          if (String(e && e.message || '').includes('429')) {
            recent429++;
            console.warn('  download failed (429): throttling');
          } else {
            console.warn('  download failed:', e.message);
          }
          return { ok: false };
        }
      });

      let added = 0;
      for (const r of results) {
        if (r && r.ok && r.src && r.fname) {
          if (!map[r.src]) {
            // If we've already reached desired count, stop adding more
            if (remaining - added <= 0) break;
            map[r.src] = r.fname;
            added++;
            if (r.photographerId) {
              seenPhotographers.add(String(r.photographerId));
            }
          }
        }
      }
      if (added > 0) {
        fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
        remaining -= added;
        console.log(`[${label}] +${added} (remaining ${remaining})`);
        persistAuthors();
      }

      if (hits.length < batch) break; // no more pages
  page++;
  const jitter = Math.floor(Math.random() * 150);
  await sleep(pageDelayMs + jitter);
    }
  }

  console.log(`Bucket ${label} done. Still remaining: ${remaining}`);
  if (remaining > 0 && strictUniquePhotographers) {
    console.log(`Note: strict unique photographers may limit results. To relax, re-run with --allowSamePhotographer or add more keywords.`);
  }
}

(async function main() {
  await ensureDir(OUT_DIR);
  console.log('Starting Pixabay API fetch...');

  // Buckets
  const clothesKeywords = [
    'saree','kurti','lehenga','women fashion','men kurta','sherwani','tshirt','jeans','dress','hoodie','jacket','kids wear','ethnic wear','salwar','blouse','skirts','tops','trousers','formal wear','casual wear','sportswear','men fashion','women clothing'
  ];
  const homeKeywords = [
    'home decor','sofa','cushion','lamp','bed sheet','curtains','kitchen set','dining set','wall art','vase','carpet','blanket','storage box'
  ];
  const giftsKeywords = [
    'gift box','birthday gift','toy gift','jewelry gift','watch gift','perfume','handbag gift','wallet gift','mug gift','photo frame gift','chocolate gift','teddy bear','flower bouquet','anniversary gift','festival gift'
  ];

  await fetchBucket('clothes', clothesKeywords, 1000);
  await fetchBucket('home', homeKeywords, 54);
  await fetchBucket('gifts', giftsKeywords, 500);

  console.log('\nAll buckets attempted. Files in', OUT_DIR);
  console.log('Map at', MAP_FILE);
})();
