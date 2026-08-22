import type { Product } from '@/types/product';

import productsJson from './seed/storefront/products.json';
import categoriesJson from './seed/storefront/categories.json';

export const mockCategories = categoriesJson;

export const mockProducts: Product[] = productsJson as Product[];

// Product Selectors
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find(p => p.slug === slug);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All Items' || category === 'all') return mockProducts;
  if (category === 'cakes' || category === 'birthday-cakes') {
    return mockProducts.filter(p => p.categoryName === 'Cakes' || p.categoryName === 'Birthday Cakes' || p.categoryName.toLowerCase().includes('cake'));
  }
  return mockProducts.filter(p => p.categoryName === category || p.categoryName.toLowerCase().replace(" ", "-") === category);
};

export const getFeaturedProducts = (limit = 4): Product[] => {
  return mockProducts.filter(p => p.isBestSeller || p.isNew).slice(0, limit);
};

export const getBestSellingProducts = (limit = 8): Product[] => {
  return mockProducts.filter(p => p.isBestSeller).slice(0, limit);
};

export const getNewArrivals = (limit = 4): Product[] => {
  return mockProducts.filter(p => p.isNew).slice(0, limit);
};

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return mockProducts
    .filter(p => p.id !== productId && p.categoryName === product.categoryName)
    .slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(
    p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description?.toLowerCase().includes(lowercaseQuery) ||
      p.categoryName.toLowerCase().includes(lowercaseQuery)
  );
};
