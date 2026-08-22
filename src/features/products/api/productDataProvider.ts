import { Product } from '@/types/product';

export interface Category {
  id: string;
  name: string;
}

export interface ProductDataProvider {
  getProducts(): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getBestSellingProducts(limit?: number): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
}
