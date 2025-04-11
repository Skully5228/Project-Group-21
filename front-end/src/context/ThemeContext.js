import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Try to load theme from localStorage; default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "Light");

  const toggleTheme = () => {
    setTheme(prev => (prev === "Light" ? "Dark" : "Light"));
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
