import { Router, Request, Response } from 'express';
import productsData from '../../data/seed/products.json';
import categoriesData from '../../data/seed/categories.json';
import { CatalogSearchEngine } from '../../services/catalogSearchEngine';

const router = Router();
export const catalogSearchEngine = new CatalogSearchEngine(
  productsData as any[],
  categoriesData as any[]
);

// GET /api/v1/products/suggestions
router.get('/suggestions', (req: Request, res: Response) => {
  const { q, limit } = req.query;
  const numLimit = limit ? parseInt(limit as string, 10) : 5;
  const suggestions = catalogSearchEngine.getSuggestions((q as string) || '', numLimit);
  return res.status(200).json({
    success: true,
    data: suggestions,
  });
});

// GET /api/v1/products
router.get('/', (req: Request, res: Response) => {
  const { isFeatured, isBestSeller, isNew, limit, search, category, maxPrice, minPrice } = req.query;

  const numLimit = limit ? parseInt(limit as string, 10) : undefined;
  const numMaxPrice = maxPrice ? parseInt(maxPrice as string, 10) : undefined;
  const numMinPrice = minPrice ? parseInt(minPrice as string, 10) : undefined;

  // Use ultra-smart catalog search engine when search or price filtering is present
  if ((search && typeof search === 'string') || numMaxPrice !== undefined || numMinPrice !== undefined) {
    const searchRes = catalogSearchEngine.search((search as string) || '', {
      limit: numLimit && !isNaN(numLimit) ? numLimit : undefined,
      isFeatured: isFeatured === 'true',
      isBestSeller: isBestSeller === 'true',
      isNew: isNew === 'true',
      category: typeof category === 'string' ? category : undefined,
      maxPrice: numMaxPrice && !isNaN(numMaxPrice) ? numMaxPrice : undefined,
      minPrice: numMinPrice && !isNaN(numMinPrice) ? numMinPrice : undefined,
    });

    return res.status(200).json({
      success: true,
      data: searchRes.results,
      total: searchRes.total,
      query: searchRes.query,
      cleanTerm: searchRes.cleanTerm,
      appliedPriceFilter: searchRes.appliedPriceFilter,
      budgetShortcuts: searchRes.budgetShortcuts,
      didYouMean: searchRes.didYouMean,
      matchedCategories: searchRes.matchedCategories,
      fallbackRecommendations: searchRes.fallbackRecommendations,
      fallbackCategories: searchRes.fallbackCategories,
    });
  }

  let results = [...(productsData as any[])];

  if (isFeatured === 'true') {
    results = results.filter((p) => p.isBestSeller || p.isNew);
  }

  if (isBestSeller === 'true') {
    results = results.filter((p) => p.isBestSeller);
  }

  if (isNew === 'true') {
    results = results.filter((p) => p.isNew);
  }

  if (limit) {
    const numLimit = parseInt(limit as string, 10);
    if (!isNaN(numLimit) && numLimit > 0) {
      results = results.slice(0, numLimit);
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    total: results.length,
  });
});

// GET /api/v1/products/category/:category
router.get('/category/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const decoded = decodeURIComponent(category);

  if (decoded === 'All Items' || decoded.toLowerCase() === 'all') {
    return res.status(200).json({ success: true, data: productsData });
  }

  const results = (productsData as any[]).filter(
    (p) =>
      p.categoryName?.toLowerCase() === decoded.toLowerCase() ||
      p.categoryName?.toLowerCase().replace(/\s+/g, '-') === decoded.toLowerCase()
  );

  res.status(200).json({
    success: true,
    data: results,
  });
});

// GET /api/v1/products/:id/related
router.get('/:id/related', (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit } = req.query;

  const current = (productsData as any[]).find((p) => p.id === id || p.slug === id);
  if (!current) {
    return res.status(200).json({ success: true, data: [] });
  }

  let related = (productsData as any[]).filter(
    (p) => p.id !== current.id && p.categoryName === current.categoryName
  );

  const numLimit = limit ? parseInt(limit as string, 10) : 4;
  if (!isNaN(numLimit) && numLimit > 0) {
    related = related.slice(0, numLimit);
  }

  res.status(200).json({
    success: true,
    data: related,
  });
});

// GET /api/v1/products/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const product = (productsData as any[]).find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product '${idOrSlug}' not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export default router;
