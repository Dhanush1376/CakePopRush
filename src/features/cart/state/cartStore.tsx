import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';

export interface CartItem {
  id: string; // Unique ID for the cart line item
  product: Product;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

export type CouponState = 'none' | 'valid' | 'invalid' | 'expired' | 'applied';

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponState: CouponState;
  couponDiscountValue: number; // in paise
  isLoading: boolean;
  isCartOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: string }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_COUPON_STATE'; payload: { state: CouponState; discount?: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART_OPEN'; payload: boolean };

const initialState: CartState = {
  items: [],
  couponCode: '',
  couponState: 'none',
  couponDiscountValue: 0,
  isLoading: true,
  isCartOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item with same product and variant already exists
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.payload.product.id && item.variantId === action.payload.variantId
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, items: newItems, isCartOpen: true };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, id: `cart-item-${Math.random().toString(36).substring(2, 9)}` }],
        isCartOpen: true, // Auto-open cart when adding
      };
    }
    
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [], couponCode: '', couponState: 'none', couponDiscountValue: 0 };
    
    case 'APPLY_COUPON':
      return { ...state, couponCode: action.payload, couponState: 'valid' };
      
    case 'SET_COUPON_STATE':
      return { 
        ...state, 
        couponState: action.payload.state,
        couponDiscountValue: action.payload.discount || 0
      };
      
    case 'REMOVE_COUPON':
      return { ...state, couponCode: '', couponState: 'none', couponDiscountValue: 0 };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload };
      
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  shippingFee: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children, initialItems = [] }: { children: ReactNode; initialItems?: CartItem[] }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load initial cart
  useEffect(() => {
    const timer = setTimeout(() => {
      // Direct state mutation for init to avoid dispatch overhead in effect
      initialItems.forEach(item => {
         dispatch({ type: 'ADD_ITEM', payload: item });
      });
      // Ensure cart is closed on load (ADD_ITEM opens it by default)
      dispatch({ type: 'SET_CART_OPEN', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Derived state calculations
  const { totalItems, subtotal, itemDiscounts } = useMemo(() => {
    let items = 0;
    let sub = 0;
    let discounts = 0;
    
    state.items.forEach(item => {
      items += item.quantity;
      const compareAtPrice = item.product.compareAtPrice || Math.round(item.product.basePrice * 1.25);
      
      const itemMRP = compareAtPrice * item.quantity;
      const itemActual = item.product.basePrice * item.quantity;
      
      sub += itemMRP;
      discounts += (itemMRP - itemActual);
    });
    
    return { totalItems: items, subtotal: sub, itemDiscounts: discounts };
  }, [state.items]);

  // If order < 1000 rupees, add 50 rupees shipping (mock logic)
  const shippingFee = (subtotal - itemDiscounts) > 100000 || totalItems === 0 ? 0 : 5000;
  
  const total = Math.max(0, subtotal - itemDiscounts - state.couponDiscountValue + shippingFee);

  // Actions
  const addItem = (item: Omit<CartItem, 'id'>) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const openCart = () => dispatch({ type: 'SET_CART_OPEN', payload: true });
  const closeCart = () => dispatch({ type: 'SET_CART_OPEN', payload: false });

  const applyCoupon = (code: string) => {
    // Mock coupon logic
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;
    
    dispatch({ type: 'APPLY_COUPON', payload: trimmedCode });
    
    // Simulate API call
    setTimeout(() => {
      if (trimmedCode === 'CAKE10') {
        dispatch({ 
          type: 'SET_COUPON_STATE', 
          payload: { state: 'applied', discount: Math.round((subtotal - itemDiscounts) * 0.1) } 
        });
      } else if (trimmedCode === 'EXPIRED20') {
        dispatch({ type: 'SET_COUPON_STATE', payload: { state: 'expired' } });
      } else {
        dispatch({ type: 'SET_COUPON_STATE', payload: { state: 'invalid' } });
      }
    }, 600);
  };
  
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });

  return (
    <CartContext.Provider
      value={{
        ...state,
        totalItems,
        subtotal,
        totalDiscount: itemDiscounts,
        shippingFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
