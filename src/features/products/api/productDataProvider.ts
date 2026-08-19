import { Product } from '@/types/product';

export interface Category {
  id: string;
  name: string;
}

export interface ProductDataProvider {
  getProducts(): Product[];
  getCategories(): Category[];
  getProductById(id: string): Product | undefined;
  getProductBySlug(slug: string): Product | undefined;
  getProductsByCategory(category: string): Product[];
  getFeaturedProducts(limit?: number): Product[];
  getBestSellingProducts(limit?: number): Product[];
  getNewArrivals(limit?: number): Product[];
  getRelatedProducts(productId: string, limit?: number): Product[];
  searchProducts(query: string): Product[];
}
