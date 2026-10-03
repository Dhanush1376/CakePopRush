/**
 * CakePopRush Ultra-Smart, Data-Driven Catalog Search Engine
 * 
 * Powered strictly by the actual CakePopRush product catalog.
 * Handles exact matches, partial words, prefixes, misspellings/fuzzy typos,
 * word order variations, casual language, and gibberish fallback.
 */

export interface SearchProduct {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  basePrice: number;
  rating?: number;
  reviewCount?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  description?: string;
  ingredients?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  occasions?: string[];
  flavours?: any[];
  images?: { id?: string; url: string; alt?: string }[];
  isActive?: boolean;
  isPublished?: boolean;
  [key: string]: any;
}

export interface SearchCategory {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SearchResultItem {
  product: SearchProduct;
  score: number;
  matchedFields: string[];
}

export interface PriceIntent {
  cleanTerm: string;
  minPrice?: number;
  maxPrice?: number;
  hasPriceIntent: boolean;
}

export interface BudgetShortcut {
  id: string;
  label: string;
  searchTerm: string;
  maxPrice: number;
  count: number;
}

export interface SearchResponse {
  results: SearchProduct[];
  total: number;
  query: string;
  cleanTerm?: string;
  appliedPriceFilter?: {
    minPrice?: number;
    maxPrice?: number;
  };
  budgetShortcuts?: BudgetShortcut[];
  didYouMean?: string | null;
  matchedCategories: SearchCategory[];
  fallbackRecommendations?: SearchProduct[];
  fallbackCategories?: SearchCategory[];
}

export interface SuggestionResponse {
  query: string;
  predictions?: string[];
  terms: {
    term: string;
    type: 'term' | 'category' | 'intent';
    categorySlug?: string;
  }[];
  budgetShortcuts: BudgetShortcut[];
  products: {
    id: string;
    slug: string;
    name: string;
    categoryName: string;
    basePrice: number;
    priceInRupees: number;
    image?: string;
    isBestSeller?: boolean;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
  didYouMean?: string | null;
}

// ----------------------------------------------------
// UTILITY FUNCTIONS: Levenshtein with Transpositions (Damerau-Levenshtein)
// ----------------------------------------------------
export function damerauLevenshtein(a: string, b: string, maxDistance = 2): number {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (!lenA) return lenB;
  if (!lenB) return lenA;
  if (Math.abs(lenA - lenB) > maxDistance) return maxDistance + 1;

  // 2D distance matrix
  const d: number[][] = [];
  for (let i = 0; i <= lenA; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= lenB; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    let minRowVal = d[i][0];
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition check (e.g., 'choclate' vs 'chocolate')
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }

      minRowVal = Math.min(minRowVal, d[i][j]);
    }
    // Early cutoff if whole row exceeds maxDistance
    if (minRowVal > maxDistance) {
      return maxDistance + 1;
    }
  }

  return d[lenA][lenB];
}

// Singularize common plural suffixes in baking domain
export function singularizeWord(word: string): string {
  if (word.endsWith('cookies')) return word.slice(0, -1); // cookie
  if (word.endsWith('brownies')) return word.slice(0, -1); // brownie
  if (word.endsWith('cupcakes')) return word.slice(0, -1); // cupcake
  if (word.endsWith('macarons')) return word.slice(0, -1); // macaron
  if (word.endsWith('boxes')) return word.slice(0, -2); // box
  if (word.endsWith('pops')) return word.slice(0, -1); // pop
  if (word.endsWith('jars')) return word.slice(0, -1); // jar
  if (word.endsWith('cakes')) return word.slice(0, -1); // cake
  if (word.endsWith('chips')) return word.slice(0, -1); // chip
  if (word.endsWith('sweets')) return word.slice(0, -1); // sweet
  if (word.endsWith('treats')) return word.slice(0, -1); // treat
  if (word.length > 4 && word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

// Compound word expansions / contractions common in baking ecommerce
const COMPOUND_REPLACEMENTS: [RegExp, string][] = [
  [/\bcakepops?\b/g, 'cake pop'],
  [/\bcup\s*cakes?\b/g, 'cupcake'],
  [/\bchoc\b/g, 'chocolate'],
  [/\bchoclate\b/g, 'chocolate'],
  [/\bsea\s*salt\b/g, 'seasalt'],
  [/\bred\s*velvet\b/g, 'redvelvet'],
  [/\bgift\s*box\b/g, 'giftbox'],
];

export function normalizeText(text: string): string {
  if (!text) return '';
  let str = text.toLowerCase().trim();
  for (const [pattern, replacement] of COMPOUND_REPLACEMENTS) {
    str = str.replace(pattern, replacement);
  }
  // Remove special characters, keep alphanumeric, spaces, and hyphens
  str = str.replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  return str;
}

export function extractTokens(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  const rawTokens = normalized.split(/[\s-]+/).filter((t) => t.length > 0);
  const result: string[] = [];
  for (const t of rawTokens) {
    result.push(t);
    const sing = singularizeWord(t);
    if (sing !== t) {
      result.push(sing);
    }
  }
  return Array.from(new Set(result));
}

// ----------------------------------------------------
// PRICE INTENT PARSING & BUDGET SHORTCUTS GENERATION
// ----------------------------------------------------
export function parsePriceIntent(rawQuery: string): PriceIntent {
  if (!rawQuery) {
    return { cleanTerm: '', hasPriceIntent: false };
  }

  let text = rawQuery.trim();
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let hasPriceIntent = false;

  // 1. Range query: "between ₹500 and ₹1,000", "500 to 1000", "500-1000", "500 & 1000"
  const rangeRegex = /(?:between\s+)?(?:₹|rs\.?|inr)?\s*(\d{1,5}(?:,\d{3})*)\s*(?:to|-|and|&)\s*(?:₹|rs\.?|inr)?\s*(\d{1,5}(?:,\d{3})*)/i;
  const rangeMatch = text.match(rangeRegex);
  if (rangeMatch) {
    const p1 = parseInt(rangeMatch[1].replace(/,/g, ''), 10);
    const p2 = parseInt(rangeMatch[2].replace(/,/g, ''), 10);
    if (!isNaN(p1) && !isNaN(p2) && (p1 >= 50 || p2 >= 50)) {
      minPrice = Math.min(p1, p2);
      maxPrice = Math.max(p1, p2);
      hasPriceIntent = true;
      text = text.replace(rangeMatch[0], ' ');
    }
  }

  // 2. Upper bound (max price): "under 1000", "below ₹1,000", "less than 500", "within 600", "upto 700", "<= 800", "budget 1000"
  if (!hasPriceIntent) {
    const maxRegex = /(?:under|below|less\s+than|within|upto|up\s+to|<=?|budget)\s*(?:₹|rs\.?|inr)?\s*(\d{1,5}(?:,\d{3})*)/i;
    const maxMatch = text.match(maxRegex);
    if (maxMatch) {
      const val = parseInt(maxMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(val) && val >= 50) {
        maxPrice = val;
        hasPriceIntent = true;
        text = text.replace(maxMatch[0], ' ');
      }
    }
  }

  // 3. Lower bound (min price): "above 500", "over ₹500", "more than 600", ">= 500"
  if (!minPrice) {
    const minRegex = /(?:above|over|more\s+than|greater\s+than|>=?)\s*(?:₹|rs\.?|inr)?\s*(\d{1,5}(?:,\d{3})*)/i;
    const minMatch = text.match(minRegex);
    if (minMatch) {
      const val = parseInt(minMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(val) && val >= 50) {
        minPrice = val;
        hasPriceIntent = true;
        text = text.replace(minMatch[0], ' ');
      }
    }
  }

  const cleanTerm = text
    .replace(/(?:₹|rs\.?|inr)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    cleanTerm,
    minPrice,
    maxPrice,
    hasPriceIntent,
  };
}

export function generateBudgetShortcuts(
  matchingProducts: SearchProduct[],
  searchTerm: string
): BudgetShortcut[] {
  if (!matchingProducts || matchingProducts.length === 0) return [];

  const prices = Array.from(
    new Set(
      matchingProducts
        .map((p) => Math.round((p.basePrice || 0) / 100))
        .filter((price) => price > 0)
    )
  ).sort((a, b) => a - b);

  if (prices.length === 0) return [];

  const minPrice = prices[0];
  const maxPrice = prices[prices.length - 1];

  const candidateThresholds = [300, 400, 500, 600, 700, 800, 1000, 1500, 2000, 2500];
  const rawShortcuts: BudgetShortcut[] = [];
  const displayTerm = searchTerm.trim() ? searchTerm.trim() : 'Treats';

  for (const threshold of candidateThresholds) {
    if (threshold < minPrice) continue;
    if (threshold > maxPrice * 1.6 && threshold > maxPrice + 300) continue;

    const qualifyingCount = matchingProducts.filter(
      (p) => Math.round((p.basePrice || 0) / 100) <= threshold
    ).length;

    if (qualifyingCount > 0) {
      rawShortcuts.push({
        id: `budget-${threshold}`,
        label: `${displayTerm} under ₹${threshold.toLocaleString('en-IN')}`,
        searchTerm: displayTerm,
        maxPrice: threshold,
        count: qualifyingCount,
      });
    }

    if (rawShortcuts.length >= 4) break;
  }

  const uniqueShortcuts: BudgetShortcut[] = [];
  const seenCounts = new Set<number>();
  for (const sc of rawShortcuts) {
    if (sc.count === matchingProducts.length && seenCounts.has(sc.count)) {
      continue;
    }
    seenCounts.add(sc.count);
    uniqueShortcuts.push(sc);
    if (uniqueShortcuts.length >= 3) break;
  }

  if (uniqueShortcuts.length === 1 && rawShortcuts.length > 1) {
    const next = rawShortcuts.find((s) => s.maxPrice !== uniqueShortcuts[0].maxPrice);
    if (next) uniqueShortcuts.push(next);
  }

  return uniqueShortcuts;
}

// ----------------------------------------------------
// CATALOG SEARCH ENGINE CLASS
// ----------------------------------------------------
export interface CandidatePhrase {
  text: string;
  type: 'category' | 'concept' | 'product';
  boost: number;
}

const CORE_CATALOG_CONCEPTS: { text: string; boost: number }[] = [
  { text: 'Cake Pops', boost: 160 },
  { text: 'Chocolates', boost: 150 },
  { text: 'Cupcakes', boost: 140 },
  { text: 'Cookies', boost: 130 },
  { text: 'Brownies', boost: 120 },
  { text: 'Cakes', boost: 110 },
  { text: 'Macarons', boost: 100 },
  { text: 'Cake Jars', boost: 90 },
  { text: 'Gift Boxes', boost: 80 },
  { text: 'Desserts', boost: 70 },
  { text: 'Cakesicles', boost: 60 },
  { text: 'Birthday Cakes', boost: 55 },
  { text: 'Truffles', boost: 50 },
  { text: 'Dark Chocolate', boost: 45 },
  { text: 'Red Velvet', boost: 40 },
  { text: 'Vanilla', boost: 35 },
  { text: 'Nutella', boost: 30 },
  { text: 'Eggless', boost: 25 },
];

export class CatalogSearchEngine {
  private products: SearchProduct[] = [];
  private categories: SearchCategory[] = [];
  private vocabulary: Set<string> = new Set();
  private candidatePhrases: CandidatePhrase[] = [];
  private tokenInvertedIndex: Map<
    string,
    { productId: string; field: string; weight: number }[]
  > = new Map();
  private queryCache: Map<string, { timestamp: number; response: SearchResponse }> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_MAX_SIZE = 250;

  constructor(products: SearchProduct[], categories: SearchCategory[]) {
    this.reindex(products, categories);
  }

  public reindex(products: SearchProduct[], categories: SearchCategory[]) {
    // Only index visible products
    this.products = products.filter(
      (p) => p.isActive !== false && p.isPublished !== false && p.isDeleted !== true
    );
    this.categories = categories || [];
    this.vocabulary.clear();
    this.tokenInvertedIndex.clear();
    this.queryCache.clear();
    this.candidatePhrases = [];

    const seenCandidates = new Set<string>();
    const addCandidate = (text: string, type: 'category' | 'concept' | 'product', boost: number) => {
      const clean = text.trim();
      const lower = clean.toLowerCase();
      if (!clean || seenCandidates.has(lower)) return;
      seenCandidates.add(lower);
      this.candidatePhrases.push({ text: clean, type, boost });
    };

    // 1. Core concepts
    for (const c of CORE_CATALOG_CONCEPTS) {
      addCandidate(c.text, 'concept', c.boost);
    }

    // 2. Real categories
    for (const cat of this.categories) {
      if (cat.id !== 'all' && cat.name?.toLowerCase() !== 'all items') {
        addCandidate(cat.name, 'category', 75);
      }
    }

    // 3. Real products from catalog
    for (const prod of this.products) {
      if (prod.name) {
        addCandidate(prod.name, 'product', prod.isBestSeller ? 25 : 15);
      }
    }

    // 1. Index categories
    for (const cat of this.categories) {
      const catTokens = extractTokens(cat.name);
      for (const t of catTokens) {
        this.vocabulary.add(t);
      }
    }

    // 2. Index products
    for (const product of this.products) {
      this.indexProductField(product.id, product.name, 'name', 12);
      this.indexProductField(product.id, product.categoryName, 'categoryName', 8);
      this.indexProductField(product.id, product.description, 'description', 3);
      this.indexProductField(product.id, product.ingredients, 'ingredients', 4);

      if (Array.isArray(product.dietaryInfo)) {
        for (const item of product.dietaryInfo) {
          this.indexProductField(product.id, item, 'dietaryInfo', 5);
        }
      }
      if (Array.isArray(product.occasions)) {
        for (const item of product.occasions) {
          this.indexProductField(product.id, item, 'occasions', 5);
        }
      }
      if (Array.isArray(product.allergens)) {
        for (const item of product.allergens) {
          this.indexProductField(product.id, item, 'allergens', 2);
        }
      }
      if (Array.isArray(product.flavours)) {
        for (const f of product.flavours) {
          const flavourName = typeof f === 'string' ? f : f?.name;
          if (flavourName) {
            this.indexProductField(product.id, flavourName, 'flavours', 6);
          }
        }
      }
    }
  }

  private indexProductField(
    productId: string,
    text: string | undefined,
    field: string,
    weight: number
  ) {
    if (!text) return;
    const tokens = extractTokens(text);
    for (const token of tokens) {
      if (token.length < 2) continue;
      this.vocabulary.add(token);

      if (!this.tokenInvertedIndex.has(token)) {
        this.tokenInvertedIndex.set(token, []);
      }
      this.tokenInvertedIndex.get(token)!.push({ productId, field, weight });
    }
  }

  /**
   * Find closest vocabulary term for typo tolerance
   */
  public findClosestVocabularyTerm(token: string): { word: string; distance: number } | null {
    if (token.length <= 2) return null;
    if (this.vocabulary.has(token)) return { word: token, distance: 0 };

    const maxAllowedDist = token.length <= 4 ? 1 : 2;
    let bestMatch: string | null = null;
    let minDistance = maxAllowedDist + 1;

    for (const vocabWord of this.vocabulary) {
      // Fast length difference prune
      if (Math.abs(vocabWord.length - token.length) > maxAllowedDist) continue;

      const dist = damerauLevenshtein(token, vocabWord, maxAllowedDist);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = vocabWord;
        if (dist === 1) break; // Good enough match for fast exit
      }
    }

    if (bestMatch && minDistance <= maxAllowedDist) {
      return { word: bestMatch, distance: minDistance };
    }
    return null;
  }

  /**
   * Main Search Method
   */
  public search(
    rawQuery: string,
    options: {
      limit?: number;
      minScore?: number;
      isFeatured?: boolean;
      isBestSeller?: boolean;
      isNew?: boolean;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {}
  ): SearchResponse {
    // 1. Sanitize & trim query
    const cleanQuery = (rawQuery || '').slice(0, 100).trim();
    const priceIntent = parsePriceIntent(cleanQuery);
    const effectiveMinPrice = options.minPrice !== undefined ? options.minPrice : priceIntent.minPrice;
    const effectiveMaxPrice = options.maxPrice !== undefined ? options.maxPrice : priceIntent.maxPrice;
    const effectiveQuery = priceIntent.hasPriceIntent ? priceIntent.cleanTerm : cleanQuery;

    // Check cache
    const cacheKey = JSON.stringify({ cleanQuery, effectiveMinPrice, effectiveMaxPrice, options });
    const cached = this.queryCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.response;
    }

    // If effective query is empty (or purely a price query), return filtered active products
    if (!effectiveQuery) {
      let filtered = [...this.products];
      if (options.isFeatured) filtered = filtered.filter((p) => p.isBestSeller || p.isNew);
      if (options.isBestSeller) filtered = filtered.filter((p) => p.isBestSeller);
      if (options.isNew) filtered = filtered.filter((p) => p.isNew);
      if (options.category) {
        const catNorm = normalizeText(options.category);
        filtered = filtered.filter((p) => normalizeText(p.categoryName) === catNorm);
      }
      if (effectiveMinPrice !== undefined) {
        filtered = filtered.filter((p) => Math.round((p.basePrice || 0) / 100) >= effectiveMinPrice);
      }
      if (effectiveMaxPrice !== undefined) {
        filtered = filtered.filter((p) => Math.round((p.basePrice || 0) / 100) <= effectiveMaxPrice);
      }

      const total = filtered.length;
      const budgetShortcuts = generateBudgetShortcuts(filtered, options.category || 'Treats');

      if (options.limit && options.limit > 0) {
        filtered = filtered.slice(0, options.limit);
      }

      const response: SearchResponse = {
        results: filtered,
        total,
        query: cleanQuery,
        cleanTerm: effectiveQuery,
        appliedPriceFilter: (effectiveMinPrice !== undefined || effectiveMaxPrice !== undefined) ? {
          minPrice: effectiveMinPrice,
          maxPrice: effectiveMaxPrice,
        } : undefined,
        budgetShortcuts,
        matchedCategories: [],
        didYouMean: null,
      };

      this.saveToCache(cacheKey, response);
      return response;
    }

    const normalizedQuery = normalizeText(effectiveQuery);
    const queryTokens = extractTokens(effectiveQuery);

    const scores = new Map<string, { score: number; matchedFields: Set<string> }>();
    const matchedCategoryIds = new Set<string>();
    let didYouMeanTokens: string[] = [];
    let hadTypoCorrection = false;

    // Check matched categories
    for (const cat of this.categories) {
      const catNorm = normalizeText(cat.name);
      if (catNorm.includes(normalizedQuery) || normalizedQuery.includes(catNorm)) {
        matchedCategoryIds.add(cat.id);
      }
    }

    // 2. Score candidate products
    for (const product of this.products) {
      // Category filter check if specified in options
      if (options.category) {
        const catNorm = normalizeText(options.category);
        if (
          normalizeText(product.categoryName) !== catNorm &&
          product.categoryName?.toLowerCase().replace(/\s+/g, '-') !== options.category.toLowerCase()
        ) {
          continue;
        }
      }

      // Authoritative Price Filter Check (stored in Paise, converted to Rupees)
      const priceInRupees = Math.round((product.basePrice || 0) / 100);
      if (effectiveMinPrice !== undefined && priceInRupees < effectiveMinPrice) {
        continue;
      }
      if (effectiveMaxPrice !== undefined && priceInRupees > effectiveMaxPrice) {
        continue;
      }

      let score = 0;
      const matchedFields = new Set<string>();

      const prodNameNorm = normalizeText(product.name);
      const prodCatNorm = normalizeText(product.categoryName);
      const prodDescNorm = normalizeText(product.description || '');

      // --- TIER 1: Exact matches & phrase containment ---
      // Exact title match gets massive priority at the top
      if (prodNameNorm === normalizedQuery) {
        score += 2500;
        matchedFields.add('exact_title');
      } else if (prodNameNorm.startsWith(normalizedQuery)) {
        score += 850;
        matchedFields.add('title_prefix');
      } else if (prodNameNorm.includes(normalizedQuery)) {
        score += 650;
        matchedFields.add('title_phrase');
      }

      // Exact category match
      if (prodCatNorm === normalizedQuery) {
        score += 550;
        matchedFields.add('exact_category');
      } else if (prodCatNorm.includes(normalizedQuery)) {
        score += 300;
        matchedFields.add('category_phrase');
      }

      // Check if ALL query tokens appear in title (regardless of word order!)
      const allTokensInTitle =
        queryTokens.length > 1 &&
        queryTokens.every(
          (qt) => prodNameNorm.includes(qt) || prodNameNorm.includes(singularizeWord(qt))
        );
      if (allTokensInTitle) {
        score += 500;
        matchedFields.add('all_tokens_in_title');
      }

      // --- TIER 2: Token-based scoring & fuzzy tolerance ---
      for (const qToken of queryTokens) {
        if (qToken.length < 2) continue;

        let tokenMatched = false;

        // A. Exact token match in Title
        if (prodNameNorm.includes(qToken)) {
          score += 180;
          matchedFields.add('title_token');
          tokenMatched = true;
        }
        // B. Prefix match in Title (user typing partial word, e.g. 'choc' -> 'chocolate')
        else if (prodNameNorm.split(' ').some((w) => w.startsWith(qToken))) {
          score += 140;
          matchedFields.add('title_token_prefix');
          tokenMatched = true;
        }

        // C. Category token match
        if (prodCatNorm.includes(qToken)) {
          score += 120;
          matchedFields.add('category_token');
          tokenMatched = true;
        }

        // D. Occasions & Dietary
        if (product.occasions && product.occasions.some((o) => normalizeText(o).includes(qToken))) {
          score += 90;
          matchedFields.add('occasions');
          tokenMatched = true;
        }
        if (product.dietaryInfo && product.dietaryInfo.some((d) => normalizeText(d).includes(qToken))) {
          score += 80;
          matchedFields.add('dietary');
          tokenMatched = true;
        }

        // E. Ingredients
        if (product.ingredients && normalizeText(product.ingredients).includes(qToken)) {
          score += 60;
          matchedFields.add('ingredients');
          tokenMatched = true;
        }

        // F. Description
        if (prodDescNorm.includes(qToken)) {
          score += 40;
          matchedFields.add('description');
          tokenMatched = true;
        }

        // G. Fuzzy / Typo tolerance against product words if no exact match found for token
        if (!tokenMatched && qToken.length >= 4) {
          const prodWords = prodNameNorm.split(' ');
          for (const pw of prodWords) {
            if (pw.length < 4) continue;
            const dist = damerauLevenshtein(qToken, pw, 2);
            if (dist === 1) {
              score += 130;
              matchedFields.add('fuzzy_title_dist1');
              tokenMatched = true;
              break;
            } else if (dist === 2 && qToken.length >= 6) {
              score += 80;
              matchedFields.add('fuzzy_title_dist2');
              tokenMatched = true;
              break;
            }
          }

          if (!tokenMatched) {
            const catWords = prodCatNorm.split(' ');
            for (const cw of catWords) {
              if (cw.length < 4) continue;
              const dist = damerauLevenshtein(qToken, cw, 2);
              if (dist === 1) {
                score += 90;
                matchedFields.add('fuzzy_category');
                tokenMatched = true;
                break;
              }
            }
          }
        }
      }

      // --- TIER 3: Quality & Storefront signals (tie-breakers) ---
      if (score > 0) {
        if (product.isBestSeller) score += 15;
        if (product.isNew) score += 10;
        if (product.rating) score += Math.min(product.rating * 2, 10);
        if (product.reviewCount) score += Math.min(product.reviewCount * 0.05, 10);

        scores.set(product.id, { score, matchedFields });
      }
    }

    // 3. Compute Did You Mean suggestion from genuine catalog vocabulary
    const rawTokensForTypo = effectiveQuery
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    for (const qToken of rawTokensForTypo) {
      if (this.vocabulary.has(qToken) || qToken.length < 4) {
        didYouMeanTokens.push(qToken);
      } else {
        const closest = this.findClosestVocabularyTerm(qToken);
        if (closest && closest.distance > 0 && closest.distance <= 2) {
          didYouMeanTokens.push(closest.word);
          hadTypoCorrection = true;
        } else {
          didYouMeanTokens.push(qToken);
        }
      }
    }

    const correctedPhrase = didYouMeanTokens.join(' ');
    const didYouMean =
      hadTypoCorrection && correctedPhrase !== effectiveQuery.toLowerCase().trim()
        ? correctedPhrase
        : null;

    // 4. Filter by dynamic relevance threshold to reject gibberish and low-relevance incidental matches
    let maxScore = 0;
    for (const [_, data] of scores.entries()) {
      if (data.score > maxScore) maxScore = data.score;
    }

    const dynamicMinScore = Math.max(
      options.minScore || 50,
      maxScore >= 500 ? maxScore * 0.22 : (queryTokens.length > 1 ? 80 : 45)
    );

    const scoredProducts: SearchResultItem[] = [];

    for (const [prodId, data] of scores.entries()) {
      if (data.score >= dynamicMinScore) {
        const p = this.products.find((prod) => prod.id === prodId);
        if (p) {
          scoredProducts.push({
            product: p,
            score: data.score,
            matchedFields: Array.from(data.matchedFields),
          });
        }
      }
    }

    // Sort descending by relevance score
    scoredProducts.sort((a, b) => b.score - a.score);

    let finalResults = scoredProducts.map((sp) => sp.product);

    // Apply optional flags
    if (options.isFeatured) {
      finalResults = finalResults.filter((p) => p.isBestSeller || p.isNew);
    }
    if (options.isBestSeller) {
      finalResults = finalResults.filter((p) => p.isBestSeller);
    }
    if (options.isNew) {
      finalResults = finalResults.filter((p) => p.isNew);
    }

    const total = finalResults.length;
    const budgetShortcuts = generateBudgetShortcuts(finalResults, effectiveQuery || cleanQuery);

    if (options.limit && options.limit > 0) {
      finalResults = finalResults.slice(0, options.limit);
    }

    const matchedCategories = this.categories.filter((c) => matchedCategoryIds.has(c.id));

    // Fallback recommendation items if no products matched
    let fallbackRecommendations: SearchProduct[] | undefined;
    let fallbackCategories: SearchCategory[] | undefined;

    if (total === 0) {
      fallbackRecommendations = this.products
        .filter((p) => p.isBestSeller || p.isNew)
        .slice(0, 6);
      fallbackCategories = this.categories.slice(0, 6);
    }

    const response: SearchResponse = {
      results: finalResults,
      total,
      query: cleanQuery,
      cleanTerm: effectiveQuery,
      appliedPriceFilter: (effectiveMinPrice !== undefined || effectiveMaxPrice !== undefined) ? {
        minPrice: effectiveMinPrice,
        maxPrice: effectiveMaxPrice,
      } : undefined,
      budgetShortcuts,
      didYouMean,
      matchedCategories,
      fallbackRecommendations,
      fallbackCategories,
    };

    this.saveToCache(cacheKey, response);
    return response;
  }

  private saveToCache(cacheKey: string, response: SearchResponse) {
    if (this.queryCache.size >= this.CACHE_MAX_SIZE) {
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) this.queryCache.delete(oldestKey);
    }
    this.queryCache.set(cacheKey, { timestamp: Date.now(), response });
  }

  public getPredictions(rawQuery: string, limit = 6): string[] {
    const q = (rawQuery || '').trim().toLowerCase();
    if (!q) return [];

    const qCompact = q.replace(/[\s-]+/g, '');
    const scored: { text: string; score: number }[] = [];

    for (const item of this.candidatePhrases) {
      const lower = item.text.toLowerCase();
      const lowerCompact = lower.replace(/[\s-]+/g, '');
      const words = lower.split(/[\s-]+/).filter(Boolean);

      let score = 0;

      // 1. Exact match
      if (lower === q) {
        score = 2500 + item.boost;
      }
      // 2. Exact prefix match on full string
      else if (lower.startsWith(q)) {
        score = 1000 + item.boost - lower.length * 2;
      }
      // 3. Compact prefix match (e.g. "cakep" -> "cakepops", "cake pop" -> "cakepop")
      else if (lowerCompact.startsWith(qCompact)) {
        score = 920 + item.boost - lowerCompact.length * 2;
      }
      // 4. Word boundary prefix match (any word in the phrase starts with q)
      else if (words.some((w) => w.startsWith(q))) {
        const wordIdx = words.findIndex((w) => w.startsWith(q));
        score = 750 + item.boost - wordIdx * 30 - lower.length * 2;
      }
      // 5. Substring match (q length >= 2)
      else if (q.length >= 2 && lower.includes(q)) {
        score = 450 + item.boost - lower.indexOf(q) * 8 - lower.length;
      }
      // 6. Fuzzy matching for typos (q length >= 3)
      else if (q.length >= 3) {
        let bestWordDist = 99;
        for (const w of words) {
          if (Math.abs(w.length - q.length) <= 2) {
            const dist = damerauLevenshtein(q, w, 2);
            if (dist < bestWordDist) bestWordDist = dist;
          }
        }

        let phraseDist = 99;
        if (Math.abs(lowerCompact.length - qCompact.length) <= 2) {
          phraseDist = damerauLevenshtein(qCompact, lowerCompact, 2);
        }

        const minDist = Math.min(bestWordDist, phraseDist);
        if (minDist === 1) {
          score = 380 + item.boost - 40;
        } else if (minDist === 2) {
          score = 260 + item.boost - 80;
        }
      }

      // Relevance threshold: discard non-matching / gibberish terms
      if (score >= 200) {
        scored.push({ text: item.text, score });
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Deduplicate preserving highest score order
    const seen = new Set<string>();
    const results: string[] = [];

    for (const item of scored) {
      const norm = item.text.trim();
      if (!seen.has(norm.toLowerCase())) {
        seen.add(norm.toLowerCase());
        results.push(norm);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Fast preview suggestions for typing
   */
  public getSuggestions(query: string, limit = 5): SuggestionResponse {
    const cleanQuery = (query || '').slice(0, 100).trim();
    const priceIntent = parsePriceIntent(cleanQuery);
    const searchRes = this.search(cleanQuery, { limit: Math.max(limit, 8) });
    const predictions = this.getPredictions(cleanQuery, limit);

    const terms: SuggestionResponse['terms'] = [];
    if (cleanQuery) {
      terms.push({
        term: priceIntent.cleanTerm || cleanQuery,
        type: 'term',
      });
    }

    for (const cat of searchRes.matchedCategories) {
      terms.push({
        term: cat.name,
        type: 'category',
        categorySlug: cat.id || cat.name.toLowerCase().replace(/\s+/g, '-'),
      });
    }

    const budgetShortcuts =
      searchRes.budgetShortcuts ||
      generateBudgetShortcuts(searchRes.results, priceIntent.cleanTerm || cleanQuery);

    return {
      query: cleanQuery,
      predictions,
      terms,
      budgetShortcuts,
      products: searchRes.results.slice(0, limit).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        categoryName: p.categoryName,
        basePrice: p.basePrice,
        priceInRupees: Math.round(p.basePrice / 100),
        image: p.images?.[0]?.url,
        isBestSeller: p.isBestSeller,
      })),
      categories: searchRes.matchedCategories.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      didYouMean: searchRes.didYouMean,
    };
  }
}
