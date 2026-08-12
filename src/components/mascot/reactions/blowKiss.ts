import { ReactionContext } from '../animations/animationTypes';
import { applyPose } from '../poses/applyPose';
import { blowKissPose } from '../poses/blowKissPose';
import * as P from '../primitives';
import { AnimationSequence } from 'framer-motion';

export const playBlowKiss = async (ctx: ReactionContext) => {
  const { animate, speedMultiplier, prefersReducedMotion } = ctx;
  const speed = (ms: number) => (ms / 1000) * speedMultiplier;

  // 1. Instantly clear effects
  P.clearEffects(ctx);

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'kiss');
    P.spawnKissHeart(ctx);
    await new Promise(r => setTimeout(r, 1400 * speedMultiplier));
    P.setMouth(ctx, 'neutral');
    return;
  }

  // Phase 1: 0-120ms Tiny happy recognition
  // (Scale up, eyes slightly wider - we'll just set a small scale on the body)
  const recognition: AnimationSequence = [
    ['#mascot-root', { scale: 1.01, y: -2 }, { duration: speed(120), ease: 'easeOut' }]
  ];
  
  try {
    await animate(recognition);
  } catch(e) { console.warn(e); }

  // Phase 2: 120-220ms Head tilt
  const tilt: AnimationSequence = [
    ['#torso-group', { rotate: 5 }, { duration: speed(100), ease: 'easeInOut' }]
  ];
  try {
    await animate(tilt);
  } catch(e) { console.warn(e); }

  // Phase 3: 220-400ms Kiss Expression
  // We'll apply the pose which handles squeezed eyes, blush, and kiss mouth
  applyPose(ctx, blowKissPose);
  await new Promise(r => setTimeout(r, speed(180) * 1000));

  // Phase 4: 400-520ms Pucker shift (tiny forward movement)
  const pucker: AnimationSequence = [
    ['#left-eye-container, #right-eye-container, #mouth', { x: 3, y: -1 }, { duration: speed(120), ease: 'easeOut' }]
  ];
  try {
    await animate(pucker);
  } catch(e) { console.warn(e); }

  // Phase 5: 520-850ms Spawn heart and reset face
  P.spawnKissHeart(ctx);
  const faceReset: AnimationSequence = [
    ['#left-eye-container, #right-eye-container, #mouth', { x: 0, y: 0 }, { duration: speed(330), ease: 'easeIn' }]
  ];
  try {
    await animate(faceReset);
  } catch(e) { console.warn(e); }

  // Phase 6: 850-1150ms Happy face follow-through
  P.eyesNormal(ctx);
  P.setMouth(ctx, 'happy');
  try {
    await animate([
      ['#torso-group', { rotate: 0 }, { duration: speed(300), ease: 'easeInOut' }],
      ['#mascot-root', { scale: 1, y: 0 }, { duration: speed(300), ease: 'easeInOut', at: '<' }]
    ]);
  } catch(e) { console.warn(e); }

  // Wait remaining time up to 1400ms
  // 120+100+180+120+330+300 = 1150. Remaining: 250
  await new Promise(r => setTimeout(r, speed(250) * 1000));
};
