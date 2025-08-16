const express = require('express');
const router = express.Router();

// User routes for SmartCart: Clothes & Gifts
router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint - SmartCart: Clothes & Gifts' });
});

module.exports = router;
