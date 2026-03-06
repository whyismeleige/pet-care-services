import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./home";
import Login from "./login";
import Register from "./register";
import Dashboard from "./dashboard";
import CreateService from "./create-service";
import EditService from "./edit-service";
import ServiceList from "./service-list";
import ServiceView from "./service-view";
import Messages from "./messages";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, [location]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/services" element={<ServiceList />} />
      <Route path="/services/:id" element={<ServiceView />} />
      <Route path="/create-service" element={isLoggedIn ? <CreateService /> : <Navigate to="/login" />} />
      <Route path="/edit-service/:id" element={isLoggedIn ? <EditService /> : <Navigate to="/login" />} />
      <Route path="/messages" element={isLoggedIn ? <Messages /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}