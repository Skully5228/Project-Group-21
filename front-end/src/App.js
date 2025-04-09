import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pages that use the common layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        {/* Login page may have its own style */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;
