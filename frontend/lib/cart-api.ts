import { apiClient } from './api';
import {
  Cart,
  Wishlist,
  AddToCartRequest,
  UpdateCartItemRequest,
  AddToWishlistRequest,
  Order,
  OrdersResponse,
  CreateOrderRequest,
} from '@/types';

export const cartApi = {
  // Cart operations
  getCart: async (): Promise<Cart> => {
    return apiClient.get<Cart>('/api/orders/cart');
  },

  addToCart: async (item: AddToCartRequest): Promise<void> => {
    return apiClient.post<void>('/api/orders/cart/add', item);
  },

  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<void> => {
    return apiClient.put<void>(`/api/orders/cart/update/${itemId}`, data);
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/orders/cart/remove/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    return apiClient.delete<void>('/api/orders/cart/clear');
  },

  // Wishlist operations
  getWishlist: async (): Promise<Wishlist> => {
    return apiClient.get<Wishlist>('/api/orders/wishlist');
  },

  addToWishlist: async (item: AddToWishlistRequest): Promise<void> => {
    return apiClient.post<void>('/api/orders/wishlist/add', item);
  },

  removeFromWishlist: async (itemId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/orders/wishlist/remove/${itemId}`);
  },

  moveWishlistToCart: async (itemId: string): Promise<void> => {
    return apiClient.post<void>(`/api/orders/wishlist/move-to-cart/${itemId}`);
  },

  // Order operations
  getOrders: async (): Promise<{ orders: Order[] }> => {
    return apiClient.get<{ orders: Order[] }>('/api/orders/orders');
  },

  getOrderHistory: async (page = 1, limit = 10): Promise<OrdersResponse> => {
    return apiClient.get<OrdersResponse>(`/api/orders/orders/history?page=${page}&limit=${limit}`);
  },

  createOrder: async (orderData: CreateOrderRequest): Promise<{ order: Order }> => {
    return apiClient.post<{ order: Order }>('/api/orders/orders', orderData);
  },

  getOrder: async (orderId: string): Promise<{ order: Order }> => {
    return apiClient.get<{ order: Order }>(`/api/orders/orders/${orderId}`);
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    return apiClient.get('/api/orders/health');
  },
};