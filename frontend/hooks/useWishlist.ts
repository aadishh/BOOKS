import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { cartApi } from '@/lib/cart-api';
import {
  Wishlist,
  AddToWishlistRequest,
  WishlistContextType,
} from '@/types';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    try {
      setLoading(true);
      const wishlistData = await cartApi.getWishlist();
      setWishlist(wishlistData);
    } catch (error: any) {
      // Don't show error toast for initial load failures
      console.error('Failed to fetch wishlist:', error);
      setWishlist({ wishlist: [], updatedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const wishlistData = await cartApi.getWishlist();
        if (isMounted) {
          setWishlist(wishlistData);
        }
      } catch (error: any) {
        console.error('Failed to fetch wishlist:', error);
        if (isMounted) {
          setWishlist({ wishlist: [], updatedAt: new Date().toISOString() });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWishlist();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const addToWishlist = async (item: AddToWishlistRequest): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.addToWishlist(item);
      await refreshWishlist();
      toast.success('Item added to wishlist!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item to wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.removeFromWishlist(itemId);
      await refreshWishlist();
      toast.success('Item removed from wishlist!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item from wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (itemId: string): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.moveWishlistToCart(itemId);
      await refreshWishlist();
      toast.success('Item moved to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to move item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    loading,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}