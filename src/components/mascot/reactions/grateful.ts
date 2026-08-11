import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #18 Grateful:
 * Emotionally softer than Love. Eyes closed happily, small grateful smile,
 * hands toward chest, tiny bow, small hearts.
 */
export const playGrateful = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    await P.eyesClosed(ctx);
    P.spawnHearts(ctx);
    return;
  }

  // 1. Hands move toward chest (slow, gentle)
  P.setMouth(ctx, 'smallSmile');
  await P.handsToChest(ctx);
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 2. Eyes gently close
  await P.eyesClosed(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 3. Body performs tiny bow (gentle forward tilt + slight lower)
  await ctx.animate([
    ['#torso-group', { y: 3, rotate: 3 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Hearts appear (small, gentle)
  P.spawnHearts(ctx);

  // 5. Hold (peaceful)
  await new Promise(r => setTimeout(r, 900 / speedMultiplier));

  // 6. Rise from bow
  await ctx.animate([
    ['#torso-group', { y: 0, rotate: 0 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 7. Recover
  await P.eyesNormal(ctx);
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
