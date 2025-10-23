import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/auth-api';
import { apiClient } from '@/lib/api';
import {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  TwoFactorRequest,
  AuthContextType,
} from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const savedToken = apiClient.getAuthToken();
      
      if (savedToken) {
        try {
          const { user: userData } = await authApi.getProfile();
          if (isMounted) {
            setUser(userData);
            setToken(savedToken);
          }
        } catch (error) {
          // Token is invalid, remove it
          if (isMounted) {
            apiClient.removeAuthToken();
            setUser(null);
            setToken(null);
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.requiresTwoFactor) {
        // Return response for 2FA handling
        return response;
      }
      
      if (response.token && response.user) {
        apiClient.setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        toast.success('Login successful!');
      }
      
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const response = await authApi.signup(data);
      
      if (response.requiresTwoFactor) {
        // Return response for 2FA handling
        return response;
      }
      
      if (response.token && response.user) {
        apiClient.setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        toast.success('Account created successfully!');
      }
      
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (data: TwoFactorRequest): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const response = await authApi.verify2FA(data);
      
      if (response.token && response.user) {
        apiClient.setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        toast.success('Verification successful!');
      }
      
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.removeAuthToken();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const { user: updatedUser } = await authApi.updateProfile(data);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    verify2FA,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}