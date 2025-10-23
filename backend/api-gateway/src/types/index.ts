import { Document, Types } from 'mongoose';
import { Request } from 'express';
import { IUser } from '../models/User';

// Re-export model interfaces
export { IUser, IUserProfile } from '../models/User';
export { IBook, IReview, IBookImage, IBookDimensions } from '../models/Book';
export { IOrder, IOrderItem, IShippingAddress, IPaymentDetails } from '../models/Order';
export { ICart, ICartItem } from '../models/Cart';
export { ICategory, ICategoryImage } from '../models/Category';



// Auth Types
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

export interface OTPData {
  userId: string | Types.ObjectId;
  otp: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  pendingUser?: IUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Standard API Response Format
export interface StandardApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  requiresTwoFactor?: boolean;
  tempToken?: string;
  expiresIn?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BookQuery extends PaginationQuery {
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
}