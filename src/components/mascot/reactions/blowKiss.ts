import { ReactionContext } from '../animations/animationTypes';
import { applyPose } from '../poses/applyPose';
import { blowKissPose } from '../poses/blowKissPose';
import * as P from '../primitives';
export const playBlowKiss = async (ctx: ReactionContext) => {
  const { animate, speedMultiplier, prefersReducedMotion } = ctx;
  const speed = (ms: number) => (ms / 1000) / speedMultiplier;

  // 1. Instantly clear effects
  P.clearEffects(ctx);

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'kiss');
    P.spawnKissHeart(ctx);
    await new Promise(r => setTimeout(r, 3500 / speedMultiplier));
    P.setMouth(ctx, 'neutral');
    return;
  }

  // Phase 1: 0-200ms — Gentle happy recognition (slow scale up)
  try {
    await animate([
      ['#mascot-root', { scale: 1.02, y: -3 }, { duration: speed(200), ease: 'easeOut' }]
    ]);
  } catch(e: any) { if (e.message !== 'Aborted') console.warn(e); }

  // Phase 2: 200-450ms — Smooth head tilt
  try {
    await animate([
      ['#torso-group', { rotate: 5 }, { duration: speed(250), ease: [0.25, 0.1, 0.25, 1] }]
    ]);
  } catch(e: any) { if (e.message !== 'Aborted') console.warn(e); }

  // Phase 3: 450-750ms — Kiss expression builds up gradually
  applyPose(ctx, blowKissPose);
  await new Promise(r => setTimeout(r, speed(300) * 1000));

  // Phase 4: 750-950ms — Gentle pucker shift (face leans forward)
  try {
    await animate([
      ['#left-eye-container, #right-eye-container, #mouth', { x: 3, y: -1 }, { duration: speed(200), ease: [0.4, 0, 0.2, 1] }]
    ]);
  } catch(e: any) { if (e.message !== 'Aborted') console.warn(e); }

  // Phase 5: 950-1400ms — Spawn heart and slowly reset face
  P.spawnKissHeart(ctx);
  try {
    await animate([
      ['#left-eye-container, #right-eye-container, #mouth', { x: 0, y: 0 }, { duration: speed(450), ease: [0.4, 0, 0.2, 1] }]
    ]);
  } catch(e: any) { if (e.message !== 'Aborted') console.warn(e); }

  // Phase 6: 1400-1900ms — Happy face follow-through (smooth settle)
  try { await P.eyesNormal(ctx); } catch (e: any) { if (e.message !== 'Aborted') console.warn(e); }
  P.setMouth(ctx, 'happy');
  try {
    await animate([
      ['#torso-group', { rotate: 0 }, { duration: speed(500), ease: [0.25, 0.1, 0.25, 1] }],
      ['#mascot-root', { scale: 1, y: 0 }, { duration: speed(500), ease: [0.25, 0.1, 0.25, 1], at: '<' }]
    ]);
  } catch(e: any) { if (e.message !== 'Aborted') console.warn(e); }

  // Phase 7: Hold the happy smile
  await new Promise(r => setTimeout(r, 1600 / speedMultiplier));
};
