import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productData } from '@/features/products';
import { Product } from '@/types/product';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';
import {
  FrontendCatalogSearchEngine,
  SearchCategory,
  BudgetShortcut,
  parsePriceIntent,
  normalizeText,
} from './catalogSearchEngine';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// In-memory LRU search cache (100 entries)
const clientSearchCache = new Map<
  string,
  {
    results: Product[];
    budgetShortcuts: BudgetShortcut[];
    didYouMean: string | null;
    matchedCategories: SearchCategory[];
    fallbackRecommendations: Product[];
    fallbackCategories: SearchCategory[];
    timestamp: number;
  }
>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export function useSearch(onClose?: () => void, onFocusChange?: (focused: boolean) => void) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [budgetShortcuts, setBudgetShortcuts] = useState<BudgetShortcut[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [matchedCategories, setMatchedCategories] = useState<SearchCategory[]>([]);
  const [fallbackRecommendations, setFallbackRecommendations] = useState<Product[]>([]);
  const [fallbackCategories, setFallbackCategories] = useState<SearchCategory[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Chocolate Cake Pops', 'Cookies']);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [predictions, setPredictions] = useState<string[]>([]);

  const { triggerReaction } = useMascotOrchestrator();

  // Fast 180ms debounce for ultra-responsive feel
  const debouncedQuery = useDebounce(query, 180);

  // Request sequencing and cancellation refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const localEngineRef = useRef<FrontendCatalogSearchEngine | null>(null);

  // Initialize client-side catalog search engine for instantaneous local searches
  useEffect(() => {
    Promise.all([productData.getProducts(), productData.getCategories()]).then(
      ([prods, cats]) => {
        const engine = new FrontendCatalogSearchEngine(
          prods,
          cats as SearchCategory[]
        );
        localEngineRef.current = engine;
        if (query.trim()) {
          setPredictions(engine.getPredictions(query.trim(), 6));
        }
      }
    );
  }, []);

  // Update predictions instantly on every keystroke
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setPredictions([]);
      setActiveIndex(-1);
      return;
    }
    if (localEngineRef.current) {
      setPredictions(localEngineRef.current.getPredictions(trimmed, 6));
    }
    setActiveIndex(-1);
  }, [query]);

  // Execute search when debouncedQuery changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setResults([]);
      setBudgetShortcuts([]);
      setDidYouMean(null);
      setMatchedCategories([]);
      setFallbackRecommendations([]);
      setFallbackCategories([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const normQuery = normalizeText(trimmed);

    // 1. Check client-side query cache first
    const cached = clientSearchCache.get(normQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setResults(cached.results);
      setBudgetShortcuts(cached.budgetShortcuts || []);
      setDidYouMean(cached.didYouMean);
      setMatchedCategories(cached.matchedCategories);
      setFallbackRecommendations(cached.fallbackRecommendations);
      setFallbackCategories(cached.fallbackCategories);
      setIsLoading(false);
      setActiveIndex(-1);

      if (cached.results.length === 0) {
        triggerReaction('search:no-results', `I couldn't find "${trimmed}"...`);
      }
      return;
    }

    // 2. If client-side engine has loaded the catalog, compute instant local result
    let instantLocalResult: any = null;
    if (localEngineRef.current) {
      instantLocalResult = localEngineRef.current.search(trimmed, { limit: 8 });
      setResults(instantLocalResult.results);
      setBudgetShortcuts(instantLocalResult.budgetShortcuts || []);
      setDidYouMean(instantLocalResult.didYouMean || null);
      setMatchedCategories(instantLocalResult.matchedCategories || []);
      setFallbackRecommendations(instantLocalResult.fallbackRecommendations || []);
      setFallbackCategories(instantLocalResult.fallbackCategories || []);
    }

    // 3. Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    const performSearch = async () => {
      try {
        let resData: any;
        if (typeof productData.searchCatalog === 'function') {
          resData = await productData.searchCatalog(trimmed, {
            signal: controller.signal,
          });
        } else {
          const prods = await productData.searchProducts(trimmed, {
            signal: controller.signal,
          });
          resData = {
            results: prods,
            total: prods.length,
            query: trimmed,
            budgetShortcuts: instantLocalResult?.budgetShortcuts || [],
            didYouMean: instantLocalResult?.didYouMean || null,
            matchedCategories: instantLocalResult?.matchedCategories || [],
            fallbackRecommendations: instantLocalResult?.fallbackRecommendations || [],
            fallbackCategories: instantLocalResult?.fallbackCategories || [],
          };
        }

        // Stale request check: discard if newer query has dispatched
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const finalResults = (resData.results || []).slice(0, 8);
        const finalShortcuts = resData.budgetShortcuts || instantLocalResult?.budgetShortcuts || [];
        const finalDidYouMean = resData.didYouMean || null;
        const finalCategories = resData.matchedCategories || [];
        const finalFallbacks = resData.fallbackRecommendations || [];
        const finalFallbackCats = resData.fallbackCategories || [];

        setResults(finalResults);
        setBudgetShortcuts(finalShortcuts);
        setDidYouMean(finalDidYouMean);
        setMatchedCategories(finalCategories);
        setFallbackRecommendations(finalFallbacks);
        setFallbackCategories(finalFallbackCats);
        setIsLoading(false);
        setActiveIndex(-1);

        // Cache response
        if (clientSearchCache.size >= 100) {
          const oldestKey = clientSearchCache.keys().next().value;
          if (oldestKey) clientSearchCache.delete(oldestKey);
        }
        clientSearchCache.set(normQuery, {
          results: finalResults,
          budgetShortcuts: finalShortcuts,
          didYouMean: finalDidYouMean,
          matchedCategories: finalCategories,
          fallbackRecommendations: finalFallbacks,
          fallbackCategories: finalFallbackCats,
          timestamp: Date.now(),
        });

        if (finalResults.length === 0) {
          triggerReaction('search:no-results', `I couldn't find "${trimmed}"...`);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
          return;
        }
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, triggerReaction]);

  // Loading state indicator while debouncing
  useEffect(() => {
    if (query.trim() !== debouncedQuery.trim() && query.trim().length > 0) {
      setIsLoading(true);
    }
  }, [query, debouncedQuery]);

  const handleResultClick = useCallback(
    (product: Product) => {
      navigate(`/product/${product.slug}`);
      if (onFocusChange) onFocusChange(false);
      if (onClose) onClose();

      if (!recentSearches.includes(product.name)) {
        setRecentSearches((prev) => [product.name, ...prev].slice(0, 4));
      }
    },
    [navigate, onFocusChange, onClose, recentSearches]
  );

  const handleSearchSubmit = useCallback(
    (searchTerm: string) => {
      const term = searchTerm.trim();
      if (term) {
        const intent = parsePriceIntent(term);
        const params = new URLSearchParams();
        if (intent.hasPriceIntent) {
          if (intent.cleanTerm) params.append('search', intent.cleanTerm);
          if (intent.maxPrice !== undefined) params.append('maxPrice', intent.maxPrice.toString());
          if (intent.minPrice !== undefined) params.append('minPrice', intent.minPrice.toString());
        } else {
          params.append('search', term);
        }

        navigate(`/shop?${params.toString()}`);
        if (onFocusChange) onFocusChange(false);
        if (onClose) onClose();

        if (!recentSearches.includes(term)) {
          setRecentSearches((prev) => [term, ...prev].slice(0, 4));
        }
        triggerReaction('search:query-submitted', `Searching for ${term}...`);
      } else {
        navigate('/shop');
        if (onFocusChange) onFocusChange(false);
        if (onClose) onClose();
      }
    },
    [navigate, onFocusChange, onClose, recentSearches, triggerReaction]
  );

  const handleBudgetClick = useCallback(
    (shortcut: BudgetShortcut) => {
      const params = new URLSearchParams();
      if (shortcut.searchTerm && shortcut.searchTerm !== 'Treats') {
        params.append('search', shortcut.searchTerm);
      }
      params.append('maxPrice', shortcut.maxPrice.toString());

      navigate(`/shop?${params.toString()}`);
      if (onFocusChange) onFocusChange(false);
      if (onClose) onClose();

      if (!recentSearches.includes(shortcut.label)) {
        setRecentSearches((prev) => [shortcut.label, ...prev].slice(0, 4));
      }
      triggerReaction('search:query-submitted', `Filtering ${shortcut.label}...`);
    },
    [navigate, onFocusChange, onClose, recentSearches, triggerReaction]
  );

  const handleCategoryClick = useCallback(
    (cat: SearchCategory) => {
      const catSlug = cat.id || cat.name.toLowerCase().replace(/\s+/g, '-');
      navigate(catSlug === 'all' ? '/shop' : `/shop?category=${catSlug}`);
      if (onFocusChange) onFocusChange(false);
      if (onClose) onClose();
      triggerReaction('filter:applied', `Viewing ${cat.name}...`);
    },
    [navigate, onFocusChange, onClose, triggerReaction]
  );

  const handleDidYouMeanClick = useCallback(
    (suggestedTerm: string) => {
      setQuery(suggestedTerm);
    },
    []
  );

  const removeRecent = useCallback((e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  }, []);

  return {
    query,
    setQuery,
    isLoading,
    results,
    budgetShortcuts,
    didYouMean,
    matchedCategories,
    fallbackRecommendations,
    fallbackCategories,
    recentSearches,
    setRecentSearches,
    activeIndex,
    setActiveIndex,
    predictions,
    debouncedQuery,
    handleResultClick,
    handleSearchSubmit,
    handleBudgetClick,
    handleCategoryClick,
    handleDidYouMeanClick,
    removeRecent,
  };
}
