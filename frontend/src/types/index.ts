// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  twoFactorEnabled?: boolean;
  isActive?: boolean;
  createdAt?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

// Toast Types
export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO';

export interface GlobalContextType {
  updateCustomToast: (toastType: ToastType, toastText: string) => void;
  showCustomToast: boolean;
  toastType: ToastType;
  toastText: string;
  hideToast: () => void;
  setShowCustomToast: (show: boolean) => void;
}

// Book Types
export interface Book {
  id: string;
  name: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  rating?: number;
  reviews?: number;
  isbn?: string;
  pages?: number;
  publisher?: string;
  publishedDate?: string;
  tags?: string[];
  image?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  bookId: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  cart: CartItem[];
  total: number;
  updatedAt: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  bookId: string;
  name: string;
  price: number;
  addedAt: string;
}

export interface Wishlist {
  wishlist: WishlistItem[];
  updatedAt: string;
}

// Order Types
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Shipment Types
export interface TrackingEvent {
  status: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface Shipment {
  trackingNumber: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  estimatedDelivery: string;
  shippingAddress: ShippingAddress;
  trackingEvents: TrackingEvent[];
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface TwoFactorFormData {
  tempToken: string;
  code: string;
}

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  twoFactorEnabled?: boolean;
}

export interface ProfileFormData {
  email?: string;
  twoFactorEnabled?: boolean;
  profile?: UserProfile;
}

export interface CreateOrderFormData {
  customerEmail: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface CreateBookFormData {
  name: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  isbn?: string;
  pages?: number;
  publisher?: string;
  publishedDate?: string;
  tags?: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}

// Auth Response Types
export interface LoginResponse {
  token?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  expiresIn?: string;
}

// Country/State Types
export interface Country {
  name: string;
  code: string;
  states: string[];
}
