import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productData } from '@/features/products';
import { Product } from '@/types/product';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useSearch(onClose?: () => void, onFocusChange?: (focused: boolean) => void) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Chocolate cake pops', 'Strawberry cookies']);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { triggerReaction } = useMascotOrchestrator();

  const debouncedQuery = useDebounce(query, 300);

  // Simulate search API call
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    const lowercaseQuery = debouncedQuery.toLowerCase();
    productData.searchProducts(lowercaseQuery).then((filtered: any) => {
      setResults(filtered.slice(0, 5));
      setIsLoading(false);
      if (filtered.length === 0 && debouncedQuery.trim().length > 0) {
        triggerReaction('search:no-results', `I couldn't find "${debouncedQuery}"...`);
      }
    });
  }, [debouncedQuery, triggerReaction]);

  // Reset loading state immediately on new input
  useEffect(() => {
    if (query.trim() !== debouncedQuery.trim()) {
      setIsLoading(true);
    }
  }, [query, debouncedQuery]);

  const handleResultClick = (product: Product) => {
    navigate(`/product/${product.slug}`);
    if (onFocusChange) onFocusChange(false);
    if (onClose) onClose();
    
    // Add to recent searches
    if (!recentSearches.includes(product.name)) {
      setRecentSearches(prev => [product.name, ...prev].slice(0, 4));
    }
  };

  const handleSearchSubmit = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      if (onFocusChange) onFocusChange(false);
      if (onClose) onClose();
      
      if (!recentSearches.includes(searchTerm)) {
        setRecentSearches(prev => [searchTerm, ...prev].slice(0, 4));
      }
      triggerReaction('search:query-submitted', `Searching for ${searchTerm}...`);
    }
  };

  const removeRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(t => t !== term));
  };

  return {
    query,
    setQuery,
    isLoading,
    results,
    recentSearches,
    setRecentSearches,
    activeIndex,
    setActiveIndex,
    debouncedQuery,
    handleResultClick,
    handleSearchSubmit,
    removeRecent
  };
}
