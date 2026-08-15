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
  | 'profile';

export type MascotPriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export const PRIORITY_WEIGHTS: Record<MascotPriorityLevel, number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
};

export interface MascotTriggerEvent {
  emotion: MascotReaction;
  reason: string;
  priority: MascotPriorityLevel;
  category: MascotEventCategory;
  alternatives?: MascotReaction[];
  cooldownMs?: number;
  message?: string;
}

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
