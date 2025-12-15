import { API_BASE_URL } from './constants';
import type {
  ApiResponse,
  Book,
  LoginFormData,
  TwoFactorFormData,
  SignUpFormData,
  ProfileFormData,
  User,
  Cart,
  CartItem,
  Wishlist,
  Order,
  CreateOrderFormData,
  Shipment,
  CreateBookFormData,
  PaginatedResponse,
  LoginResponse,
} from '@/types';

// Helper function to get auth headers
const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// ==================== Authentication APIs ====================

export const loginUser = async (payload: LoginFormData): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse<LoginResponse>(response);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const verify2FA = async (payload: TwoFactorFormData): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse<LoginResponse>(response);
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    throw error;
  }
};

export const signUpUser = async (payload: SignUpFormData): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse<LoginResponse>(response);
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const getUserProfile = async (token?: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ user: User }>(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  payload: ProfileFormData,
  token?: string
): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    return await handleResponse<{ user: User }>(response);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// ==================== Cart APIs ====================

export const getCart = async (token?: string): Promise<ApiResponse<Cart>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/cart`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<Cart>(response);
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (
  item: { bookId: string; name: string; price: number; quantity: number },
  token?: string
): Promise<ApiResponse<Cart>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(item),
    });
    return await handleResponse<Cart>(response);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (
  itemId: string,
  quantity: number,
  token?: string
): Promise<ApiResponse<Cart>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/cart/update/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ quantity }),
    });
    return await handleResponse<Cart>(response);
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (
  itemId: string,
  token?: string
): Promise<ApiResponse<Cart>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/cart/remove/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<Cart>(response);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (token?: string): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// ==================== Wishlist APIs ====================

export const getWishlist = async (token?: string): Promise<ApiResponse<Wishlist>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/wishlist`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<Wishlist>(response);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (
  item: { bookId: string; name: string; price: number },
  token?: string
): Promise<ApiResponse<Wishlist>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/wishlist/add`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(item),
    });
    return await handleResponse<Wishlist>(response);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (
  itemId: string,
  token?: string
): Promise<ApiResponse<Wishlist>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/wishlist/remove/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<Wishlist>(response);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const moveWishlistToCart = async (
  itemId: string,
  token?: string
): Promise<ApiResponse<{ cart: Cart; wishlist: Wishlist }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/wishlist/move-to-cart/${itemId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ cart: Cart; wishlist: Wishlist }>(response);
  } catch (error) {
    console.error('Error moving wishlist item to cart:', error);
    throw error;
  }
};

// ==================== Order APIs ====================

export const getUserOrders = async (token?: string): Promise<ApiResponse<{ orders: Order[] }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/orders`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ orders: Order[] }>(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderHistory = async (
  page: number = 1,
  limit: number = 10,
  token?: string
): Promise<ApiResponse<PaginatedResponse<Order>>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/orders/history?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );
    return await handleResponse<PaginatedResponse<Order>>(response);
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
};

export const createOrder = async (
  payload: CreateOrderFormData,
  token?: string
): Promise<ApiResponse<{ order: Order }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/orders`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    return await handleResponse<{ order: Order }>(response);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrderDetails = async (
  orderId: string,
  token?: string
): Promise<ApiResponse<{ order: Order }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ order: Order }>(response);
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// ==================== Book APIs ====================

export const getBooks = async (
  params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  token?: string
): Promise<ApiResponse<PaginatedResponse<Book>>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/api/books/books${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
      cache: 'no-store',
    });
    return await handleResponse<PaginatedResponse<Book>>(response);
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const searchBooks = async (
  query: string,
  category?: string,
  token?: string
): Promise<ApiResponse<{ query: string; results: Book[]; totalResults: number }>> => {
  try {
    const queryParams = new URLSearchParams({ q: query });
    if (category) queryParams.append('category', category);

    const response = await fetch(`${API_BASE_URL}/api/books/books/search?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ query: string; results: Book[]; totalResults: number }>(response);
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookDetails = async (
  bookId: string,
  token?: string
): Promise<ApiResponse<{ book: Book }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/books/books/${bookId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ book: Book }>(response);
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

export const createBook = async (
  payload: CreateBookFormData,
  token?: string
): Promise<ApiResponse<{ book: Book }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/books/books`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    return await handleResponse<{ book: Book }>(response);
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

export const updateBook = async (
  bookId: string,
  payload: Partial<CreateBookFormData>,
  token?: string
): Promise<ApiResponse<{ book: Book }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/books/books/${bookId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    return await handleResponse<{ book: Book }>(response);
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

export const updateBookStock = async (
  bookId: string,
  quantity: number,
  operation: 'add' | 'subtract',
  token?: string
): Promise<ApiResponse<{ book: Book }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/books/books/${bookId}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ quantity, operation }),
    });
    return await handleResponse<{ book: Book }>(response);
  } catch (error) {
    console.error('Error updating book stock:', error);
    throw error;
  }
};

// ==================== Shipping APIs ====================

export const trackShipment = async (
  trackingNumber: string,
  token?: string
): Promise<ApiResponse<Shipment>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shipping/track/${trackingNumber}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<Shipment>(response);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
};

// ==================== Admin APIs ====================

export const getAdminDashboard = async (
  token?: string
): Promise<ApiResponse<{ stats: any; recentUsers: User[] }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ stats: any; recentUsers: User[] }>(response);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
};

export const getAllUsers = async (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'user' | 'admin';
  },
  token?: string
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const url = `${API_BASE_URL}/api/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<PaginatedResponse<User>>(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserDetails = async (
  userId: string,
  token?: string
): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return await handleResponse<{ user: User }>(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const updateUserStatus = async (
  userId: string,
  isActive: boolean,
  token?: string
): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ isActive }),
    });
    return await handleResponse<{ user: User }>(response);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// ==================== Health Check APIs ====================

export const checkHealth = async (service?: 'orders' | 'books' | 'shipping'): Promise<any> => {
  try {
    const endpoint = service ? `/api/${service}/health` : '/health';
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(`Error checking ${service || 'gateway'} health:`, error);
    throw error;
  }
};

// ==================== Legacy Support (for backward compatibility) ====================

export const isLoginValid = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const profileBuild = async (
  username: string,
  payload: any
): Promise<ApiResponse<any>> => {
  console.warn('profileBuild is deprecated. Use updateUserProfile instead.');
  return updateUserProfile(payload);
};

export const getProfile = async (username: string): Promise<ApiResponse<any>> => {
  console.warn('getProfile is deprecated. Use getUserProfile instead.');
  return getUserProfile();
};

export const uploadBook = async (formData: FormData): Promise<ApiResponse<any>> => {
  console.warn('uploadBook with FormData is deprecated. Use createBook with JSON payload instead.');
  try {
    const response = await fetch(`${API_BASE_URL}/books/uploadBook`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading book:', error);
    throw error;
  }
};
