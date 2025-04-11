import React, { useState } from "react";

const AddListing = ({ onListingAdded, userId }) => { // userId is passed as a prop (replace with actual user ID if needed)
  const [formData, setFormData] = useState({
    title: "", // New field for title
    description: "",
    price: "",
    latitude: "",
    longitude: "",
    photo_url: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const locationArr = formData.location.split(",");
    const latitude = parseFloat(locationArr[0]);
    const longitude = parseFloat(locationArr[1]);

    const listingData = {
      user_id: userId, 
      title: formData.title,
      description: formData.description,
      price: formData.price,
      latitude,
      longitude,
      photo_url: formData.photo_url,
    };

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listingData),
    });

    if (res.ok) {
      const data = await res.json();
      alert("Listing created!");
      if (onListingAdded) onListingAdded(); 
    } else {
      alert("Failed to create listing.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h3>Create a New Listing</h3>

      {/* Title Field */}
      <input
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      {/* Description Field */}
      <input
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />

      {/* Price Field */}
      <input
        name="price"
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
      />

      {/* Location Field (latitude,longitude) */}
      <input
        name="location"
        placeholder="Latitude,Longitude"
        value={formData.location}
        onChange={handleChange}
        required
      />

      {/* Photo URL Field */}
      <input
        name="photo_url"
        placeholder="Photo URL"
        value={formData.photo_url}
        onChange={handleChange}
      />

      <button type="submit">Add Listing</button>
    </form>
  );
};

export default AddListing;
