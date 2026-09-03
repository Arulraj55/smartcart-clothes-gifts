import clothingCatalog from '../data/clothing-catalog.json';
import footwearCatalog from '../data/footwear-catalog.json';

const ALL_PRODUCTS = [...clothingCatalog, ...footwearCatalog];

// ---------------------------------------------------------------------------
// PURE FRONTEND ENGINE (used as instant/cold-start fallback)
// No network calls — runs synchronously on every render.
// ---------------------------------------------------------------------------

export function getInitialTopRatedSuggestions(limit = 20) {
  const half = Math.floor(limit / 2);
  const topClothes  = [...clothingCatalog]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, half);
  const topFootwear = [...footwearCatalog]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, half);
  const result = [];
  for (let i = 0; i < half; i++) {
    if (topClothes[i])  result.push(topClothes[i]);
    if (topFootwear[i]) result.push(topFootwear[i]);
  }
  return result;
}

/**
 * Frontend-only scoring. Used immediately on render (no network wait).
 *
 * userExperience shape:
 *   { clickedProducts[], boughtProducts[], clickedCategories{}, clickedColors{} }
 *
 * Scoring (transparent weighted approach):
 *   Category match : 3.5  — what kind of item the user prefers
 *   Color match    : 2.0  — preferred colors
 *   Price proximity: 1.5  — how close to their typical spend
 *   Rating quality : 1.0  — product quality floor
 *
 * Purchase events weight 4× more than click events (via clickedCategories /
 * clickedColors accumulated in App.js with categoryWeight=4, colorWeight=3).
 */
export function getPersonalizedMLSuggestions(userExperience, limit = 20) {
  const {
    clickedProducts   = [],
    boughtProducts    = [],
    clickedCategories = {},
    clickedColors     = {}
  } = userExperience;

  const totalInteractions = clickedProducts.length + boughtProducts.length * 3;
  if (totalInteractions === 0) return getInitialTopRatedSuggestions(limit);

  const interactedItems = [...clickedProducts, ...boughtProducts];
  const avgPrice = interactedItems.reduce(
    (acc, p) => acc + (p.discounted_price || p.price || 1000), 0
  ) / interactedItems.length;
  const interactedIds = new Set(interactedItems.map(p => String(p.id || p._id)));

  const catValues   = Object.values(clickedCategories);
  const colorValues = Object.values(clickedColors);
  const maxCat   = catValues.length   ? Math.max(...catValues)   : 1;
  const maxColor = colorValues.length ? Math.max(...colorValues) : 1;

  const scored = ALL_PRODUCTS.map(product => {
    const pid = String(product.id || product._id);

    // Soft penalty — already interacted products get 0.4× to encourage discovery
    const interactionPenalty = interactedIds.has(pid) ? 0.4 : 1.0;

    const catScore   = Math.min((clickedCategories[product.category] || 0) / maxCat,   1);
    const colorScore = Math.min((clickedColors[product.color]        || 0) / maxColor, 1);

    const pPrice = product.discounted_price || product.price || 1000;
    const priceDiffRatio = Math.abs(pPrice - avgPrice) / Math.max(avgPrice, 1);
    const priceScore = Math.exp(-priceDiffRatio * 1.5);

    const rating = parseFloat(product.rating || product.ratings || 4.0);
    const ratingScore = rating / 5.0;

    const mlScore =
      ((catScore   * 3.5) +
       (colorScore * 2.0) +
       (priceScore * 1.5) +
       (ratingScore * 1.0)) * interactionPenalty;

    return { product, mlScore };
  });

  scored.sort((a, b) => b.mlScore - a.mlScore);

  // Interleave clothes and footwear for variety
  const clothesRecs  = scored.filter(s => s.product.type === 'clothes').map(s => s.product);
  const footwearRecs = scored.filter(s => s.product.type === 'footwear').map(s => s.product);

  const result = [];
  let ci = 0, fi = 0;
  while (result.length < limit && (ci < clothesRecs.length || fi < footwearRecs.length)) {
    if (ci < clothesRecs.length && (result.length % 2 === 0 || fi >= footwearRecs.length)) {
      result.push(clothesRecs[ci++]);
    } else if (fi < footwearRecs.length) {
      result.push(footwearRecs[fi++]);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// BACKEND-CONNECTED FUNCTIONS
// ---------------------------------------------------------------------------

const API_BASE = (() => {
  const explicit = (process.env.REACT_APP_API_BASE_URL || '').trim();
  return explicit
    ? explicit.replace(/\/$/, '')
    : 'https://smartcart-clothes-gifts-backend.onrender.com/api';
})();

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch personalized recommendations from the backend.
 * Backend returns { success, recommendations: [...], source }
 * Falls back to frontend engine on any error or empty result.
 */
export async function fetchBackendRecommendations(userExperience, limit = 20) {
  try {
    const res = await fetch(`${API_BASE}/recommendations?limit=${limit}`, {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const recs = data.recommendations || [];
    if (recs.length === 0) throw new Error('empty');

    // Map backend recs to full local product objects (by id) — prefer local
    // objects since they have complete fields; merge mlScore from backend.
    const productMap = {};
    for (const p of ALL_PRODUCTS) productMap[String(p.id || p._id)] = p;

    const mapped = recs
      .map(r => {
        const pid = String(r.id || r._id);
        return productMap[pid] ? { ...productMap[pid], mlScore: r.mlScore } : r;
      })
      .filter(Boolean);

    return mapped.length > 0 ? mapped : getPersonalizedMLSuggestions(userExperience, limit);
  } catch (_) {
    return getPersonalizedMLSuggestions(userExperience, limit);
  }
}

/**
 * Track a user behavior event to the backend.
 *
 * metadata should include category and color when available so the
 * recommendation engine can build a preference profile without DB lookups.
 *
 * Silent — never throws.
 */
export async function trackBehavior(action, productId = null, metadata = {}) {
  const token = localStorage.getItem('token');
  if (!token) return; // only track authenticated users

  try {
    await fetch(`${API_BASE}/analytics/behavior`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        productId: productId ? String(productId) : undefined,
        metadata
      })
    });
  } catch (_) {
    // Silent — analytics must never crash the app
  }
}

/**
 * Search products via the backend with ML ranking.
 * Backend returns { success, results: [...], total, page, totalPages }
 * Falls back to frontend keyword filter if backend fails.
 */
export async function searchProducts(query, type = 'all', limit = 20) {
  if (!query || !query.trim()) return [];
  try {
    const params = new URLSearchParams({ q: query.trim(), type, limit });
    const res = await fetch(`${API_BASE}/search?${params}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) throw new Error('empty');

    // Enrich with full local product data if possible
    const productMap = {};
    for (const p of ALL_PRODUCTS) productMap[String(p.id || p._id)] = p;

    return results.map(r => {
      const pid = String(r.id || r._id);
      return productMap[pid] ? { ...productMap[pid], searchScore: r.searchScore } : r;
    });
  } catch (_) {
    // Frontend fallback: simple keyword filter
    const term = query.toLowerCase();
    return ALL_PRODUCTS.filter(p =>
      (p.name     && p.name.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.color    && p.color.toLowerCase().includes(term))
    ).slice(0, limit);
  }
}

/**
 * Get search suggestions from the backend.
 * Backend returns { success, suggestions: [...] }
 */
export async function getSearchSuggestions(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`,
      { headers: authHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.suggestions || [];
  } catch (_) {
    // Simple local fallback
    const term = query.toLowerCase();
    const seen = new Set();
    const suggestions = [];
    for (const p of ALL_PRODUCTS) {
      if (suggestions.length >= 6) break;
      const name = (p.name || '').toLowerCase();
      if (name.includes(term) && !seen.has(p.name)) {
        seen.add(p.name);
        suggestions.push(p.name.length > 40 ? p.name.substring(0, 40) + '…' : p.name);
      }
    }
    return suggestions;
  }
}
