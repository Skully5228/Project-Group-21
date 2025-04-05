import React, { useState, useEffect, useRef } from "react";

const ChatWindow = ({ listingId, sellerId, productTitle, onClose, onFavorite }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const messageContainerRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    fetch(`http://localhost:3000/api/messages?listingId=${listingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [listingId]);

  // Auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // On mount, fetch favorite status from the backend and update local state.
  useEffect(() => {
    const userId = 1; // For testing purposes; replace with actual user ID.
    fetch(`http://localhost:3000/api/favorites?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.favorites) {
          // Check if the current listing exists in the favorites
          const exists = data.favorites.some((fav) => fav.id === listingId);
          setIsFavorited(exists);
        }
      })
      .catch((err) => console.error("Error fetching favorites:", err));
  }, [listingId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    fetch("http://localhost:3000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        recipientId: sellerId,
        content: newMessage,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const newMsg =
          data.chatMessage || {
            id: Date.now(),
            sender_id: 1, // hardcoded for testing
            content: newMessage,
            created_at: new Date().toISOString(),
          };
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        setNewMessage("");
      })
      .catch((err) => {
        console.error("Error sending message:", err);
        const newMsg = {
          id: Date.now(),
          sender_id: 1,
          content: newMessage,
          created_at: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        setNewMessage("");
      });
  };

  // Allow sending message with Enter key.
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle favorite status and persist it to the database.
  const handleFavoriteToggle = () => {
    const newState = !isFavorited;
    setIsFavorited(newState);
    console.log("Favorite toggled. New state:", newState);

    // Hardcoded userId; in production obtain this from auth context or props.
    const userId = 1;
    if (newState) {
      // Add favorite using POST /api/favorites.
      fetch("http://localhost:3000/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, listingId }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Favorite added:", data))
        .catch((err) => console.error("Error adding favorite:", err));
    } else {
      // Remove favorite using DELETE /api/favorites.
      fetch("http://localhost:3000/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, listingId }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Favorite removed:", data))
        .catch((err) => console.error("Error removing favorite:", err));
    }

    // Optionally notify the parent if a callback is provided.
    if (onFavorite) {
      onFavorite({ id: listingId, description: productTitle }, newState);
    }
  };

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
                msg.sender_id === 1 ? styles.messageBuyer : styles.messageSeller
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