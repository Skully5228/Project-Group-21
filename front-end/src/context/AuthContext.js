// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";

// Create the context for authentication.
const AuthContext = createContext();

// AuthProvider that holds the user state.
// Note: The initial state is null.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Call this after a successful OAuth login.
  const signIn = (userData) => {
    setUser(userData);
  };

  // Resets the user to null on sign out.
  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the auth context.
export const useAuth = () => useContext(AuthContext);

// Export AuthContext as both a named export and a default export.
export { AuthContext };
export default AuthContext;