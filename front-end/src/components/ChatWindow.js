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
        .eq("user_id", userId)
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
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle favorite toggle: if currently not favorited, insert a favorite row.
  // Otherwise, delete the favorite record.
  const handleFavorite = async () => {
    const newFavoriteState = !favorited;
    if (newFavoriteState) {
      // Add favorite using listing_id instead of listing_title.
      const { data, error } = await supabase
        .from("favorites")
        .insert([{ user_id: userId, listing_id: listingId }], {
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
        .eq("user_id", userId)
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
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h4 style={styles.productTitle}>{productTitle}</h4>
          </div>
          <div style={styles.headerRight}>
            <button onClick={handleFavorite} style={styles.favoriteButton}>
              {favorited ? "★ Favorited" : "☆ Favorite"}
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>
        </div>
        <div style={styles.messageContainer} ref={messageContainerRef}>
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: "flex",
    gap: "0.5rem",
  },
  productTitle: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#333",
  },
  favoriteButton: {
    border: "none",
    background: "transparent",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#FFA500",
    padding: "0.3rem 0.5rem",
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
    margin: "5px 0",
    fontSize: "1rem",
  },
  timestamp: {
    fontSize: "0.7rem",
    color: "#888",
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