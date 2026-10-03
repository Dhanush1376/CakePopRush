import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #17 Love:
 * Redesigned to be a soft, sweet, romantic sway.
 * Eyes close into happy arcs, heavy blush, and a gentle side-to-side sway.
 */
export const playLove = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    ctx.animate([
      ['#left-eyebrow', { rotate: 10, y: -2 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -10, y: -2 }, { duration: 0 }]
    ]);
    P.showBlush(ctx);
    P.spawnHearts(ctx);
    return;
  }

  // 1. Aw, so sweet! (Blush appears, eyebrows lift softly)
  P.showBlush(ctx);
  P.setMouth(ctx, 'smallSmile');
  
  ctx.animate([
    ['#left-eyebrow', { rotate: 10, y: -2 }, { duration: 0.3 / speedMultiplier }],
    ['#right-eyebrow', { rotate: -10, y: -2 }, { duration: 0.3 / speedMultiplier }]
  ]);

  // 2. Eyes close happily
  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.15 / speedMultiplier }],
      ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: 0.15 / speedMultiplier }]
    ]),
    ctx.animate([
      ['#torso-group', { scaleX: 1.02, scaleY: 0.98, rotate: -3 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }]
    ])
  ]);

  P.spawnHearts(ctx);

  // 3. Romantic gentle sway side-to-side
  for (let i = 0; i < 2; i++) {
    // Sway Right
    await ctx.animate([
      ['#torso-group', { rotate: 3, x: 2 }, { duration: 0.8 / speedMultiplier, ease: 'easeInOut' }]
    ]);
    // Sway Left
    await ctx.animate([
      ['#torso-group', { rotate: -3, x: -2 }, { duration: 0.8 / speedMultiplier, ease: 'easeInOut' }]
    ]);
  }

  // 4. Return to center
  await ctx.animate([
    ['#torso-group', { rotate: 0, x: 0, scaleX: 1, scaleY: 1 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 5. Recover slowly
  P.hideBlush(ctx);
  await ctx.animate([
    ['#left-eye-closed, #right-eye-closed', { opacity: 0 }, { duration: 0.3 / speedMultiplier }],
    ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.3 / speedMultiplier }]
  ]);

  await Promise.all([
    P.resetBrows(ctx),
    P.settle(ctx)
  ]);
};
