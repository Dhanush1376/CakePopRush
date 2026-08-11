import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #2 Winking:
 * - Left eye (mascot's left, viewer's right) closed in happy crescent wink
 * - Right eye open, bright
 * - Open smile mouth
 * - Right arm raised in a wave/gesture
 * - Body tilted slightly (~3° right)
 */
export const playWinking = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    await P.winkLeft(ctx);
    return;
  }

  // 1. Pupils center, mouth transitions
  await P.lookCenter(ctx);
  P.setMouth(ctx, 'openSmile');

  // 2. Body tilt + wave right arm (staggered)
  P.tiltRight(ctx);
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));

  // 3. Start the long wave + Quick wink (left eye) at the same time
  const wavePromise = P.waveRightLong(ctx);

  await new Promise(r => setTimeout(r, 150 / speedMultiplier));
  await P.winkLeft(ctx);

  // 4. Wait for the wave to finish (which is ~2.2 seconds)
  await wavePromise;

  // 5. Settle
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
