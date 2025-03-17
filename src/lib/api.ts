import axios from "axios";
import { toast } from "sonner";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
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
          toast.error("Bạn không có quyền thực hiện hành động này");
          break;
        case 404:
          // Not found
          toast.error("Không tìm thấy tài nguyên yêu cầu");
          break;
        case 500:
          // Server error
          toast.error("Đã xảy ra lỗi từ máy chủ");
          break;
        default:
          // Other errors
          toast.error(response.data?.message || "Đã xảy ra lỗi");
      }
    } else {
      // Network error
      toast.error("Không thể kết nối đến máy chủ");
    }

    return Promise.reject(error);
  }
);

// Helper function to transform user data from API to our application format
interface User {
  userId: string | number;
  username: string;
  email: string;
  password: string;
  type: "EMPLOYEE" | "AGENT";
  phone: string;
  status: boolean;
}

const transformUserData = (user: User) => {
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    userType: user.type === "AGENT" ? "agent" : "staff",
    status: user.status ? "active" : "pending",
    phone: user.phone,
  };
};

// API service functions
export const accountService = {
  // Get all accounts with pagination and filters
  getAccounts: async (params: { page?: number; limit?: number }) => {
    const response = await api.get("/user", { params });
    const accounts = Array.isArray(response.data.items)
      ? response.data.items.map((user) => transformUserData(user))
      : [];
    return {
      data: accounts,
      totalItems: response.data.totalItems,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
    };
  },

  // Update account
  updateAccount: (id: string, data: any) => {
    // Transform our application data back to API format
    const apiData = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      userType: data.type === "agent" ? "AGENCY" : "EMPLOYEE",
      fullName: data.fullName,
      position: data.position,
      department: data.department,
      agencyName: data.agencyName,
      street: data.address?.street,
      wardName: data.address?.ward,
      districtName: data.address?.district,
      provinceName: data.address?.province,
      isApproved: data.status === "active",
    };
    return api.put(`/api/auth/${id}`, apiData);
  },

  // Delete account
  deleteAccount: (id: string) => api.delete(`/api/user/${id}`),

  // Get pending accounts for approval
  getPendingAccounts: async (params: { page?: number; limit?: number }) => {
    // Fetch all accounts and filter for pending ones if needed
    const response = await api.get("/api/auth");

    // Return all accounts since we don't have a specific endpoint for pending accounts
    return {
      data: {
        accounts: Array.isArray(response.data)
          ? response.data
          : [response.data],
        totalPages: 1,
        currentPage: 1,
      },
    };
  },

  // Approve account
  approveAccount: (id: string) => api.post(`/api/auth/${id}/approve`),

  // Reject account
  rejectAccount: (id: string, reason: string) =>
    api.post(`/api/auth/${id}/reject`, { reason }),

  // Get agents eligible for upgrade
  getUpgradeEligibleAgents: async (params: {
    page?: number;
    limit?: number;
  }) => {
    // Fetch all accounts and filter for AGENCY type
    const response = await api.get("/api/auth");

    let agents = [];

    if (Array.isArray(response.data)) {
      agents = response.data
        .filter((user: any) => user.userType === "AGENCY")
        .map((user: any) => ({
          id: user.registerId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          agentLevel: 2,
          status: "active",
          phone: user.phone,
          agencyName: user.agencyName,
          address: {
            street: user.street,
            ward: user.wardName,
            district: user.districtName,
            province: user.provinceName,
          },
          performance: {
            salesVolume: Math.floor(Math.random() * 10000000) + 1000000, // Random sales volume
            customerRating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
            monthsActive: Math.floor(Math.random() * 24) + 6, // Random months between 6-30
          },
        }));
    } else if (response.data && response.data.userType === "AGENCY") {
      // If only one user is returned and it's an AGENCY
      const user = response.data;
      agents = [
        {
          id: user.registerId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          agentLevel: 2,
          status: "active",
          phone: user.phone,
          agencyName: user.agencyName,
          address: {
            street: user.street,
            ward: user.wardName,
            district: user.districtName,
            province: user.provinceName,
          },
          performance: {
            salesVolume: Math.floor(Math.random() * 10000000) + 1000000,
            customerRating: (Math.random() * 2 + 3).toFixed(1),
            monthsActive: Math.floor(Math.random() * 24) + 6,
          },
        },
      ];
    }

    return {
      data: {
        agents,
        totalPages: 1,
        currentPage: 1,
      },
    };
  },

  // Upgrade agent level
  upgradeAgentLevel: (id: string) => api.post(`/api/auth/agents/${id}/upgrade`),
};

export default api;
