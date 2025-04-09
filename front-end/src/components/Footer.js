import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Marketplace. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#F76B1C",
    color: "#fff",
    padding: "10px 20px",
    textAlign: "center",
    marginTop: "20px",
  },
};

export default Footer;
