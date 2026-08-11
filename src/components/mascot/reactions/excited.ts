import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #6 Excited:
 * Energetic but controlled.
 * anticipation squash → hop → stretch → excited face → arms lift → lines → land → hold.
 */
export const playExcited = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'laugh');
    P.spawnExcitementLines(ctx);
    return;
  }

  // 1. Anticipation squash
  await ctx.animate([
    ['#mascot-root', { scaleY: 0.85, scaleX: 1.15, y: 15 }, { duration: 0.2 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 2. Hop / Stretch upwards
  P.setMouth(ctx, 'laugh');
  ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 1.1, scaleX: 1.1 }, { duration: 0.1 / speedMultiplier }]
  ]);
  
  await Promise.all([
    ctx.animate([
      ['#mascot-root', { scaleY: 1.1, scaleX: 0.9, y: -25 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
    ]),
    ctx.animate([
      ['#left-arm', { rotate: -160, y: -2, x: 2 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }],
      ['#right-arm', { rotate: 160, y: -2, x: -2 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
    ])
  ]);

  // 3. Excitement lines appear at peak
  P.spawnExcitementLines(ctx);

  // 4. Land and rebound
  await ctx.animate([
    ['#mascot-root', { scaleY: 0.95, scaleX: 1.05, y: 0 }, { duration: 0.15 / speedMultiplier, ease: 'easeIn' }]
  ]);
  await ctx.animate([
    ['#mascot-root', { scaleY: 1, scaleX: 1, y: 0 }, { duration: 0.2 / speedMultiplier, ease: 'backOut' }]
  ]);

  // 5. Hold
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 6. Settle/Recover
  await Promise.all([
    P.resetEyes(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
