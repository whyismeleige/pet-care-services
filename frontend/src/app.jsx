import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./login-page";
import RegisterPage from "./register-page";
import DashboardPage from "./dashboard-page";
import MyLogsPage from "./my-logs-page";
import CreateLogPage from "./create-log-page";
import EditLogPage from "./edit-log-page";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("http://localhost:8080/api/auth/profile", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage user={user} setUser={setUser} />} />
      
      <Route
        path="/login"
        element={user ? <Navigate to="/my-logs" /> : <LoginPage setUser={setUser} />}
      />
      
      <Route
        path="/register"
        element={user ? <Navigate to="/my-logs" /> : <RegisterPage setUser={setUser} />}
      />
      
      <Route
        path="/my-logs"
        element={user ? <MyLogsPage user={user} setUser={setUser} /> : <Navigate to="/login" />}
      />
      
      <Route
        path="/create-log"
        element={user ? <CreateLogPage user={user} setUser={setUser} /> : <Navigate to="/login" />}
      />
      
      <Route
        path="/edit-log/:id"
        element={user ? <EditLogPage user={user} setUser={setUser} /> : <Navigate to="/login" />}
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}