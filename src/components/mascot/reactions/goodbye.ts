import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #27 Goodbye:
 * slightly slower → broader wave → small body movement away/down → final small wave → warm smile → settle.
 */
export const playGoodbye = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    return;
  }

  // 1. Warm smile + small body movement away/down
  P.setMouth(ctx, 'smallSmile');
  await ctx.animate([
    ['#torso-group', { rotate: 2, y: 3 }, { duration: 0.5 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 2. Arm raises (left arm for difference, slower)
  await ctx.animate([
    ['#left-arm', { rotate: 45, y: -2, x: 0 }, { duration: 0.4 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 3. Broader, slower wave (2 times)
  P.spawnExcitementLines(ctx);
  const waveSpeed = 0.3 / speedMultiplier;
  for (let i = 0; i < 2; i++) {
    await ctx.animate([['#left-arm', { rotate: 20 }, { duration: waveSpeed, ease: 'easeInOut' }]]);
    await ctx.animate([['#left-arm', { rotate: 60 }, { duration: waveSpeed, ease: 'easeInOut' }]]);
  }
  
  // 4. Final small wave
  await ctx.animate([['#left-arm', { rotate: 30 }, { duration: 0.2 / speedMultiplier, ease: 'easeInOut' }]]);
  await ctx.animate([['#left-arm', { rotate: 45 }, { duration: 0.2 / speedMultiplier, ease: 'easeInOut' }]]);

  // 5. Hold
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 6. Settle
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
