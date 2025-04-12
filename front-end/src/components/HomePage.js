import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import ChatWindow from "./ChatWindow";
import { supabase } from "./supabase";
import geolib from "geolib";

const parseLocation = (loc) => {
  if (typeof loc === "string") {
    const parts = loc.split(",");
    return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
  }
  return loc;
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

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("sold", 0); // Get only unsold listings

        if (error) throw error;

        console.log("Fetched Listings:", data); // Log the fetched listings

        // Apply filters on the fetched data
        let filteredListings = data;

        // Apply text search filter
        if (searchText) {
          const lowerQ = searchText.toLowerCase();
          filteredListings = filteredListings.filter(
            (listing) =>
              listing.description &&
              listing.description.toLowerCase().includes(lowerQ)
          );
        }

        // Apply price filters
        if (priceMin) {
          filteredListings = filteredListings.filter(
            (listing) => listing.price >= parseFloat(priceMin)
          );
        }
        if (priceMax) {
          filteredListings = filteredListings.filter(
            (listing) => listing.price <= parseFloat(priceMax)
          );
        }

        // Apply location filter based on range if available
        if (range) {
          filteredListings = filteredListings.filter((listing) => {
            const loc = parseLocation(listing.location);
            if (loc) {
              const distance = geolib.getDistance(
                { latitude: currentUserLocation.lat, longitude: currentUserLocation.lng },
                { latitude: loc.lat, longitude: loc.lng }
              );
              const miles = distance / 1609.34; // Convert meters to miles
              return miles <= parseFloat(range);
            }
            return false;
          });
        }

        console.log("Filtered Listings:", filteredListings); // Log filtered listings
        setListings(filteredListings);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };

    fetchListings();
  }, [searchText, priceMin, priceMax, range]);

  const backgroundStyle =
    theme === "Dark"
      ? "linear-gradient(135deg, #333, #555)"
      : "linear-gradient(135deg,hsla(185, 87.20%, 72.40%, 0.76),rgba(139, 248, 122, 0.75))";
  const textColor = theme === "Dark" ? "#fff" : "#333";

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
        {listings.length > 0 ? (
          <div style={styles.listingsGrid}>
            {listings.map((listing) => {
              const loc = parseLocation(listing.location);
              return (
                <div
                  key={listing.id}
                  style={{
                    ...styles.listingCard,
                    backgroundImage: `url(${listing.photoUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    color: "#fff",
                    position: "relative",
                  }}
                  onClick={() => {
                    console.log("Clicked listing userId:", listing.userId);
                    // Only allow click if userId (seller) is not null/undefined
                    if (listing.userId === null || listing.userId === undefined) {
                      alert("Seller information is missing for this listing. Chat cannot be opened.");
                      return;
                    }
                    setSelectedListing(listing);
                  }}
                >
                  {/* Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      zIndex: 0,
                    }}
                  ></div>

                  {/* Description */}
                  <h4 style={{ ...styles.listingTitle, zIndex: 2 }}>
                    {listing.title|| "No Title"}
                  </h4>

                  {/* Location */}
                  {loc ? (
                    <p style={{ ...styles.listingLocation, zIndex: 2 }}>
                      Location: ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                    </p>
                  ) : (
                    <p style={{ ...styles.listingLocation, zIndex: 2 }}></p>
                  )}

                  {/* Price */}
                  <p style={{ ...styles.listingPrice, zIndex: 2 }}>
                    Price: ${listing.price}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={styles.noResults}>No listings match your search.</p>
        )}
      </section>
      {/* Chat Modal */}
      {selectedListing && (
        <ChatWindow
          listingId={selectedListing.id}
          sellerId={selectedListing.userId}  // Use userId consistently
          productTitle={selectedListing.description || "No Title"}
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
    boxShadow: "0 2px 8px rgba(0,0,0,3)",
    transition: "transform 0.2s ease",
    cursor: "pointer",
  },
  listingTitle: {
    fontSize: "1.25rem",
    marginBottom: "10px",
    zIndex: 2
  },
  listingLocation: {
    fontSize: "0.9rem",
    color: "#FFFFFF",
    marginTop: "10px",
    zIndex: 2
  },
  listingPrice: {
    fontSize: "1rem",
    color: "#FFFFFF",
    marginTop: "5px",
    fontWeight: "600",
    zIndex: 2
  },
  noResults: {
    fontSize: "1.1rem",
    color: "#777",
    textAlign: "center",
  },
};

export default HomePage;
