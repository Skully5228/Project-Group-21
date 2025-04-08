require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const pool = require('./database');  // Import your MySQL connection pool
const multer = require('multer');

const app = express();
require('dotenv').config();
const listingsRouter = require('./routes/listings'); // Adjust if needed

app.use(express.json());

// Mount the listings API
app.use('/api/listings', listingsRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the "uploads" folder so uploaded images can be accessed.
app.use('/uploads', express.static('uploads'));

// Initialize the Google OAuth2 client.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google  
 * Body: { token: "google_id_token" }
 */
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the token with Google.
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // Extract user info from the payload.
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        // Check if the user already exists.
        const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
        let user;
        if (rows.length === 0) {
            // Insert the new user into the users table.
            const [result] = await pool.execute(
                'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
                [googleId, email, name, picture]
            );
            // Retrieve the newly inserted user record.
            const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newRows[0];
        } else {
            user = rows[0];
        }

        // For demonstration, return the user data (in production you'd generate a token).
        return res.status(200).json({ message: "Authentication successful", user });
    } catch (error) {
        console.error("Google token verification failed:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
});

// Set up multer for file uploads (adjust destination and limits as needed).
const upload = multer({ dest: 'uploads/' });

// Dummy authentication middleware for testing purposes.
// In a production environment, replace this with proper session or JWT validation.
function ensureAuthenticated(req, res, next) {
    next();
}

/**
 * POST /api/listings
 * Accepts form-data containing price, description, location, and an optional photo.
 */
app.post('/api/listings', ensureAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        // Extract data from the form.
        const { price, location, description } = req.body;
        const photo = req.file; // Information about the uploaded file.

        // For now, use the file path as the photo URL.
        const photoUrl = photo ? photo.path : null;

        // Assume the current user's ID is stored on the request.
        // For testing purposes, we are hardcoding it.
        const userId = 1;

        // Insert the new listing into the database.
        const [result] = await pool.execute(
            'INSERT INTO listings (user_id, price, location, photo_url, description) VALUES (?, ?, ?, ?, ?)',
            [userId, price, location, photoUrl, description]
        );

        res.status(201).json({ message: "Listing created successfully", listingId: result.insertId });
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).json({ error: "Server error creating listing" });
    }
});

/**
 * POST /api/messages
 * Expects body: { listingId: number, recipientId: number, content: string }
 * In production, the sender's ID would be set from your authentication (e.g., req.user.id)
 */
app.post('/api/messages', ensureAuthenticated, async (req, res) => {
    const { listingId, recipientId, content } = req.body;
    // For demonstration, we hardcode the sender's ID.
    const senderId = 1;

    try {
        // Insert the new message into the database.
        const [result] = await pool.execute(
            'INSERT INTO messages (listing_id, sender_id, recipient_id, content) VALUES (?, ?, ?, ?)',
            [listingId, senderId, recipientId, content]
        );
        // Retrieve the newly inserted message record.
        const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: "Message sent", chatMessage: rows[0] });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Server error sending message" });
    }
});

/**
 * GET /api/messages?listingId=...
 * Retrieves all messages for a given listing ordered by creation time (ascending).
 */
app.get('/api/messages', ensureAuthenticated, async (req, res) => {
    const { listingId } = req.query;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM messages WHERE listing_id = ? ORDER BY created_at ASC',
            [listingId]
        );
        res.status(200).json({ messages: rows });
    } catch (error) {
        console.error("Error retrieving messages:", error);
        res.status(500).json({ error: "Server error retrieving messages" });
    }
});

// GET /api/listings?userId=...
app.get('/api/listings', ensureAuthenticated, async (req, res) => {
    const { userId } = req.query;
    try {
      let rows;
      if (userId) {
        [rows] = await pool.query(
          'SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
      } else {
        // Return all listings if no userId is provided.
        [rows] = await pool.query(
          'SELECT * FROM listings ORDER BY created_at DESC'
        );
      }
      res.status(200).json({ listings: rows });
    } catch (error) {
      console.error("Error retrieving listings:", error);
      res.status(500).json({ error: "Server error retrieving listings" });
    }
  });

app.delete('/api/listings/:id', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM listings WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Listing not found" });
        }
        res.status(200).json({ message: "Listing successfully deleted" });
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/favorites', ensureAuthenticated, async (req, res) => {
    const { userId, listingId } = req.body;
    try {
        const [result] = await pool.execute(
            "INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)",
            [userId, listingId]
        );
        res.status(201).json({ message: "Favorite added", favoriteId: result.insertId });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ error: "Error adding favorite" });
    }
});

app.delete('/api/favorites', ensureAuthenticated, async (req, res) => {
    const { userId, listingId } = req.body;
    try {
        const [result] = await pool.execute(
            "DELETE FROM favorites WHERE user_id = ? AND listing_id = ?",
            [userId, listingId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Favorite not found" });
        }
        res.status(200).json({ message: "Favorite removed" });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).json({ error: "Error deleting favorite" });
    }
});

app.get('/api/favorites', ensureAuthenticated, async (req, res) => {
    // Expecting the userId as a query parameter
    const { userId } = req.query;
    try {
        const [rows] = await pool.query(
            "SELECT l.* FROM favorites f JOIN listings l ON f.listing_id = l.id WHERE f.user_id = ?",
            [userId]
        );
        res.status(200).json({ favorites: rows });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Error fetching favorites" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
