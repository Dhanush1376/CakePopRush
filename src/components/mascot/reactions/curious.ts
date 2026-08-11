import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #9 Curious:
 * Eyes lead the movement. Inquisitive, looking at something external.
 * "Hmm... what's that?"
 */
export const playCurious = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    P.thinkingHand(ctx);
    return;
  }

  // 1. Pupils move first (eyes lead) — looking upward-right
  await P.lookAt(ctx, 4, -4);

  // 2. Slight pause — the mascot notices something
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 3. Eyebrow reacts (one raised — asymmetric curiosity)
  ctx.animate([
    ['#left-eyebrow', { y: -4, rotate: 5 }, { duration: 0.2 / speedMultiplier }],
    ['#right-eyebrow', { y: -2, rotate: 0 }, { duration: 0.2 / speedMultiplier }]
  ]);
  await new Promise(r => setTimeout(r, 120 / speedMultiplier));

  // 4. Hand approaches chin + body tilts
  P.setMouth(ctx, 'smallSmile');
  await Promise.all([
    P.thinkingHand(ctx),
    ctx.animate([['#torso-group', { rotate: 3 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }]])
  ]);

  // 5. Tiny attentive blink
  await P.blink(ctx);

  // 6. Hold target
  await new Promise(r => setTimeout(r, 800 / speedMultiplier));

  // 7. Recover
  P.resetBrows(ctx);
  await Promise.all([
    P.lookCenter(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
