import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '@/types/product';
import { mockProducts } from '@/mocks/products';

// Mock initial data: let's pretend a few items are already in the wishlist
const MOCK_INITIAL_WISHLIST = [
  mockProducts[0],
  mockProducts[2],
  mockProducts[4]
];

export type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
export type ViewMode = 'grid' | 'compact';

interface WishlistState {
  items: Product[];
  lastRemoved: Product | null;
  sortBy: SortOption;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UNDO_REMOVE' }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_SORT_BY'; payload: SortOption }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: WishlistState = {
  items: [],
  lastRemoved: null,
  sortBy: 'recent',
  viewMode: 'grid',
  isLoading: true,
  error: null,
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.some((i) => i.id === action.payload.id)) return state;
      return { ...state, items: [...state.items, action.payload], lastRemoved: null };
    
    case 'REMOVE_ITEM': {
      const removedItem = state.items.find((i) => i.id === action.payload) || null;
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
        lastRemoved: removedItem,
      };
    }
    
    case 'UNDO_REMOVE':
      if (!state.lastRemoved) return state;
      return {
        ...state,
        items: [...state.items, state.lastRemoved],
        lastRemoved: null,
      };
    
    case 'CLEAR_WISHLIST':
      return { ...state, items: [], lastRemoved: null };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    default:
      return state;
  }
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  undoRemove: () => void;
  clearWishlist: () => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  isInWishlist: (productId: string) => boolean;
  refresh: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Simulate initial fetch
  useEffect(() => {
    let isMounted = true;
    
    const fetchWishlist = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      setTimeout(() => {
        if (!isMounted) return;
        
        MOCK_INITIAL_WISHLIST.forEach(product => {
          dispatch({ type: 'ADD_ITEM', payload: product });
        });
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 800);
    };

    fetchWishlist();
    return () => { isMounted = false; };
  }, []);

  const addToWishlist = (product: Product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeFromWishlist = (productId: string) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
  const undoRemove = () => dispatch({ type: 'UNDO_REMOVE' });
  const clearWishlist = () => dispatch({ type: 'CLEAR_WISHLIST' });
  const setSortBy = (sort: SortOption) => dispatch({ type: 'SET_SORT_BY', payload: sort });
  const setViewMode = (mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  const isInWishlist = (productId: string) => state.items.some((i) => i.id === productId);

  const refresh = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 600);
  };

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addToWishlist,
        removeFromWishlist,
        undoRemove,
        clearWishlist,
        setSortBy,
        setViewMode,
        isInWishlist,
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
