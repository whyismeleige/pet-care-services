import axios from "axios";
import toast from "react-hot-toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    
    // --- FIX START ---
    // Check if the error is from the "getProfile" call
    const isProfileCheck = error.config?.url?.includes("/auth/profile");
    
    // If it's a 401 on the profile check, it just means the user isn't logged in.
    // We don't need to show a scary red error toast for that.
    if (error.response?.status === 401 && isProfileCheck) {
      // Reject the promise so AuthContext knows it failed, but DON'T show toast
      return Promise.reject(error);
    }
    // --- FIX END ---

    toast.error(message);
    return Promise.reject({ message, ...error.response?.data });
  }
);