import { describe, it, expect, beforeEach } from 'vitest';
import { FrontendCatalogSearchEngine } from '../catalogSearchEngine';
import productsJson from '@/mocks/seed/storefront/products.json';
import categoriesJson from '@/mocks/seed/storefront/categories.json';

describe('FrontendCatalogSearchEngine - CakePopRush Storefront Search', () => {
  let engine: FrontendCatalogSearchEngine;

  beforeEach(() => {
    engine = new FrontendCatalogSearchEngine(productsJson as any, categoriesJson as any);
  });

  describe('1. Exact searches', () => {
    it('should find Chocolate Chip Cookies by exact title', () => {
      const res = engine.search('Chocolate Chip Cookies');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Chocolate Chip Cookies');
    });

    it('should find Oreo Pops by exact name', () => {
      const res = engine.search('Oreo Pops');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Oreo Pops');
    });
  });

  describe('2. Partial & Prefix searches', () => {
    it('should find chocolate items by prefix "choc"', () => {
      const res = engine.search('choc');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('chocolate'))).toBe(true);
    });

    it('should normalize compound word "cakepop" to "cake pop"', () => {
      const res = engine.search('cakepop');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.categoryName === 'Cake Pops')).toBe(true);
    });

    it('should normalize "cup cake" to "cupcake"', () => {
      const res = engine.search('cup cake');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.categoryName === 'Cupcakes')).toBe(true);
    });
  });

  describe('3. Typo & Misspelling tolerance (Real Catalog Derived)', () => {
    it('should tolerate "choclate" and provide "chocolate" in didYouMean', () => {
      const res = engine.search('choclate');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('chocolate'))).toBe(true);
      expect(res.didYouMean).toContain('chocolate');
    });

    it('should tolerate "biskoff" and match biscoff items', () => {
      const res = engine.search('biskoff');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('biscoff'))).toBe(true);
    });

    it('should tolerate "nutela" and match Nutella items', () => {
      const res = engine.search('nutela');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('nutella'))).toBe(true);
    });
  });

  describe('4. Wrong Word Order', () => {
    it('should match "cookies chocolate chip" to Chocolate Chip Cookies', () => {
      const res = engine.search('cookies chocolate chip');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Chocolate Chip Cookies');
    });

    it('should match "cake pops dark chocolate" to Dark Chocolate Cake Pops', () => {
      const res = engine.search('cake pops dark chocolate');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Dark Chocolate Cake Pops');
    });
  });

  describe('5. Casual & Metadata Searches', () => {
    it('should find brownies when searching "brownies"', () => {
      const res = engine.search('brownies');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.every((p) => p.categoryName === 'Brownies')).toBe(true);
    });

    it('should find eggless items when searching "eggless"', () => {
      const res = engine.search('eggless');
      expect(res.results.length).toBeGreaterThan(0);
      expect(
        res.results.some(
          (p) =>
            p.isEggless ||
            p.dietaryInfo?.some((d: string) => d.toLowerCase().includes('eggless'))
        )
      ).toBe(true);
    });
  });

  describe('6. Gibberish & Fallback Recommendations', () => {
    it('should gracefully handle random gibberish without crashing', () => {
      const res = engine.search('xxxyyyzzzrandomgibberish');
      expect(res.results.length).toBe(0);
      expect(res.fallbackRecommendations).toBeDefined();
      expect(res.fallbackRecommendations!.length).toBeGreaterThan(0);
      expect(res.fallbackCategories).toBeDefined();
      expect(res.fallbackCategories!.length).toBeGreaterThan(0);
    });
  });

  describe('7. Storefront Visibility Filtering', () => {
    it('should not return inactive or hidden products', () => {
      const mockList = [
        ...productsJson,
        {
          id: 'test_hidden_product',
          name: 'Super Secret Hidden Item',
          categoryName: 'Cookies',
          isActive: false,
          basePrice: 100,
        },
      ];
      const testEngine = new FrontendCatalogSearchEngine(mockList as any, categoriesJson as any);
      const res = testEngine.search('Super Secret Hidden Item');
      expect(res.results.some((p) => p.id === 'test_hidden_product')).toBe(false);
      expect(res.results.length).toBe(0);
    });
  });

  describe('8. Price Intent Detection & Budget-Aware Search', () => {
    it('should parse "cake pops under 400" and return only cake pops <= ₹400', () => {
      const res = engine.search('cake pops under 400');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.appliedPriceFilter?.maxPrice).toBe(400);
      for (const prod of res.results) {
        expect(prod.categoryName).toBe('Cake Pops');
        expect(prod.basePrice / 100).toBeLessThanOrEqual(400);
      }
    });

    it('should parse "cookies below ₹500" and return only cookies <= ₹500', () => {
      const res = engine.search('cookies below ₹500');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.appliedPriceFilter?.maxPrice).toBe(500);
      for (const prod of res.results) {
        expect(prod.categoryName).toBe('Cookies');
        expect(prod.basePrice / 100).toBeLessThanOrEqual(500);
      }
      expect(res.results.some((p) => p.name === 'Chocolate Chip Cookies')).toBe(true);
      expect(res.results.some((p) => p.name === 'Red Velvet Cookies')).toBe(true);
      expect(res.results.some((p) => p.name === 'Nutella Sea Salt Cookies')).toBe(false);
    });

    it('should parse price range "500 to 600" for brownies', () => {
      const res = engine.search('brownies 500 to 600');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.appliedPriceFilter?.minPrice).toBe(500);
      expect(res.appliedPriceFilter?.maxPrice).toBe(600);
      for (const prod of res.results) {
        const inRs = prod.basePrice / 100;
        expect(prod.categoryName).toBe('Brownies');
        expect(inRs).toBeGreaterThanOrEqual(500);
        expect(inRs).toBeLessThanOrEqual(600);
      }
    });

    it('should generate dynamic budget shortcuts based on real catalog prices', () => {
      const res = engine.search('brownies');
      expect(res.budgetShortcuts).toBeDefined();
      expect(res.budgetShortcuts!.length).toBeGreaterThan(0);
      expect(res.budgetShortcuts![0].label).toContain('under ₹');
    });
  });

  describe('9. Smart Discovery & Suggestions', () => {
    it('should return terms, budget shortcuts, and products with real formatted prices', () => {
      const suggestions = engine.getSuggestions('cookies', 4);
      expect(suggestions.query).toBe('cookies');
      expect(suggestions.terms.length).toBeGreaterThan(0);
      expect(suggestions.budgetShortcuts.length).toBeGreaterThan(0);
      expect(suggestions.products.length).toBeGreaterThan(0);
      expect(suggestions.products[0].priceInRupees).toBe(Math.round(suggestions.products[0].basePrice / 100));
    });
  });

  describe('10. Clean Predictive Autocomplete (getPredictions)', () => {
    it('should predict Cake Pops, Chocolates, Cupcakes, Cookies when user types "c"', () => {
      const predictions = engine.getPredictions('c', 6);
      expect(predictions.length).toBeGreaterThanOrEqual(4);
      expect(predictions.slice(0, 4)).toEqual([
        'Cake Pops',
        'Chocolates',
        'Cupcakes',
        'Cookies',
      ]);
    });

    it('should become more specific when user types "ca"', () => {
      const predictions = engine.getPredictions('ca', 6);
      expect(predictions).toContain('Cake Pops');
      expect(predictions).toContain('Cakes');
      expect(predictions[0]).toBe('Cake Pops');
      expect(predictions[1]).toBe('Cakes');
    });

    it('should predict Brownies when user types "b"', () => {
      const predictions = engine.getPredictions('b', 6);
      expect(predictions[0]).toBe('Brownies');
    });

    it('should predict Chocolates when user types "ch"', () => {
      const predictions = engine.getPredictions('ch', 6);
      expect(predictions[0]).toBe('Chocolates');
    });

    it('should predict Cake Pops for "cakep"', () => {
      const predictions = engine.getPredictions('cakep', 4);
      expect(predictions[0]).toBe('Cake Pops');
    });

    it('should tolerate minor spelling mistakes like "coookies"', () => {
      const predictions = engine.getPredictions('coookies', 4);
      expect(predictions).toContain('Cookies');
    });

    it('should return empty array for non-matching gibberish "xyzabc"', () => {
      const predictions = engine.getPredictions('xyzabc', 6);
      expect(predictions).toEqual([]);
    });
  });
});
