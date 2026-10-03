import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Product } from '@/types/product';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { wishlistApiService, BackendWishlistItem } from '@/services/api/wishlistService';
import { getProductById, mockProducts } from '@/mocks/products';

export type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'popular' | 'rating' | 'name-asc';
export type ViewMode = 'grid' | 'compact';

export interface WishlistProduct extends Product {
  addedAt?: number;
}

interface WishlistState {
  items: WishlistProduct[];
  lastRemoved: WishlistProduct | null;
  sortBy: SortOption;
  viewMode: ViewMode;
  searchQuery: string;
  filterCategory: string;
  isLoading: boolean;
  error: string | null;
}

type WishlistAction =
  | { type: 'SET_ITEMS'; payload: WishlistProduct[] }
  | { type: 'ADD_ITEM'; payload: WishlistProduct }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UNDO_REMOVE' }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_SORT_BY'; payload: SortOption }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_CATEGORY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const WISHLIST_STORAGE_KEY = 'cakepoprush_wishlist';

export function sanitizeProduct(raw: any): WishlistProduct | null {
  if (!raw) return null;
  try {
    if (typeof raw === 'string') {
      return hydrateWishlistItem({ productId: raw, title: '', price: 0 });
    }
    if (typeof raw === 'object') {
      const id = String(raw.id || raw.productId || raw._id || raw.slug || '').trim();
      if (!id) return null;

      const local =
        getProductById(id) ||
        mockProducts.find(
          (p) =>
            p.id === id ||
            p.slug === id ||
            (raw.slug && p.slug === raw.slug) ||
            ((p as any)._id && (p as any)._id === id)
        );

      const name = String(raw.name || raw.title || local?.name || 'Artisan Treat').trim();
      const basePrice =
        typeof raw.basePrice === 'number'
          ? raw.basePrice
          : typeof raw.price === 'number'
          ? raw.price
          : local?.basePrice || 45;

      const primaryImg =
        Array.isArray(raw.images) && raw.images.length > 0
          ? typeof raw.images[0] === 'string'
            ? raw.images[0]
            : raw.images[0]?.url || ''
          : typeof raw.image === 'string'
          ? raw.image
          : local?.images?.[0]?.url || '/assets/images/placeholder.png';

      const compareAtPrice =
        typeof raw.compareAtPrice === 'number'
          ? raw.compareAtPrice
          : local?.compareAtPrice || Math.round(basePrice * 1.25);

      const addedAt =
        typeof raw.addedAt === 'number'
          ? raw.addedAt
          : raw.addedAt
          ? new Date(raw.addedAt).getTime()
          : Date.now();

      return {
        id,
        name,
        slug: String(raw.slug || local?.slug || id).trim(),
        description: String(raw.description || local?.description || '').trim(),
        basePrice,
        compareAtPrice,
        images: [{ id: 'img_1', url: primaryImg, alt: name }],
        categoryName: String(raw.categoryName || local?.categoryName || 'Cake Pops').trim(),
        isBestSeller: Boolean(raw.isBestSeller ?? local?.isBestSeller),
        isEggless: raw.isEggless !== undefined ? Boolean(raw.isEggless) : (local?.isEggless ?? true),
        isCustomizable: Boolean(raw.isCustomizable ?? local?.isCustomizable),
        rating: typeof raw.rating === 'number' ? raw.rating : (local?.rating || 4.9),
        reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : (local?.reviewCount || 24),
        addedAt,
      };
    }
  } catch (err) {
    console.warn('Error sanitizing wishlist item:', err);
  }
  return null;
}

const loadSavedWishlist = (): WishlistProduct[] => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizeProduct).filter((p): p is WishlistProduct => p !== null);
      }
    }
  } catch (err) {
    console.error('Failed to parse saved wishlist:', err);
  }
  return [];
};

const persistWishlist = (items: WishlistProduct[]) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist wishlist:', err);
  }
};

export function hydrateWishlistItem(backendItem: BackendWishlistItem): WishlistProduct {
  const local =
    getProductById(backendItem.productId) ||
    mockProducts.find(
      (p) =>
        p.id === backendItem.productId ||
        p.slug === backendItem.productId ||
        (backendItem.slug && p.slug === backendItem.slug)
    );

  const addedAt = backendItem.addedAt ? new Date(backendItem.addedAt).getTime() : Date.now();

  if (local) {
    return {
      ...local,
      name: backendItem.title || local.name,
      basePrice: backendItem.price || local.basePrice,
      addedAt,
    };
  }

  const primaryImage = backendItem.image || '/assets/images/placeholder.png';
  return {
    id: backendItem.productId,
    name: backendItem.title || 'Artisan Treat',
    slug: backendItem.slug || backendItem.productId,
    description: 'Handcrafted artisan sweet treat made with premium ingredients.',
    basePrice: backendItem.price || 45,
    compareAtPrice: Math.round((backendItem.price || 45) * 1.25),
    images: [{ id: 'img_1', url: primaryImage, alt: backendItem.title || 'Artisan Treat' }],
    categoryName: 'Cake Pops',
    isBestSeller: false,
    isEggless: true,
    isCustomizable: true,
    rating: 4.9,
    reviewCount: 28,
    addedAt,
  } as WishlistProduct;
}

const initialState: WishlistState = {
  items: [],
  lastRemoved: null,
  sortBy: 'recent',
  viewMode: 'grid',
  searchQuery: '',
  filterCategory: 'all',
  isLoading: false,
  error: null,
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };

    case 'ADD_ITEM': {
      if (
        state.items.some(
          (i) =>
            i.id === action.payload.id ||
            (i.slug && action.payload.slug && i.slug === action.payload.slug)
        )
      ) {
        return state;
      }
      const itemWithTimestamp: WishlistProduct = {
        ...action.payload,
        addedAt: action.payload.addedAt || Date.now(),
      };
      const updated = [itemWithTimestamp, ...state.items];
      persistWishlist(updated);
      return { ...state, items: updated, lastRemoved: null };
    }

    case 'REMOVE_ITEM': {
      const target = String(action.payload).toLowerCase();
      const removedItem =
        state.items.find(
          (i) =>
            String(i.id).toLowerCase() === target ||
            String(i.slug).toLowerCase() === target ||
            String((i as any)._id).toLowerCase() === target
        ) || null;
      const updated = state.items.filter(
        (i) =>
          String(i.id).toLowerCase() !== target &&
          String(i.slug).toLowerCase() !== target &&
          String((i as any)._id).toLowerCase() !== target
      );
      persistWishlist(updated);
      return {
        ...state,
        items: updated,
        lastRemoved: removedItem,
      };
    }

    case 'UNDO_REMOVE': {
      if (!state.lastRemoved) return state;
      if (state.items.some((i) => i.id === state.lastRemoved!.id)) return state;
      const updated = [state.lastRemoved, ...state.items];
      persistWishlist(updated);
      return {
        ...state,
        items: updated,
        lastRemoved: null,
      };
    }

    case 'CLEAR_WISHLIST':
      persistWishlist([]);
      return { ...state, items: [], lastRemoved: null };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTER_CATEGORY':
      return { ...state, filterCategory: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

export interface WishlistContextType extends WishlistState {
  itemCount: number;
  filteredItems: WishlistProduct[];
  categories: string[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  undoRemove: () => Promise<void>;
  clearWishlist: () => Promise<void>;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product, addCartItem?: (item: any) => Promise<void>) => Promise<void>;
  moveAllToCart: (addCartItem?: (item: any) => Promise<void>) => Promise<{ addedCount: number }>;
  refresh: () => Promise<void>;
}

const defaultFallbackContext: WishlistContextType = {
  items: [],
  itemCount: 0,
  filteredItems: [],
  categories: [],
  lastRemoved: null,
  sortBy: 'recent',
  viewMode: 'grid',
  searchQuery: '',
  filterCategory: 'all',
  isLoading: false,
  error: null,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  undoRemove: async () => {},
  clearWishlist: async () => {},
  setSortBy: () => {},
  setViewMode: () => {},
  setSearchQuery: () => {},
  setFilterCategory: () => {},
  isInWishlist: () => false,
  moveToCart: async () => {},
  moveAllToCart: async () => ({ addedCount: 0 }),
  refresh: async () => {},
};

const WishlistContext = createContext<WishlistContextType>(defaultFallbackContext);

export const WishlistProvider = ({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: Product[];
}) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  // Initialize from localStorage safely on first mount
  useEffect(() => {
    const saved = loadSavedWishlist();
    const initial = saved.length > 0 ? saved : initialItems.map(sanitizeProduct).filter((p): p is WishlistProduct => p !== null);
    if (initial.length > 0) {
      dispatch({ type: 'SET_ITEMS', payload: initial });
    }
  }, []);

  // Synchronize with backend when auth state changes
  useEffect(() => {
    if (isAuthLoading) return;

    let isMounted = true;

    const syncWishlist = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Check if there are local guest items to merge
        const localItems = loadSavedWishlist();
        if (localItems.length > 0) {
          try {
            await wishlistApiService.mergeWishlist(
              localItems.map((p) => ({
                productId: p.id,
                title: p.name,
                price: p.basePrice,
                image: p.images?.[0]?.url,
                slug: p.slug,
                addedAt: p.addedAt ? new Date(p.addedAt) : new Date(),
              }))
            );
          } catch (mergeErr) {
            console.warn('Could not merge guest wishlist with backend:', mergeErr);
          }
        }

        // Fetch authoritative wishlist from backend
        let response: any;
        try {
          response = await wishlistApiService.getWishlist();
        } catch {
          await new Promise((r) => setTimeout(r, 1500));
          if (!isMounted) return;
          response = await wishlistApiService.getWishlist().catch(() => null);
        }
        if (isMounted && response?.data && Array.isArray(response.data)) {
          const hydratedItems = response.data.map(hydrateWishlistItem);
          dispatch({ type: 'SET_ITEMS', payload: hydratedItems });
          persistWishlist(hydratedItems);
        }
      } catch (err: any) {
        console.warn('Error fetching user wishlist:', err?.message || err);
      } finally {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    syncWishlist();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading]);

  // Actions
  const addToWishlist = useCallback(
    async (product: Product) => {
      const sanitized = sanitizeProduct(product);
      if (!sanitized) return;

      dispatch({ type: 'ADD_ITEM', payload: sanitized });

      if (isAuthenticated) {
        try {
          const res = await wishlistApiService.addItem({
            productId: sanitized.id,
            title: sanitized.name,
            price: sanitized.basePrice,
            image: sanitized.images?.[0]?.url,
            slug: sanitized.slug,
          });
          if (res?.data && Array.isArray(res.data)) {
            const hydrated = res.data.map(hydrateWishlistItem);
            dispatch({ type: 'SET_ITEMS', payload: hydrated });
            persistWishlist(hydrated);
          }
        } catch (err) {
          console.warn('Backend sync failed for addToWishlist:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const match = state.items.find(
        (i) =>
          i.id === productId ||
          i.slug === productId ||
          (i as any)._id === productId ||
          (i as any).productId === productId
      );
      const targetId = match ? match.id : productId;

      dispatch({ type: 'REMOVE_ITEM', payload: targetId });

      if (isAuthenticated) {
        try {
          const res = await wishlistApiService.removeItem(targetId);
          if (res?.data && Array.isArray(res.data)) {
            const hydrated = res.data.map(hydrateWishlistItem);
            dispatch({ type: 'SET_ITEMS', payload: hydrated });
            persistWishlist(hydrated);
          }
        } catch (err) {
          console.warn('Backend sync failed for removeFromWishlist:', err);
        }
      }
    },
    [state.items, isAuthenticated]
  );

  const undoRemove = useCallback(async () => {
    const itemToRestore = state.lastRemoved;
    if (!itemToRestore) return;

    dispatch({ type: 'UNDO_REMOVE' });

    if (isAuthenticated) {
      try {
        await wishlistApiService.addItem({
          productId: itemToRestore.id,
          title: itemToRestore.name,
          price: itemToRestore.basePrice,
          image: itemToRestore.images?.[0]?.url,
          slug: itemToRestore.slug,
        });
      } catch (err) {
        console.warn('Backend sync failed for undoRemove:', err);
      }
    }
  }, [state.lastRemoved, isAuthenticated]);

  const clearWishlist = useCallback(async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });

    if (isAuthenticated) {
      try {
        await wishlistApiService.clearWishlist();
      } catch (err) {
        console.warn('Backend sync failed for clearWishlist:', err);
      }
    }
  }, [isAuthenticated]);

  const setSortBy = useCallback((sort: SortOption) => {
    dispatch({ type: 'SET_SORT_BY', payload: sort });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setFilterCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_FILTER_CATEGORY', payload: category });
  }, []);

  const isInWishlist = useCallback(
    (productIdOrSlug: string) => {
      if (!productIdOrSlug) return false;
      const target = String(productIdOrSlug).trim().toLowerCase();
      return state.items.some((i) => {
        const itemId = String(i.id || '').trim().toLowerCase();
        const itemSlug = String(i.slug || '').trim().toLowerCase();
        const itemMongoId = String((i as any)._id || '').trim().toLowerCase();
        const itemProdId = String((i as any).productId || '').trim().toLowerCase();
        return (
          itemId === target ||
          itemSlug === target ||
          itemMongoId === target ||
          itemProdId === target
        );
      });
    },
    [state.items]
  );

  const moveToCart = useCallback(
    async (product: Product, addCartItem?: (item: any) => Promise<void>) => {
      try {
        if (addCartItem) {
          await addCartItem({
            product,
            quantity: 1,
            unitPrice: product.basePrice,
            compareAtPrice: product.compareAtPrice,
          });
        }
        await removeFromWishlist(product.id);
        toast({
          type: 'success',
          title: 'Moved to Bag',
          message: `${product.name} is ready in your cart!`,
        });
      } catch (err) {
        console.error('Failed to move to cart:', err);
      }
    },
    [removeFromWishlist, toast]
  );

  const moveAllToCart = useCallback(
    async (addCartItem?: (item: any) => Promise<void>) => {
      if (state.items.length === 0) return { addedCount: 0 };

      let count = 0;
      if (addCartItem) {
        for (const item of state.items) {
          try {
            await addCartItem({
              product: item,
              quantity: 1,
              unitPrice: item.basePrice,
              compareAtPrice: item.compareAtPrice,
            });
            count++;
          } catch (err) {
            console.error('Failed to add item to cart:', item.id, err);
          }
        }
      }

      await clearWishlist();
      toast({
        type: 'success',
        title: 'All Treats Moved to Bag! 🛍️',
        message: `${state.items.length} sweet treats transferred to your cart.`,
      });

      return { addedCount: count || state.items.length };
    },
    [state.items, clearWishlist, toast]
  );

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    if (isAuthenticated) {
      try {
        const response = await wishlistApiService.getWishlist();
        if (response?.data && Array.isArray(response.data)) {
          const hydratedItems = response.data.map(hydrateWishlistItem);
          dispatch({ type: 'SET_ITEMS', payload: hydratedItems });
          persistWishlist(hydratedItems);
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh wishlist' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      setTimeout(() => {
        dispatch({ type: 'SET_ITEMS', payload: loadSavedWishlist() });
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 200);
    }
  }, [isAuthenticated]);

  // Derived available categories from current items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    state.items.forEach((item) => {
      if (item && item.categoryName) {
        cats.add(item.categoryName);
      }
    });
    return Array.from(cats);
  }, [state.items]);

  // Filtered & Sorted items computation
  const filteredItems = useMemo(() => {
    let result = [...state.items];

    // Filter by Category
    if (state.filterCategory && state.filterCategory !== 'all') {
      result = result.filter(
        (i) => (i?.categoryName || '').toLowerCase() === state.filterCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          (i?.name || '').toLowerCase().includes(q) ||
          (i?.categoryName || '').toLowerCase().includes(q) ||
          (i?.description || '').toLowerCase().includes(q)
      );
    }

    // Sort items
    result.sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      switch (state.sortBy) {
        case 'price-asc':
          return (a.basePrice || 0) - (b.basePrice || 0);
        case 'price-desc':
          return (b.basePrice || 0) - (a.basePrice || 0);
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'recent':
        default:
          return (b.addedAt || 0) - (a.addedAt || 0);
      }
    });

    return result;
  }, [state.items, state.filterCategory, state.searchQuery, state.sortBy]);

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        itemCount: state.items.length,
        filteredItems,
        categories,
        addToWishlist,
        removeFromWishlist,
        undoRemove,
        clearWishlist,
        setSortBy,
        setViewMode,
        setSearchQuery,
        setFilterCategory,
        isInWishlist,
        moveToCart,
        moveAllToCart,
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    return defaultFallbackContext;
  }
  return context;
};
