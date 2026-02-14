import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
      </div>
    );
  }

  // If authenticated, send them to dashboard
  // If NOT authenticated, let them see the login page (Outlet)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}