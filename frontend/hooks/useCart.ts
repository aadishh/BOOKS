import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { cartApi } from '@/lib/cart-api';
import {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartContextType,
} from '@/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (error: any) {
      // Don't show error toast for initial load failures
      console.error('Failed to fetch cart:', error);
      setCart({ cart: [], total: 0, updatedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadCart = async () => {
      try {
        setLoading(true);
        const cartData = await cartApi.getCart();
        if (isMounted) {
          setCart(cartData);
        }
      } catch (error: any) {
        console.error('Failed to fetch cart:', error);
        if (isMounted) {
          setCart({ cart: [], total: 0, updatedAt: new Date().toISOString() });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCart();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const addToCart = async (item: AddToCartRequest): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.addToCart(item);
      await refreshCart();
      toast.success('Item added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, data: UpdateCartItemRequest): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.updateCartItem(itemId, data);
      await refreshCart();
      toast.success('Cart updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart item');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.removeFromCart(itemId);
      await refreshCart();
      toast.success('Item removed from cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item from cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      await refreshCart();
      toast.success('Cart cleared!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextType = {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loading,
    refreshCart,
  };

  return React.createElement(CartContext.Provider, { value }, children);
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}