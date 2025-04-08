const express = require('express');
const router = express.Router();
const db = require('../db'); // This pulls in your MySQL connection

// Get all active listings (not sold)
router.get('/', async (req, res) => {
  try {
    const [listings] = await db.query('SELECT * FROM listings WHERE is_sold = FALSE');
    res.json(listings);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
