/**
 * Cache images referenced in frontend catalogs into backend/public/images
 * using Pixabay API by id when needed, and update backend/public/images/map.json
 * so rewrite_catalog_images.js can switch URLs to local /images/* paths.
 *
 * Behavior:
 * - Reads clothing-catalog.json and gifts-catalog.json
 * - For each item with an http(s) image URL (Pixabay), if not already in map.json:
 *   - If item.pixabay_id exists, call Pixabay API ?id=<id> to get a fresh URL
 *   - Download webformatURL (640) with retries and save as <prefix>_<id>_<token>_640.<ext>
 *   - Add two mappings in map.json:
 *       apiURL -> filename, and original item.image -> filename
 * - Skips items already mapped or already local (/images/*)
 */

const fs = require('fs');
const path = require('path');
const { setTimeout: delay } = require('timers/promises');

// node-fetch v3 in CJS via dynamic import
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const ROOT = path.join(__dirname, '..', '..');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const MAP_PATH = path.join(IMAGES_DIR, 'map.json');

const CATALOGS = [
	{ file: path.join(ROOT, 'frontend', 'src', 'data', 'clothing-catalog.json'), prefix: 'clothes' },
	{ file: path.join(ROOT, 'frontend', 'src', 'data', 'gifts-catalog.json'), prefix: 'gifts' }
];

function loadJSON(file, fallback = null) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return fallback;
	}
}

function saveJSON(file, data) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function sha1(str) {
	const crypto = require('crypto');
	return crypto.createHash('sha1').update(str).digest('hex');
}

function getExtFromUrl(url, def = 'jpg') {
	const m = url.match(/\.(jpg|jpeg|png|webp)($|\?)/i);
	return m ? m[1].toLowerCase() : def;
}

function extractToken(url) {
	const m = url.match(/\/get\/(g[0-9a-f]+)_/i);
	return m ? m[1] : null;
}

async function httpGetJson(url) {
	const res = await fetch(url, {
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'SmartCart-ImageCacher/1.0'
		},
		// 20s timeout via AbortController
		signal: AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`GET ${url} -> ${res.status} ${res.statusText} ${text.slice(0, 200)}`);
	}
	return res.json();
}

async function downloadToFile(url, filePath, attempt = 1) {
	try {
		const res = await fetch(url, {
			headers: {
				'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
				'Referer': 'https://pixabay.com'
			},
			signal: AbortSignal.timeout ? AbortSignal.timeout(25000) : undefined
		});
		if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
		const buf = await res.arrayBuffer();
		fs.writeFileSync(filePath, Buffer.from(buf));
	} catch (err) {
		if (attempt < 3) {
			const backoff = 500 * Math.pow(2, attempt - 1);
			await delay(backoff + Math.floor(Math.random() * 250));
			return downloadToFile(url, filePath, attempt + 1);
		}
		throw err;
	}
}

async function cacheItem(item, prefix, map, apiKey) {
	const src = item.image;
	if (!src || typeof src !== 'string') return false;
	if (src.startsWith('/images/')) return false; // already local
	if (!/^https?:\/\//i.test(src)) return false; // non-http ignored

	// Only handle pixabay sources here
	if (!src.includes('pixabay.com/')) return false;

	// If already mapped, skip
	if (map[src]) return false;

	const id = item.pixabay_id;
	if (!apiKey) {
		console.warn('PIXABAY_API_KEY not set, cannot resolve by id. Skipping', id || src);
		return false;
	}
	if (!id) {
		console.warn('No pixabay_id on item; cannot refresh expired URL reliably. Skipping', src);
		return false;
	}

	// Query Pixabay by id to get a fresh downloadable URL
	const apiUrl = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(String(id))}`;
	let hit;
	try {
		const data = await httpGetJson(apiUrl);
		if (!data || !Array.isArray(data.hits) || data.hits.length === 0) {
			console.warn('No hits for id', id, 'url', src);
			return false;
		}
		hit = data.hits[0];
	} catch (e) {
		console.warn('Pixabay API error for id', id, e.message);
		return false;
	}

	// Prefer webformatURL (640) for consistent sizing
	const freshUrl = hit.webformatURL || hit.largeImageURL || hit.previewURL;
	if (!freshUrl) {
		console.warn('No suitable image URL for id', id);
		return false;
	}

	const token = extractToken(freshUrl) || extractToken(src) || sha1(freshUrl).slice(0, 16);
	const ext = getExtFromUrl(freshUrl, 'jpg');
	const filename = `${prefix}_${id}_${token}_640.${ext}`;
	const outPath = path.join(IMAGES_DIR, filename);

	try {
		fs.mkdirSync(IMAGES_DIR, { recursive: true });
		await downloadToFile(freshUrl, outPath);
	} catch (e) {
		console.warn('Download failed for', freshUrl, '->', filename, e.message);
		return false;
	}

	// Update map with both fresh URL and original src mapping to this local filename
	map[freshUrl] = filename;
	map[src] = filename;
	return true;
}

async function main() {
	const dotenvPath = path.join(__dirname, '..', '.env');
	if (fs.existsSync(dotenvPath)) {
		require('dotenv').config({ path: dotenvPath });
	}
	const API_KEY = process.env.PIXABAY_API_KEY;

	let map = loadJSON(MAP_PATH, {});
	let totalCached = 0;

	for (const { file, prefix } of CATALOGS) {
		if (!fs.existsSync(file)) {
			console.warn('Catalog not found, skipping:', file);
			continue;
		}
		const catalog = loadJSON(file, []);
		let cachedCount = 0;
		for (const item of catalog) {
			// Throttle lightly to avoid hitting rate limits
			// eslint-disable-next-line no-await-in-loop
			const did = await cacheItem(item, prefix, map, API_KEY);
			if (did) cachedCount++;
			if (cachedCount % 10 === 0 && cachedCount > 0) {
				// Persist intermittently
				saveJSON(MAP_PATH, map);
				await delay(200);
			}
			// Small delay each iteration to be gentle with API
			await delay(75 + Math.floor(Math.random() * 50));
		}
		totalCached += cachedCount;
		console.log(`Cached ${cachedCount} images from ${path.basename(file)} -> ${prefix}`);
	}

	saveJSON(MAP_PATH, map);
	console.log(`Done. Total newly cached: ${totalCached}`);
}

if (require.main === module) {
	main().catch((e) => {
		console.error('cacheImagesFromCatalog failed:', e);
		process.exit(1);
	});
}

