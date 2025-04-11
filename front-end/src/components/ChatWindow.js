import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase"; // Ensure this is your frontend supabase client
import { AuthContext } from "../context/AuthContext"; // Adjust the path if needed

const ChatWindow = ({ listingId, sellerId, productTitle, onClose, onFavorite }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Always call all hooks unconditionally.
  useEffect(() => {
    if (!user) {
      // If no user is authenticated, redirect to the login page.
      navigate("/login");
    }
  }, [user, navigate]);

  // Even if user is null, we define userId as null so that hooks are still called.
  const userId = user ? user.id : null;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const messageContainerRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    if (!userId) return; // Guard: exit effect if userId is not available.
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .in("sender_id", [userId, sellerId])
        .in("recipient_id", [userId, sellerId])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
      }
    }
    fetchMessages();
  }, [listingId, sellerId, userId]);

  // Auto-scroll to bottom on messages change.
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch favorite status from the database.
  useEffect(() => {
    if (!userId) return;
    async function fetchFavorites() {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId);
      
      if (error) {
        console.error("Error fetching favorites:", error);
      } else if (data) {
        const exists = data.some((fav) => fav.listing_id === listingId);
        setIsFavorited(exists);
      }
    }
    fetchFavorites();
  }, [listingId, userId]);

  // Handle sending a message.
  const handleSendMessage = async () => {
    if (!userId) {
      alert("Please log in.");
      return;
    }

    if (userId === sellerId) {
      alert("You can't message yourself.");
      return;
    }
    
    if (!newMessage.trim()) return;

    const message = {
      listing_id: listingId,
      sender_id: userId,
      recipient_id: sellerId,
      content: newMessage,
    };

    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .single();

    if (error) {
      console.error("Error sending message:", error);
      // Optimistic update on error.
      const optimisticMessage = {
        ...message,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    } else {
      setMessages((prevMessages) => [...prevMessages, data]);
    }
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle favorite status in the database.
  const handleFavoriteToggle = async () => {
    if (!userId) return;
    const newState = !isFavorited;
    setIsFavorited(newState);
    console.log("Favorite toggled. New state:", newState);

    if (newState) {
      const { data, error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, listing_id: listingId });
      
      if (error) {
        console.error("Error adding favorite:", error);
      } else {
        console.log("Favorite added:", data);
      }
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
      
      if (error) {
        console.error("Error removing favorite:", error);
      } else {
        console.log("Favorite removed:", data);
      }
    }

    if (onFavorite) {
      onFavorite({ id: listingId, description: productTitle }, newState);
    }
  };

  // If user is not available, show nothing (the redirect should already have been fired).
  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h4 style={styles.productTitle}>{productTitle}</h4>
            <p style={styles.headerSubtitle}>Chat with Seller</p>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={handleFavoriteToggle}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: isFavorited ? "#ffc107" : "#eee",
                color: isFavorited ? "#fff" : "#333",
                transition: "background-color 0.3s ease",
                marginRight: "10px",
              }}
            >
              {isFavorited ? "Favorited" : "Favorite"}
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>
        </div>
        <div style={styles.messageContainer} ref={messageContainerRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={
                msg.sender_id === userId
                  ? styles.messageBuyer
                  : styles.messageSeller
              }
            >
              <p style={styles.messageText}>{msg.content}</p>
              <small style={styles.timestamp}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};


const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: "#fff",
    border: "4px solid #5563DE",
    borderRadius: "6px",
    width: "400px",
    height: "500px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#f0f8ff",
    padding: "10px",
    borderBottom: "1px solid #ccc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#333",
  },
  headerSubtitle: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#555",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#333",
  },
  messageContainer: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
  },
  messageBuyer: {
    alignSelf: "flex-end",
    backgroundColor: "#5563DE",
    color: "#fff",
    padding: "8px",
    borderRadius: "12px",
    marginBottom: "10px",
    maxWidth: "70%",
  },
  messageSeller: {
    alignSelf: "flex-start",
    backgroundColor: "#FFA500",
    color: "#fff",
    padding: "8px",
    borderRadius: "12px",
    marginBottom: "10px",
    maxWidth: "70%",
  },
  messageText: {
    margin: 0,
    fontSize: "1rem",
  },
  timestamp: {
    fontSize: "0.7rem",
    color: "#ddd",
    textAlign: "right",
    marginTop: "4px",
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  sendButton: {
    padding: "8px 12px",
    marginLeft: "10px",
    border: "none",
    backgroundColor: "#5563DE",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

export default ChatWindow;