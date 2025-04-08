const express = require('express');
const pool = require('../db'); // Import the database connection pool
const router = express.Router();

// Create a new listing
router.post('/', async (req, res) => {
  const { title, description, price, image_url } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO listings (title, description, price, image_url) VALUES (?, ?, ?, ?)',
      [title, description, price, image_url]
    );

    res.status(201).json({ message: 'Listing created', listingId: result.insertId });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Error creating listing' });
  }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM listings');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Error fetching listings' });
  }
});

// Update a listing to mark it as sold
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('UPDATE listings SET is_sold = true WHERE id = ?', [id]);
    res.status(200).json({ message: 'Listing marked as sold' });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ error: 'Error updating listing' });
  }
});

module.exports = router;
