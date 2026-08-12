import { ReactionContext } from '../animations/animationTypes';
import { applyPose } from '../poses/applyPose';
import { cryingFountainPose } from '../poses/cryingFountainPose';
import { AnimationSequence } from 'framer-motion';
import * as P from '../primitives';

export const playCryingFountain = async (ctx: ReactionContext) => {
  const { animate } = ctx;
  const speedMultiplier = ctx.prefersReducedMotion ? 0.7 : 1;

  
  // 1. Instantly clear effects
  P.clearEffects(ctx);

  // 2. Transition rapidly into sad face (150ms)
  applyPose(ctx, cryingFountainPose);

  // 4. Start fountain
  P.spawnFountainTears(ctx);

  // 6. Hold the sad pose and tears for much longer (3.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 3500 / speedMultiplier));

  // 7. Stop tears, reset pose
  P.clearEffects(ctx);
};
