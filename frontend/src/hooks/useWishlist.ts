'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWishlist, addToWishlist, removeFromWishlist, moveWishlistToCart } from '@/lib/api';
import type { Wishlist } from '@/types';

export const useWishlist = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getWishlist(token);
      setWishlist(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addItem = async (bookId: string, name: string, price: number) => {
    if (!token) {
      setError('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await addToWishlist({ bookId, name, price }, token);
      setWishlist(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) {
      setError('Please login to remove items from wishlist');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await removeFromWishlist(itemId, token);
      setWishlist(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (itemId: string) => {
    if (!token) {
      setError('Please login to move items to cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await moveWishlistToCart(itemId, token);
      setWishlist(response.data.wishlist);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token, fetchWishlist]);

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addItem,
    removeItem,
    moveToCart,
    itemCount: wishlist?.wishlist.length || 0,
  };
};
