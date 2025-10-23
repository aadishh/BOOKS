import { apiClient } from './api';
import {
  Book,
  BooksResponse,
  BookSearchParams,
} from '@/types';

export const booksApi = {
  // Get all books with pagination and filters
  getBooks: async (params?: BookSearchParams): Promise<BooksResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/api/books/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<BooksResponse>(url);
  },

  // Search books
  searchBooks: async (params: BookSearchParams): Promise<BooksResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiClient.get<BooksResponse>(`/api/books/books/search?${queryParams.toString()}`);
  },

  // Get book by ID
  getBook: async (bookId: string): Promise<{ book: Book }> => {
    return apiClient.get<{ book: Book }>(`/api/books/books/${bookId}`);
  },

  // Create book (Admin only)
  createBook: async (bookData: Partial<Book>): Promise<{ book: Book }> => {
    return apiClient.post<{ book: Book }>('/api/books/books', bookData);
  },

  // Update book (Admin only)
  updateBook: async (bookId: string, bookData: Partial<Book>): Promise<{ book: Book }> => {
    return apiClient.put<{ book: Book }>(`/api/books/books/${bookId}`, bookData);
  },

  // Update book stock (Admin only)
  updateBookStock: async (
    bookId: string, 
    data: { quantity: number; operation: 'add' | 'subtract' | 'set' }
  ): Promise<{ book: Book }> => {
    return apiClient.patch<{ book: Book }>(`/api/books/books/${bookId}/stock`, data);
  },

  // Delete book (Admin only)
  deleteBook: async (bookId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/books/books/${bookId}`);
  },

  // Get book categories
  getCategories: async (): Promise<{ categories: string[] }> => {
    return apiClient.get<{ categories: string[] }>('/api/books/categories');
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    return apiClient.get('/api/books/health');
  },
};