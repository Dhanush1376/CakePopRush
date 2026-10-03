import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #20 Silly:
 * Very playful, sticking tongue out.
 * Quick squash, pop up with squeezed eyes and tongue, vigorous head wiggle.
 */
export const playSilly = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tongue');
    await P.eyesSqueezed(ctx);
    return;
  }

  // 1. Quick squash (anticipation)
  P.setMouth(ctx, 'smallSmile');
  await animate([
    ['#torso-group', { scaleY: 0.85, scaleX: 1.15, y: 15 }, { duration: 0.15 / sm, ease: 'easeIn' }]
  ]);

  // 2. Pop upward: Squeezed eyes + tongue out + body stretches and tilts
  P.setMouth(ctx, 'tongue');
  
  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.1 / sm }],
      ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 1 }, { duration: 0.1 / sm }]
    ]),
    animate([
      ['#torso-group', { scaleY: 1.05, scaleX: 0.95, y: -5, rotate: -8 }, { duration: 0.2 / sm, ease: 'backOut' }]
    ])
  ]);

  // 3. Playful vigorous wiggle (shaking head side to side)
  for(let i = 0; i < 4; i++) {
    await animate([['#torso-group', { rotate: 8, scaleY: 0.95, scaleX: 1.05 }, { duration: 0.15 / sm, ease: 'easeInOut' }]]);
    await animate([['#torso-group', { rotate: -8, scaleY: 1.05, scaleX: 0.95 }, { duration: 0.15 / sm, ease: 'easeInOut' }]]);
  }
  
  // Center
  await animate([['#torso-group', { rotate: 0, scaleY: 1, scaleX: 1 }, { duration: 0.1 / sm, ease: 'easeOut' }]]);

  // 4. Hold the silly tongue out face
  await new Promise(r => setTimeout(r, 600 / sm));

  // 5. Recover smoothly
  await Promise.all([
    ctx.animate([
      ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 0 }, { duration: 0.2 / sm }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.2 / sm }]
    ]),
    animate([
      ['#torso-group', { y: 0 }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);

  P.setMouth(ctx, 'neutral');
};
