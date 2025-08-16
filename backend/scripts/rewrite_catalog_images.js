/*
  Rewrites catalog image URLs to local cached filenames based on backend/public/images/map.json
  Strategy (in order):
  1) Exact URL match -> use mapped filename
  2) Match by Pixabay token (the "g..." slug in the URL) -> use any mapped filename with that token
  3) Match by pixabay_id present on the item -> use any mapped filename that embeds that id
  Leaves others unchanged
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const MAP_PATH = path.join(__dirname, '..', 'public', 'images', 'map.json');
const CATALOGS = [
  path.join(ROOT, 'frontend', 'src', 'data', 'clothing-catalog.json'),
  path.join(ROOT, 'frontend', 'src', 'data', 'gifts-catalog.json')
];

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function main() {
  if (!fs.existsSync(MAP_PATH)) {
    console.error('map.json not found at', MAP_PATH);
    process.exit(1);
  }
  const map = loadJSON(MAP_PATH);
  const urlToFilename = map; // alias for clarity
  const keys = new Set(Object.keys(urlToFilename));

  // Build reverse indices for resilient matching
  const tokenToFilename = new Map(); // token (g[hex]) -> filename
  const pixabayIdToFilename = new Map(); // numeric id -> filename

  for (const [url, filename] of Object.entries(urlToFilename)) {
    // Extract the pixabay token from URL: https://pixabay.com/get/<token>_...
    const m = url.match(/\/get\/(g[0-9a-f]+)_/i);
    if (m) {
      const token = m[1];
      // prefer first seen; don't overwrite to keep deterministic
      if (!tokenToFilename.has(token)) tokenToFilename.set(token, filename);
    }
    // Extract pixabay id from filename, which follows the pattern: <prefix>_<id>_<token>_size.jpg
    const m2 = filename.match(/_(\d+)_g[0-9a-f]+_/i);
    if (m2) {
      const pid = m2[1];
      if (!pixabayIdToFilename.has(pid)) pixabayIdToFilename.set(pid, filename);
    }
  }
  let totalRewrote = 0;

  for (const catalogPath of CATALOGS) {
    if (!fs.existsSync(catalogPath)) {
      console.warn('Catalog not found, skipping:', catalogPath);
      continue;
    }
    const catalog = loadJSON(catalogPath);

    let rewrote = 0;
    for (const item of catalog) {
      const img = item.image;
      if (!img || typeof img !== 'string') continue;
      if (img.startsWith('/images/')) continue; // already local

      // Only rewrite http(s) sources
      if (/^https?:\/\//i.test(img)) {
        // 1) Exact URL match
        if (keys.has(img)) {
          item.image = `/images/${urlToFilename[img]}`;
          rewrote++;
          continue;
        }

        // 2) Match by pixabay token in URL
        const t = img.match(/\/get\/(g[0-9a-f]+)_/i);
        if (t) {
          const token = t[1];
          const filename = tokenToFilename.get(token);
          if (filename) {
            item.image = `/images/${filename}`;
            rewrote++;
            continue;
          }
        }

        // 3) Match by pixabay_id if present on item
        if (item.pixabay_id) {
          const filename = pixabayIdToFilename.get(String(item.pixabay_id));
          if (filename) {
            item.image = `/images/${filename}`;
            rewrote++;
            continue;
          }
        }
      }
    }

    if (rewrote > 0) {
      saveJSON(catalogPath, catalog);
      console.log(`Updated ${catalogPath} -> rewrote ${rewrote} images to /images/*`);
    } else {
      console.log(`No changes for ${catalogPath}`);
    }
    totalRewrote += rewrote;
  }

  console.log(`Done. Total images rewritten: ${totalRewrote}`);
}

if (require.main === module) {
  main();
}
