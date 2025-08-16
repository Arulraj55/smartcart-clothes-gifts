const express = require('express');
const router = express.Router();

// Smart Search for SmartCart: Clothes & Gifts
router.get('/', (req, res) => {
  const query = req.query.q || '';
  res.json({ 
    message: 'Smart Search - SmartCart: Clothes & Gifts',
    query: query,
    results: [
      { id: 1, name: 'Search Result: Summer Dress', category: 'women-clothing', price: 49.99 },
      { id: 2, name: 'Search Result: Casual Wear', category: 'men-clothing', price: 34.99 }
    ]
  });
});

router.get('/suggestions', (req, res) => {
  res.json({ 
    message: 'Search Suggestions - SmartCart: Clothes & Gifts',
    suggestions: ['summer dress', 'casual shirt', 'gift box', 'accessories']
  });
});

module.exports = router;
