// src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    alert("You have been successfully logged out.");
    navigate("/"); // Redirect to home after logout
  };

  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <h1 style={styles.logo}>Marketplace</h1>
        <nav style={styles.nav}>
          <Link style={styles.link} to="/">Home</Link>
          <Link style={styles.link} to="/dashboard">Dashboard</Link>
          {user ? (
            <button onClick={handleSignOut} style={styles.button}>
              Logout
            </button>
          ) : (
            <Link style={styles.link} to="/login">Login</Link>
          )}
        </nav>
      </div>
      {user && (
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            Hello, {user.name || user.email}
          </span>
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    padding: "10px 20px",
    backgroundColor: "#5563DE",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    margin: 0,
    fontSize: "1.8rem",
  },
  nav: {
    display: "flex",
    alignItems: "center",
  },
  link: {
    margin: "0 10px",
    textDecoration: "none",
    fontSize: "1rem",
    color: "#fff",
  },
  button: {
    margin: "0 10px",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "transparent",
    border: "1px solid #fff",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  userInfo: {
    marginTop: "8px",
    textAlign: "right",
  },
  userName: {
    fontSize: "1rem",
    fontWeight: "bold",
  },
};

export default Header;