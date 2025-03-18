import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Interface for user data
export interface User {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  role?: string;
  userType?: string;
}

// Interface for login response
export interface LoginResponse {
  token: string;
  user?: User;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  // Login user
  login: async (userName: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post("/auth/login", {
        userName,
        password,
      });

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("auth_token");

      // Optional: Call logout API if needed
      // await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    return !!token;
  },

  // Get current user info
  getCurrentUser: (): User | null => {
    const userInfo = localStorage.getItem("user_info");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Get auth token
  getToken: (): string | null => {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  },
};

export default authService;
