import express from 'express';
import { supabase } from '../supabase.js'; // Adjust the file extension if needed
import geolib from 'geolib';

const router = express.Router();

// GET listings with filters
router.get('/', async (req, res) => {
  const { q, minPrice, maxPrice, userLat, userLng, range } = req.query;

  try {
    // Start with all listings
    let { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .eq('sold', 0); // Make sure to filter only unsold listings

    if (error) throw error;

    // Text search (description)
    if (q) {
      const lowerQ = q.toLowerCase();
      listings = listings.filter(listing =>
        listing.description && listing.description.toLowerCase().includes(lowerQ)
      );
    }

    // Filter by price range
    if (minPrice) {
      listings = listings.filter(listing => listing.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      listings = listings.filter(listing => listing.price <= parseFloat(maxPrice));
    }

    // Filter by distance if location info is present
    if (userLat && userLng && range) {
      const userCoords = { latitude: parseFloat(userLat), longitude: parseFloat(userLng) };

      listings = listings.filter(listing => {
        if (!listing.location) return false;
        const [latStr, lngStr] = listing.location.split(',');
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) return false;

        const distance = geolib.getDistance(userCoords, { latitude: lat, longitude: lng });
        const miles = distance / 1609.34;

        return miles <= parseFloat(range);
      });
    }

    res.json({ listings });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST create new listing
router.post('/', async (req, res) => {
  const { userId, title, price, latitude, longitude, photoUrl, description } = req.body;


  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([{ userId, title, price, latitude, longitude, photoUrl, description }]);

    if (error) throw error;

    res.status(201).json({ id: data[0].id, message: 'Listing created!' });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;