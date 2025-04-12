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
dotenv.config();

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});