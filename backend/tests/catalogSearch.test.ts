import { describe, it, expect, beforeEach } from 'vitest';
import { CatalogSearchEngine } from '../src/services/catalogSearchEngine';
import productsData from '../src/data/seed/products.json';
import categoriesData from '../src/data/seed/categories.json';

describe('CakePopRush Ultra-Smart Catalog Search Engine', () => {
  let engine: CatalogSearchEngine;

  beforeEach(() => {
    engine = new CatalogSearchEngine(productsData as any[], categoriesData as any[]);
  });

  describe('1. Exact Searches', () => {
    it('should find product by exact title with highest relevance', () => {
      const res = engine.search('Chocolate Chip Cookies');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Chocolate Chip Cookies');
    });

    it('should find Dark Chocolate Cake Pops by exact name', () => {
      const res = engine.search('Dark Chocolate Cake Pops');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Dark Chocolate Cake Pops');
    });
  });

  describe('2. Partial & Prefix Searches', () => {
    it('should find products by prefix "choc"', () => {
      const res = engine.search('choc');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('chocolate'))).toBe(true);
    });

    it('should find products by prefix "bis"', () => {
      const res = engine.search('bis');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('biscoff'))).toBe(true);
    });

    it('should handle compound words like "cakepop" and "cup cake"', () => {
      const res1 = engine.search('cakepop');
      expect(res1.results.length).toBeGreaterThan(0);
      expect(res1.results.some((p) => p.categoryName === 'Cake Pops')).toBe(true);

      const res2 = engine.search('cup cake');
      expect(res2.results.length).toBeGreaterThan(0);
      expect(res2.results.some((p) => p.categoryName === 'Cupcakes')).toBe(true);
    });
  });

  describe('3. Bad Spelling & Typo Tolerance (Catalog-Derived)', () => {
    it('should tolerate "choclate" (missing o)', () => {
      const res = engine.search('choclate');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('chocolate'))).toBe(true);
    });

    it('should tolerate "biskoff" (k instead of c, double f)', () => {
      const res = engine.search('biskoff');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('biscoff'))).toBe(true);
    });

    it('should tolerate "cooki" (singular / missing e)', () => {
      const res = engine.search('cooki');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.categoryName === 'Cookies')).toBe(true);
    });

    it('should tolerate "oreoo" (repeated letter)', () => {
      const res = engine.search('oreoo');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Oreo Pops');
    });

    it('should tolerate "nutela" (single l)', () => {
      const res = engine.search('nutela');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.some((p) => p.name.toLowerCase().includes('nutella'))).toBe(true);
    });
  });

  describe('4. Wrong Word Order', () => {
    it('should match products when words are typed out of order', () => {
      const res = engine.search('cookies chocolate chip');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Chocolate Chip Cookies');
    });

    it('should match "cake pops dark chocolate" in any order', () => {
      const res = engine.search('cake pops dark chocolate');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Dark Chocolate Cake Pops');
    });
  });

  describe('5. Category & Casual Terminology Searches', () => {
    it('should match all brownies when searching "brownies"', () => {
      const res = engine.search('brownies');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.every((p) => p.categoryName === 'Brownies')).toBe(true);
    });

    it('should find birthday occasion products when searching "birthday"', () => {
      const res = engine.search('birthday');
      expect(res.results.length).toBeGreaterThan(0);
      expect(
        res.results.some(
          (p) => p.occasions?.includes('Birthday') || p.name.toLowerCase().includes('birthday')
        )
      ).toBe(true);
    });

    it('should find vegetarian or eggless products when searching "eggless"', () => {
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

  describe('6. Gibberish & Low Relevance Graceful Fallback', () => {
    it('should return 0 results and provide fallback recommendations for random gibberish', () => {
      const res = engine.search('aaaaaxxxxxrandomrandom');
      expect(res.results.length).toBe(0);
      expect(res.fallbackRecommendations).toBeDefined();
      expect(res.fallbackRecommendations!.length).toBeGreaterThan(0);
      expect(res.fallbackCategories).toBeDefined();
      expect(res.fallbackCategories!.length).toBeGreaterThan(0);
    });

    it('should never crash on special symbols or long input', () => {
      const crazyInput = '!@#$%^&*()_+~`|}{[]:;?><,./'.repeat(5);
      expect(() => engine.search(crazyInput)).not.toThrow();
    });
  });

  describe('7. Search Suggestions', () => {
    it('should provide fast lightweight suggestions', () => {
      const suggestions = engine.getSuggestions('macaron', 5);
      expect(suggestions.products.length).toBeGreaterThan(0);
      expect(suggestions.products[0].name).toBe('Assorted Macarons Box');
      expect(suggestions.products[0].basePrice).toBeGreaterThan(0);
    });
  });

  describe('8. Storefront Visibility Filtering', () => {
    it('should not return inactive or unpublished products', () => {
      const testProducts = [
        ...productsData,
        {
          id: 'hidden_1',
          name: 'Mysterious Inactive Item',
          categoryName: 'Cookies',
          isActive: false,
          basePrice: 1000,
        },
      ];
      const customEngine = new CatalogSearchEngine(testProducts as any[], categoriesData as any[]);
      const res = customEngine.search('Mysterious Inactive Item');
      expect(res.results.some((p) => p.id === 'hidden_1')).toBe(false);
      expect(res.results.length).toBe(0);
    });
  });

  describe('9. Price Intent Detection & Budget-Aware Search', () => {
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
      // Should include Chocolate Chip Cookies (₹450) and Red Velvet Cookies (₹480)
      expect(res.results.some((p) => p.name === 'Chocolate Chip Cookies')).toBe(true);
      expect(res.results.some((p) => p.name === 'Red Velvet Cookies')).toBe(true);
      // Should exclude Nutella Sea Salt Cookies (₹580)
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

    it('should handle pure budget queries like "under 1000"', () => {
      const res = engine.search('under 1000');
      expect(res.results.length).toBeGreaterThan(0);
      for (const prod of res.results) {
        expect(prod.basePrice / 100).toBeLessThanOrEqual(1000);
      }
    });

    it('should generate dynamic budget shortcuts based on real catalog prices', () => {
      const res = engine.search('cookies');
      expect(res.budgetShortcuts).toBeDefined();
      expect(res.budgetShortcuts!.length).toBeGreaterThan(0);
      expect(res.budgetShortcuts![0].label).toContain('under ₹');
      expect(res.budgetShortcuts![0].count).toBeGreaterThan(0);
    });
  });

  describe('10. Rich Discovery & Smart Suggestions', () => {
    it('should return terms, budget shortcuts, and products with real formatted prices', () => {
      const suggestions = engine.getSuggestions('cookies', 4);
      expect(suggestions.query).toBe('cookies');
      expect(suggestions.terms.length).toBeGreaterThan(0);
      expect(suggestions.budgetShortcuts.length).toBeGreaterThan(0);
      expect(suggestions.products.length).toBeGreaterThan(0);
      expect(suggestions.products[0].priceInRupees).toBe(Math.round(suggestions.products[0].basePrice / 100));
    });
  });

  describe('11. Clean Predictive Autocomplete (getPredictions)', () => {
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
