import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #12 Shrug:
 * Both arms raised outward, wide innocent eyes, "I dunno" body language.
 * Must feel UNCERTAIN (not confident like Ta-Da).
 */
export const playShrug = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'neutral');
    P.shrugArms(ctx);
    P.raiseBrows(ctx);
    return;
  }

  // 1. Look left (checking)
  await P.lookLeft(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 2. Look right (checking)
  await P.lookRight(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 3. Look center + both arms rise outward
  P.lookCenter(ctx);
  P.setMouth(ctx, 'neutral');
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));

  // 4. Arms rise + shoulders/body rise slightly + innocent brows
  await Promise.all([
    P.shrugArms(ctx),
    ctx.animate([['#torso-group', { y: -3 }, { duration: 0.25 / speedMultiplier, ease: 'easeOut' }]]),
    P.raiseBrows(ctx)
  ]);

  // 5. Innocent wide eyes
  ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleX: 1.05, scaleY: 1.05 }, { duration: 0.15 / speedMultiplier }]
  ]);

  // 6. Hold target
  await new Promise(r => setTimeout(r, 800 / speedMultiplier));

  // 7. Tiny settle
  await ctx.animate([
    ['#torso-group', { y: -1 }, { duration: 0.15 / speedMultiplier }]
  ]);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 8. Arms lower, recover
  P.resetBrows(ctx);
  await Promise.all([
    P.resetEyes(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
