import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Sad:
 * Slow sinking sadness. 
 * Body sags deeply, brows furrow in concern, lips tremble slightly.
 */
export const playSad = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tiredFrown');
    P.concernBrows(ctx);
    P.eyesNormal(ctx);
    P.lookDown(ctx);
    ctx.setActiveParticles(['tears']);
    return;
  }

  // 1. Slow, heartbroken sinking
  P.concernBrows(ctx);
  P.setMouth(ctx, 'tiredFrown');
  P.eyesNormal(ctx);
  
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { y: 4 }, { duration: 0.5 / sm, ease: 'easeInOut' }]
    ]),
    animate([
      ['#torso-group', { y: 10 }, { duration: 0.8 / sm, ease: 'easeOut' }]
    ])
  ]);

  // 2. Tears begin to fall
  ctx.setActiveParticles(['tears']);

  // 3. Very subtle sobbing shakes (lip trembling/body shuddering)
  for (let i = 0; i < 4; i++) {
    await animate([
      ['#torso-group', { y: 12 }, { duration: 0.3 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { y: 10 }, { duration: 0.3 / sm, ease: 'easeInOut' }]
    ]);
  }

  // 4. Stay sad indefinitely (this is usually cleared by another reaction)
  return { holdState: true };
};
