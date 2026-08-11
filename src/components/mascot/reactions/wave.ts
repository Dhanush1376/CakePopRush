import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #26 Hello / Wave:
 * notice viewer → pupils center → smile → arm raises → wave ~3 times → torso reacts → motion marks → friendly hold → arm settles.
 */
export const playHello = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    P.spawnExcitementLines(ctx);
    return;
  }

  // 1. Notice viewer
  await P.lookCenter(ctx);
  P.setMouth(ctx, 'openSmile');
  
  // Torso reacts subtly (friendly tilt)
  await ctx.animate([
    ['#torso-group', { rotate: -2, y: -1 }, { duration: 0.3 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 2. Arm raises with natural acceleration/overshoot
  await ctx.animate([
    ['#right-arm', { rotate: -45, y: -4, x: -2 }, { duration: 0.25 / speedMultiplier, ease: 'backOut' }]
  ]);

  // 3. Wave ~3 times + motion marks
  P.spawnExcitementLines(ctx); // Using excitement lines for motion marks
  
  const waveSpeed = 0.15 / speedMultiplier;
  for (let i = 0; i < 3; i++) {
    await ctx.animate([['#right-arm', { rotate: -15 }, { duration: waveSpeed, ease: 'easeInOut' }]]);
    await ctx.animate([['#right-arm', { rotate: -60 }, { duration: waveSpeed, ease: 'easeInOut' }]]);
  }
  
  // 4. Return to center raised position (friendly hold)
  await ctx.animate([['#right-arm', { rotate: -45 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]]);
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 5. Arm settles
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
