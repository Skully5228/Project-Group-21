import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

// Helper functions for distance calculation (Haversine formula)
const deg2rad = (deg) => deg * (Math.PI / 180);
const getDistanceFromLatLonInMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const HomePage = () => {
  const { theme } = useContext(ThemeContext);
  const [searchText, setSearchText] = useState("");
  const [range, setRange] = useState(""); // Location range in miles
  const [priceMin, setPriceMin] = useState(""); // Minimum price
  const [priceMax, setPriceMax] = useState(""); // Maximum price

  // Dummy listings including a price property
  const dummyListings = [
    { id: 1, title: "Vintage Bicycle", description: "A classic bike in excellent condition.", location: { lat: 40.7128, lng: -74.0060 }, price: 150 },
    { id: 2, title: "Modern Sofa", description: "Comfortable and stylish sofa.", location: { lat: 40.7138, lng: -74.0050 }, price: 800 },
    { id: 3, title: "Coffee Maker", description: "Brew the best coffee at home.", location: { lat: 40.7110, lng: -74.0070 }, price: 60 },
    { id: 4, title: "Laptop", description: "High-performance laptop ideal for work.", location: { lat: 40.7140, lng: -74.0080 }, price: 1200 },
    { id: 5, title: "Mountain Bike", description: "Durable and fast bike.", location: { lat: 40.7100, lng: -74.0055 }, price: 450 },
    { id: 6, title: "Gaming Console", description: "Next-gen console with immersive gaming.", location: { lat: 40.7150, lng: -74.0065 }, price: 500 },
    { id: 7, title: "Acoustic Guitar", description: "Great for beginners.", location: { lat: 40.7120, lng: -74.0040 }, price: 250 },
    { id: 8, title: "Desk Lamp", description: "LED desk lamp with adjustable brightness.", location: { lat: 40.7135, lng: -74.0075 }, price: 40 },
    { id: 9, title: "Air Fryer", description: "Healthy cooking made easy.", location: { lat: 40.7115, lng: -74.0058 }, price: 100 },
    { id: 10, title: "Smartphone", description: "Latest model smartphone.", location: { lat: 40.7145, lng: -74.0045 }, price: 900 },
    { id: 11, title: "Bluetooth Speaker", description: "Portable speaker with excellent sound.", location: { lat: 40.7160, lng: -74.0060 }, price: 70 },
    { id: 12, title: "Wireless Earbuds", description: "Compact and powerful sound.", location: { lat: 40.7130, lng: -74.0080 }, price: 120 },
    { id: 13, title: "Smartwatch", description: "Track your fitness and notifications.", location: { lat: 40.7125, lng: -74.0075 }, price: 200 },
    { id: 14, title: "Digital Camera", description: "Capture high quality photos.", location: { lat: 40.7132, lng: -74.0052 }, price: 450 },
    { id: 15, title: "Electric Kettle", description: "Boils water quickly and safely.", location: { lat: 40.7129, lng: -74.0065 }, price: 30 },
  ];

  // Assume current user location is NYC
  const currentUserLocation = { lat: 40.7128, lng: -74.0060 };

  // Filter listings by title, by location range, and by price range.
  const filteredListings = dummyListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchText.toLowerCase());
    const distance = getDistanceFromLatLonInMiles(
      currentUserLocation.lat,
      currentUserLocation.lng,
      listing.location.lat,
      listing.location.lng
    );
    const withinRange = range === "" ? true : distance <= parseFloat(range);
    const meetsMinPrice = priceMin === "" ? true : listing.price >= parseFloat(priceMin);
    const meetsMaxPrice = priceMax === "" ? true : listing.price <= parseFloat(priceMax);

    return matchesSearch && withinRange && meetsMinPrice && meetsMaxPrice;
  });

  const backgroundStyle =
    theme === "dark"
      ? "linear-gradient(135deg, #333, #555)"
      : "linear-gradient(135deg, #FAD961, #F76B1C)";
  const textColor = theme === "dark" ? "#fff" : "#333";

  return (
    <div style={{ ...styles.container, background: backgroundStyle, color: textColor, animation: "fadeIn 1s ease-in-out" }}>
      <section style={styles.hero}>
        <h2 style={styles.heroTitle}>Discover Local Deals</h2>
        <p style={styles.heroSubtitle}>
          Browse thousands of listings available in your community.
        </p>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search listings..."
            style={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button style={styles.searchButton}>Search</button>
        </div>
        {/* New Price Filter Section */}
        <div style={styles.filterContainer}>
          <div style={styles.rangeContainer}>
            <label style={styles.rangeLabel}>Range (miles): </label>
            <input
              type="number"
              placeholder="e.g. 5"
              style={styles.rangeInput}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            />
          </div>
          <div style={styles.priceContainer}>
            <label style={styles.priceLabel}>Price Range: </label>
            <input
              type="number"
              placeholder="Min"
              style={{ ...styles.priceInput, marginRight: "10px" }}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              style={styles.priceInput}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section style={styles.listingsSection}>
        <h3 style={styles.sectionTitle}>Listings</h3>
        {filteredListings.length > 0 ? (
          <div style={styles.listingsGrid}>
            {filteredListings.map((listing) => (
              <div key={listing.id} style={styles.listingCard}>
                <h4 style={styles.listingTitle}>{listing.title}</h4>
                <p style={styles.listingDescription}>{listing.description}</p>
                <p style={styles.listingLocation}>
                  Location: ({listing.location.lat.toFixed(4)}, {listing.location.lng.toFixed(4)})
                </p>
                <p style={styles.listingPrice}>Price: ${listing.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noResults}>No listings match your search.</p>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    minHeight: "100vh",
  },
  hero: {
    padding: "60px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    marginBottom: "40px",
  },
  heroTitle: {
    fontSize: "2.5rem",
    margin: "0 0 20px",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    margin: "0 0 30px",
  },
  searchBar: {
    display: "flex",
    justifyContent: "center",
  },
  searchInput: {
    width: "300px",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px 0 0 4px",
    outline: "none",
  },
  searchButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#5563DE",
    color: "#fff",
    border: "none",
    borderRadius: "0 4px 4px 0",
    cursor: "pointer",
  },
  filterContainer: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  rangeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  rangeLabel: {
    fontSize: "1rem",
  },
  rangeInput: {
    width: "80px",
    padding: "8px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  priceContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  priceLabel: {
    fontSize: "1rem",
  },
  priceInput: {
    width: "80px",
    padding: "8px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  listingsSection: {
    marginTop: "40px",
    maxHeight: "600px",
    overflowY: "auto",
  },
  sectionTitle: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  listingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  listingCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease",
    cursor: "pointer",
  },
  listingTitle: {
    fontSize: "1.25rem",
    marginBottom: "10px",
  },
  listingDescription: {
    fontSize: "1rem",
    margin: 0,
    color: "#555",
  },
  listingLocation: {
    fontSize: "0.9rem",
    color: "#888",
    marginTop: "10px",
  },
  listingPrice: {
    fontSize: "1rem",
    color: "#000",
    marginTop: "5px",
    fontWeight: "600",
  },
  noResults: {
    fontSize: "1.1rem",
    color: "#777",
    textAlign: "center",
  },
};

export default HomePage;
