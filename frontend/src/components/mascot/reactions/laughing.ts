import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #5 Laughing:
 * Redesigned to be VERY different from Happy.
 * Happy = calm open-eyed smile with a gentle bounce.
 * Laughing = eyes squeezed, belly-laugh shaking, body rocking side to side.
 * 
 * The mascot is laughing SO hard it can't keep still!
 */
export const playLaughing = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'laugh');
    P.showBlush(ctx, 0.2);
    await ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0 }],
      ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 1 }, { duration: 0 }]
    ]);
    return;
  }

  // 1. Build-up: Smile starts small, body tenses
  P.setMouth(ctx, 'smallSmile');
  await ctx.animate([
    ['#torso-group', { scaleY: 1.02, scaleX: 0.98 }, { duration: 0.2 / sm, ease: [0.4, 0, 0.2, 1] }]
  ]);

  await new Promise(r => setTimeout(r, 100 / sm));

  // 2. Can't hold it — mouth opens wider
  P.setMouth(ctx, 'openSmile');
  await new Promise(r => setTimeout(r, 150 / sm));

  // 3. BURST! Eyes squeeze, laugh mouth, body squashes down hard
  P.setMouth(ctx, 'laugh');
  P.showBlush(ctx, 0.2);

  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.08 / sm }],
      ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 1 }, { duration: 0.08 / sm }]
    ]),
    ctx.animate([
      ['#torso-group', { scaleX: 1.06, scaleY: 0.94, y: 6, rotate: -3 }, { duration: 0.2 / sm, ease: 'backOut' }]
    ])
  ]);

  // 4. Belly-laugh rocking — body rocks left and right like it can't control itself
  for (let i = 0; i < 3; i++) {
    // Rock right
    await ctx.animate([
      ['#torso-group', { rotate: 4, x: 3, scaleX: 1.04, scaleY: 0.96, y: 5 }, { duration: 0.2 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ]);
    // Rock left
    await ctx.animate([
      ['#torso-group', { rotate: -4, x: -3, scaleX: 1.04, scaleY: 0.96, y: 5 }, { duration: 0.2 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ]);
  }

  // 5. One more big squash-bounce
  await ctx.animate([
    ['#torso-group', { scaleX: 1.08, scaleY: 0.92, y: 8, rotate: 0, x: 0 }, { duration: 0.12 / sm, ease: 'easeOut' }]
  ]);
  await ctx.animate([
    ['#torso-group', { scaleX: 0.96, scaleY: 1.04, y: -4, rotate: 0 }, { duration: 0.15 / sm, ease: 'easeOut' }]
  ]);
  await ctx.animate([
    ['#torso-group', { scaleX: 1.03, scaleY: 0.97, y: 3, rotate: -2 }, { duration: 0.15 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);

  // 6. Hold the laughing pose
  await new Promise(r => setTimeout(r, 600 / sm));

  // 7. Slowly calm down — eyes open, mouth goes to happy smile
  P.hideBlush(ctx);
  await ctx.animate([
    ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 0 }, { duration: 0.25 / sm, ease: [0.4, 0, 0.2, 1] }],
    ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.25 / sm, ease: [0.4, 0, 0.2, 1] }]
  ]);

  P.setMouth(ctx, 'happy');
  await new Promise(r => setTimeout(r, 200 / sm));

  // 8. Settle
  P.setMouth(ctx, 'neutral');
  await P.settle(ctx);
};
