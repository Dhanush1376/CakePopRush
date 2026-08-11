import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #29 Clapping:
 * arms move inward → CONTACT → impact lines → separate → CONTACT → separate → CONTACT → happy hold → return.
 */
export const playClapping = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    P.showBlush(ctx);
    P.spawnImpactLines(ctx);
    return;
  }

  // 1. Initial happy state
  P.setMouth(ctx, 'openSmile');
  P.showBlush(ctx);
  await ctx.animate([
    ['#torso-group', { rotate: -2, y: -2 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 2. Clapping cycle (3 times)
  const clapSpeed = 0.1 / speedMultiplier;
  
  for (let i = 0; i < 3; i++) {
    // Separate
    await ctx.animate([
      ['#left-arm', { rotate: -40, y: 0, x: 5 }, { duration: clapSpeed }],
      ['#right-arm', { rotate: 40, y: 0, x: -5 }, { duration: clapSpeed }]
    ]);
    
    // CONTACT!
    ctx.animate([['#torso-group', { scaleY: 0.98, scaleX: 1.02 }, { duration: clapSpeed }]]);
    await ctx.animate([
      ['#left-arm', { rotate: -100, y: 0, x: 15 }, { duration: clapSpeed, ease: 'easeIn' }],
      ['#right-arm', { rotate: 100, y: 0, x: -15 }, { duration: clapSpeed, ease: 'easeIn' }]
    ]);
    P.spawnImpactLines(ctx);
    
    // Recover slightly
    await ctx.animate([['#torso-group', { scaleY: 1, scaleX: 1 }, { duration: clapSpeed }]]);
  }

  // 3. Happy hold (hands together)
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 4. Return
  P.hideBlush(ctx);
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
