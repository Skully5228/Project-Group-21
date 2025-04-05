import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import ChatWindow from "./ChatWindow";

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

// New helper: parse location string into an object
const parseLocation = (loc) => {
  if (typeof loc === "string") {
    const parts = loc.split(",");
    return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
  }
  return loc; // if already an object, return as is.
};

const HomePage = () => {
  const { theme } = useContext(ThemeContext);
  const [searchText, setSearchText] = useState("");
  const [range, setRange] = useState(""); // in miles
  const [priceMin, setPriceMin] = useState(""); // Minimum price
  const [priceMax, setPriceMax] = useState(""); // Maximum price
  const [listings, setListings] = useState([]); // Listings fetched from the database
  const [selectedListing, setSelectedListing] = useState(null); // For chat modal

  // Assume current user location is NYC
  const currentUserLocation = { lat: 40.7128, lng: -74.0060 };

  // Fetch listings from the database on component mount.
  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched listings data:", data);
        if (data.listings) {
          setListings(data.listings);
        } else if (Array.isArray(data)) {
          setListings(data);
        } else {
          console.error("Unexpected listings format:", data);
        }
      })
      .catch((err) => console.error("Error fetching listings:", err));
  }, []);

  // Filter listings by search text, range, and price range.
  const filteredListings = listings.filter((listing) => {
    const matchesSearch = (listing.title || listing.description || "")
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const loc = parseLocation(listing.location);
    const distance = getDistanceFromLatLonInMiles(
      currentUserLocation.lat,
      currentUserLocation.lng,
      loc.lat,
      loc.lng
    );
    const withinRange = range === "" ? true : distance <= parseFloat(range);
    const meetsMinPrice =
      priceMin === "" ? true : listing.price >= parseFloat(priceMin);
    const meetsMaxPrice =
      priceMax === "" ? true : listing.price <= parseFloat(priceMax);
    return matchesSearch && withinRange && meetsMinPrice && meetsMaxPrice;
  });

  // Set styles based on the current theme.
  const backgroundStyle =
    theme === "dark"
      ? "linear-gradient(135deg, #333, #555)"
      : "linear-gradient(135deg, #FAD961, #F76B1C)";
  const textColor = theme === "dark" ? "#fff" : "#333";

  return (
    <div
      style={{
        ...styles.container,
        background: backgroundStyle,
        color: textColor,
        animation: "fadeIn 1s ease-in-out",
      }}
    >
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
        {/* Price & Range Filter Section */}
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
            {filteredListings.map((listing) => {
              const loc = parseLocation(listing.location);
              return (
                <div
                  key={listing.id}
                  style={styles.listingCard}
                  onClick={() => setSelectedListing(listing)}
                >
                  {/* Use title if available, otherwise description */}
                  <h4 style={styles.listingTitle}>
                    {listing.title || listing.description}
                  </h4>
                  {loc ? (
                    <p style={styles.listingLocation}>
                      Location: (
                      {loc.lat ? loc.lat.toFixed(4) : "N/A"},{" "}
                      {loc.lng ? loc.lng.toFixed(4) : "N/A"})
                    </p>
                  ) : (
                    <p style={styles.listingLocation}>Location: N/A</p>
                  )}
                  <p style={styles.listingPrice}>Price: ${listing.price}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={styles.noResults}>No listings match your search.</p>
        )}
      </section>

      {/* Chat Modal - Opens when a listing is selected */}
      {selectedListing && (
        <ChatWindow
          listingId={selectedListing.id}
          sellerId={selectedListing.sellerId}
          productTitle={selectedListing.title || selectedListing.description}
          onClose={() => setSelectedListing(null)}
        />
      )}
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