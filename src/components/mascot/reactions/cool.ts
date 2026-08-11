import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #13 Cool:
 * sunglasses enter → confident → lean → hand gesture → sparkle → hold.
 */
export const playCool = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'confident');
    ctx.setAccessories(prev => ({ ...prev, sunglasses: true }));
    return;
  }

  // 1. Confident expression + body lean
  P.setMouth(ctx, 'confident');
  await ctx.animate([
    ['#torso-group', { rotate: -5, y: -2 }, { duration: 0.3 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 2. Hand gesture
  await ctx.animate([
    ['#left-arm', { rotate: -140, y: -8, x: -6 }, { duration: 0.3 / speedMultiplier, ease: 'backOut' }]
  ]);

  // 3. Sunglasses enter (instant)
  ctx.setAccessories(prev => ({ ...prev, sunglasses: true }));
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));

  // 4. Sparkle
  P.spawnSparkles(ctx);

  // 5. Hold
  await new Promise(r => setTimeout(r, 1000 / speedMultiplier));

  // 6. Reset
  ctx.setAccessories(prev => ({ ...prev, sunglasses: false }));
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
