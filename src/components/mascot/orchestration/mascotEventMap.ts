import { MascotTriggerEvent } from './mascotEmotionTypes';
import { MascotReaction } from '../reactions/reactionTypes';

export type EventKey =
  | 'cart:item-added'
  | 'cart:quantity-increased'
  | 'cart:quantity-decreased'
  | 'cart:item-delete-confirm'
  | 'cart:item-delete-canceled'
  | 'cart:item-removed'
  | 'cart:emptied'
  | 'cart:abandoned'
  | 'wishlist:item-added'
  | 'wishlist:item-removed'
  | 'wishlist:emptied'
  | 'checkout:started'
  | 'checkout:payment-processing'
  | 'checkout:success'
  | 'checkout:failure'
  | 'product:opened'
  | 'product:favorited'
  | 'search:no-results'
  | 'search:empty-query'
  | 'navigation:not-found'
  | 'navigation:server-error'
  | 'navigation:network-error'
  | 'account:login-success'
  | 'account:login-failure'
  | 'account:signup-success'
  | 'user:returns'
  | 'mascot:tapped'
  | 'coupon:applied'
  | 'profile:saved';

export const MASCOT_EVENT_MAP: Record<EventKey, MascotTriggerEvent> = {
  // Cart
  'cart:item-added': {
    emotion: 'blowKiss',
    reason: 'PRODUCT_ADDED_TO_CART',
    priority: 'medium',
    category: 'cart',
    alternatives: ['love', 'emotionalCute', 'heartEyes', 'party'],
  },
  'cart:quantity-increased': {
    emotion: 'emotionalCute',
    reason: 'CART_QUANTITY_INCREASED',
    priority: 'low',
    category: 'cart',
    alternatives: ['excited', 'love', 'heartEyes'],
  },
  'cart:quantity-decreased': {
    emotion: 'cryingFountain',
    reason: 'CART_QUANTITY_DECREASED',
    priority: 'medium',
    category: 'cart',
    alternatives: ['sad', 'pleadingCute'],
  },
  'cart:item-delete-confirm': {
    emotion: 'pleadingCute',
    reason: 'CART_ITEM_DELETE_CONFIRM',
    priority: 'high',
    category: 'cart',
    alternatives: ['sad', 'cryingFountain'],
  },
  'cart:item-delete-canceled': {
    emotion: 'excited',
    reason: 'CART_ITEM_DELETE_CANCELED',
    priority: 'high',
    category: 'cart',
    alternatives: ['love', 'emotionalCute'],
  },
  'cart:item-removed': {
    emotion: 'sad',
    reason: 'CART_ITEM_REMOVED',
    priority: 'high',
    category: 'cart',
    alternatives: ['pleadingCute'],
  },
  'cart:emptied': {
    emotion: 'pleadingCute',
    reason: 'CART_EMPTIED',
    priority: 'high',
    category: 'cart',
    alternatives: ['sad'],
  },
  'cart:abandoned': {
    emotion: 'sad',
    reason: 'CART_ABANDONED',
    priority: 'medium',
    category: 'cart',
    alternatives: ['pleadingCute'],
  },

  // Wishlist
  'wishlist:item-added': {
    emotion: 'heartEyes',
    reason: 'WISHLIST_ITEM_ADDED',
    priority: 'medium',
    category: 'wishlist',
    alternatives: ['love', 'blushing'],
  },
  'wishlist:item-removed': {
    emotion: 'sad',
    reason: 'WISHLIST_ITEM_REMOVED',
    priority: 'medium',
    category: 'wishlist',
    alternatives: ['pleadingCute'],
  },
  'wishlist:emptied': {
    emotion: 'sad',
    reason: 'WISHLIST_EMPTIED',
    priority: 'high',
    category: 'wishlist',
    alternatives: ['pleadingCute'],
  },

  // Checkout
  'checkout:started': {
    emotion: 'excited',
    reason: 'CHECKOUT_STARTED',
    priority: 'medium',
    category: 'checkout',
  },
  'checkout:payment-processing': {
    emotion: 'emotionalCute',
    reason: 'PAYMENT_PROCESSING',
    priority: 'low',
    category: 'checkout',
    alternatives: ['surprised'],
  },
  'checkout:success': {
    emotion: 'party',
    reason: 'ORDER_SUCCESS',
    priority: 'critical',
    category: 'checkout',
    alternatives: ['excited', 'blowKiss'],
  },
  'checkout:failure': {
    emotion: 'oops',
    reason: 'PAYMENT_FAILED',
    priority: 'critical',
    category: 'checkout',
    alternatives: ['confused'],
  },

  // Product
  'product:opened': {
    emotion: 'winking',
    reason: 'PRODUCT_VIEWED',
    priority: 'low',
    category: 'product',
    alternatives: ['blowKiss', 'love'],
  },
  'product:favorited': {
    emotion: 'heartEyes',
    reason: 'PRODUCT_FAVORITED',
    priority: 'medium',
    category: 'product',
    alternatives: ['love'],
  },

  // Search
  'search:no-results': {
    emotion: 'confused',
    reason: 'SEARCH_NO_RESULTS',
    priority: 'medium',
    category: 'search',
    alternatives: ['oops'],
  },
  'search:empty-query': {
    emotion: 'emotionalCute',
    reason: 'SEARCH_EMPTY',
    priority: 'low',
    category: 'search',
    alternatives: ['confused'],
  },

  // Navigation
  'navigation:not-found': {
    emotion: 'oops',
    reason: 'PAGE_NOT_FOUND',
    priority: 'high',
    category: 'navigation',
    alternatives: ['confused'],
  },
  'navigation:server-error': {
    emotion: 'oops',
    reason: 'SERVER_ERROR',
    priority: 'high',
    category: 'navigation',
    alternatives: ['confused'],
  },
  'navigation:network-error': {
    emotion: 'confused',
    reason: 'NETWORK_ERROR',
    priority: 'high',
    category: 'navigation',
    alternatives: ['oops'],
  },

  // Account
  'account:login-success': {
    emotion: 'blowKiss',
    reason: 'LOGIN_SUCCESS',
    priority: 'medium',
    category: 'account',
  },
  'account:login-failure': {
    emotion: 'oops',
    reason: 'LOGIN_FAILURE',
    priority: 'medium',
    category: 'account',
    alternatives: ['confused'],
  },
  'account:signup-success': {
    emotion: 'blowKiss',
    reason: 'SIGNUP_SUCCESS',
    priority: 'medium',
    category: 'account',
  },
  'user:returns': {
    emotion: 'blowKiss',
    reason: 'USER_RETURNED',
    priority: 'low',
    category: 'account',
    alternatives: ['blowKiss', 'winking'],
  },

  // General interactions
  'mascot:tapped': {
    emotion: 'bonk', // default tap reaction, but will usually use the pool
    reason: 'MASCOT_TAPPED',
    priority: 'medium',
    category: 'mascot',
  },
  'coupon:applied': {
    emotion: 'winking',
    reason: 'COUPON_APPLIED',
    priority: 'medium',
    category: 'coupon',
  },
  'profile:saved': {
    emotion: 'emotionalCute',
    reason: 'PROFILE_SAVED',
    priority: 'low',
    category: 'profile',
    alternatives: ['blushing'],
  },
};

// Playful pool for direct mascot taps
export const TAP_REACTION_POOL: { emotion: MascotReaction; weight: number }[] = [
  { emotion: 'bonk', weight: 15 },
  { emotion: 'winking', weight: 15 },
  { emotion: 'emotionalCute', weight: 15 }, // Using emotionalCute for "Cute"
  { emotion: 'blowKiss', weight: 12 },
  { emotion: 'blushing', weight: 12 },
  { emotion: 'silly', weight: 10 },
  { emotion: 'heartEyes', weight: 10 },
  { emotion: 'cool', weight: 6 },
  { emotion: 'laughing', weight: 5 },
  { emotion: 'excited', weight: 5 },
];
