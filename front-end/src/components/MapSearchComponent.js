// MapSearchComponent.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issues in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// This component listens for clicks and places a marker, and calls onSelectLocation
const LocationMarker = ({ onSelectLocation }) => {
  const [position, setPosition] = useState(null);
  
  // Listen to clicks on the map:
  useMapEvents({
    click(e) {
      console.log("Map clicked at:", e.latlng); // Debug log
      setPosition(e.latlng);
      onSelectLocation(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const MapSearchComponent = ({ initialPosition, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);

  // Fetch suggestions using Nominatim API, restricted to the USA.
  useEffect(() => {
    if (searchQuery.length > 2) {
      const controller = new AbortController();
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&q=${encodeURIComponent(
          searchQuery
        )}`,
        { signal: controller.signal }
      )
        .then((response) => response.json())
        .then((data) => {
          setSuggestions(data);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Geocoding error:", error);
          }
        });
      return () => controller.abort();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // When a suggestion is clicked, update position and notify parent.
  const handleSelectSuggestion = (suggestion) => {
    const newPos = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    };
    console.log("Suggestion selected:", newPos);
    setSelectedPosition(newPos);
    onLocationSelect(newPos);
    setSuggestions([]);
    setSearchQuery(suggestion.display_name);
  };

  return (
    <div>
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              background: "#fff",
              border: "1px solid #ccc",
              maxHeight: "200px",
              overflowY: "auto",
              position: "absolute",
              zIndex: 1000,
              width: "calc(100% - 16px)",
            }}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapContainer
        center={selectedPosition}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={selectedPosition} />
        <LocationMarker onSelectLocation={onLocationSelect} />
      </MapContainer>
    </div>
  );
};

export default MapSearchComponent;
