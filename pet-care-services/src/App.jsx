import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import PublicRoute from "@/components/routes/PublicRoute";

// Pages
import AuthPage from "@/pages/Auth"; // Your Login/Register page
import Dashboard from "@/pages/Dashboard"; // Create this placeholder if missing
import Home from "@/pages/Home"; // Create this placeholder if missing

export default function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (Accessible by anyone) --- */}
      <Route path="/" element={<Home />} />

      {/* --- AUTH ROUTES (Only for guests) --- */}
      {/* Wraps Login/Register. If logged in, redirects to Dashboard */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Route>

      {/* --- PROTECTED ROUTES (Only for logged in users) --- */}
      {/* If not logged in, redirects to Login */}
      {/* <Route element={<ProtectedRoute />}> */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other private routes here, e.g., /profile, /settings */}
      {/* </Route> */}

      {/* Catch-all: Redirect unknown pages to Home or 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}