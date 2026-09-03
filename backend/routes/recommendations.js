const express = require('express');
const router = express.Router();
const UserBehavior = require('../models/UserBehavior');
const { auth, optionalAuth } = require('../middleware/auth');
const path = require('path');

// ---------------------------------------------------------------------------
// Load the JSON catalogs once at module load (same data the frontend uses)
// ---------------------------------------------------------------------------
let clothingCatalog = [];
let footwearCatalog = [];
try {
  clothingCatalog = require(path.join(__dirname, '../../frontend/src/data/clothing-catalog.json'));
} catch (e) {
  console.warn('recommendations: could not load clothing-catalog.json', e.message);
}
try {
  footwearCatalog = require(path.join(__dirname, '../../frontend/src/data/footwear-catalog.json'));
} catch (e) {
  console.warn('recommendations: could not load footwear-catalog.json', e.message);
}
const ALL_PRODUCTS = [...clothingCatalog, ...footwearCatalog];

// Build a lookup map: catalogProductId (string) → product object
const productMap = {};
for (const p of ALL_PRODUCTS) {
  productMap[String(p.id || p._id)] = p;
}

// ---------------------------------------------------------------------------
// Behavior weights — purchase outweighs everything else
// ---------------------------------------------------------------------------
const ACTION_WEIGHT = {
  purchase:          5,
  add_to_cart:       3,
  add_to_wishlist:   2,
  search_click:      2,
  quick_view:        1.5,
  view:              1,
  like:              2,
  category_browse:   0.5
};

// ---------------------------------------------------------------------------
// Build a preference profile from raw UserBehavior docs.
//
// Behaviors now store product info in metadata:
//   metadata.catalogProductId  — string id matching JSON catalog
//   metadata.category          — product category
//   metadata.color             — product color
//   metadata.price             — product price (for avg price calc)
//
// Legacy behaviors (before this fix) may have a `product` ObjectId but no
// metadata.catalogProductId — we try to match those via productMap too.
//
// Returns: { categories, colors, purchasedIds, interactedIds, avgPrice }
// ---------------------------------------------------------------------------
function buildProfile(behaviors) {
  const categories = {};
  const colors = {};
  const purchasedIds = new Set();
  const interactedIds = new Set();
  let priceSum = 0;
  let priceCount = 0;

  for (const b of behaviors) {
    const weight = ACTION_WEIGHT[b.action] || 1;

    // Resolve the product snapshot:
    // 1) Try metadata.catalogProductId (new format)
    // 2) Try legacy ObjectId string match against productMap
    let pid = b.metadata && b.metadata.catalogProductId
      ? String(b.metadata.catalogProductId)
      : null;

    // Fallback for legacy docs that have b.product (ObjectId stored as string)
    if (!pid && b.product) {
      pid = String(b.product);
    }

    // Get category and color — prefer metadata fields (always accurate),
    // fall back to looking up the full product from the catalog.
    let category = b.metadata && b.metadata.category ? b.metadata.category : null;
    let color    = b.metadata && b.metadata.color    ? b.metadata.color    : null;
    let price    = b.metadata && b.metadata.price    ? b.metadata.price    : null;

    if (pid && (!category || !color || !price)) {
      const catalogProduct = productMap[pid];
      if (catalogProduct) {
        category = category || catalogProduct.category || null;
        color    = color    || catalogProduct.color    || null;
        price    = price    || catalogProduct.discounted_price || catalogProduct.price || null;
      }
    }

    // Track interaction sets
    if (pid) {
      if (b.action === 'purchase') {
        purchasedIds.add(pid);
      }
      interactedIds.add(pid);
    }

    // Accumulate category preferences
    if (category) {
      categories[category] = (categories[category] || 0) + weight;
    }

    // Accumulate color preferences
    if (color) {
      colors[color] = (colors[color] || 0) + weight;
    }

    // Accumulate price for avg
    if (price) {
      priceSum += price;
      priceCount++;
    }

    // category_browse events have no product but contribute via metadata.category
    if (b.action === 'category_browse') {
      const browsedCat = b.metadata && b.metadata.category ? b.metadata.category : null;
      if (browsedCat) {
        categories[browsedCat] = (categories[browsedCat] || 0) + 0.5;
      }
    }
  }

  const avgPrice = priceCount > 0 ? priceSum / priceCount : null;
  return { categories, colors, purchasedIds, interactedIds, avgPrice };
}

// ---------------------------------------------------------------------------
// Score a single product against a user profile.
// Higher score = more recommended.
//
// Scoring weights (intentionally transparent):
//   Category match : 3.5  (strongest signal — what kind of item they like)
//   Color match    : 2.0  (strong signal — preferred colors)
//   Rating quality : 1.0  (product quality floor)
//   Price proximity: 0.8  (how close to their typical spend)
//
// Interaction penalty: products already interacted with get 0.4× multiplier
// to encourage discovery (not 0 — repeat purchases are valid).
// ---------------------------------------------------------------------------
function scoreProduct(product, profile) {
  const pid = String(product.id || product._id);

  // Soft penalty for already-interacted products (encourages new discovery)
  const interactionPenalty = profile.interactedIds.has(pid) ? 0.4 : 1.0;

  // Category score — normalised to [0, 1] against the user's top category
  const catValues = Object.values(profile.categories);
  const maxCat = catValues.length ? Math.max(...catValues) : 1;
  const catScore = profile.categories[product.category]
    ? Math.min(profile.categories[product.category] / maxCat, 1)
    : 0;

  // Color score — normalised to [0, 1] against the user's top color
  const colorValues = Object.values(profile.colors);
  const maxColor = colorValues.length ? Math.max(...colorValues) : 1;
  const colorScore = profile.colors[product.color]
    ? Math.min(profile.colors[product.color] / maxColor, 1)
    : 0;

  // Price proximity (Gaussian decay around the user's average spend)
  let priceScore = 0.5; // neutral when no purchase history
  if (profile.avgPrice) {
    const productPrice = product.discounted_price || product.price || profile.avgPrice;
    const ratio = Math.abs(productPrice - profile.avgPrice) / Math.max(profile.avgPrice, 1);
    priceScore = Math.exp(-ratio * 1.5);
  }

  // Product quality from rating
  const rating = parseFloat(product.rating || product.ratings || 4.0);
  const ratingScore = rating / 5.0;

  // Final weighted score
  const rawScore =
    (catScore   * 3.5) +
    (colorScore * 2.0) +
    (ratingScore * 1.0) +
    (priceScore * 0.8);

  return rawScore * interactionPenalty;
}

// ---------------------------------------------------------------------------
// Cold-start: top-rated products when user has no preference history
// ---------------------------------------------------------------------------
function coldStartRecommendations(limit) {
  const half = Math.floor(limit / 2);
  const topClothes  = [...clothingCatalog]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, half);
  const topFootwear = [...footwearCatalog]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, half);

  const result = [];
  for (let i = 0; i < half; i++) {
    if (topClothes[i])  result.push({ ...topClothes[i],  mlScore: 0, source: 'cold_start' });
    if (topFootwear[i]) result.push({ ...topFootwear[i], mlScore: 0, source: 'cold_start' });
  }
  return result.slice(0, limit);
}

// ---------------------------------------------------------------------------
// GET /api/recommendations
// optionalAuth — works for both logged-in and anonymous users
// Query params: limit (default 20)
// ---------------------------------------------------------------------------
router.get('/', optionalAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    // No authenticated user → cold start
    if (!req.user) {
      return res.json({
        success: true,
        recommendations: coldStartRecommendations(limit),
        source: 'cold_start'
      });
    }

    // Fetch the last 90 days of behavior for this user
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const rawBehaviors = await UserBehavior.find({
      user: req.user._id,
      timestamp: { $gte: cutoff }
    }).lean();

    if (rawBehaviors.length === 0) {
      return res.json({
        success: true,
        recommendations: coldStartRecommendations(limit),
        source: 'cold_start'
      });
    }

    const profile = buildProfile(rawBehaviors);

    // No meaningful preferences yet → cold start
    const hasCatPref   = Object.keys(profile.categories).length > 0;
    const hasColorPref = Object.keys(profile.colors).length > 0;
    if (!hasCatPref && !hasColorPref) {
      return res.json({
        success: true,
        recommendations: coldStartRecommendations(limit),
        source: 'cold_start'
      });
    }

    // Score all catalog products
    const scored = ALL_PRODUCTS
      .filter(p => Boolean(p.image)) // only products with images
      .map(product => ({
        product,
        score: scoreProduct(product, profile)
      }));
    scored.sort((a, b) => b.score - a.score);

    // Interleave clothes and footwear for variety
    const clothesScored  = scored.filter(s => s.product.type === 'clothes');
    const footwearScored = scored.filter(s => s.product.type === 'footwear');

    const result = [];
    let ci = 0, fi = 0;
    while (result.length < limit && (ci < clothesScored.length || fi < footwearScored.length)) {
      if (ci < clothesScored.length && (result.length % 2 === 0 || fi >= footwearScored.length)) {
        const { product, score } = clothesScored[ci++];
        result.push({ ...product, mlScore: parseFloat(score.toFixed(4)), source: 'personalized' });
      } else if (fi < footwearScored.length) {
        const { product, score } = footwearScored[fi++];
        result.push({ ...product, mlScore: parseFloat(score.toFixed(4)), source: 'personalized' });
      }
    }

    res.json({
      success: true,
      recommendations: result,
      source: 'personalized',
      profileSummary: {
        topCategories: Object.entries(profile.categories)
          .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k),
        topColors: Object.entries(profile.colors)
          .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k),
        totalBehaviors: rawBehaviors.length
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    // Graceful fallback — never crash for ML failures
    res.json({
      success: true,
      recommendations: coldStartRecommendations(20),
      source: 'fallback'
    });
  }
});

module.exports = router;
