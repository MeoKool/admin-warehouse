import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Interface for account data
export interface Account {
  userId: string; // Unique identifier for the user
  username: string; // Username of the account
  email: string; // Email address
  password: string; // Password
  userType: "EMPLOYEE" | "AGENT"; // Type of user
  phone: string; // Phone number
  status: boolean; // Active or inactive status
  fullName: string;
  agencyName: string;
  street: string;
  wardName: string;
  districtName: string;
  provinceName: string;
}

// Interface for paginated account response
export interface AccountResponse {
  items: Account[]; // List of accounts
  totalItems: number; // Total number of items
  totalPages: number; // Total number of pages
  currentPage: number; // Current page
}

// Interface for query parameters
export interface AccountParams {
  page?: number; // Page number
  limit?: number; // Number of items per page
  search?: string; // Search query
  type?: string; // Filter by user type
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
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

export const accountService = {
  // Get paginated accounts
  getAccounts: async (params: AccountParams = {}): Promise<AccountResponse> => {
    try {
      const response = await api.get("/user", {
        params: {
          page: params.page || 1,
          limit: params.limit || 100, // Get more items to handle client-side filtering
          search: params.search || "",
          type: params.type || "",
        },
      });

      // Handle different response formats
      if (response.data.items) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data,
          totalItems: response.data.length,
          totalPages: 1,
          currentPage: 1,
        };
      } else {
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
        };
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  },

  // Get account details by ID
  getAccount: async (id: string): Promise<Account> => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching account with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new account
  createAccount: async (accountData: Partial<Account>): Promise<Account> => {
    try {
      const response = await api.post("/user", accountData);
      return response.data;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  },

  // Update account information
  updateAccount: async (
    id: string,
    accountData: Partial<Account>
  ): Promise<Account> => {
    try {
      const response = await api.put(`/user/${id}`, accountData);
      return response.data;
    } catch (error) {
      console.error(`Error updating account with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an account
  deleteAccount: async (id: string): Promise<void> => {
    try {
      await api.delete(`/user/${id}`);
    } catch (error) {
      console.error(`Error deleting account with ID ${id}:`, error);
      throw error;
    }
  },

  // Toggle account status (activate/deactivate)
  toggleAccountStatus: async (
    id: string,
    active: boolean
  ): Promise<Account> => {
    try {
      const response = await api.patch(`/user/${id}/status`, {
        status: active,
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling status for account with ID ${id}:`, error);
      throw error;
    }
  },

  // Reset account password
  resetPassword: async (id: string): Promise<{ newPassword: string }> => {
    try {
      const response = await api.post(`/user/${id}/reset-password`);
      return response.data;
    } catch (error) {
      console.error(
        `Error resetting password for account with ID ${id}:`,
        error
      );
      throw error;
    }
  },

  // Change account password
  changePassword: async (
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await api.post(`/user/${id}/change-password`, {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.error(
        `Error changing password for account with ID ${id}:`,
        error
      );
      throw error;
    }
  },
};

export default accountService;
