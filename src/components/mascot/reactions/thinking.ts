import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #10 Thinking:
 * Internal processing. Slower, more deliberate than Curious.
 * Pupils drift upward-left (internal gaze), thought dots appear.
 * "Hmm, let me think about that..."
 */
export const playThinking = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'neutral');
    P.thinkingHand(ctx);
    P.spawnThoughtDots(ctx);
    return;
  }

  // 1. Look upward (eyes lead — but slowly, internal focus)
  await P.lookAt(ctx, -3, -5, 0.4);
  P.setMouth(ctx, 'neutral');

  // 2. Pupils drift diagonally (slow, deliberate)
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 3. Hand reaches chin + torso settles into thinking tilt
  P.thinkingHand(ctx);
  await ctx.animate([
    ['#torso-group', { rotate: -3 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Thought dots appear
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));
  P.spawnThoughtDots(ctx);

  // 5. Tiny subtle eye movement (pupils drift slightly)
  await P.lookAt(ctx, -4, -4, 0.6);
  await new Promise(r => setTimeout(r, 400 / speedMultiplier));

  // 6. Slow blink (contemplative)
  await P.slowBlink(ctx);

  // 7. Hold target
  await new Promise(r => setTimeout(r, 500 / speedMultiplier));

  // 8. Recover
  await Promise.all([
    P.lookCenter(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
