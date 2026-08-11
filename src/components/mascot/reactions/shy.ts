import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #23 Shy:
 * Reserved body language + eye avoidance. NOT just blushing.
 * Wide eyes looking away, hands together inward, body compressed.
 */
export const playShy = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    P.showBlush(ctx);
    return;
  }

  // 1. Pupils glance away (avoidance — sideways, opposite from blushing direction)
  await P.lookAt(ctx, -5, 1);
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 2. Blush appears
  P.showBlush(ctx);
  P.setMouth(ctx, 'smallSmile');

  // 3. Hands move inward (together, in front — not to cheeks like blushing)
  ctx.animate([
    ['#left-arm', { rotate: -90, x: 12 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }],
    ['#right-arm', { rotate: 90, x: -12 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Body subtly compresses (shy inward posture)
  await ctx.animate([
    ['#torso-group', { scaleX: 0.96, scaleY: 1.01, rotate: -3 }, { duration: 0.3 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 5. Quick glance toward viewer
  await new Promise(r => setTimeout(r, 400 / speedMultiplier));
  await P.lookAt(ctx, 2, -1, 0.2);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 6. Quick shy glance away again
  await P.lookAt(ctx, -5, 1, 0.15);

  // 7. Blink
  await P.blink(ctx);

  // 8. Hold target
  await new Promise(r => setTimeout(r, 500 / speedMultiplier));

  // 9. Recover
  P.hideBlush(ctx);
  await Promise.all([
    P.lookCenter(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
