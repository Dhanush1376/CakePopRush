import { ReactionContext, animSpeed } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #32 Bonk (Hit reaction):
 * - Instant squash impact on #torso-group (the head/body)
 * - Eyes squeeze shut, brows raise, oMouth
 * - Small rotational wobble (recovering from hit)
 * - Tiny secondary bounce on #mascot-root
 * - bonkStars particles
 */
export const playBonk = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'oMouth');
    P.raiseBrows(ctx);
    P.spawnBonkStars(ctx);
    
    // Simple pulse
    await ctx.animate([
      ['#torso-group', { scaleX: 0.96, scaleY: 0.96 }, { duration: animSpeed(0.1, speedMultiplier) }]
    ]);
    await ctx.animate([
      ['#torso-group', { scaleX: 1, scaleY: 1 }, { duration: animSpeed(0.2, speedMultiplier) }]
    ]);
    
    P.setMouth(ctx, 'neutral');
    P.resetBrows(ctx);
    return;
  }

  // Determine random impact direction for slight variation (-2 to +2 degrees)
  const dirMultiplier = Math.random() > 0.5 ? 1 : -1;
  const baseWobble = 8;
  const w1 = -(baseWobble + Math.random() * 2) * dirMultiplier;
  const w2 = (baseWobble - 1) * dirMultiplier;
  const w3 = -(baseWobble - 3) * dirMultiplier;
  const w4 = (baseWobble - 5) * dirMultiplier;

  // 1. IMPACT (0-40ms): Squash torso (head), raise brows, tiny root bump
  P.spawnBonkStars(ctx);
  P.raiseBrows(ctx);
  P.setMouth(ctx, 'oMouth');
  
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleX: 1.04, scaleY: 0.94, y: 4, rotate: w1 / 2 }, { duration: animSpeed(0.04, speedMultiplier), ease: 'easeOut' }]
    ]),
    ctx.animate([
      ['#mascot-root', { y: 2 }, { duration: animSpeed(0.04, speedMultiplier), ease: 'easeOut' }]
    ]),
    P.legWobble(ctx) // subtle leg reaction
  ]);

  // 2. FACE REACTION (40-50ms): Eyes squeeze shut
  P.eyesSqueezed(ctx);

  // 3. WOBBLE SEQUENCE (50-280ms)
  await ctx.animate([
    ['#torso-group', { rotate: w1 }, { duration: animSpeed(0.06, speedMultiplier), ease: 'easeInOut' }]
  ]);
  
  await ctx.animate([
    ['#torso-group', { rotate: w2, scaleX: 0.97, scaleY: 1.03, y: -2 }, { duration: animSpeed(0.06, speedMultiplier), ease: 'easeInOut' }]
  ]);
  
  await ctx.animate([
    ['#torso-group', { rotate: w3, scaleX: 1.01, scaleY: 0.99, y: 1 }, { duration: animSpeed(0.06, speedMultiplier), ease: 'easeInOut' }]
  ]);
  
  await ctx.animate([
    ['#torso-group', { rotate: w4 }, { duration: animSpeed(0.06, speedMultiplier), ease: 'easeInOut' }]
  ]);

  // 4. RECOVERY (280-350ms)
  P.resetBrows(ctx);
  P.setMouth(ctx, 'neutral');
  
  await Promise.all([
    ctx.animate([
      ['#torso-group', { rotate: 0, scaleX: 1, scaleY: 1, y: 0 }, { duration: animSpeed(0.07, speedMultiplier), ease: 'easeOut' }]
    ]),
    ctx.animate([
      ['#mascot-root', { y: 0 }, { duration: animSpeed(0.07, speedMultiplier), ease: 'easeOut' }]
    ])
  ]);

  // Finally open eyes
  P.eyesNormal(ctx);
};
