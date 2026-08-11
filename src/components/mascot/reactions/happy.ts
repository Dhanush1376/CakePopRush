import { ReactionContext } from '../animations/animationTypes';
import { happyPose } from '../poses/happyPose';
import * as P from '../primitives';

export const playHappy = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, happyPose.mouth);
    await P.openArms(ctx);
    return;
  }

  // 1. Anticipation dip
  P.setMouth(ctx, 'happy');
  await P.squash(ctx);

  // 2. Rise and open arms
  await Promise.all([
    P.bodyRise(ctx),
    P.openArms(ctx)
  ]);

  // 3. Gentle bounce & hold
  await P.bounce(ctx);
  
  // 4. Hold
  await new Promise(resolve => setTimeout(resolve, 800 * speedMultiplier));

  // 5. Settle
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
