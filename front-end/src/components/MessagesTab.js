import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ChatWindow from "./ChatWindow";
import { supabase } from "./supabase";

const MessagesTab = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, listing: listings(*)")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      if (data) {
        const convMap = new Map();
        data.forEach((msg) => {
          if (!convMap.has(msg.listing_id)) {
            convMap.set(msg.listing_id, msg);
          }
        });
        setConversations(Array.from(convMap.values()));
      }
    };

    fetchConversations();
  }, [user]);

  if (!user) {
    return (
      <div style={messagesStyles.container}>
        <h3 style={messagesStyles.title}>Your Conversations</h3>
        <p>No Conversations yet.</p>
      </div>
    );
  }


  if (selectedConversation) {
    const otherPartyId =
      selectedConversation.sender_id === user.id
        ? selectedConversation.recipient_id
        : selectedConversation.sender_id;

    const productTitle =
      selectedConversation.listing && selectedConversation.listing.title
        ? selectedConversation.listing.title
        : `Listing ${selectedConversation.listing_id}`;

    return (
      <ChatWindow
        listingId={selectedConversation.listing_id}
        sellerId={otherPartyId}
        productTitle={productTitle}
        onClose={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div style={messagesStyles.container}>
      <h3 style={messagesStyles.title}>Your Conversations</h3>
      {conversations.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul style={messagesStyles.list}>
          {conversations.map((conv) => (
            <li
              key={conv.listing_id}
              style={messagesStyles.listItem}
              onClick={() => setSelectedConversation(conv)}
            >
              <h4 style={messagesStyles.productTitle}>
                {conv.listing && conv.listing.title
                  ? conv.listing.title
                  : `Listing ${conv.listing_id}`}
              </h4>
              <p style={messagesStyles.lastMessage}>{conv.context}</p>
              <small style={messagesStyles.timestamp}>
                {new Date(conv.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const messagesStyles = {
  container: {
    padding: "20px",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "20px",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    padding: "15px",
    borderBottom: "1px solid #ddd",
    marginBottom: "10px",
    cursor: "pointer",
  },
  productTitle: {
    margin: 0,
    fontSize: "1.2rem",
  },
  lastMessage: {
    margin: "5px 0",
    color: "#555",
  },
  timestamp: {
    fontSize: "0.8rem",
    color: "#888",
  },
};

export default MessagesTab;