import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // 1. Show a loading spinner while checking auth status
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
      </div>
    );
  }

  // 2. If authenticated, render the child routes (Outlet)
  // 3. If not, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}