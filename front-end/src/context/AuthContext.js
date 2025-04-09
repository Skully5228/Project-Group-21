import React, { createContext, useState } from "react";

// Dummy user for testing.
// Remove or modify this when integrating real OAuth.
const dummyUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  // You can add any additional fields you expect from the OAuth provider,
  // for example: picture: "https://example.com/profile.jpg"
};

export const AuthContext = createContext({
  user: null,
  signIn: () => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }) => {
  // For testing, start with the dummyUser so that you're "logged in"
  const [user, setUser] = useState(dummyUser);

  const signIn = (userData) => {
    setUser(userData);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
