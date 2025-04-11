import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useContext(AuthContext);

  const handleSignOut = () => {
    signOut();
    navigate("/"); 
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.logo}>Online Marketplace</h1>
      <nav>
        <Link className="header-link" style={styles.link} to="/">
          Home
        </Link>
        <Link className="header-link" style={styles.link} to="/dashboard">
          Dashboard
        </Link>
        {user ? (
          <button onClick={handleSignOut} style={styles.button}>
            Sign Out
          </button>
        ) : (
          <Link className="header-link" style={styles.link} to="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    padding: "10px 20px",
    backgroundColor: "#5563DE",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff",
  },
  logo: {
    margin: 0,
    fontSize: "1.8rem",
  },
  link: {
    margin: "0 10px",
    textDecoration: "none",
    fontSize: "1rem",
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
};

export default Header;
