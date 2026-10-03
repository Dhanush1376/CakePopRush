import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #7 Surprised:
 * Redesigned — no arms, proper eyeball positioning.
 * Pupils shrink and stay CENTERED. Eyes widen. Body jumps up.
 */
export const playSurprised = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'oMouth');
    P.raiseBrows(ctx);
    return;
  }

  // 1. Micro beat before surprise
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));

  // 2. INSTANT surprise — everything happens at once
  P.setMouth(ctx, 'oMouth');

  await Promise.all([
    // Eyes widen slightly and look top right (at the marks)
    ctx.animate([
      ['#left-eye-group, #right-eye-group', { scaleX: 1.08, scaleY: 1.08 }, { duration: 0.1 / speedMultiplier, ease: 'backOut' }],
      ['#left-pupil-group, #right-pupil-group', { x: 3, y: -4 }, { duration: 0.1 / speedMultiplier }]
    ]),
    // Brows jump up high
    ctx.animate([
      ['#left-eyebrow', { y: -8, rotate: 5 }, { duration: 0.1 / speedMultiplier }],
      ['#right-eyebrow', { y: -8, rotate: -5 }, { duration: 0.1 / speedMultiplier }]
    ]),
    // Body startles upward (stretches vertically)
    ctx.animate([
      ['#torso-group', { y: -8, scaleX: 0.96, scaleY: 1.06 }, { duration: 0.15 / speedMultiplier, ease: 'backOut' }]
    ]),
    // Question marks
    P.spawnSurprisedMarks(ctx)
  ]);

  // 3. Frozen surprised hold
  await new Promise(r => setTimeout(r, 800 / speedMultiplier));

  // 4. Recover (eyes first, then body)
  P.resetBrows(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));

  await Promise.all([
    // Eyes back to normal size and center
    ctx.animate([
      ['#left-eye-group, #right-eye-group', { scaleX: 1, scaleY: 1 }, { duration: 0.2 / speedMultiplier }],
      ['#left-pupil-group, #right-pupil-group', { x: 0, y: 0 }, { duration: 0.2 / speedMultiplier }]
    ]),
    // Body settles
    P.settle(ctx)
  ]);
};
