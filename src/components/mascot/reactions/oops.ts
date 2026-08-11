import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #8 Oops!:
 * Quick, cute startle → embarrassed recoil → hand to mouth
 * Fast reaction. Asymmetric expression is key.
 */
export const playOops = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tinyOops');
    P.concernBrows(ctx);
    return;
  }

  // 1. Micro startle (fast, eyes lead)
  P.setMouth(ctx, 'frown');
  ctx.setActiveParticles(['tears']);
  await P.startle(ctx);

  // 2. Pupils react sideways + asymmetric brows (staggered)
  await P.lookAt(ctx, 3, -1);
  await new Promise(r => setTimeout(r, 60 / speedMultiplier));

  // Asymmetric brows: left raised, right slightly furrowed
  ctx.animate([
    ['#left-eyebrow', { y: -4, rotate: 8 }, { duration: 0.15 / speedMultiplier }],
    ['#right-eyebrow', { y: -2, rotate: -5 }, { duration: 0.15 / speedMultiplier }]
  ]);

  // 3. Right hand approaches mouth quickly
  P.setMouth(ctx, 'tiredFrown');
  await ctx.animate([
    ['#right-arm', { rotate: 170, y: -18, x: -4 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 4. Tiny embarrassed body recoil
  await ctx.animate([
    ['#torso-group', { y: 2, scaleX: 0.98 }, { duration: 0.2 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 5. Hold target
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 6. Recover
  ctx.setActiveParticles([]);
  P.resetBrows(ctx);
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));
  await Promise.all([
    P.lookCenter(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
