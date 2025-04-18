import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import MapSearchComponent from "./MapSearchComponent"; // if using the map with search
import MessagesTab from "./MessagesTab";
import UserListings from "./UserListings"; // Your UserListings component

const Dashboard = () => {
  const tabs = ["Favorites", "Messages", "Settings"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [title, setTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');


  // State for triggering refresh of listings (used in the Settings tab)
  const [listingRefresh, setListingRefresh] = useState(0);

  // NEW: Favorites state to hold an array of favorited listings.
  const [favorites, setFavorites] = useState([]);

  // Fetch favorites from the backend once the user is available.
  useEffect(() => {
    if (user && user.id) {
      fetch(`/api/favorites?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.favorites) {
            setFavorites(data.favorites);
          }
        })
        .catch((err) => console.error("Error fetching favorites:", err));
    }
  }, [user?.id, listingRefresh]);;

  // Callback to update favorites.
  // Call this function from any child component (like ChatWindow)
  // to update the Dashboard’s favorites accordingly.

  const handleListingSubmit = async (e) => {
    e.preventDefault();
  
    const listingData = {
      userId: user.id,
      title,
      description,
      price: parseFloat(price),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      photoUrl: photoUrl,
    };
    
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });
  
      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to create listing:", result.error);
        return;
      }

      // Reset form + close modal
      setTitle("");
      setDescription("");
      setPrice("");
      setLatitude(null);
      setLongitude(null);
      setPhotoUrl("");
      
      setIsModalOpen(false);
      setListingRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  // Adjust underline position for active tab.
  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setUnderlineStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeTab]);

  // Bypass login for testing new listing functionality.
  const handleNewListingClick = () => {
    const bypassLoginForTesting = false; // change when ready for production
    if (!user && !bypassLoginForTesting) {
      navigate("/login");
    } else {
      setIsModalOpen(true);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error obtaining geolocation:", error);
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Map modal functions.
  const openMapModal = () => {
    setIsMapModalOpen(true);
  };

  const closeMapModal = () => {
    setIsMapModalOpen(false);
  };

  const handleConfirmMapLocation = () => {
    setIsMapModalOpen(false);
  };

  // Render content based on the active tab.
  const renderContent = () => {
    switch (activeTab) {
      case "Favorites":
        return (
          <div>
            <h3>Your Favorites</h3>
            {favorites.length === 0 ? (
              <p>No favorites yet.</p>
            ) : (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <h4>{fav.description}</h4>
                  <p>Price: ${fav.price}</p>
                  <p>Location: {fav.location}</p>
                  {fav.photoUrl && (
                    <img
                      src={fav.photoUrl}
                      alt="Favorite Listing"
                      style={{ width: "200px" }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        );
      case "Messages":
        return <MessagesTab />;
      case "Settings":
        return (
          <div>
            <h3>Settings</h3>
            <div style={styles.themeToggleContainer}>
              <p>Current Theme: {theme} Mode</p>
              <button style={styles.themeToggleBtn} onClick={toggleTheme}>
                Toggle Dark/Light Mode
              </button>
            </div>
            <hr style={styles.hr} />
            <h4>My Listings</h4>
            <p>View all your personal listings here.</p>
            <UserListings refreshTrigger={listingRefresh} />
          </div>
        );
      default:
        return null;
    }
  };

  // Set background styles according to the theme.
  const pageWrapperBackground =
    theme === "Dark"
      ? "linear-gradient(135deg, #333, #555)"
      : "linear-gradient(135deg,hsla(185, 87.20%, 72.40%, 0.76),rgba(139, 248, 122, 0.75))";
  const dashboardContainerBg =
    theme === "Dark" ? "rgba(50, 50, 50, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const textColor = theme === "Dark" ? "#fff" : "#333";

  return (
    <div style={{ ...styles.pageWrapper, background: pageWrapperBackground }}>
      <div style={{ ...styles.dashboardContainer, background: dashboardContainerBg }}>
        <header style={styles.header}>
          <h1 style={{ ...styles.heading, color: textColor }}>Dashboard</h1>
          <button style={styles.newListingBtn} onClick={handleNewListingClick}>
            + New Listing
          </button>
        </header>
        <nav style={{ ...styles.nav, justifyContent: "space-around" }}>
          {tabs.map((tab) => (
            <div
              key={tab}
              ref={(el) => (tabRefs.current[tab] = el)}
              className="dashboard-tab"
              style={{
                ...styles.tab,
                color: activeTab === tab ? "#F76B1C" : textColor,
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
          <div
            style={{
              ...styles.underline,
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </nav>
        <section style={styles.content}>{renderContent()}</section>

        {/* New Listing Modal */}
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Create a New Listing</h2>
              <form style={styles.form} onSubmit={handleListingSubmit}>
              <div style={styles.formGroup}>
                  <label style={styles.label}>Title:</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Enter listing title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                <label>
                  Photo URL:
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    required
                  />
                </label>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description:</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Enter a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price ($):</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                <label style={styles.label}>Location:</label>
                  {latitude && longitude ? (
                    <p style={{ margin: "8px 0" }}>
                      Selected: ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                    </p>
                  ) : (
                    <p style={{ margin: "8px 0" }}>No location selected</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                    <button type="button" style={styles.smallBtn} onClick={handleUseCurrentLocation}>
                      Use Current Location
                    </button>
                    <button type="button" style={styles.smallBtn} onClick={openMapModal}>
                      Select on Map
                    </button>
                  </div>
                </div>
                <div style={styles.buttonGroup}>
                  <button type="submit" style={styles.submitBtn}>
                    Submit
                  </button>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {isMapModalOpen && (
          <div style={styles.mapModalOverlay}>
            <div style={styles.mapModalContent}>
              <h3>Select a Location</h3>
              <MapSearchComponent
                initialPosition={{ lat: 28.5383, lng: -81.3792 }}
                onLocationSelect={(latlng) => {
                  console.log("Location selected:", latlng);
                  setLatitude(latlng.lat);
                  setLongitude(latlng.lng);
                }}
              />
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button type="button" style={styles.submitBtn} onClick={handleConfirmMapLocation}>
                  Confirm Location
                </button>
                <button type="button" style={styles.cancelBtn} onClick={closeMapModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Provided styles
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    animation: "fadeIn 1s ease-in-out",
  },
  dashboardContainer: {
    borderRadius: "16px",
    padding: "40px",
    width: "90%",
    maxWidth: "1200px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  heading: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: "bold",
  },
  newListingBtn: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#F76B1C",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  nav: {
    position: "relative",
    display: "flex",
    borderBottom: "1px solid #ccc",
    marginBottom: "30px",
  },
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "color 0.3s ease, transform 0.3s ease",
  },
  underline: {
    position: "absolute",
    bottom: "0",
    height: "2px",
    backgroundColor: "#F76B1C",
    transition: "left 0.3s ease, width 0.3s ease",
  },
  content: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    minHeight: "300px",
  },
  hr: {
    margin: "20px 0",
    border: "none",
    borderTop: "1px solid #ccc",
  },
  themeToggleContainer: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  themeToggleBtn: {
    marginTop: "10px",
    padding: "8px 16px",
    fontSize: "0.9rem",
    backgroundColor: "#5563DE",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    background: "#fff",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "5px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "none",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  submitBtn: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#5563DE",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ddd",
    color: "#333",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  smallBtn: {
    padding: "8px 12px",
    fontSize: "0.9rem",
    backgroundColor: "#5563DE",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  mapModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  mapModalContent: {
    background: "#fff",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
};

export default Dashboard;