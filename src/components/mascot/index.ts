export { CakePopMascot } from './CakePopMascot';
export type { MascotDirection, SmartMascotState } from './MascotState';
export { INTRO_KEY } from './MascotState';
export { useMascotController } from './useMascotController';
export { useSmartMascot } from './useSmartMascot';
export * from './animations/mascotAnimations';

// Types & Config
export * from './config/mascotConfig';
export * from './config/mascotConstants';

// Orchestration (New Centralized System)
export * from './orchestration/mascotEmotionTypes';
export * from './orchestration/mascotEventMap';
export * from './orchestration/mascotEmotionController';
export * from './orchestration/useMascotOrchestrator';
export * from './orchestration/MascotOrchestrationProvider';
export * from './config/mascotSelectors';
export * from './reactions/reactionRegistry';
export type { MascotReaction, MascotRef, MascotSize, MascotState } from './reactions/reactionTypes';
