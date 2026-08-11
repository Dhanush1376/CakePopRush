import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #19 Cheeky:
 * look toward viewer → sideways tilt → tongue → one eyebrow reacts → tiny playful bounce.
 */
export const playCheeky = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tongue');
    return;
  }

  // 1. Look toward viewer
  await P.lookCenter(ctx);
  
  // 2. Sideways tilt + arms pose
  await Promise.all([
    ctx.animate([
      ['#torso-group', { rotate: 4 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
    ]),
    ctx.animate([
      ['#left-arm', { rotate: -120, y: -5 }, { duration: 0.25 / speedMultiplier, ease: 'easeOut' }],
      ['#right-arm', { rotate: 20 }, { duration: 0.25 / speedMultiplier, ease: 'easeOut' }]
    ])
  ]);

  // 3. One eyebrow reacts + tongue out
  P.setMouth(ctx, 'tongue');
  ctx.animate([
    ['#left-eyebrow', { y: -6, rotate: 10 }, { duration: 0.15 / speedMultiplier }],
    ['#right-eyebrow', { y: -2, rotate: -5 }, { duration: 0.15 / speedMultiplier }]
  ]);

  // 4. Tiny playful bounce
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));
  await ctx.animate([
    ['#torso-group', { y: -5 }, { duration: 0.15 / speedMultiplier, ease: 'easeOut' }]
  ]);
  await ctx.animate([
    ['#torso-group', { y: 0 }, { duration: 0.15 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 5. Hold
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 6. Reset
  P.resetBrows(ctx);
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
