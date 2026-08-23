import { MascotReaction } from '../reactions/reactionTypes';

export type MascotEventCategory = 
  | 'cart' 
  | 'wishlist' 
  | 'checkout' 
  | 'product' 
  | 'search' 
  | 'navigation' 
  | 'account' 
  | 'idle' 
  | 'mascot' 
  | 'error' 
  | 'success'
  | 'coupon'
  | 'profile'
  | 'admin'
  | 'filter'
  | 'review'
  | 'page'
  | 'order';

export type MascotPriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export const PRIORITY_WEIGHTS: Record<MascotPriorityLevel, number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
};

export type MascotIntensity = 'micro' | 'normal' | 'strong' | 'milestone';

export type MascotPageContext = 
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'orderSuccess'
  | 'orderTracking'
  | 'wishlist'
  | 'reviews'
  | 'admin'
  | 'profile'
  | 'search'
  | 'error'
  | 'other';

export interface MascotTriggerEvent {
  emotion: MascotReaction;
  reason: string;
  priority: MascotPriorityLevel;
  category: MascotEventCategory;
  intensity?: MascotIntensity;
  alternatives?: MascotReaction[];
  cooldownMs?: number;
  message?: string;
  messages?: string[]; // pool of messages to randomly pick from
  probability?: number; // 0-1 chance of firing
  silenceWeight?: number; // 0-1 chance of doing nothing (silence) even if triggered
  pageContexts?: MascotPageContext[]; // if provided, only fires on these pages
  delayMs?: number; // delays the reaction by X ms
  chainedEvent?: EventKey; // fires another event after this one expires
}

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
  | 'checkout:address-completed'
  | 'checkout:payment-started'
  | 'checkout:payment-processing'
  | 'checkout:success'
  | 'checkout:success-surprise'
  | 'checkout:success-realization'
  | 'checkout:success-celebration'
  | 'checkout:failure'
  | 'product:opened'
  | 'product:favorited'
  | 'product:premium-viewed'
  | 'product:category-chocolate'
  | 'product:repeated-view'
  | 'product:treat-me'
  | 'search:query-submitted'
  | 'search:results-found'
  | 'search:no-results'
  | 'search:empty-query'
  | 'filter:applied'
  | 'filter:zero-results'
  | 'review:submitted'
  | 'review:high-rating'
  | 'review:low-rating'
  | 'order:status-placed'
  | 'order:status-preparing'
  | 'order:status-ready'
  | 'order:status-delivering'
  | 'order:status-delivered'
  | 'order:status-cancelled'
  | 'navigation:not-found'
  | 'navigation:server-error'
  | 'navigation:network-error'
  | 'account:login-success'
  | 'account:login-failure'
  | 'account:signup-success'
  | 'user:returns'
  | 'mascot:tapped'
  | 'coupon:applied'
  | 'profile:saved'
  | 'page:home-arrived'
  | 'page:shop-arrived'
  | 'page:admin-arrived'
  | 'page:cart-opened'
  | 'page:drawer-opened'
  | 'admin:save-success'
  | 'admin:delete-action'
  | 'admin:error';

// Global configuration for the orchestration system
export interface OrchestratorConfig {
  defaultCooldownMs: number;
  categoryCooldowns: Partial<Record<MascotEventCategory, number>>;
  idleIntervals: {
    tired: [number, number];   // min, max seconds
    yawning: [number, number];
    sleeping: [number, number];
  };
}
