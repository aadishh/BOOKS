export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-backend-gyz6.onrender.com';

export const ROUTES = {
  HOME: '/',
  BOOKS: '/books',
  MY_BOOK: '/myBook',
  CONTACT: '/contact',
  PROFILE: '/profile',
  CART: '/cart',
  ADMIN: '/admin',
  LOGIN: '/login',
} as const;
