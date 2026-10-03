import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #8 Oops!:
 * Redesigned — no arms, proper eyeball positioning.
 * Quick wince → one eye squeezes shut → nervous body shake → recover.
 */
export const playOops = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'uncertain');
    P.concernBrows(ctx);
    return;
  }

  // 1. Initial startle — mouth goes wiggly, brows go asymmetric
  P.setMouth(ctx, 'uncertain');
  P.spawnOopsMarks(ctx);

  await Promise.all([
    // Right eye squeezes shut (wince)
    ctx.animate([
      ['#right-eye-normal', { opacity: 0 }, { duration: 0.1 / speedMultiplier }],
      ['#right-eye-squeezed', { opacity: 1 }, { duration: 0.1 / speedMultiplier }]
    ]),
    // Eyebrows go asymmetric
    ctx.animate([
      ['#left-eyebrow', { y: -6, rotate: 12 }, { duration: 0.15 / speedMultiplier }],
      ['#right-eyebrow', { y: 3, rotate: -18 }, { duration: 0.15 / speedMultiplier }]
    ]),
    // Body squashes down (cringe)
    ctx.animate([
      ['#torso-group', { y: 8, scaleY: 0.94, scaleX: 1.04 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
    ]),
    // Light blush
    P.showBlush(ctx, 0.3)
  ]);

  // 2. Nervous body shake
  for (let i = 0; i < 3; i++) {
    await ctx.animate([
      ['#torso-group', { x: 3, rotate: 1 }, { duration: 0.04 / speedMultiplier }]
    ]);
    await ctx.animate([
      ['#torso-group', { x: -3, rotate: -1 }, { duration: 0.04 / speedMultiplier }]
    ]);
  }
  await ctx.animate([
    ['#torso-group', { x: 0, rotate: 0 }, { duration: 0.05 / speedMultiplier }]
  ]);

  // 3. Hold the cringing pose
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 4. Recover
  P.hideBlush(ctx);
  P.resetBrows(ctx);
  
  // Open right eye back up
  await ctx.animate([
    ['#right-eye-squeezed', { opacity: 0 }, { duration: 0.15 / speedMultiplier }],
    ['#right-eye-normal', { opacity: 1 }, { duration: 0.15 / speedMultiplier }]
  ]);

  await Promise.all([
    P.settle(ctx)
  ]);
};
