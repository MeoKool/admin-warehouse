import axios from "axios";
import { toast } from "sonner";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 1000,
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
          toast("You don't have permission to perform this action");
          // Forbidden

          break;
        case 404:
          // Not found
          toast("The requested resource was not found");

          break;
        case 500:
          // Server error
          toast("Something went wrong on the server");

          break;
        default:
          toast(response.data?.message || "An error occurred");

        // Other errors
      }
    } else {
      // Network error
      toast("Unable to connect to the server");
    }

    return Promise.reject(error);
  }
);

interface User {
  userId: string;
  username: string;
  email: string;
  userType: "AGENCY" | "EMPLOYEE";
  status: boolean;
  phone?: string;
}

const transformUserData = (user: User) => {
  return {
    id: user.userId,
    username: user.username,
    email: user.email,
    fullName: user.username, // Assuming fullName is not provided in the API
    type: user.userType === "AGENCY" ? "agent" : "staff",
    agentLevel: user.userType === "AGENCY" ? 2 : undefined, // Default to level 2 for agents
    status: user.status ? "active" : "inactive",
    createdAt: new Date().toISOString(), // Assuming createdAt is not provided in the API
    phone: user.phone,
  };
};

// API service functions
export const accountService = {
  // Get all accounts with pagination and filters
  getAccounts: async (params: { page?: number; limit?: number }) => {
    const response = await api.get("/user", {
      params: {
        page: params.page || 1,
        pageSize: params.limit || 10,
      },
    });

    // Transform the response to match our application's expected format
    return {
      data: {
        accounts: response.data.items.map(transformUserData),
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      },
    };
  },

  // Get account by ID
  getAccount: async (id: string) => {
    const response = await api.get(`/user/${id}`);
    return {
      data: transformUserData(response.data),
    };
  },

  // Update account
  updateAccount: (id: string, data: User) => {
    // Transform our application data back to API format
    const apiData = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      userType: data.userType,
      status: data.status,
    };
    return api.put(`/users/${id}`, apiData);
  },

  // Delete account
  deleteAccount: (id: string) => api.delete(`/users/${id}`),

  // Get pending accounts for approval
  getPendingAccounts: async (params: { page?: number; limit?: number }) => {
    // Assuming there's an endpoint for pending accounts or we need to filter from all users
    const response = await api.get("/users/pending", {
      params: {
        page: params.page || 1,
        size: params.limit || 10,
      },
    });

    // Transform the response to match our application's expected format
    return {
      data: {
        accounts: response.data.items.map((user: User) => ({
          id: user.userId,
          username: user.username,
          email: user.email,
          fullName: user.username,
          requestedType: user.userType === "AGENCY" ? "agent" : "staff",
          requestedAgentLevel: user.userType === "AGENCY" ? 2 : undefined,
          createdAt: new Date().toISOString(),
          documents: [], // Assuming documents are not provided in the API
        })),
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      },
    };
  },

  // Approve account
  approveAccount: (id: string) => api.post(`/users/${id}/approve`),

  // Reject account
  rejectAccount: (id: string, reason: string) =>
    api.post(`/users/${id}/reject`, { reason }),

  // Get agents eligible for upgrade
  getUpgradeEligibleAgents: async (params: {
    page?: number;
    limit?: number;
  }) => {
    // Assuming there's an endpoint for eligible agents or we need to filter from all users
    const response = await api.get("/users/eligible-upgrade", {
      params: {
        page: params.page || 1,
        size: params.limit || 10,
      },
    });

    // Transform the response to match our application's expected format
    return {
      data: {
        agents: response.data.items
          .filter((user: User) => user.userType === "AGENCY")
          .map((user: User) => ({
            id: user.userId,
            username: user.username,
            email: user.email,
            fullName: user.username,
            agentLevel: 2,
            status: "active",
            createdAt: new Date().toISOString(),
            performance: {
              salesVolume: Math.floor(Math.random() * 10000000) + 1000000, // Random sales volume
              customerRating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
              monthsActive: Math.floor(Math.random() * 24) + 6, // Random months between 6-30
            },
          })),
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      },
    };
  },

  // Upgrade agent level
  upgradeAgentLevel: (id: string) => api.post(`/users/agents/${id}/upgrade`),
};

export default api;
