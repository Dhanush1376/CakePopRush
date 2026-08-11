import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #15 Tired:
 * Awake but exhausted. NOT sleeping.
 * Droopy half-open eyes, low body, arms hanging.
 */
export const playTired = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tiredFrown');
    ctx.animate([
      ['#left-eyebrow', { rotate: 15, y: -2 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -15, y: -2 }, { duration: 0 }]
    ]);
    await P.eyesTired(ctx);
    return;
  }

  // 1. Body lowers (exhausted)
  ctx.animate([
    ['#torso-group', { y: 5, scaleY: 0.96 }, { duration: 0.5 / speedMultiplier, ease: 'easeInOut' }]
  ]);
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 2. Eyelids droop and eyebrows rotate
  P.setMouth(ctx, 'tiredFrown');
  ctx.animate([
    ['#left-eyebrow', { rotate: 15, y: -2 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }],
    ['#right-eyebrow', { rotate: -15, y: -2 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);
  await P.eyesTired(ctx);

  // 3. Arms relax/hang
  ctx.animate([
    ['#left-arm', { rotate: 8, y: 3 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }],
    ['#right-arm', { rotate: -8, y: 3 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Pupils droop downward
  await P.lookAt(ctx, 0, 2, 0.4);

  // 5. Slow tiny sway
  await ctx.animate([
    ['#torso-group', { rotate: -2 }, { duration: 0.6 / speedMultiplier, ease: 'easeInOut' }]
  ]);
  await ctx.animate([
    ['#torso-group', { rotate: 2 }, { duration: 0.6 / speedMultiplier, ease: 'easeInOut' }]
  ]);
  await ctx.animate([
    ['#torso-group', { rotate: 0 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 6. Exhausted blink
  await P.slowBlink(ctx);
  
  // 7. Hold
  await new Promise(r => setTimeout(r, 500 / speedMultiplier));

  // 8. Recover
  await Promise.all([
    P.eyesNormal(ctx),
    P.resetBrows(ctx),
    P.lookCenter(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
