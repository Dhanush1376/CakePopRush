import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Product } from '@/types/product';
import { useAuth } from '@/context/AuthContext';
import { cartService, BackendCartItem, BackendCartResponse } from '@/services/api/cartService';
import { getProductById } from '@/mocks/products';
import { useToast } from '@/components/ui/ToastContext';

export interface CartCustomization {
  flavourId?: string | null;
  flavourName?: string | null;
  quantityId?: string | null;
  quantityName?: string | null;
  addOns?: string[];
  inlineOptions?: Record<string, string | string[]>;
  personalMessage?: string;
  occasion?: string | null;
}

export interface CartItem {
  id: string; // Unique ID for the cart line item
  product: Product;
  quantity: number;
  variantId?: string;
  variantName?: string;
  customization?: CartCustomization;
  priceModifier?: number;
  unitPrice?: number; // Authoritative selling price per unit in paise
  compareAtPrice?: number; // Authoritative MRP per unit in paise
}

export const getItemUnitPrice = (item: CartItem): number => {
  if (typeof item.unitPrice === 'number' && item.unitPrice > 0) {
    return item.unitPrice;
  }
  const base = Number(item.product?.basePrice) || 0;
  const modifier = Number(item.priceModifier) || 0;
  return Math.max(0, base + modifier);
};

export const getItemCompareAtPrice = (item: CartItem): number => {
  if (typeof item.compareAtPrice === 'number' && item.compareAtPrice > 0) {
    return item.compareAtPrice;
  }
  const unit = getItemUnitPrice(item);
  if (item.product?.compareAtPrice && item.product.compareAtPrice > unit) {
    return item.product.compareAtPrice;
  }
  return Math.round(unit * 1.25);
};

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
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'SET_CART_AND_TOTALS'; payload: { items: CartItem[]; totals?: BackendCartResponse } }
  | { type: 'ADD_ITEM_OPTIMISTIC'; payload: CartItem; autoOpen?: boolean }
  | { type: 'REMOVE_ITEM_OPTIMISTIC'; payload: string }
  | { type: 'UPDATE_QUANTITY_OPTIMISTIC'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART_OPTIMISTIC' }
  | { type: 'APPLY_COUPON'; payload: string }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_COUPON_STATE'; payload: { state: CouponState; discount?: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART_OPEN'; payload: boolean };

const GUEST_CART_STORAGE_KEY = 'cakepoprush_guest_cart';

const initialState: CartState = {
  items: [],
  couponCode: '',
  couponState: 'none',
  couponDiscountValue: 0,
  isLoading: true,
  isCartOpen: false,
};

function generateDeterministicItemKey(
  productId: string,
  variantId?: string,
  customization?: any
): string {
  const pId = String(productId || '').trim();
  const vId = String(variantId || 'default').trim();
  let custKey = 'none';

  if (customization && typeof customization === 'object') {
    try {
      const sortedKeys = Object.keys(customization).sort();
      const normalized: Record<string, any> = {};
      for (const k of sortedKeys) {
        const val = customization[k];
        if (Array.isArray(val)) {
          normalized[k] = [...val].sort();
        } else {
          normalized[k] = val;
        }
      }
      custKey = JSON.stringify(normalized);
    } catch {
      custKey = String(customization);
    }
  }

  return `${pId}:::${vId}:::${custKey}`;
}

export function hydrateBackendItem(backendItem: BackendCartItem): CartItem {
  const baseProduct = getProductById(backendItem.productId);
  const primaryImage = backendItem.image || (baseProduct?.images[0]?.url ?? '');

  const productImages = primaryImage
    ? [{ id: 'img_primary', url: primaryImage, alt: backendItem.title || 'Cake Pop' }]
    : (baseProduct?.images || []);

  const unitPrice = Number(backendItem.price) || (baseProduct ? baseProduct.basePrice : 0);
  const compareAtPrice =
    backendItem.compareAtPrice ||
    (baseProduct?.compareAtPrice && baseProduct.compareAtPrice > unitPrice
      ? baseProduct.compareAtPrice
      : Math.round(unitPrice * 1.25));

  const product: Product = baseProduct
    ? {
        ...baseProduct,
        name: backendItem.title || baseProduct.name,
        basePrice: unitPrice,
        compareAtPrice: compareAtPrice,
        images: productImages,
      }
    : {
        id: backendItem.productId,
        name: backendItem.title || 'Cake Pop',
        slug: backendItem.productId,
        description: '',
        basePrice: unitPrice,
        compareAtPrice: compareAtPrice,
        images: productImages,
        categoryName: 'Cake Pops',
        isBestSeller: false,
        isEggless: true,
        isCustomizable: false,
        ingredients: '',
        allergens: [],
        dietaryInfo: [],
        preparationTime: '',
        shelfLife: '',
        storage: '',
        deliveryInfo: '',
        occasions: [],
      };

  const id =
    backendItem.id ||
    generateDeterministicItemKey(
      backendItem.productId,
      backendItem.variantId,
      backendItem.customization
    );

  return {
    id,
    product,
    quantity: Math.max(1, Math.min(99, Number(backendItem.quantity) || 1)),
    variantId: backendItem.variantId,
    variantName: backendItem.variantName || backendItem.variant,
    customization: backendItem.customization,
    priceModifier: backendItem.priceModifier || 0,
    unitPrice,
    compareAtPrice,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        isLoading: false,
      };

    case 'SET_CART_AND_TOTALS':
      return {
        ...state,
        items: action.payload.items,
        isLoading: false,
      };

    case 'ADD_ITEM_OPTIMISTIC': {
      const targetKey = action.payload.id;
      const existingIndex = state.items.findIndex((item) => item.id === targetKey);

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(99, newItems[existingIndex].quantity + action.payload.quantity),
        };
      } else {
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
        isCartOpen: action.autoOpen !== false ? true : state.isCartOpen,
      };
    }

    case 'REMOVE_ITEM_OPTIMISTIC':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload && i.product.id !== action.payload),
      };

    case 'UPDATE_QUANTITY_OPTIMISTIC': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== id && i.product.id !== id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id || item.product.id === id
            ? { ...item, quantity: Math.min(99, quantity) }
            : item
        ),
      };
    }

    case 'CLEAR_CART_OPTIMISTIC':
      return {
        ...state,
        items: [],
        couponCode: '',
        couponState: 'none',
        couponDiscountValue: 0,
      };

    case 'APPLY_COUPON':
      return { ...state, couponCode: action.payload, couponState: 'valid' };

    case 'SET_COUPON_STATE':
      return {
        ...state,
        couponState: action.payload.state,
        couponDiscountValue: action.payload.discount || 0,
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

export interface CartContextType extends CartState {
  totalItems: number;
  subtotal: number; // Total MRP (e.g. ₹963)
  totalMRP: number; // Total MRP before discounts (e.g. ₹963)
  itemsSubtotal: number; // Net selling price total (e.g. ₹770)
  totalDiscount: number;
  shippingFee: number;
  cartTotal: number; // Cart pre-checkout total (e.g. ₹770)
  checkoutTotal: number; // Checkout total including shipping (e.g. ₹820)
  total: number;
  addItem: (item: Omit<CartItem, 'id'> & { id?: string }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: CartItem[];
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const prevAuthRef = useRef<boolean | null>(null);
  const isHydratedRef = useRef(false);

  // Sync state items to localStorage for guest users
  const persistGuestCart = useCallback((itemsToPersist: CartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(itemsToPersist));
    } catch (e) {
      console.error('Failed to persist guest cart:', e);
    }
  }, []);

  // Hydrate Cart when auth state resolves or changes
  useEffect(() => {
    if (isAuthLoading) return;

    let isMounted = true;

    const initializeCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (isAuthenticated) {
        // Authenticated customer flow
        try {
          // Check if guest cart exists to merge
          const savedGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
          let guestItemsToMerge: any[] = [];

          if (savedGuestCart) {
            try {
              const parsed = JSON.parse(savedGuestCart);
              if (Array.isArray(parsed) && parsed.length > 0) {
                guestItemsToMerge = parsed;
              }
            } catch {
              // ignore corrupt data
            }
          }

          let responseData: BackendCartResponse;

          if (guestItemsToMerge.length > 0) {
            // Deterministically merge guest cart into backend user cart
            const mergeRes = await cartService.mergeCart(
              guestItemsToMerge.map((gi) => ({
                productId: gi.product?.id || gi.productId,
                quantity: gi.quantity,
                variantId: gi.variantId,
                variantName: gi.variantName,
                customization: gi.customization,
              }))
            );
            responseData = mergeRes.data;
            // Clear guest cart once merged
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          } else {
            // Load authoritative cart from backend
            const cartRes = await cartService.getCart();
            responseData = cartRes.data;
          }

          if (isMounted) {
            const hydrated = (responseData.items || []).map(hydrateBackendItem);
            dispatch({
              type: 'SET_CART_AND_TOTALS',
              payload: { items: hydrated, totals: responseData },
            });
            isHydratedRef.current = true;
          }
        } catch (err: any) {
          console.warn('Initial cart load failed, retrying once...', err?.message);
          try {
            await new Promise((r) => setTimeout(r, 1500));
            if (!isMounted) return;
            const retryRes = await cartService.getCart();
            if (isMounted && retryRes?.data) {
              const hydrated = (retryRes.data.items || []).map(hydrateBackendItem);
              dispatch({
                type: 'SET_CART_AND_TOTALS',
                payload: { items: hydrated, totals: retryRes.data },
              });
              isHydratedRef.current = true;
              return;
            }
          } catch (retryErr) {
            console.warn('Cart retry also failed:', retryErr);
          }
          if (isMounted) {
            // Fallback to local memory/guest cache if backend network hiccups
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } else {
        // Guest customer flow
        try {
          const savedGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
          let items: CartItem[] = [];

          if (savedGuestCart) {
            try {
              const parsed = JSON.parse(savedGuestCart);
              if (Array.isArray(parsed)) {
                items = parsed
                  .map((item: any) => {
                    const pId = item.product?.id || item.productId;
                    const baseProduct = getProductById(pId);
                    if (!baseProduct && !item.product) return null;
                    const prod = baseProduct || item.product;
                    const unitPrice =
                      typeof item.unitPrice === 'number' && item.unitPrice > 0
                        ? item.unitPrice
                        : Math.max(0, (Number(prod.basePrice) || 0) + (Number(item.priceModifier) || 0));
                    const compareAtPrice =
                      typeof item.compareAtPrice === 'number' && item.compareAtPrice > 0
                        ? item.compareAtPrice
                        : (prod.compareAtPrice && prod.compareAtPrice > unitPrice
                            ? prod.compareAtPrice
                            : Math.round(unitPrice * 1.25));

                    return {
                      ...item,
                      id:
                        item.id ||
                        generateDeterministicItemKey(pId, item.variantId, item.customization),
                      unitPrice,
                      compareAtPrice,
                      product: {
                        ...prod,
                        basePrice: unitPrice,
                        compareAtPrice,
                      },
                      quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
                    };
                  })
                  .filter(Boolean) as CartItem[];
              }
            } catch {
              items = [];
            }
          } else if (initialItems.length > 0 && !isHydratedRef.current) {
            // If caller supplied seed items and nothing in storage
            items = initialItems;
          }

          if (isMounted) {
            dispatch({ type: 'SET_ITEMS', payload: items });
            persistGuestCart(items);
            isHydratedRef.current = true;
          }
        } catch (err) {
          console.error('Failed to load guest cart:', err);
          if (isMounted) {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      }

      prevAuthRef.current = isAuthenticated;
    };

    initializeCart();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, persistGuestCart]);

  // Derived state calculations (reconciles directly with authoritative items in state)
  const { totalItems, subtotal, totalMRP, itemsSubtotal, totalDiscount, shippingFee, cartTotal, checkoutTotal, total } = useMemo(() => {
    let itemsCount = 0;
    let sellingSum = 0;
    let mrpSum = 0;

    state.items.forEach((item) => {
      const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      itemsCount += qty;

      const unitPrice = getItemUnitPrice(item);
      const compareAtPrice = getItemCompareAtPrice(item);

      sellingSum += unitPrice * qty;
      mrpSum += compareAtPrice * qty;
    });

    const discounts = Math.max(0, mrpSum - sellingSum);
    // Free delivery if net product total >= ₹1,000 (100,000 paise) or cart is empty
    const shipping = sellingSum >= 100000 || itemsCount === 0 ? 0 : 5000;
    const couponDiscount = Math.min(sellingSum, state.couponDiscountValue || 0);
    const preCheckoutTotal = itemsCount === 0 ? 0 : Math.max(0, sellingSum - couponDiscount);
    const postCheckoutTotal = itemsCount === 0 ? 0 : Math.max(0, sellingSum - couponDiscount + shipping);

    return {
      totalItems: itemsCount,
      subtotal: mrpSum,           // Total MRP sum (e.g. ₹963)
      totalMRP: mrpSum,           // Strikethrough MRP sum (e.g. ₹963)
      itemsSubtotal: sellingSum,  // Net selling sum (e.g. ₹770)
      totalDiscount: discounts,   // Savings from MRP (e.g. ₹193)
      shippingFee: shipping,      // Flat ₹50 or FREE
      cartTotal: preCheckoutTotal, // Pre-checkout total: ₹770
      checkoutTotal: postCheckoutTotal, // Total with shipping: ₹820
      total: preCheckoutTotal,    // Pre-checkout total: ₹770
    };
  }, [state.items, state.couponDiscountValue]);

  // Actions
  const addItem = async (itemInput: Omit<CartItem, 'id'> & { id?: string }) => {
    const itemKey =
      itemInput.id ||
      generateDeterministicItemKey(
        itemInput.product.id,
        itemInput.variantId,
        itemInput.customization
      );

    const unitPrice =
      typeof itemInput.unitPrice === 'number' && itemInput.unitPrice > 0
        ? itemInput.unitPrice
        : Math.max(0, (Number(itemInput.product.basePrice) || 0) + (Number(itemInput.priceModifier) || 0));

    const compareAtPrice =
      typeof itemInput.compareAtPrice === 'number' && itemInput.compareAtPrice > 0
        ? itemInput.compareAtPrice
        : (itemInput.product.compareAtPrice && itemInput.product.compareAtPrice > unitPrice
            ? itemInput.product.compareAtPrice
            : Math.round(unitPrice * 1.25));

    const fullItem: CartItem = {
      ...itemInput,
      id: itemKey,
      quantity: Math.max(1, Math.min(99, Number(itemInput.quantity) || 1)),
      unitPrice,
      compareAtPrice,
      product: {
        ...itemInput.product,
        basePrice: unitPrice,
        compareAtPrice,
      },
    };

    // Optimistically update UI immediately
    dispatch({ type: 'ADD_ITEM_OPTIMISTIC', payload: fullItem, autoOpen: true });

    if (isAuthenticated) {
      try {
        const res = await cartService.addItem({
          productId: fullItem.product.id,
          quantity: fullItem.quantity,
          variantId: fullItem.variantId,
          variantName: fullItem.variantName,
          customization: fullItem.customization,
        });

        if (res.data) {
          const hydrated = (res.data.items || []).map(hydrateBackendItem);
          dispatch({
            type: 'SET_CART_AND_TOTALS',
            payload: { items: hydrated, totals: res.data },
          });
        }
      } catch (err: any) {
        console.error('Failed to add item to backend cart:', err);
        toast({
          type: 'error',
          title: 'Could not sync cart',
          message: err?.message || 'Please check your connection.',
        });
      }
    } else {
      // Guest persistence
      const currentItems = state.items;
      const existingIdx = currentItems.findIndex((i) => i.id === itemKey);
      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = [...currentItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(99, updated[existingIdx].quantity + fullItem.quantity),
        };
      } else {
        updated = [...currentItems, fullItem];
      }
      persistGuestCart(updated);
    }
  };

  const removeItem = async (id: string) => {
    const prevItems = state.items;
    dispatch({ type: 'REMOVE_ITEM_OPTIMISTIC', payload: id });

    if (isAuthenticated) {
      try {
        const res = await cartService.removeItem(id);
        if (res.data) {
          const hydrated = (res.data.items || []).map(hydrateBackendItem);
          dispatch({
            type: 'SET_CART_AND_TOTALS',
            payload: { items: hydrated, totals: res.data },
          });
        }
      } catch (err: any) {
        console.error('Failed to remove item from backend cart:', err);
        // Rollback
        dispatch({ type: 'SET_ITEMS', payload: prevItems });
        toast({
          type: 'error',
          title: 'Failed to remove item',
          message: 'Please try again.',
        });
      }
    } else {
      const updated = prevItems.filter((i) => i.id !== id && i.product.id !== id);
      persistGuestCart(updated);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    const prevItems = state.items;
    const clampedQty = Math.min(99, Math.max(1, quantity));
    dispatch({ type: 'UPDATE_QUANTITY_OPTIMISTIC', payload: { id, quantity: clampedQty } });

    if (isAuthenticated) {
      try {
        const res = await cartService.updateQuantity(id, clampedQty);
        if (res.data) {
          const hydrated = (res.data.items || []).map(hydrateBackendItem);
          dispatch({
            type: 'SET_CART_AND_TOTALS',
            payload: { items: hydrated, totals: res.data },
          });
        }
      } catch (err: any) {
        console.error('Failed to update quantity on backend cart:', err);
        // Rollback
        dispatch({ type: 'SET_ITEMS', payload: prevItems });
        toast({
          type: 'error',
          title: 'Failed to update quantity',
          message: 'Please try again.',
        });
      }
    } else {
      const updated = prevItems.map((item) =>
        item.id === id || item.product.id === id ? { ...item, quantity: clampedQty } : item
      );
      persistGuestCart(updated);
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART_OPTIMISTIC' });

    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.error('Failed to clear backend cart:', err);
      }
    } else {
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear guest cart:', e);
      }
    }
  };

  const openCart = () => dispatch({ type: 'SET_CART_OPEN', payload: true });
  const closeCart = () => dispatch({ type: 'SET_CART_OPEN', payload: false });

  const applyCoupon = (code: string) => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    dispatch({ type: 'APPLY_COUPON', payload: trimmedCode });

    setTimeout(() => {
      if (trimmedCode === 'CAKE10') {
        dispatch({
          type: 'SET_COUPON_STATE',
          payload: { state: 'applied', discount: Math.round(subtotal * 0.1) },
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
        totalMRP,
        itemsSubtotal,
        totalDiscount,
        shippingFee,
        cartTotal,
        checkoutTotal,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        openCart,
        closeCart,
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
