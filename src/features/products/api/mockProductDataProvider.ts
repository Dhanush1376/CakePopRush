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

export const mockProductDataProvider: ProductDataProvider = {
  getProducts: () => mockProducts,
  getCategories: () => mockCategories,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts: (limit) => getFeaturedProducts(limit),
  getBestSellingProducts: (limit) => getBestSellingProducts(limit),
  getNewArrivals: (limit) => getNewArrivals(limit),
  getRelatedProducts: (productId, limit) => getRelatedProducts(productId, limit),
  searchProducts
};
