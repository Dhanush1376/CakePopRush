import { ReactionContext } from '../animations/animationTypes';
import { applyPose } from '../poses/applyPose';
import { cryingFountainPose } from '../poses/cryingFountainPose';
import * as P from '../primitives';

export const playCryingFountain = async (ctx: ReactionContext) => {
  const { animate } = ctx;
  const speedMultiplier = ctx.prefersReducedMotion ? 0.7 : 1;

  // 1. Clear any prior particles
  P.clearEffects(ctx);

  // 2. Transition into crying face
  await applyPose(ctx, cryingFountainPose);

  // 3. Start fountain tears
  P.spawnFountainTears(ctx);

  // 4. Continuous sobbing tremble while tears stream indefinitely
  while (true) {
    try {
      await animate([
        ['#torso-group', { y: -3, rotate: -1 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
      ]);
      await animate([
        ['#torso-group', { y: 0, rotate: 1 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
      ]);
    } catch {
      // Aborted when mascot reaction changes or unmounts
      break;
    }
  }

  return { holdState: true };
};
