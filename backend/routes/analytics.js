const express = require('express');
const router = express.Router();
const UserBehavior = require('../models/UserBehavior');
const { auth } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// POST /api/analytics/behavior
// Track a single user behavior event. Auth required.
//
// Key design: catalog products are identified by a string id (not a MongoDB
// ObjectId). We therefore do NOT store `product` as an ObjectId reference.
// Instead we store the catalog product id as a plain string in
// metadata.catalogProductId, plus category and color so the recommendation
// engine can build the user preference profile without needing a DB lookup.
// ---------------------------------------------------------------------------
router.post('/behavior', auth, async (req, res) => {
  try {
    const { action, productId, metadata = {}, sessionId } = req.body;

    // All meaningful actions we track for ML
    const allowedActions = [
      'view',
      'like',
      'add_to_cart',
      'add_to_wishlist',
      'remove_from_wishlist',
      'purchase',
      'search',
      'search_click',
      'category_browse',
      'quick_view'
    ];
    if (!action || !allowedActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing action' });
    }

    // Avoid duplicate view events within 10 minutes for the same user+catalog product
    if (action === 'view' && productId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recent = await UserBehavior.findOne({
        user: req.user._id,
        'metadata.catalogProductId': String(productId),
        action: 'view',
        timestamp: { $gte: tenMinutesAgo }
      });
      if (recent) {
        return res.json({ success: true, message: 'Duplicate view skipped' });
      }
    }

    // Build the behavior document.
    // We store the catalog product id, category, and color in metadata so the
    // recommendation engine can enrich behaviors without a separate DB lookup.
    const behaviorDoc = {
      user: req.user._id,
      action,
      timestamp: new Date(),
      metadata: {
        // Catalog-level product identification (string id from JSON catalog)
        catalogProductId: productId ? String(productId) : undefined,
        // Product attributes for ML preference building
        category: metadata.category || undefined,
        color: metadata.color || undefined,
        // Search-related fields
        searchTerm: metadata.searchTerm || undefined,
        clickPosition: metadata.clickPosition || undefined,
        // Purchase/cart fields
        quantity: metadata.quantity || undefined,
        price: metadata.price || undefined,
        // Session / device
        device: metadata.device || 'desktop',
        pageUrl: metadata.pageUrl || undefined
      }
    };

    // sessionInfo
    if (sessionId) behaviorDoc.sessionInfo = { sessionId };

    await UserBehavior.create(behaviorDoc);

    res.json({ success: true, message: 'Behavior tracked' });
  } catch (error) {
    console.error('Behavior tracking error:', error);
    // Never crash the app over analytics — swallow and respond ok
    res.json({ success: true, message: 'Behavior tracked (fallback)' });
  }
});

module.exports = router;
