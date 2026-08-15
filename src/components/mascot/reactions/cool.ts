import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #13 Cool:
 * A confident, relaxed lean back with sunglasses dropping down.
 */
export const playCool = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'confident');
    ctx.setAccessories(prev => ({ ...prev, sunglasses: true }));
    return;
  }

  // 1. Confident smirk + look up (anticipating glasses)
  P.setMouth(ctx, 'confident');
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { y: -4 }, { duration: 0.2 / sm, ease: 'easeOut' }]
    ]),
    animate([
      ['#torso-group', { rotate: -2, y: -2, scaleY: 1.02, scaleX: 0.98 }, { duration: 0.25 / sm, ease: 'easeOut' }]
    ])
  ]);

  // 2. Sunglasses enter smoothly from above (they mount first, then we animate them)
  ctx.setAccessories(prev => ({ ...prev, sunglasses: true }));
  await new Promise(r => setTimeout(r, 20)); // React mount delay

  const glassesDrop = ctx.animate([
    ['#sunglasses', { y: -30, opacity: 0 }, { duration: 0 }],
    ['#sunglasses', { y: 2, opacity: 1 }, { duration: 0.15 / sm, ease: 'easeIn' }],
    ['#sunglasses', { y: -2 }, { duration: 0.1 / sm, ease: 'easeOut' }],
    ['#sunglasses', { y: 0 }, { duration: 0.15 / sm, ease: 'backOut' }]
  ]);

  // 3. Lean back confidently with a slight squash as the glasses land
  const leanBack = async () => {
    await new Promise(r => setTimeout(r, 100 / sm)); // wait for drop impact
    await animate([
      ['#torso-group', { rotate: -8, y: 3, scaleY: 0.97, scaleX: 1.03 }, { duration: 0.3 / sm, ease: 'backOut' }]
    ]);
  };

  await Promise.all([glassesDrop, leanBack()]);

  // 4. Sparkle!
  P.spawnSparkles(ctx);

  // 5. Hold the cool pose with a subtle confident sway
  await animate([
    ['#torso-group', { rotate: -6 }, { duration: 0.6 / sm, ease: 'easeInOut' }]
  ]);
  await animate([
    ['#torso-group', { rotate: -8 }, { duration: 0.6 / sm, ease: 'easeInOut' }]
  ]);

  // 6. Reset
  await Promise.all([
    ctx.animate([
      ['#sunglasses', { y: -30, opacity: 0 }, { duration: 0.2 / sm, ease: 'easeIn' }]
    ]),
    animate([
      ['#torso-group', { rotate: 0, y: 0, scaleY: 1, scaleX: 1 }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
  
  ctx.setAccessories(prev => ({ ...prev, sunglasses: false }));
  P.setMouth(ctx, 'neutral');
  
  await ctx.animate([
    ['#left-pupil-group, #right-pupil-group', { y: 0 }, { duration: 0.2 / sm }]
  ]);
};
