import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

export const playPleadingCute = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tinyPout');
    ctx.animate([
      ['#left-eyebrow', { y: -6, rotate: -12, opacity: 1 }, { duration: 0 }],
      ['#right-eyebrow', { y: -6, rotate: 12, opacity: 1 }, { duration: 0 }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0 }],
      ['#left-eye-pleading, #right-eye-pleading', { opacity: 1 }, { duration: 0 }],
      ['#left-cheek, #right-cheek', { opacity: 1 }, { duration: 0 }]
    ]);
    await new Promise(r => setTimeout(r, 2000 / sm));
    return;
  }

  const rand = Math.random();
  const tilt = rand > 0.5 ? 5 : -5;
  const lean = rand > 0.5 ? 2 : -2;

  // 1. 0-250ms: Head gently lowers (slower)
  ctx.animate([
    ['#left-eye-container, #right-eye-container, #mouth', { y: 2 }, { duration: 0.25 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);

  await new Promise(r => setTimeout(r, 200 / sm));

  // 2. 200-500ms: Eyes blink to transition to pleading + blush fades in
  ctx.animate([
    ['#left-cheek, #right-cheek', { opacity: 1, scale: 1.2 }, { duration: 0.3 / sm, ease: [0.4, 0, 0.2, 1] }]
  ]);

  await ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 0 }, { duration: 0.15 / sm, ease: 'easeIn' }]
  ]);
  
  ctx.animate([
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0 }],
    ['#left-eye-pleading, #right-eye-pleading', { opacity: 1 }, { duration: 0 }]
  ]);
  
  await ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 1 }, { duration: 0.2 / sm, ease: 'easeOut' }]
  ]);

  await new Promise(r => setTimeout(r, 150 / sm));

  // 3. 350-550ms: Eyebrows into pleading shape (inner corners UP)
  ctx.animate([
    ['#left-eyebrow', { y: -6, rotate: -12 }, { duration: 0.2 / sm, ease: [0.25, 0.1, 0.25, 1] }],
    ['#right-eyebrow', { y: -6, rotate: 12 }, { duration: 0.2 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);

  await new Promise(r => setTimeout(r, 150 / sm));

  // 4. 500-700ms: Tiny pout appears
  P.setMouth(ctx, 'tinyPout');

  await new Promise(r => setTimeout(r, 150 / sm));

  // 5. 650-1000ms: Eyes look upward smoothly
  ctx.animate([
    ['#left-pupil-group-pleading, #right-pupil-group-pleading', { y: -2 }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);

  await new Promise(r => setTimeout(r, 250 / sm));

  // 6. 900-1250ms: Slow, dramatic blink
  ctx.animate([
    ['#left-eye-pleading, #right-eye-pleading', { scaleY: 0 }, { duration: 0.2 / sm, ease: [0.4, 0, 0.2, 1] }]
  ]);
  await new Promise(r => setTimeout(r, 200 / sm));
  ctx.animate([
    ['#left-eye-pleading, #right-eye-pleading', { scaleY: 1 }, { duration: 0.25 / sm, ease: [0, 0, 0.2, 1] }]
  ]);

  await new Promise(r => setTimeout(r, 100 / sm));

  // 7. 1250-1600ms: Head tilt & micro body lean (smoother)
  ctx.animate([
    ['#torso-group', { rotate: tilt, x: lean }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);
  
  await new Promise(r => setTimeout(r, 300 / sm));

  // 8. 1600ms+: Infinite pleading loop with pulsing eyes
  const loopPleading = async () => {
    try {
      while (true) {
        await ctx.animate([
          ['#left-eye-container, #right-eye-container', { scale: [1, 1.04, 0.96, 1] }, { duration: 1.6 / sm, ease: 'easeInOut' }],
          ['#left-pupil-group-pleading, #right-pupil-group-pleading', { y: [-2, -3, -1, -2] }, { duration: 1.6 / sm, ease: 'easeInOut', at: '<' }]
        ]);
      }
    } catch {
      // Aborted when the reaction is stopped
    }
  };
  
  loopPleading();

  return { holdState: true };
};
