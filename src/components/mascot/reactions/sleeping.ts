import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #14 Sleeping:
 * Slowest reaction. Gentle transition into sleep.
 * Subtle breathing, Zzz particles, peaceful.
 */
export const playSleeping = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'sleepySmile');
    ctx.animate([
      ['#left-eyebrow', { rotate: 12, y: -1 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -12, y: -1 }, { duration: 0 }]
    ]);
    P.foldArms(ctx);
    await P.eyesClosed(ctx);
    P.spawnSleepZs(ctx);
    return;
  }

  // 1. Eyelids become heavy (slow drooping)
  await P.eyesDroopy(ctx);
  await new Promise(r => setTimeout(r, 300 / speedMultiplier));

  // 2. Slow blink
  await P.slowBlink(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 3. Eyes close fully (switch to crescent arcs)
  await P.eyesClosed(ctx);
  P.setMouth(ctx, 'sleepySmile');

  // 4. Body settles down slightly
  await ctx.animate([
    ['#torso-group', { y: 4, scaleY: 0.97 }, { duration: 0.6 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 5. Arms relax and fold, eyebrows soften
  P.foldArms(ctx);
  ctx.animate([
    ['#left-eyebrow', { rotate: 12, y: -1 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }],
    ['#right-eyebrow', { rotate: -12, y: -1 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 6. Subtle breathing (almost invisible body pulse) + Zzz
  P.spawnSleepZs(ctx);
  
  // Breathing cycle: very subtle scaleY pulse
  for (let i = 0; i < 3; i++) {
    await ctx.animate([
      ['#torso-group', { scaleY: 0.98 }, { duration: 0.8 / speedMultiplier, ease: 'easeInOut' }]
    ]);
    await ctx.animate([
      ['#torso-group', { scaleY: 0.96 }, { duration: 0.8 / speedMultiplier, ease: 'easeInOut' }]
    ]);
  }

  // 7. Gentle wake/recovery
  await P.eyesNormal(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));
  await P.slowBlink(ctx);
  await Promise.all([
    P.resetBrows(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
