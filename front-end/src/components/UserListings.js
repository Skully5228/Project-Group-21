import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from './supabase';

<<<<<<< HEAD
=======
// Inline ListingCard component to display each listing and its delete button.
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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
<<<<<<< HEAD
        <p>Location: {listing.latitude}, {listing.longitude}</p>
=======
        <p>Location: {listing.location}</p>
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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
<<<<<<< HEAD
          marginLeft: "20px",
=======
          marginLeft: "20px", // moves button to the right
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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

<<<<<<< HEAD
  const fetchListings = useCallback(async () => {
    try {
      // Only perform fetch if user exists, otherwise this string will be "undefined"
      if (!user || !user.id) return;
      const response = await fetch(`/api/listings?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
=======
  // Wrap fetchListings in useCallback to ensure it has a stable reference.
  const fetchListings = useCallback(async () => {
    try {
      const response = await fetch(`/api/listings?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await response.json();
      // Expecting: { listings: [...] }
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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
<<<<<<< HEAD
  }, [user, refreshTrigger, fetchListings]);

=======
  }, [user, refreshTrigger, fetchListings]);  // Added fetchListings to the dependencies
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391

  // Function to delete a listing.
  const handleDelete = async (listingId) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }
<<<<<<< HEAD
=======
      // Re-fetch the listings to update the UI.
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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