import {
  mockProducts,
  mockCategories,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  getBestSellingProducts,
  getNewArrivals,
  getRelatedProducts,
  searchProducts
} from '@/mocks/products';
import { ProductDataProvider } from './productDataProvider';

import { simulateAsync } from '@/lib/simulateAsync';

export const mockProductDataProvider: ProductDataProvider = {
  getProducts: () => simulateAsync(mockProducts),
  getCategories: () => simulateAsync(mockCategories),
  getProductById: (id) => simulateAsync(getProductById(id)),
  getProductBySlug: (slug) => simulateAsync(getProductBySlug(slug)),
  getProductsByCategory: (category) => simulateAsync(getProductsByCategory(category)),
  getFeaturedProducts: (limit) => simulateAsync(getFeaturedProducts(limit)),
  getBestSellingProducts: (limit) => simulateAsync(getBestSellingProducts(limit)),
  getNewArrivals: (limit) => simulateAsync(getNewArrivals(limit)),
  getRelatedProducts: (productId, limit) => simulateAsync(getRelatedProducts(productId, limit)),
  searchProducts: (query) => simulateAsync(searchProducts(query))
};
