import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #5 Laughing:
 * - Eyes squeezed shut (>_< style)
 * - Wide open laugh mouth
 * - Arms slightly out/raised
 * - Body bouncing from laughter
 */
export const playLaughing = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'laugh');
    await P.eyesSqueezed(ctx);
    return;
  }

  // 1. Smile builds
  P.setMouth(ctx, 'openSmile');
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 2. Eyes squeeze + laugh mouth + arms raise (staggered)
  P.setMouth(ctx, 'laugh');
  await P.eyesSqueezed(ctx);
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));
  P.openArms(ctx);

  // 3. Laugh bounces (body shakes)
  await P.tinyBounce(ctx);
  await P.tinyBounce(ctx);

  // 4. Hold
  await new Promise(r => setTimeout(r, 400 / speedMultiplier));

  // 5. Recover
  await P.eyesNormal(ctx);
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));
  P.setMouth(ctx, 'happy');
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
