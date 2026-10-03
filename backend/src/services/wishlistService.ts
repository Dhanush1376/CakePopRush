import User, { ICustomerWishlistItem } from '../models/User';
import ApiError from '../utils/ApiError';
import { resolveProductSnapshot } from './productResolver';

export class WishlistService {
  /**
   * Retrieve the authenticated user's wishlist
   */
  public static async getWishlist(userId: string): Promise<ICustomerWishlistItem[]> {
    const user = await User.findById(userId).select('wishlist').lean();
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.wishlist || [];
  }

  /**
   * Add an item to the user's wishlist
   */
  public static async addItem(
    userId: string,
    item: { productId: string; title?: string; price?: number; image?: string; slug?: string }
  ): Promise<ICustomerWishlistItem[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Check if already in wishlist
    const exists = user.wishlist.some(
      (w) =>
        w.productId === item.productId ||
        (item.slug && w.slug === item.slug) ||
        (item.productId && w.slug === item.productId) ||
        (w.productId && item.slug && w.productId === item.slug)
    );
    if (!exists) {
      const snapshot =
        resolveProductSnapshot(item.productId) ||
        (item.slug ? resolveProductSnapshot(item.slug) : null);
      const title = item.title || snapshot?.name || 'Artisan Cake Pop';
      const price = typeof item.price === 'number' ? item.price : (snapshot?.price || 0);
      const image = item.image || snapshot?.image || '';
      const slug = item.slug || snapshot?.slug || item.productId;
      const resolvedProductId = snapshot?.productId || item.productId;

      user.wishlist.push({
        productId: resolvedProductId,
        title,
        price,
        image,
        slug,
        addedAt: new Date(),
      } as any);

      await user.save();
    }

    return user.wishlist;
  }

  /**
   * Remove an item from the user's wishlist
   */
  public static async removeItem(userId: string, productId: string): Promise<ICustomerWishlistItem[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.wishlist && user.wishlist.length > 0) {
      user.wishlist = user.wishlist.filter(
        (w) => w.productId !== productId && w.slug !== productId
      );
      await user.save();
    }

    return user.wishlist || [];
  }

  /**
   * Clear the entire wishlist
   */
  public static async clearWishlist(userId: string): Promise<ICustomerWishlistItem[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.wishlist = [];
    await user.save();
    return [];
  }

  /**
   * Merge guest items into authenticated user's wishlist
   */
  public static async mergeWishlist(
    userId: string,
    items: Array<{ productId: string; title?: string; price?: number; image?: string; slug?: string }>
  ): Promise<ICustomerWishlistItem[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const existingProductIds = new Set(user.wishlist.map((w) => w.productId));

    for (const item of items) {
      if (item.productId && !existingProductIds.has(item.productId)) {
        const snapshot = resolveProductSnapshot(item.productId);
        const title = item.title || snapshot?.name || 'Artisan Cake Pop';
        const price = typeof item.price === 'number' ? item.price : (snapshot?.price || 0);
        const image = item.image || snapshot?.image || '';
        const slug = item.slug || snapshot?.slug || item.productId;

        user.wishlist.push({
          productId: item.productId,
          title,
          price,
          image,
          slug,
          addedAt: new Date(),
        } as any);
        existingProductIds.add(item.productId);
      }
    }

    await user.save();
    return user.wishlist;
  }
}
