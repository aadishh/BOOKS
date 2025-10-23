import { apiClient } from './api';
import {
  AdminDashboard,
  User,
  UserStats,
  PaginationInfo,
  Cart,
  Wishlist,
  Order,
} from '@/types';

export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<AdminDashboard> => {
    return apiClient.get<AdminDashboard>('/api/admin/dashboard');
  },

  // User management
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: User[];
    pagination: PaginationInfo;
  }> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(url);
  },

  getUser: async (userId: string): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>(`/api/admin/users/${userId}`);
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{ user: User }> => {
    return apiClient.put<{ user: User }>(`/api/admin/users/${userId}/status`, { isActive });
  },

  // User statistics and data
  getUserStats: async (): Promise<{ totalUsers: number; userStats: UserStats[] }> => {
    return apiClient.get('/api/orders/admin/users/stats');
  },

  getUserCart: async (userId: string): Promise<Cart> => {
    return apiClient.get<Cart>(`/api/orders/admin/users/${userId}/cart`);
  },

  getUserWishlist: async (userId: string): Promise<Wishlist> => {
    return apiClient.get<Wishlist>(`/api/orders/admin/users/${userId}/wishlist`);
  },

  getUserOrders: async (userId: string): Promise<{ orders: Order[] }> => {
    return apiClient.get<{ orders: Order[] }>(`/api/orders/admin/users/${userId}/orders`);
  },

  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: Order[];
    pagination: PaginationInfo;
  }> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/api/orders/admin/orders/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(url);
  },
};