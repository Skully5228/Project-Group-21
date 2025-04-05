import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  // Use the actual Google login flow
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google OAuth successful:", tokenResponse);
      // Send the id_token from Google to your backend:
      fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenResponse.id_token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.user) {
            // If authentication is successful, update your AuthContext:
            // For instance: signIn(data.user);
            console.log("Backend auth successful:", data.user);
            navigate("/dashboard");
          } else {
            console.error("Backend authentication error:", data.error);
          }
        })
        .catch((err) => {
          console.error("Error during backend authentication:", err);
        });
    },
    onError: (errorResponse) => {
      console.error("Google OAuth error:", errorResponse);
    },
  });
  

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Marketplace</h1>
        <p style={styles.subtitle}>
          Discover local deals and connect with your community.
        </p>
        <button style={styles.button} onClick={login}>
          Login with Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #74ABE2, #5563DE)",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#333",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: "20px",
    fontSize: "1.2rem",
    color: "#555",
  },
  button: {
    padding: "12px 30px",
    fontSize: "1.1rem",
    backgroundColor: "#5563DE",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.3s ease",
  },
};

export default LoginPage;
