import productsData from '../data/seed/products.json';
import User, { ICustomerCartItem } from '../models/User';
import ApiError from '../utils/ApiError';

export interface CartCustomization {
  flavourId?: string | null;
  flavourName?: string | null;
  quantityId?: string | null;
  quantityName?: string | null;
  addOns?: string[];
  inlineOptions?: Record<string, string | string[]>;
  personalMessage?: string;
  occasion?: string | null;
}

export interface AddItemInput {
  productId: string;
  quantity?: number;
  variantId?: string;
  variantName?: string;
  customization?: CartCustomization;
}

export interface ComputedCartResponse {
  items: ICustomerCartItem[];
  totalItems: number;
  subtotal: number;
  compareAtSubtotal: number;
  totalDiscount: number;
  shippingFee: number;
  total: number;
  droppedItems?: Array<{ productId: string; reason: string }>;
}

export class CartService {
  private static findProduct(productIdOrSlug: string) {
    if (!productIdOrSlug) return null;
    return (productsData as any[]).find(
      (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
    );
  }

  /**
   * Deterministic item identity key based on product + variant + options/customization.
   * Prevents different customizations from colliding into the same line item.
   */
  public static generateItemKey(
    productId: string,
    variantId?: string,
    customization?: any
  ): string {
    const pId = String(productId || '').trim();
    const vId = String(variantId || 'default').trim();
    
    let custKey = 'none';
    if (customization && typeof customization === 'object') {
      try {
        const sortedKeys = Object.keys(customization).sort();
        const normalized: Record<string, any> = {};
        for (const k of sortedKeys) {
          const val = customization[k];
          if (Array.isArray(val)) {
            normalized[k] = [...val].sort();
          } else {
            normalized[k] = val;
          }
        }
        custKey = JSON.stringify(normalized);
      } catch {
        custKey = String(customization);
      }
    }

    return `${pId}:::${vId}:::${custKey}`;
  }

  /**
   * Authoritatively calculate line-item unit price from product seed data.
   * NEVER trust prices sent from the client!
   */
  public static computeAuthoritativeUnitPrice(
    product: any,
    customization?: CartCustomization
  ): { unitPrice: number; compareAtPrice: number; priceModifier: number } {
    let basePrice = typeof product.basePrice === 'number' ? product.basePrice : 0;
    let compareAt = product.compareAtPrice || Math.round(basePrice * 1.25);
    let modifier = 0;

    if (customization) {
      // Flavour price modifier
      if (customization.flavourId && Array.isArray(product.flavours)) {
        const flav = product.flavours.find((f: any) => f.id === customization.flavourId);
        if (flav && typeof flav.priceModifier === 'number') {
          modifier += flav.priceModifier;
        }
      }

      // Quantity / pack modifier
      if (customization.quantityId && Array.isArray(product.quantities)) {
        const qMod = product.quantities.find((q: any) => q.id === customization.quantityId);
        if (qMod && typeof qMod.priceModifier === 'number') {
          modifier += qMod.priceModifier;
        }
      }

      // Add-ons
      if (Array.isArray(customization.addOns) && Array.isArray(product.addOns)) {
        for (const addonId of customization.addOns) {
          const match = product.addOns.find((a: any) => a.id === addonId);
          if (match && typeof match.price === 'number') {
            modifier += match.price;
          }
        }
      }
    }

    const unitPrice = Math.max(0, basePrice + modifier);
    const calculatedCompareAt = Math.max(unitPrice, compareAt + modifier);

    return {
      unitPrice,
      compareAtPrice: calculatedCompareAt,
      priceModifier: modifier,
    };
  }

  /**
   * Compute full totals for a list of cart items.
   * Free delivery threshold is 100000 paise (₹1000). Standard shipping is 5000 paise (₹50).
   */
  public static calculateCartTotals(items: ICustomerCartItem[]): Omit<ComputedCartResponse, 'droppedItems'> {
    let totalItems = 0;
    let subtotal = 0;
    let compareAtSubtotal = 0;

    for (const item of items) {
      const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      totalItems += qty;
      const unitPrice = Number(item.price) || 0;
      
      const product = this.findProduct(item.productId);
      const compareAtUnit = product?.compareAtPrice || Math.round(unitPrice * 1.25);

      subtotal += unitPrice * qty;
      compareAtSubtotal += compareAtUnit * qty;
    }

    const totalDiscount = Math.max(0, compareAtSubtotal - subtotal);
    // Free shipping if subtotal >= ₹1,000 (100,000 paise) or cart is empty
    const shippingFee = subtotal >= 100000 || totalItems === 0 ? 0 : 5000;
    const total = Math.max(0, subtotal + shippingFee);

    return {
      items,
      totalItems,
      subtotal,
      compareAtSubtotal,
      totalDiscount,
      shippingFee,
      total,
    };
  }

  /**
   * Retrieves and sanitizes the user's cart from DB.
   * Cleans stale/deleted products, recomputes authoritative prices.
   */
  public static async getCart(userId: string): Promise<ComputedCartResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const rawItems = user.cart || [];
    const validItems: ICustomerCartItem[] = [];
    const droppedItems: Array<{ productId: string; reason: string }> = [];
    let stateMutated = false;

    for (const item of rawItems) {
      const product = this.findProduct(item.productId);
      if (!product) {
        droppedItems.push({ productId: item.productId, reason: 'Product is no longer available' });
        stateMutated = true;
        continue;
      }

      const { unitPrice, priceModifier } = this.computeAuthoritativeUnitPrice(
        product,
        item.customization
      );

      const primaryImage =
        Array.isArray(product.images) && product.images.length > 0
          ? typeof product.images[0] === 'string'
            ? product.images[0]
            : product.images[0]?.url || product.image
          : product.image || '';

      const validatedItem: ICustomerCartItem = {
        id: item.id || this.generateItemKey(item.productId, item.variantId, item.customization),
        productId: product.id,
        title: product.name,
        price: unitPrice,
        quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
        image: primaryImage,
        variant: item.variant || '',
        variantId: item.variantId || '',
        variantName: item.variantName || '',
        customization: item.customization || null,
        priceModifier,
      };

      if (
        item.price !== unitPrice ||
        item.id !== validatedItem.id ||
        item.image !== primaryImage
      ) {
        stateMutated = true;
      }

      validItems.push(validatedItem);
    }

    if (stateMutated || rawItems.length !== validItems.length) {
      user.cart = validItems;
      await user.save();
    }

    const totals = this.calculateCartTotals(validItems);
    return {
      ...totals,
      droppedItems: droppedItems.length > 0 ? droppedItems : undefined,
    };
  }

  /**
   * Adds an item to the authenticated user's cart.
   */
  public static async addItem(userId: string, input: AddItemInput): Promise<ComputedCartResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const product = this.findProduct(input.productId);
    if (!product) {
      throw new ApiError(404, `Product not found: ${input.productId}`);
    }

    const qtyToAdd = Math.max(1, Math.min(99, Number(input.quantity) || 1));
    const itemKey = this.generateItemKey(product.id, input.variantId, input.customization);
    const { unitPrice, priceModifier } = this.computeAuthoritativeUnitPrice(
      product,
      input.customization
    );

    const primaryImage =
      Array.isArray(product.images) && product.images.length > 0
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : product.images[0]?.url || product.image
        : product.image || '';

    const currentCart = user.cart || [];
    const existingIndex = currentCart.findIndex((i) => {
      const curKey = i.id || this.generateItemKey(i.productId, i.variantId, i.customization);
      return curKey === itemKey;
    });

    if (existingIndex > -1) {
      const existing = currentCart[existingIndex];
      const newQty = Math.min(99, (Number(existing.quantity) || 0) + qtyToAdd);
      existing.quantity = newQty;
      existing.price = unitPrice;
      existing.priceModifier = priceModifier;
      existing.id = itemKey;
      if (input.variantName) existing.variantName = input.variantName;
    } else {
      if (currentCart.length >= 50) {
        throw new ApiError(400, 'Cart item limit reached. Please checkout before adding more items.');
      }
      currentCart.push({
        id: itemKey,
        productId: product.id,
        title: product.name,
        price: unitPrice,
        quantity: qtyToAdd,
        image: primaryImage,
        variant: input.variantName || '',
        variantId: input.variantId || '',
        variantName: input.variantName || '',
        customization: input.customization || null,
        priceModifier,
      });
    }

    user.cart = currentCart;
    await user.save();

    return this.getCart(userId);
  }

  /**
   * Updates quantity of a cart line item.
   * If quantity <= 0, item is deleted.
   */
  public static async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<ComputedCartResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const currentCart = user.cart || [];
    const index = currentCart.findIndex((i) => i.id === itemId || i.productId === itemId);

    if (index === -1) {
      throw new ApiError(404, 'Cart item not found');
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      currentCart.splice(index, 1);
    } else {
      currentCart[index].quantity = Math.min(99, qty);
    }

    user.cart = currentCart;
    await user.save();

    return this.getCart(userId);
  }

  /**
   * Removes an item from the cart.
   */
  public static async removeItem(userId: string, itemId: string): Promise<ComputedCartResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const currentCart = user.cart || [];
    user.cart = currentCart.filter((i) => i.id !== itemId && i.productId !== itemId);
    await user.save();

    return this.getCart(userId);
  }

  /**
   * Clears all items from the cart.
   */
  public static async clearCart(userId: string): Promise<ComputedCartResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.cart = [];
    await user.save();

    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      compareAtSubtotal: 0,
      totalDiscount: 0,
      shippingFee: 0,
      total: 0,
    };
  }

  /**
   * Merges guest cart items into authenticated user's cart upon login.
   * Deterministically avoids duplicates, handles quantity limits, and drops stale items.
   */
  public static async mergeCart(
    userId: string,
    guestItems: any[]
  ): Promise<ComputedCartResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const currentCart = user.cart || [];
    const droppedItems: Array<{ productId: string; reason: string }> = [];

    for (const item of guestItems || []) {
      const pId = item.productId || item.product?.id || item.product?._id || item.id;
      if (!pId) continue;

      const product = this.findProduct(pId);
      if (!product) {
        droppedItems.push({ productId: pId, reason: 'Product is unavailable or out of stock' });
        continue;
      }

      const variantId = item.variantId || '';
      const customization = item.customization || null;
      const itemKey = this.generateItemKey(product.id, variantId, customization);

      const { unitPrice, priceModifier } = this.computeAuthoritativeUnitPrice(
        product,
        customization
      );

      const primaryImage =
        Array.isArray(product.images) && product.images.length > 0
          ? typeof product.images[0] === 'string'
            ? product.images[0]
            : product.images[0]?.url || product.image
          : product.image || '';

      const qtyToAdd = Math.max(1, Math.min(99, Number(item.quantity) || 1));

      const existingIndex = currentCart.findIndex((i) => {
        const curKey = i.id || this.generateItemKey(i.productId, i.variantId, i.customization);
        return curKey === itemKey;
      });

      if (existingIndex > -1) {
        currentCart[existingIndex].quantity = Math.min(
          99,
          (Number(currentCart[existingIndex].quantity) || 0) + qtyToAdd
        );
        currentCart[existingIndex].price = unitPrice;
        currentCart[existingIndex].priceModifier = priceModifier;
        currentCart[existingIndex].id = itemKey;
      } else {
        if (currentCart.length >= 50) {
          droppedItems.push({ productId: product.id, reason: 'Maximum cart items limit (50) reached' });
          continue;
        }

        currentCart.push({
          id: itemKey,
          productId: product.id,
          title: product.name,
          price: unitPrice,
          quantity: qtyToAdd,
          image: primaryImage,
          variant: item.variant || item.variantName || '',
          variantId,
          variantName: item.variantName || '',
          customization,
          priceModifier,
        });
      }
    }

    user.cart = currentCart;
    await user.save();

    const result = await this.getCart(userId);
    if (droppedItems.length > 0) {
      result.droppedItems = [...(result.droppedItems || []), ...droppedItems];
    }
    return result;
  }
}
