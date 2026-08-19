import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { mascotEmotionController } from './mascotEmotionController';
import { EventKey } from './mascotEventMap';

interface MascotOrchestrationContextType {
  triggerMascotReaction: (eventKey: EventKey, message?: string) => void;
  resetIdleTimer: () => void;
}

const MascotOrchestrationContext = createContext<MascotOrchestrationContextType | undefined>(undefined);

export const MascotOrchestrationProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const cart = useCart();
  const wishlist = useWishlist();

  // Track previous states to detect changes
  const prevCartTotal = useRef(cart.totalItems);
  const prevCartItemsLen = useRef(cart.items.length);
  const prevWishlistLen = useRef(wishlist.items.length);
  const prevPathname = useRef(pathname);

  // 1. Auto-detect Cart Changes
  useEffect(() => {
    // Wait for initial load
    if (cart.isLoading) return;

    const currentTotal = cart.totalItems;
    const currentLen = cart.items.length;
    
    if (currentTotal !== prevCartTotal.current) {
      if (currentTotal === 0 && prevCartTotal.current > 0) {
        // Cart emptied
        mascotEmotionController.triggerEvent('cart:emptied');
      } else if (currentLen < prevCartItemsLen.current) {
        // Item completely removed (not just quantity decreased)
        mascotEmotionController.triggerEvent('cart:item-removed');
      } else if (currentTotal < prevCartTotal.current) {
        // Quantity decreased
        mascotEmotionController.triggerEvent('cart:quantity-decreased');
      } else if (currentLen > prevCartItemsLen.current) {
        // New item added
        mascotEmotionController.triggerEvent('cart:item-added');
      } else if (currentTotal > prevCartTotal.current) {
        // Quantity increased
        mascotEmotionController.triggerEvent('cart:quantity-increased');
      }
    }

    prevCartTotal.current = currentTotal;
    prevCartItemsLen.current = currentLen;
  }, [cart.totalItems, cart.items.length, cart.isLoading]);

  // 2. Auto-detect Wishlist Changes
  useEffect(() => {
    if (wishlist.isLoading) return;

    const currentLen = wishlist.items.length;
    
    if (currentLen !== prevWishlistLen.current) {
      if (currentLen === 0 && prevWishlistLen.current > 0) {
        mascotEmotionController.triggerEvent('wishlist:emptied');
      } else if (currentLen < prevWishlistLen.current) {
        mascotEmotionController.triggerEvent('wishlist:item-removed');
      } else if (currentLen > prevWishlistLen.current) {
        mascotEmotionController.triggerEvent('wishlist:item-added');
      }
    }

    prevWishlistLen.current = currentLen;
  }, [wishlist.items.length, wishlist.isLoading]);

  // 3. Auto-detect Route Changes (Contextual)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // User abandoned cart/checkout
      if ((prevPathname.current === '/cart' || prevPathname.current === '/checkout' || prevPathname.current === '/payment') && 
          pathname !== '/cart' && pathname !== '/checkout' && pathname !== '/payment' && pathname !== '/order-success') {
        if (cart.totalItems > 0) {
           mascotEmotionController.triggerEvent('cart:abandoned');
        }
      }

      // Contextual route arrival reactions
      if (pathname === '/checkout' || pathname === '/payment') {
         mascotEmotionController.triggerEvent('checkout:started');
      }
      
      prevPathname.current = pathname;
    }
  }, [pathname, cart.totalItems]);

  // 4. Global User Activity Monitoring (reset idle timer)
  useEffect(() => {
    const handleActivity = () => {
      mascotEmotionController.resetIdleTimer();
    };

    // Use passive listeners for performance
    const options = { passive: true };
    window.addEventListener('scroll', handleActivity, options);
    window.addEventListener('click', handleActivity, options);
    window.addEventListener('touchstart', handleActivity, options);
    window.addEventListener('keydown', handleActivity, options);
    window.addEventListener('mousemove', handleActivity, options);

    return () => {
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
    };
  }, []);

  const value = {
    triggerMascotReaction: (eventKey: EventKey, message?: string) => mascotEmotionController.triggerEvent(eventKey, message),
    resetIdleTimer: () => mascotEmotionController.resetIdleTimer(),
  };

  return (
    <MascotOrchestrationContext.Provider value={value}>
      {children}
    </MascotOrchestrationContext.Provider>
  );
};

export const useMascotContextTrigger = () => {
  const context = useContext(MascotOrchestrationContext);
  if (context === undefined) {
    throw new Error('useMascotContextTrigger must be used within a MascotOrchestrationProvider');
  }
  return context;
};
