import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api/auth.api";
import { toast } from "react-hot-toast";

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // "Loading" handles the initial check to see if user is logged in
  const [loading, setLoading] = useState(true); 

  // --- PERSISTENCE LOGIC (Replaces Redux Persist) ---
  // On app start, we try to fetch the profile to see if a session exists
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.getProfile();
        if (response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Not logged in - that's okay, just stay on login screen
        console.log("No active session found");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // --- ACTIONS (Replaces Thunks) ---

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success("Welcome back!");
      return true; // Return success to component
    } catch (error) {
      // Error is already handled by api-client interceptor (toast), 
      // but we throw it so the form can stop the spinner
      throw error; 
    }
  };

  const register = async (credentials) => {
    try {
      const response = await authApi.register(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};