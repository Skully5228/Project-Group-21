import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ChatWindow from "./ChatWindow";

const MessagesTab = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Fetch conversation summaries for the logged-in user.
  // (Replace this effect with a real fetch once you have the endpoint.)
  useEffect(() => {
    // Uncomment and modify when your backend provides conversation data:
    /*
    fetch(`http://localhost:3000/api/conversations?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations);
      })
      .catch((err) => console.error("Error fetching conversations:", err));
    */

    // For now, use dummy data:
    setConversations([
      {
        listingId: 1,
        productTitle: "Vintage Bicycle",
        lastMessage: "Hi, is it still available?",
        timestamp: new Date().toISOString(),
        sellerId: 2,
      },
      {
        listingId: 4,
        productTitle: "Laptop",
        lastMessage: "When can I pick it up?",
        timestamp: new Date().toISOString(),
        sellerId: 3,
      },
    ]);
  }, [user.id]);

  // Render the ChatWindow if a conversation is selected.
  if (selectedConversation) {
    return (
      <ChatWindow
        listingId={selectedConversation.listingId}
        sellerId={selectedConversation.sellerId}
        productTitle={selectedConversation.productTitle}
        onClose={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div style={messagesStyles.container}>
      <h3 style={messagesStyles.title}>Your Conversations</h3>
      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        <ul style={messagesStyles.list}>
          {conversations.map((conv) => (
            <li
              key={conv.listingId}
              style={messagesStyles.listItem}
              onClick={() => setSelectedConversation(conv)}
            >
              <h4 style={messagesStyles.productTitle}>{conv.productTitle}</h4>
              <p style={messagesStyles.lastMessage}>{conv.lastMessage}</p>
              <small style={messagesStyles.timestamp}>
                {new Date(conv.timestamp).toLocaleString()}
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