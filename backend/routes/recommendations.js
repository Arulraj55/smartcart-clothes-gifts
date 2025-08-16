const express = require('express');
const router = express.Router();

// ML Recommendations for SmartCart: Clothes & Gifts
router.get('/', (req, res) => {
  res.json({ 
    message: 'AI Recommendations - SmartCart: Clothes & Gifts',
    recommendations: [
      { id: 1, name: 'Recommended Summer Dress', category: 'women-clothing', price: 54.99, mlScore: 0.95 },
      { id: 2, name: 'Recommended Casual Shirt', category: 'men-clothing', price: 29.99, mlScore: 0.88 },
      { id: 3, name: 'Recommended Gift Set', category: 'gifts', price: 44.99, mlScore: 0.82 }
    ]
  });
});

module.exports = router;
