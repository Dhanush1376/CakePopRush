import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #20 Silly:
 * quick squash → squeezed eyes → tongue out → arms pop upward → tiny irregular wiggle.
 * More exaggerated than Cheeky.
 */
export const playSilly = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tongue');
    await P.eyesSqueezed(ctx);
    return;
  }

  // 1. Quick squash (anticipation)
  await ctx.animate([
    ['#torso-group', { scaleY: 0.85, scaleX: 1.15, y: 15 }, { duration: 0.15 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 2. Pop upward: Squeezed eyes + tongue + arms pop
  P.setMouth(ctx, 'tongue');
  await P.eyesSqueezed(ctx);
  
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleY: 0.95, scaleX: 1.05, y: -5, rotate: -5 }, { duration: 0.2 / speedMultiplier, ease: 'backOut' }]
    ]),
    ctx.animate([
      ['#left-arm', { rotate: -150, y: -5, x: 4 }, { duration: 0.2 / speedMultiplier, ease: 'backOut' }],
      ['#right-arm', { rotate: 150, y: -5, x: -4 }, { duration: 0.2 / speedMultiplier, ease: 'backOut' }]
    ])
  ]);

  // 3. Tiny irregular wiggle
  for(let i=0; i<3; i++) {
    await ctx.animate([['#torso-group', { rotate: 3 }, { duration: 0.1 / speedMultiplier }]]);
    await ctx.animate([['#torso-group', { rotate: -5 }, { duration: 0.1 / speedMultiplier }]]);
  }

  // 4. Hold
  await new Promise(r => setTimeout(r, 400 / speedMultiplier));

  // 5. Settle
  await P.eyesNormal(ctx);
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
