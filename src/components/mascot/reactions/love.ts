import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #17 Love:
 * Warm, not hyperactive. Normal eyes (NOT heart eyes), hearts floating.
 * Hands move inward toward chest, tiny happy bounce.
 */
export const playLove = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    ctx.animate([
      ['#left-eyebrow', { rotate: 15 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -15 }, { duration: 0 }]
    ]);
    P.handsToCheeks(ctx);
    P.showBlush(ctx);
    P.spawnHearts(ctx);
    return;
  }

  // 1. Eyes brighten/widen (pupils center, slightly larger)
  ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleX: 1.05, scaleY: 1.08 }, { duration: 0.2 / speedMultiplier }],
    ['#left-pupil-group, #right-pupil-group', { scale: 1.1, x: 0, y: 0 }, { duration: 0.2 / speedMultiplier }]
  ]);
  P.setMouth(ctx, 'smallSmile');
  ctx.animate([
    ['#left-eyebrow', { rotate: 15 }, { duration: 0.2 / speedMultiplier }],
    ['#right-eyebrow', { rotate: -15 }, { duration: 0.2 / speedMultiplier }]
  ]);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));

  // 2. Hands move inward to cheeks
  P.showBlush(ctx);
  await P.handsToCheeks(ctx);

  // 3. Tiny body squeeze (warm, inward)
  await ctx.animate([
    ['#torso-group', { scaleX: 0.97, scaleY: 1.02 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Hearts appear sequentially
  P.spawnHearts(ctx);
  await new Promise(r => setTimeout(r, 300 / speedMultiplier));

  // 5. Tiny happy bounce
  await P.tinyBounce(ctx);

  // 6. Hold target
  await new Promise(r => setTimeout(r, 700 / speedMultiplier));

  // 7. Recover
  P.hideBlush(ctx);
  await Promise.all([
    P.resetBrows(ctx),
    P.resetEyes(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
