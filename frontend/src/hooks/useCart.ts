'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@/lib/api';
import type { Cart, CartItem } from '@/types';

export const useCart = () => {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCart(token);
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addItem = async (bookId: string, name: string, price: number, quantity: number = 1) => {
    if (!token) {
      setError('Please login to add items to cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await addToCart({ bookId, name, price, quantity }, token);
      setCart(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!token) {
      setError('Please login to update cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await updateCartItem(itemId, quantity, token);
      setCart(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) {
      setError('Please login to remove items from cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await removeFromCart(itemId, token);
      setCart(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    if (!token) {
      setError('Please login to clear cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await clearCart(token);
      setCart({ cart: [], total: 0, updatedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
    itemCount: cart?.cart.length || 0,
    total: cart?.total || 0,
  };
};
