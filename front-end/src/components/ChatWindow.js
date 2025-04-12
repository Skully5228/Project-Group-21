<<<<<<< HEAD
import React, { useState, useEffect, useContext, useRef } from "react";
import { supabase } from "./supabase";
import { AuthContext } from "../context/AuthContext";

const ChatWindow = ({
  listingId,
  sellerId,
  productTitle,
  onClose,
  onFavorite,
}) => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [favorited, setFavorited] = useState(false);
  const messageContainerRef = useRef(null);

  // Fetch messages based on listingId, filtering by sender and recipient.
  useEffect(() => {
    if (!userId || !sellerId || !listingId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .in("sender_id", [userId, sellerId])
        .in("recipient_id", [userId, sellerId])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data) {
        console.log("Fetched messages data:", data);
        data.forEach((msg, idx) => {
          if (msg == null) {
            console.warn(`Message at index ${idx} is null.`);
          } else if (msg.sender_id == null) {
            console.warn(`Message at index ${idx} has null sender_id:`, msg);
          } else if (msg.content == null) {
            console.warn(`Message at index ${idx} has null content:`, msg);
          }
        });
        setMessages(data);
      }
    };

    fetchMessages();
  }, [listingId, sellerId, userId]);

  // Fetch favorite state for this listing when the ChatWindow mounts or changes.
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!userId || !listingId) return;
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("userId", userId)
        .eq("listing_id", listingId)
        .maybeSingle();
      if (error) {
        console.error("Error fetching favorite state:", error);
      } else {
        // If a favorite record exists, data will be non-null.
        setFavorited(!!data);
      }
    };

    fetchFavoriteStatus();
  }, [userId, listingId]);

  // Auto-scroll the chat container to the bottom when messages update.
=======
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
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

<<<<<<< HEAD
  // Function to handle sending a new message.
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const message = {
      listing_id: listingId,
      sender_id: userId,
      recipient_id: sellerId,
      content: newMessage,
    };

    // Force PostgREST to return the inserted row by chaining .select() after .insert().
    const { data, error } = await supabase
      .from("messages")
      .insert([message], { returning: "representation" })
      .select();

    if (error) {
      console.error("Error sending message:", error);
      const optimisticMessage = {
        ...message,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
    } else if (data && data.length > 0) {
      console.log("Message sent, returned data:", data[0]);
      setMessages((prev) => [...prev, data[0]]);
    } else {
      console.error(
        "Insert returned no data. This may be an issue with your Supabase configuration."
      );
    }
    setNewMessage("");
  };

=======
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
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

<<<<<<< HEAD
  // Handle favorite toggle: if currently not favorited, insert a favorite row.
  // Otherwise, delete the favorite record.
  const handleFavorite = async () => {
    const newFavoriteState = !favorited;
    if (newFavoriteState) {
      // Add favorite using listing_id instead of listing_title.
      const { data, error } = await supabase
        .from("favorites")
        .insert([{ userId: userId, listing_id: listingId }], {
          returning: "representation",
        })
        .maybeSingle();
      if (error) {
        console.error("Error adding favorite:", error);
      } else {
        setFavorited(true);
        if (onFavorite) {
          onFavorite(listingId, true);
        }
      }
    } else {
      // Remove favorite using listing_id.
      const { data, error } = await supabase
        .from("favorites")
        .delete()
        .eq("userId", userId)
        .eq("listing_id", listingId)
        .maybeSingle();
      if (error) {
        console.error("Error removing favorite:", error);
      } else {
        setFavorited(false);
        if (onFavorite) {
          onFavorite(listingId, false);
        }
      }
=======
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
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
<<<<<<< HEAD
          <div style={styles.headerLeft}>
            <h4 style={styles.productTitle}>{productTitle}</h4>
          </div>
          <div style={styles.headerRight}>
            <button onClick={handleFavorite} style={styles.favoriteButton}>
              {favorited ? "★ Favorited" : "☆ Favorite"}
=======
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
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>
        </div>
        <div style={styles.messageContainer} ref={messageContainerRef}>
<<<<<<< HEAD
          {messages.map((msg, idx) => {
            if (!msg || msg.sender_id == null) {
              console.error(`Skipping message at index ${idx} since it is invalid:`, msg);
              return null;
            }
            return (
              <div
                key={msg.id}
                style={msg.sender_id === userId ? styles.messageBuyer : styles.messageSeller}
              >
                <p style={styles.messageText}>{msg.content}</p>
                <small style={styles.timestamp}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </small>
              </div>
            );
          })}
=======
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
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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

<<<<<<< HEAD
=======



>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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
<<<<<<< HEAD
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: "flex",
    gap: "0.5rem",
  },
=======
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
  productTitle: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#333",
  },
<<<<<<< HEAD
  favoriteButton: {
    border: "none",
    background: "transparent",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#FFA500",
    padding: "0.3rem 0.5rem",
=======
  headerSubtitle: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#555",
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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
<<<<<<< HEAD
    margin: "5px 0",
=======
    margin: 0,
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
    fontSize: "1rem",
  },
  timestamp: {
    fontSize: "0.7rem",
<<<<<<< HEAD
    color: "#888",
=======
    color: "#ddd",
>>>>>>> 716e409fd67e1d2637ae53f93b4c65deef16e391
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