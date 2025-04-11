import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';
import listingsRouter from './routes/listings.js';

// Initialize Supabase
const supabaseUrl = 'https://rxdfrrfdaweiosovpala.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4ZGZycmZkYXdlaW9zb3ZwYWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTgyNTQsImV4cCI6MjA1OTEzNDI1NH0.c8gGtwSx0rnmjAAAsNzfPfqSonZKLni7sgYR9HMLOZQ';  // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Load environment variables from the .env file


// Initialize Express app
const app = express();

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Enable Cross-Origin Resource Sharing
app.use(cors());
app.use(express.json());

// Use listingsRouter for listing routes
app.use('/api/listings', listingsRouter);

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  // For demonstration purposes, we will just call next()
  // Replace this with your actual authentication logic (e.g., session or JWT check)
  next();
}

// POST /api/auth/google to authenticate with Google
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user already exists in the Supabase database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    let user;

    if (error || !data) {
      // Insert the new user into the Supabase database
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ google_id: googleId, email, name, picture }])
        .single();
      
      if (insertError) {
        throw insertError;
      }

      user = newUser;
    } else {
      user = data;
    }

    // Return user data for demonstration (in production, generate a session or JWT token)
    res.status(200).json({ message: 'Authentication successful', user });
  } catch (error) {
    console.error('Google token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/listings to create a new listing with photo URL
app.post('/api/listings', ensureAuthenticated, async (req, res) => {
    const { title, price, description, photoUrl, latitude, longitude } = req.body;
  
    if (!title || !price) {
      return res.status(400).json({ error: 'Missing required fields: title, price' });
    }
  
    const userId = 1; // Replace with actual user ID from authentication
  
    try {
      // Insert the new listing into Supabase
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          user_id: userId,
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
      data = data.filter(listing => listing.user_id === parseInt(userId));
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

// POST /api/favorites to add a listing to a user's favorites
app.post('/api/favorites', ensureAuthenticated, async (req, res) => {
    const { userId, listingTitle } = req.body;
  
    if (!userId || !listingTitle) {
      return res.status(400).json({ error: 'Missing userId or listingTitle' });
    }
  
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, listing_title: listingTitle }]) // <-- fixed here
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

// GET /api/favorites to get all favorites for a user
app.get('/api/favorites', ensureAuthenticated, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        listing_title,
        listings (
          *
        )
      `)
      .eq('user_id', userId);
  
    if (error) throw error;
  
    const listings = data.map(fav => fav.listings).filter(Boolean);
    res.status(200).json({ favorites: listings });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error fetching favorites' });
  }
});

// DELETE /api/favorites to remove a listing from the user's favorites
app.delete('/api/favorites', ensureAuthenticated, async (req, res) => {
    const { userId, listingTitle } = req.body;
  
    if (!userId || !listingTitle) {
      return res.status(400).json({ error: 'Missing userId or listingTitle' });
    }
  
    try {
      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_title', listingTitle) // <-- fixed here
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
