import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle specific error status codes
      switch (response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          break;
        case 403:
          // Forbidden
          toast({
            title: "Access Denied",
            description: "You don't have permission to perform this action",
            variant: "destructive",
          });
          break;
        case 404:
          // Not found
          toast({
            title: "Not Found",
            description: "The requested resource was not found",
            variant: "destructive",
          });
          break;
        case 500:
          // Server error
          toast({
            title: "Server Error",
            description: "Something went wrong on the server",
            variant: "destructive",
          });
          break;
        default:
          // Other errors
          toast({
            title: "Error",
            description: response.data?.message || "An error occurred",
            variant: "destructive",
          });
      }
    } else {
      // Network error
      toast({
        title: "Network Error",
        description: "Unable to connect to the server",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

// API service functions
export const accountService = {
  // Get all accounts with pagination and filters
  getAccounts: (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) => api.get("/accounts", { params }),

  // Get account by ID
  getAccount: (id: string) => api.get(`/accounts/${id}`),

  // Update account
  updateAccount: (id: string, data: any) => api.put(`/accounts/${id}`, data),

  // Delete account
  deleteAccount: (id: string) => api.delete(`/accounts/${id}`),

  // Get pending accounts for approval
  getPendingAccounts: (params: { page?: number; limit?: number }) =>
    api.get("/accounts/pending", { params }),

  // Approve account
  approveAccount: (id: string) => api.post(`/accounts/${id}/approve`),

  // Reject account
  rejectAccount: (id: string, reason: string) =>
    api.post(`/accounts/${id}/reject`, { reason }),

  // Get agents eligible for upgrade
  getUpgradeEligibleAgents: (params: { page?: number; limit?: number }) =>
    api.get("/accounts/agents/eligible-upgrade", { params }),

  // Upgrade agent level
  upgradeAgentLevel: (id: string) => api.post(`/accounts/agents/${id}/upgrade`),
};

export default api;
