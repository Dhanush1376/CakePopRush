import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #21 Proud:
 * body rises slightly → posture straightens → eyes close happily → confident smile → sparkles → calm hold.
 */
export const playProud = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    await P.eyesClosed(ctx);
    P.spawnSparkles(ctx);
    return;
  }

  // 1. Posture straightens (slight rise)
  P.setMouth(ctx, 'openSmile');
  await ctx.animate([
    ['#torso-group', { y: -5, scaleY: 1.02, scaleX: 0.98 }, { duration: 0.4 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 2. Eyes close happily
  await P.eyesClosed(ctx);

  // 3. Arms move to proud stance
  ctx.animate([
    ['#left-arm', { rotate: -60, y: 2, x: -4 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }],
    ['#right-arm', { rotate: 60, y: 2, x: 4 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Sparkles appear
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));
  P.spawnSparkles(ctx);

  // 5. Calm hold
  await new Promise(r => setTimeout(r, 900 / speedMultiplier));

  // 6. Settle
  await P.eyesNormal(ctx);
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
