import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse, ApiError } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          Cookies.remove('auth_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        const apiError: ApiError = {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.message || 'An unexpected error occurred',
          details: error.response?.data?.details || error.message,
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url,
        data,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP methods
  async get<T>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  // Set auth token
  setAuthToken(token: string) {
    Cookies.set('auth_token', token, { expires: 7 }); // 7 days
  }

  // Remove auth token
  removeAuthToken() {
    Cookies.remove('auth_token');
  }

  // Get auth token
  getAuthToken(): string | undefined {
    return Cookies.get('auth_token');
  }
}

export const apiClient = new ApiClient();