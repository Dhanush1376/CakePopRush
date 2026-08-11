import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Sad:
 * - Frown mouth
 * - Brows furrowed downwards
 * - Tears effect continuously
 */
export const playSad = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tiredFrown');
    P.concernBrows(ctx);
    ctx.setActiveParticles(['tears']);
    return;
  }

  // 1. Brows drop, eyes look slightly down
  P.concernBrows(ctx);
  P.setMouth(ctx, 'tiredFrown');
  ctx.setActiveParticles(['tears']);

  await ctx.animate([
    ['#torso-group', { y: 4, scaleY: 0.95 }, { duration: 0.8 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // Hold sad position (the animation engine will just leave it here until another reaction plays)
  await new Promise(r => setTimeout(r, 2000 / speedMultiplier));
};
