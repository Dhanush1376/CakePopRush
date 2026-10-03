export const TIMING = {
  INSTANT: 0.05,
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.6,
  VERY_SLOW: 1.0,
} as const;

export const EASING = {
  SNAPPY: [0.25, 1, 0.5, 1],
  SOFT: 'easeInOut',
  BOUNCY: [0.175, 0.885, 0.32, 1.275], // approximate spring
  SETTLE: 'easeOut',
  EASE_IN: 'easeIn',
} as const;

export const animSpeed = (duration: number, multiplier: number = 1) => duration / multiplier;
