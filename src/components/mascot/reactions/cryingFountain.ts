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

  // 4. Sobbing tremble while tears stream (3.2 seconds)
  for (let i = 0; i < 6; i++) {
    try {
      await animate([
        ['#torso-group', { y: -3, rotate: -1 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
      ]);
      await animate([
        ['#torso-group', { y: 0, rotate: 1 }, { duration: 0.25 / speedMultiplier, ease: 'easeInOut' }]
      ]);
    } catch (e: any) {
      if (e.message !== 'Aborted') console.warn(e);
      break;
    }
  }

  // 5. Stop tears
  P.clearEffects(ctx);

  // 6. Smoothly return to normal face & pose
  try {
    await P.eyesNormal(ctx);
    P.setMouth(ctx, 'neutral');
    await animate([
      ['#torso-group', { y: 0, rotate: 0 }, { duration: 0.4, ease: 'easeOut' }]
    ]);
  } catch (e: any) {
    if (e.message !== 'Aborted') console.warn(e);
  }
};
