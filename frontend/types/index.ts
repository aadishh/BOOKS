// API Response Types
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  twoFactorEnabled?: boolean;
  isActive?: boolean;
  profile?: UserProfile;
  createdAt?: string;
  lastLogin?: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  expiresIn?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  twoFactorEnabled?: boolean;
}

export interface TwoFactorRequest {
  tempToken: string;
  code: string;
}

// Book Types
export interface Book {
  id: string;
  name: string;
  author: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  description: string;
  isbn?: string;
  pages?: number;
  publisher?: string;
  publishedDate?: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookSearchParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface BooksResponse {
  books: Book[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
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

export interface AddToCartRequest {
  bookId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
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

export interface AddToWishlistRequest {
  bookId: string;
  name: string;
  price: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  customerEmail: string;
  shippingAddress: Address;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerEmail: string;
  shippingAddress: Address;
  paymentMethod: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination?: PaginationInfo;
}

// Shipping Types
export interface Shipment {
  id: string;
  orderId: string;
  customerEmail: string;
  shippingAddress: Address;
  items: ShipmentItem[];
  shippingMethod: 'standard' | 'priority' | 'express';
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  trackingNumber: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  shippingAddress: Address;
  trackingEvents: TrackingEvent[];
}

// Admin Types
export interface AdminDashboard {
  stats: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  recentUsers: User[];
}

export interface UserStats {
  userId: string;
  username: string;
  email: string;
  cartItemsCount: number;
  wishlistItemsCount: number;
  totalOrders: number;
  totalSpent: number;
  lastActivity: string;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxLength?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

export interface TwoFactorFormData {
  code: string;
}

export interface ProfileFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  twoFactorEnabled: boolean;
}

export interface CheckoutFormData {
  customerEmail: string;
  shippingAddress: Address;
  paymentMethod: string;
}

// Filter and Sort Types
export interface BookFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  signup: (data: SignupRequest) => Promise<LoginResponse>;
  verify2FA: (data: TwoFactorRequest) => Promise<LoginResponse>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface CartContextType {
  cart: Cart | null;
  addToCart: (item: AddToCartRequest) => Promise<void>;
  updateCartItem: (itemId: string, data: UpdateCartItemRequest) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

export interface WishlistContextType {
  wishlist: Wishlist | null;
  addToWishlist: (item: AddToWishlistRequest) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}