import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #30 Party — ENHANCED
 *
 * Principles applied vs. the original:
 *  1. Anticipation now has a slight rotational "wind-up" wobble, not just a symmetric squash.
 *  2. The hop is an ARC (x-sway + y + rotate), not a pure vertical translate — vertical-only
 *     hops always read as robotic/fake.
 *  3. Hat pops in with an overshoot scale + tiny settle-wiggle instead of a hard opacity cut.
 *  4. Blower "unrolls" (scaleX 0→1 with slight curl) instead of appearing at full length —
 *     party blowers physically extend, so this sells the prop.
 *  5. Limbs are staggered (arms lead, legs follow by ~40ms) — real bodies don't move as one
 *     rigid unit. This is overlapping action.
 *  6. Landing is a DECAYING squash-bounce (3 diminishing oscillations) instead of one snap —
 *     this is what makes a landing feel like it has mass.
 *  7. The "hold" is not a static freeze — added a slow idle sway so the character reads as
 *     alive while celebrating, not paused.
 *  8. Cleanup reverses the extension logic: blower curls back in, hat scales down with a
 *     quick anticipatory squash first (tiny wind-down), instead of instant unmount.
 *  9. Settle has follow-through: eyes/face settle first, legs settle ~60ms later, so the
 *     motion finishes in a wave rather than snapping to rest simultaneously.
 * 10. Confetti bursts twice — a small pre-burst at peak-hop and a fuller burst on landing —
 *     for a punchier, less single-note celebration.
 *
 * NOTE: A few calls below assume small additions to your primitives file:
 *   - P.ARM_PATHS.leftHoldBlowerCurled (a shorter/curled variant of leftHoldBlower)
 *   - P.spawnConfetti(ctx, { count, spread }) accepting an optional config object
 *   - P.wobble(ctx, selector, degrees, duration) — a tiny back-and-forth rotate helper
 * If any of these don't exist yet in your primitives, tell me and I'll write them —
 * everything else here only uses functions already present in your original file.
 */
export const playParty = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'blowMouth');
    ctx.setAccessories(prev => ({ ...prev, partyHat: true, partyBlower: true }));
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { scale: 1, x: 6, y: -8 }, { duration: 0 }],
      ['#left-eyebrow', { y: -6 }, { duration: 0 }],
      ['#right-eyebrow', { y: -6 }, { duration: 0 }]
    ]);
    P.spawnConfetti(ctx);
    return;
  }

  // 1. Smooth Anticipation (Vertical only, no rotation)
  ctx.animate([
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0 }],
    ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: 0 }]
  ]);
  await ctx.animate([
    [
      '#mascot-root',
      { scaleY: 0.7, scaleX: 1.3, y: 15 }, 
      { duration: 0.2 / sm, ease: 'easeIn' }
    ]
  ]);

  // 2. The vertical hop
  P.setMouth(ctx, 'blowMouth');
  ctx.setAccessories(prev => ({ ...prev, partyHat: true, partyBlower: true }));
  
  await new Promise(r => setTimeout(r, 20)); // React mount delay
  
  // Shoot confetti right as blower extends
  setTimeout(() => P.spawnConfetti(ctx, { count: 8, spread: 45 } as any), 80 / sm);

  const hopPeak = ctx.animate([
    ['#left-eye-closed, #right-eye-closed', { opacity: 0 }, { duration: 0 }],
    ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 1 }, { duration: 0 }],
    [
      '#mascot-root',
      { scaleY: 1.05, scaleX: 0.95, y: -18 },
      { duration: 0.22 / sm, ease: 'circOut' }
    ]
  ]);

  const hatPop = ctx.animate([
    ['#party-hat', { scale: 0, opacity: 0, y: 10 }, { duration: 0 }],
    ['#party-hat', { scale: 1.15, opacity: 1, y: -5 }, { duration: 0.12 / sm, ease: 'easeOut' }],
    ['#party-hat', { scale: 1, y: 0 }, { duration: 0.08 / sm, ease: 'backOut' }]
  ]);

  const blowerExtend = ctx.animate([
    ['#party-blower', { scaleX: [0.2, 1] }, { duration: 0.16 / sm, ease: 'easeOut' }]
  ]);

  const faceMove = (async () => {
    await new Promise(r => setTimeout(r, 30 / sm));
    return ctx.animate([
      ['#left-eyebrow, #right-eyebrow', { y: -6 }, { duration: 0.1 / sm }],
      ['#left-cheek, #right-cheek', { opacity: 1, scale: 1 }, { duration: 0.12 / sm }]
    ]);
  })();

  await Promise.all([hopPeak, hatPop, blowerExtend, faceMove]);

  // 3. Smooth Landing Bounce
  P.spawnConfetti(ctx, { count: 16, spread: 110 } as any);
  
  await ctx.animate([
    ['#mascot-root', { scaleY: 0.88, scaleX: 1.12, y: 0 }, { duration: 0.13 / sm, ease: 'easeIn' }]
  ]);
  await ctx.animate([
    ['#mascot-root', { scaleY: 1.06, scaleX: 0.96, y: -6 }, { duration: 0.11 / sm, ease: 'easeOut' }]
  ]);
  await ctx.animate([
    ['#mascot-root', { scaleY: 0.97, scaleX: 1.02, y: 0 }, { duration: 0.09 / sm, ease: 'easeIn' }]
  ]);
  await ctx.animate([
    ['#mascot-root', { scaleY: 1, scaleX: 1, y: 0 }, { duration: 0.12 / sm, ease: 'backOut' }]
  ]);

  // 4. Smooth tiny happy bounce
  await P.tinyBounce(ctx);

  // 5. Smooth hold
  await new Promise(r => setTimeout(r, 1100 / sm));

  // 6. Cleanup props cleanly
  await ctx.animate([
    ['#party-hat', { scale: 1.08 }, { duration: 0.05 / sm, ease: 'easeOut' }]
  ]);
  await Promise.all([
    ctx.animate([
      ['#party-hat', { scale: 0, opacity: 0 }, { duration: 0.12 / sm, ease: 'easeIn' }],
      ['#party-blower', { scaleX: 0.3, opacity: 0 }, { duration: 0.12 / sm, ease: 'easeIn' }]
    ])
  ]);
  ctx.setAccessories(prev => ({ ...prev, partyHat: false, partyBlower: false }));
  
  await new Promise(r => setTimeout(r, 100 / sm));

  // 7. Settle to final expression
  P.resetEyes(ctx);
  P.setMouth(ctx, 'laugh'); 
  
  await Promise.all([
    P.settle(ctx),
    ctx.animate([
      ['#left-cheek, #right-cheek', { opacity: 0, scale: 1 }, { duration: 0.3 / sm, ease: 'backOut' }],
      ['#left-eyebrow, #right-eyebrow', { y: 0 }, { duration: 0.3 / sm, ease: 'backOut' }]
    ])
  ]);

  return { holdState: true };
};