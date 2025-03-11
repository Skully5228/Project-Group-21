import React, { createContext, useState } from "react";

export const AuthContext = createContext({
  user: null,
  signIn: () => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }) => {
  // For demonstration, we'll simply treat a non-null user as "logged in."
  const [user, setUser] = useState(null);

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
