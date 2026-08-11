import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #3 Blushing:
 * - Both hands on cheeks
 * - Visible blush marks
 * - Eyes looking slightly to the side (averted gaze)
 * - Small shy smile
 * - Body slightly compressed/inward
 */
export const playBlushing = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    P.showBlush(ctx);
    return;
  }

  // 1. Pupils glance sideways (averted gaze) — eyes lead
  await P.lookAt(ctx, 4, -1);

  // 2. Blush appears + mouth changes (staggered)
  P.showBlush(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));
  P.setMouth(ctx, 'smallSmile');

  // 3. Hands rise to cheeks + body compresses slightly
  await Promise.all([
    P.handsToCheeks(ctx),
    ctx.animate([['#torso-group', { scaleX: 0.97, scaleY: 1.02 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]])
  ]);

  // 4. Gentle shy wiggle
  await P.wiggle(ctx);

  // 5. Hold target
  await new Promise(r => setTimeout(r, 700 / speedMultiplier));

  // 6. Recover: blush fades, gaze returns, arms lower
  P.hideBlush(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));
  await Promise.all([
    P.lookCenter(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
