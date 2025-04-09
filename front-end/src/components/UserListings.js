import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from './supabase';

// Inline ListingCard component to display each listing and its delete button.
const ListingCard = ({ listing, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h4>{listing.description}</h4>
        <p>Price: ${listing.price}</p>
        <p>Location: {listing.location}</p>
        {listing.photo_url && (
          <img
            src={`http://localhost:5000/${listing.photo_url}`}
            alt="Listing"
            style={{ width: "200px" }}
          />
        )}
      </div>
      <button
        onClick={() => onDelete(listing.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: "8px 16px",
          backgroundColor: isHovered ? "#c9302c" : "#d9534f",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginLeft: "20px", // moves button to the right
          transition: "background-color 0.3s ease",
        }}
      >
        Delete
      </button>
    </div>
  );
};

const UserListings = ({ refreshTrigger }) => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrap fetchListings in useCallback to ensure it has a stable reference.
  const fetchListings = useCallback(async () => {
    try {
      const response = await fetch(`/api/listings?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await response.json();
      // Expecting: { listings: [...] }
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchListings();
    }
  }, [user, refreshTrigger, fetchListings]);  // Added fetchListings to the dependencies

  // Function to delete a listing.
  const handleDelete = async (listingId) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }
      // Re-fetch the listings to update the UI.
      fetchListings();
    } catch (err) {
      console.error("Error deleting listing:", err.message);
    }
  };

  if (loading) return <div>Loading listings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
};

export default UserListings;