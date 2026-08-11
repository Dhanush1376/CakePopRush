import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #16 Yawning:
 * Sleepy eyes, yawn mouth opens wide, hand covers mouth, body stretches.
 */
export const playYawning = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'yawn');
    await P.eyesDroopy(ctx);
    return;
  }

  // 1. Eyes become sleepy
  await P.eyesSleepy(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 2. Yawn mouth begins opening
  P.setMouth(ctx, 'oMouth');
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 3. Hand approaches mouth + torso stretches slightly
  ctx.animate([
    ['#right-arm', { rotate: 160, y: -16, x: -3 }, { duration: 0.3 / speedMultiplier, ease: 'easeOut' }]
  ]);
  await ctx.animate([
    ['#torso-group', { y: -2, scaleY: 1.03 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 4. Mouth reaches full yawn
  P.setMouth(ctx, 'yawn');
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));

  // 5. Eyes droop more during yawn
  await P.eyesDroopy(ctx);

  // 6. Hold full yawn
  await new Promise(r => setTimeout(r, 800 / speedMultiplier));

  // 7. Sleepy settle downward
  P.setMouth(ctx, 'sleepySmile');
  await ctx.animate([
    ['#torso-group', { y: 3, scaleY: 0.98 }, { duration: 0.4 / speedMultiplier, ease: 'easeInOut' }]
  ]);

  // 8. Recover
  await new Promise(r => setTimeout(r, 300 / speedMultiplier));
  await Promise.all([
    P.eyesNormal(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
