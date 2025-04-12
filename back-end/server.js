import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import listingsRouter from './routes/listings.js';

// Initialize Supabase
const supabaseUrl = 'https://rxdfrrfdaweiosovpala.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4ZGZycmZkYXdlaW9zb3ZwYWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgyNTQsImV4cCI6MjA1OTEzNDI1NH0.c8gGtwSx0rnmjAAAsNzfPfqSonZKLni7sgYR9HMLOZQ';  // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Load environment variables from the .env file
//dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Use listingsRouter for listing routes
app.use('/api/listings', listingsRouter);

// Middleware to ensure the user is authenticated (placeholder)
function ensureAuthenticated(req, res, next) {
  // For demonstration purposes, simply proceed.
  next();
}

// Updated /api/auth/google endpoint that verifies the access token
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  console.log("Received token on backend:", token);

  try {
    // Verify the access token by calling Google's tokeninfo endpoint.
    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
    );
    const tokenInfo = await tokenInfoResponse.json();

    if (tokenInfo.error_description) {
      console.error('Error verifying access token:', tokenInfo.error_description);
      return res.status(401).json({ error: 'Invalid access token' });
    }
    
    // Validate that the token was intended for your app.
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      console.error('Token audience mismatch:', tokenInfo.aud);
      return res.status(401).json({ error: 'Token audience mismatch' });
    }
    
    // Extract user information from the token info response.
    const googleId = tokenInfo.sub;
    const email = tokenInfo.email;
    const name = tokenInfo.name || '';
    const picture = tokenInfo.picture || '';

    // Check if the user already exists in your Supabase database.
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    let user;

    if (error || !data) {
      // Insert a new user since one wasn't found.
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ google_id: googleId, email, name, picture }])
        .single();
      if (insertError) throw insertError;
      user = newUser;
    } else {
      user = data;
    }

    res.status(200).json({ message: 'Authentication successful', user });
  } catch (error) {
    console.error('Google token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Other routes (like favorites and additional listings endpoints) remain unchanged.

// Start the server on the designated port.
// POST /api/listings to create a new listing with photo URL
app.post('/api/listings', ensureAuthenticated, async (req, res) => {
  const { title, price, description, photoUrl, latitude, longitude } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: 'Missing required fields: title, price' });
  }

  try {
    // Insert the new listing into Supabase
    const { data, error } = await supabase
      .from('listings')
      .insert([{
        userId: userId,
        price,
        title,
        description,
        photo_url: photoUrl,
        latitude,
        longitude
      }])
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'Listing created successfully', listingId: data.id });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Server error creating listing' });
  }
});

// GET /api/listings to retrieve all listings or those by a specific user
app.get('/api/listings', ensureAuthenticated, async (req, res) => {
  const { userId } = req.query;

  try {
    let { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      data = data.filter(listing => listing.userId === parseInt(userId));
    }

    if (error) {
      throw error;
    }

    res.status(200).json({ listings: data });
  } catch (error) {
    console.error('Error retrieving listings:', error);
    res.status(500).json({ error: 'Server error retrieving listings' });
  }
});

// DELETE /api/listings/:id to delete a listing
app.delete('/api/listings/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json({ message: 'Listing successfully deleted' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/favorites to add a listing to a user's favorites using listing_id
app.post('/api/favorites', ensureAuthenticated, async (req, res) => {
  const { userId, listingId } = req.body;

  if (!userId || !listingId) {
    return res.status(400).json({ error: 'Missing userId or listingId' });
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ userId: userId, listing_id: listingId }], { returning: "representation" })
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'Favorite added', favorite: data });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Error adding favorite' });
  }
});

// GET /api/favorites to get all favorites for a user, returning the joined listing details
app.get('/api/favorites', ensureAuthenticated, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        listing_id,
        listings (
          *
        )
      `)
      .eq('userId', userId);

    if (error) throw error;

    // Map through each favorite record and extract the joined listing details.
    const listings = data.map(fav => fav.listings).filter(Boolean);
    res.status(200).json({ favorites: listings });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error fetching favorites' });
  }
});

// DELETE /api/favorites to remove a listing from the user's favorites using listing_id
app.delete('/api/favorites', ensureAuthenticated, async (req, res) => {
  const { userId, listingId } = req.body;

  if (!userId || !listingId) {
    return res.status(400).json({ error: 'Missing userId or listingId' });
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('userId', userId)
      .eq('listing_id', listingId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({ error: 'Error deleting favorite' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});