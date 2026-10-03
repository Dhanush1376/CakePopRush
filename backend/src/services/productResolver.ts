import productsData from '../data/seed/products.json';
import { IProductSnapshot } from '../models/CustomOrder';

export const resolveProductSnapshot = (productIdOrSlug: string): IProductSnapshot | null => {
  if (!productIdOrSlug || typeof productIdOrSlug !== 'string') return null;

  const product = (productsData as any[]).find(
    (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
  );

  if (!product) return null;

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0]?.url || product.image
      : product.image || '';

  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: primaryImage,
    categoryName: product.categoryName || 'Cake Pops',
    price: typeof product.price === 'number' ? product.price : 0,
    description: product.description || '',
  };
};
