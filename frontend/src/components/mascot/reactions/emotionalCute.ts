import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

export const playEmotionalCute = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'neutral');
    ctx.animate([
      ['#left-eyebrow, #right-eyebrow', { y: -3, rotate: 0 }, { duration: 0 }],
      ['#left-pupil-group, #right-pupil-group', { scale: 1.15 }, { duration: 0 }],
      ['#left-cheek, #right-cheek', { opacity: 1 }, { duration: 0 }]
    ]);
    P.spawnEmotionalTears(ctx, 'sparkle');
    await new Promise(r => setTimeout(r, 1500 / sm));
    return;
  }

  // Determine random variation
  const rand = Math.random();
  const variation: 'leftTear' | 'rightTear' | 'sparkle' =
    rand < 0.33 ? 'leftTear' : rand < 0.66 ? 'rightTear' : 'sparkle';

  // 1. Initial burst: Eyes morph, body breathes, tear/sparkle appears ALL AT ONCE
  P.setMouth(ctx, 'smallSmile');
  P.spawnEmotionalTears(ctx, variation);
  
  ctx.animate([
    ['#left-eyebrow, #right-eyebrow', { scaleY: -1 }, { duration: 0 }],
    ['#left-eyebrow', { rotate: 25, y: -2 }, { duration: 0.3 / sm, ease: [0.25, 0.1, 0.25, 1] }],
    ['#right-eyebrow', { rotate: -25, y: -2 }, { duration: 0.3 / sm, ease: [0.25, 0.1, 0.25, 1] }],
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.25 / sm, ease: [0.4, 0, 0.2, 1] }],
    ['#left-eye-cute, #right-eye-cute', { opacity: 1 }, { duration: 0.25 / sm, ease: [0.4, 0, 0.2, 1] }],
    ['#left-cheek, #right-cheek', { opacity: 1, scale: 1.6 }, { duration: 0.35 / sm, ease: [0.4, 0, 0.2, 1] }],
    ['#torso-group', { scaleY: 1.02, y: -2 }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }],
    ['#left-eye-container, #right-eye-container, #mouth', { y: -1 }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);

  await new Promise(r => setTimeout(r, 400 / sm));

  // 2. 400-2900ms: Extended emotional hold with gentle breathing & mouth micro-tremor
  const holdDuration = 2500 / sm;
  
  ctx.animate([
    ['#mouth', { y: [-1, -0.5, -1, -1.5, -1, -0.5, -1, -1.5, -1, -0.5, -1, -1.5, -1, -0.5, -1, -1.5, -1] }, { duration: 2.5 / sm, ease: 'linear' }],
    ['#left-eye-cute-tear, #right-eye-cute-tear', { 
      scaleX: [1, 1.05, 0.95, 1.02, 0.98, 1],
      scaleY: [1, 0.95, 1.05, 0.98, 1.02, 1],
      y: [0, 0.5, -0.5, 0, 0.5, 0]
    }, { duration: 2.5 / sm, ease: 'easeInOut' }],
    // Gentle breathing on body
    ['#torso-group', { 
      scaleY: [1.02, 1.015, 1.02, 1.015, 1.02],
      y: [-2, -1.5, -2, -1.5, -2]
    }, { duration: 2.5 / sm, ease: 'easeInOut' }]
  ]);

  await new Promise(r => setTimeout(r, holdDuration));

  // 5. 3200-3700ms: Gently return (slower, smoother recovery)
  await Promise.all([
    ctx.animate([
      ['#left-eyebrow, #right-eyebrow', { scaleY: 1 }, { duration: 0 }],
      ['#left-eyebrow, #right-eyebrow', { rotate: 0, y: 0 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }],
      ['#left-eye-cute, #right-eye-cute', { opacity: 0 }, { duration: 0.4 / sm, ease: [0.4, 0, 0.2, 1] }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.4 / sm, ease: [0.4, 0, 0.2, 1] }],
      ['#left-cheek, #right-cheek', { opacity: 0, scale: 1 }, { duration: 0.5 / sm, ease: [0.4, 0, 0.2, 1] }],
      ['#torso-group', { scaleY: 1, y: 0, rotate: 0 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }],
      ['#left-eye-container, #right-eye-container, #mouth', { y: 0 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
};
