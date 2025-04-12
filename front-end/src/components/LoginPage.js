// src/components/LoginPage.js
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import signIn from AuthContext

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Get the signIn function from our auth context
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    flow: "implicit", // Using implicit flow
    scope: "openid email profile", // Request identity info so we get an access token with user data
    responseType: "token", // Instruct Google to return an access token
    onSuccess: async (tokenResponse) => {
      console.log("Google OAuth successful:", tokenResponse);
      setLoading(true);

      // Expect an access token in the response.
      const tokenToSend = tokenResponse.access_token;
      if (!tokenToSend) {
        console.error(
          "Access token not found in tokenResponse. Please check your Google OAuth configuration."
        );
        setLoading(false);
        return;
      }
      console.log("Access token being sent:", tokenToSend);

      try {
        const response = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenToSend }),
        });
        const data = await response.json();

        if (data.user) {
          console.log("Backend auth successful:", data.user);
          // Update the AuthContext with the returned user data.
          signIn(data.user);
          navigate("/dashboard");
        } else {
          console.error("Backend authentication error:", data.error);
        }
      } catch (err) {
        console.error("Error during backend authentication:", err);
      } finally {
        setLoading(false);
      }
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
        <button style={styles.button} onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login with Google"}
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