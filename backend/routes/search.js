const express = require('express');
const router = express.Router();
const UserBehavior = require('../models/UserBehavior');
const { optionalAuth } = require('../middleware/auth');
const path = require('path');

// ---------------------------------------------------------------------------
// Internal helper: silently record a search behavior for authenticated users.
// Never throws — search tracking must never break search results.
// ---------------------------------------------------------------------------
async function recordSearchBehavior(userId, query) {
  try {
    if (!userId || !query) return;
    await UserBehavior.create({
      user: userId,
      action: 'search',
      timestamp: new Date(),
      metadata: {
        searchTerm: query,
        device: 'desktop'
      }
    });
  } catch (_) {
    // Silently ignore — analytics must not block search
  }
}

// ---------------------------------------------------------------------------
// Load JSON catalogs once
// ---------------------------------------------------------------------------
let clothingCatalog = [];
let footwearCatalog = [];
try {
  clothingCatalog = require(path.join(__dirname, '../../frontend/src/data/clothing-catalog.json'));
} catch (e) { console.warn('search: could not load clothing-catalog.json'); }
try {
  footwearCatalog = require(path.join(__dirname, '../../frontend/src/data/footwear-catalog.json'));
} catch (e) { console.warn('search: could not load footwear-catalog.json'); }
const ALL_PRODUCTS = [...clothingCatalog, ...footwearCatalog];

// ---------------------------------------------------------------------------
// Tokenise a query string into meaningful terms
// ---------------------------------------------------------------------------
function tokenise(text) {
  return (text || '')
    .toLowerCase()
    .split(/[\s,\-_\/]+/)
    .map(t => t.replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length >= 2);
}

// ---------------------------------------------------------------------------
// Calculate text relevance score for one product vs query tokens
// Returns a value roughly in [0, 1+]
// ---------------------------------------------------------------------------
function textRelevance(product, tokens) {
  if (!tokens.length) return 0;
  let score = 0;

  const nameLower = (product.name || '').toLowerCase();
  const catLower  = (product.category || '').toLowerCase();
  const colorLower = (product.color || '').toLowerCase();
  const sellerLower = (product.seller || '').toLowerCase();
  const descLower = (product.description || '').toLowerCase();

  for (const token of tokens) {
    // Exact word match in name (highest value)
    const nameWords = nameLower.split(/\s+/);
    if (nameWords.some(w => w === token)) { score += 1.0; continue; }

    // Partial match in name
    if (nameLower.includes(token)) { score += 0.7; continue; }

    // Category exact word match
    if (catLower.split(/\s+/).some(w => w === token)) { score += 0.5; continue; }

    // Category partial
    if (catLower.includes(token)) { score += 0.35; continue; }

    // Color match
    if (colorLower.includes(token)) { score += 0.4; continue; }

    // Seller partial
    if (sellerLower.includes(token)) { score += 0.2; continue; }

    // Description partial (lowest weight)
    if (descLower.includes(token)) { score += 0.15; }
  }

  // Normalise by token count so multi-word queries don't explode
  return score / tokens.length;
}

// ---------------------------------------------------------------------------
// Build a user preference profile from recent behaviors (same logic as recs)
// ---------------------------------------------------------------------------
const ACTION_WEIGHT = { purchase: 5, add_to_cart: 3, add_to_wishlist: 2,
  search_click: 2, quick_view: 1.5, view: 1 };

function buildSearchProfile(behaviors) {
  const categories = {};
  const colors = {};
  const productMap = {};
  for (const p of ALL_PRODUCTS) productMap[String(p.id || p._id)] = p;

  for (const b of behaviors) {
    const weight = ACTION_WEIGHT[b.action] || 1;
    const pid = b.product ? String(b.product) : null;
    const p = pid ? productMap[pid] : null;
    if (p) {
      if (p.category) categories[p.category] = (categories[p.category] || 0) + weight;
      if (p.color)    colors[p.color]         = (colors[p.color] || 0) + weight;
    }
  }
  return { categories, colors };
}

// ---------------------------------------------------------------------------
// GET /api/search?q=<query>&type=clothes|footwear|all&limit=20&page=1
// ---------------------------------------------------------------------------
router.get('/', optionalAuth, async (req, res) => {
  try {
    const query  = (req.query.q || '').trim();
    const type   = req.query.type || 'all';   // clothes | footwear | all
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
    const page   = Math.max(parseInt(req.query.page)   || 1, 1);

    if (!query) {
      return res.json({ success: true, results: [], total: 0, query: '' });
    }

    // Record search behavior for authenticated users (fire-and-forget)
    if (req.user) {
      recordSearchBehavior(req.user._id, query);
    }

    // Determine candidate pool
    let pool = type === 'clothes'  ? clothingCatalog
              : type === 'footwear' ? footwearCatalog
              : ALL_PRODUCTS;

    const tokens = tokenise(query);

    // Fetch user preference profile if authenticated
    let userProfile = null;
    if (req.user) {
      const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const behaviors = await UserBehavior.find({
        user: req.user._id,
        timestamp: { $gte: cutoff }
      }).lean();
      if (behaviors.length > 0) userProfile = buildSearchProfile(behaviors);
    }

    const maxCat   = userProfile ? Math.max(...Object.values(userProfile.categories), 1) : 1;
    const maxColor = userProfile ? Math.max(...Object.values(userProfile.colors), 1) : 1;

    // Score each product
    const scored = pool
      .filter(p => Boolean(p.image)) // only products with images
      .map(product => {
        const tr = textRelevance(product, tokens);

        // User preference boost (only additive, doesn't override text score)
        let prefBoost = 0;
        if (userProfile) {
          const catPref   = (userProfile.categories[product.category] || 0) / maxCat;
          const colorPref = (userProfile.colors[product.color] || 0) / maxColor;
          prefBoost = (catPref * 0.25) + (colorPref * 0.15);
        }

        // Rating quality boost (small)
        const rating = parseFloat(product.rating || product.ratings || 4.0);
        const ratingBoost = (rating / 5.0) * 0.1;

        const finalScore = tr + prefBoost + ratingBoost;
        return { product, score: finalScore };
      })
      // Filter out zero-relevance products (no text match at all)
      .filter(s => s.score > 0.05)
      .sort((a, b) => b.score - a.score);

    const total  = scored.length;
    const start  = (page - 1) * limit;
    const paged  = scored.slice(start, start + limit);

    const results = paged.map(({ product, score }) => ({
      ...product,
      searchScore: parseFloat(score.toFixed(4))
    }));

    res.json({
      success: true,
      query,
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed', results: [] });
  }
});

// ---------------------------------------------------------------------------
// GET /api/search/suggestions?q=<partial>
// Returns up to 8 product name / category suggestions
// ---------------------------------------------------------------------------
router.get('/suggestions', async (req, res) => {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    if (query.length < 2) return res.json({ success: true, suggestions: [] });

    const seen = new Set();
    const suggestions = [];

    // Product name suggestions
    for (const p of ALL_PRODUCTS) {
      if (suggestions.length >= 8) break;
      const name = (p.name || '').toLowerCase();
      if (name.includes(query)) {
        // Return the category + short name to be useful
        const label = p.name.length > 40 ? p.name.substring(0, 40) + '…' : p.name;
        if (!seen.has(label)) { seen.add(label); suggestions.push(label); }
      }
    }

    // Category suggestions
    const cats = new Set(ALL_PRODUCTS.map(p => p.category).filter(Boolean));
    for (const cat of cats) {
      if (suggestions.length >= 8) break;
      if (cat.toLowerCase().includes(query) && !seen.has(cat)) {
        seen.add(cat);
        suggestions.push(cat);
      }
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ success: true, suggestions: [] });
  }
});

module.exports = router;
