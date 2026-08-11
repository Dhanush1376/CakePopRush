import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #11 Confused:
 * "Wait... what?" — uncertain, looking around, concerned brows.
 * Uses question marks. Body tilts back and forth slightly.
 */
export const playConfused = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'uncertain');
    P.concernBrows(ctx);
    P.spawnQuestionMarks(ctx);
    return;
  }

  // 1. Look left (searching)
  await P.lookLeft(ctx);
  await new Promise(r => setTimeout(r, 250 / speedMultiplier));

  // 2. Look right (still searching)
  await P.lookRight(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 3. Brows become concerned
  P.concernBrows(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));

  // 4. Body tilts one way
  await ctx.animate([
    ['#torso-group', { rotate: -4 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 5. Slight opposite tilt
  await ctx.animate([
    ['#torso-group', { rotate: 3 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 6. Question marks appear + uncertain mouth
  P.spawnQuestionMarks(ctx);
  P.setMouth(ctx, 'uncertain');

  // 7. Settle into confused tilt
  await ctx.animate([
    ['#torso-group', { rotate: -4 }, { duration: 0.2 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 8. Hold target
  await new Promise(r => setTimeout(r, 700 / speedMultiplier));

  // 9. Recover
  P.resetBrows(ctx);
  await Promise.all([
    P.lookCenter(ctx),
    P.settle(ctx)
  ]);
};
