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
      ['#left-arm, #right-arm', { opacity: 0 }, { duration: 0 }],
      ['#left-arm-front', { opacity: 1, x: -65 }, { duration: 0 }],
      ['#left-arm-front-path', { d: P.ARM_PATHS.leftHoldBlower }, { duration: 0 }],
      ['#right-arm-path', { d: P.ARM_PATHS.rightHidden }, { duration: 0 }],
      ['#left-leg', { rotate: 45, y: -20, x: -10 }, { duration: 0 }],
      ['#right-leg', { rotate: -15, y: 0, x: 10 }, { duration: 0 }],
      ['#left-pupil-group, #right-pupil-group', { scale: 1, x: 6, y: -8 }, { duration: 0 }],
      ['#left-eyebrow', { rotate: 15, y: -6 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -15, y: -6 }, { duration: 0 }],
      ['#left-eye-container, #right-eye-container, #left-eyebrow, #right-eyebrow, #mouth, #left-cheek, #right-cheek, #party-blower', { x: -35 }, { duration: 0 }]
    ]);
    P.spawnConfetti(ctx);
    return;
  }

  // ---------------------------------------------------------------------
  // 1. Anticipation — asymmetric wind-up, not a mirror-image squash.
  //    A tiny counter-rotation before the "real" motion sells intent.
  // ---------------------------------------------------------------------
  ctx.animate([
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0 }],
    ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: 0 }]
  ]);
  await ctx.animate([
    ['#mascot-root', { rotate: -3 }, { duration: 0.08 / sm, ease: 'easeOut' }]
  ]);
  await ctx.animate([
    [
      '#mascot-root',
      { scaleY: 0.68, scaleX: 1.32, y: 22, rotate: 2 },
      { duration: 0.16 / sm, ease: 'easeIn' }
    ]
  ]);

  // ---------------------------------------------------------------------
  // 2. The hop — an ARC. x-sway + y + rotate settle back to 0, so the body
  //    travels a curved path instead of snapping straight up.
  //    Hat/blower mount mid-anticipation so they're visually "thrown on" by
  //    the hop rather than appearing before movement starts.
  // ---------------------------------------------------------------------
  P.setMouth(ctx, 'blowMouth');
  ctx.setAccessories(prev => ({ ...prev, partyHat: true, partyBlower: true }));
  await new Promise(r => setTimeout(r, 20));

  const hopPeak = ctx.animate([
    ['#left-eye-closed, #right-eye-closed', { opacity: 0 }, { duration: 0 }],
    ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0 }],
    [
      '#mascot-root',
      { scaleY: 1.08, scaleX: 0.92, y: -14, x: -4, rotate: 0 },
      { duration: 0.22 / sm, ease: 'circOut' }
    ]
  ]);

  // Hat: overshoot pop instead of hard cut-in.
  const hatPop = ctx.animate([
    ['#party-hat', { scale: 0, opacity: 0, rotate: -12 }, { duration: 0 }],
    ['#party-hat', { scale: 1.15, opacity: 1, rotate: 6 }, { duration: 0.12 / sm, ease: 'easeOut' }],
    ['#party-hat', { scale: 1, rotate: 0 }, { duration: 0.08 / sm, ease: 'backOut' }]
  ]);

  // Blower: unrolls rather than snapping to full extension.
  const blowerExtend = ctx.animate([
    ['#left-arm, #right-arm', { opacity: 0 }, { duration: 0.08 / sm }],
    ['#left-arm-front', { opacity: 1, x: -65 }, { duration: 0.08 / sm }],
    [
      '#left-arm-front-path',
      { d: [P.ARM_PATHS.leftHoldBlowerCurled ?? P.ARM_PATHS.leftHoldBlower, P.ARM_PATHS.leftHoldBlower] },
      { duration: 0.16 / sm, ease: 'easeOut' }
    ],
    ['#right-arm-path', { d: P.ARM_PATHS.rightHidden }, { duration: 0.08 / sm }],
    ['#party-blower', { scaleX: [0.3, 1] }, { duration: 0.16 / sm, ease: 'easeOut' }]
  ]);

  // Legs kick out ~40ms after arms start — overlapping action, not lockstep.
  const legsAndFace = (async () => {
    await new Promise(r => setTimeout(r, 40 / sm));
    return ctx.animate([
      ['#left-leg', { rotate: 48, y: -22, x: -10 }, { duration: 0.18 / sm, ease: 'backOut' }],
      ['#right-leg', { rotate: -18, y: 0, x: 10 }, { duration: 0.18 / sm, ease: 'backOut' }],
      ['#left-pupil-group, #right-pupil-group', { scale: 1.1, x: 6, y: -8 }, { duration: 0.1 / sm }],
      ['#left-eyebrow', { rotate: 15, y: -6 }, { duration: 0.1 / sm }],
      ['#right-eyebrow', { rotate: -15, y: -6 }, { duration: 0.1 / sm }],
      ['#left-cheek, #right-cheek', { opacity: 1, scale: 1 }, { duration: 0.12 / sm }],
      [
        '#left-eye-container, #right-eye-container, #left-eyebrow, #right-eyebrow, #mouth, #left-cheek, #right-cheek, #party-blower',
        { x: -35 },
        { duration: 0.18 / sm, ease: 'easeOut' }
      ]
    ]);
  })();

  await Promise.all([hopPeak, hatPop, blowerExtend, legsAndFace]);

  // ---------------------------------------------------------------------
  // 3. Pre-burst confetti right at the peak of the hop (small, quick).
  // ---------------------------------------------------------------------
  P.spawnConfetti(ctx, { count: 6, spread: 40 } as any);

  // ---------------------------------------------------------------------
  // 4. Landing — a DECAYING squash-bounce instead of a single snap. This is
  //    the single biggest realism upgrade: mass shows up as oscillation
  //    that shrinks over 2-3 cycles, not one clean settle.
  // ---------------------------------------------------------------------
  const bounces = [
    { scaleY: 0.88, scaleX: 1.12, y: 0, duration: 0.13, ease: 'easeIn' as const },
    { scaleY: 1.06, scaleX: 0.96, y: -6, duration: 0.11, ease: 'easeOut' as const },
    { scaleY: 0.97, scaleX: 1.02, y: 0, duration: 0.09, ease: 'easeIn' as const },
    { scaleY: 1, scaleX: 1, y: 0, duration: 0.12, ease: 'backOut' as const }
  ];
  for (const b of bounces) {
    await ctx.animate([
      ['#mascot-root', { scaleY: b.scaleY, scaleX: b.scaleX, y: b.y }, { duration: b.duration / sm, ease: b.ease }]
    ]);
  }

  // Full confetti burst lands with the character hitting the ground.
  P.spawnConfetti(ctx, { count: 16, spread: 110 } as any);

  // 5. Happy bounce (kept from original — still earns its place here)
  await P.tinyBounce(ctx);

  // ---------------------------------------------------------------------
  // 6. Celebration hold — no longer a dead freeze. A slow ±2° sway keeps
  //    the character feeling alive while it "holds" the pose.
  // ---------------------------------------------------------------------
  const swayDuration = 1000 / sm;
  if (P.wobble) {
    await P.wobble(ctx, '#mascot-root', 2, swayDuration);
  } else {
    await ctx.animate([
      ['#mascot-root', { rotate: [0, 2, -2, 0] }, { duration: swayDuration / 1000, ease: 'easeInOut' }]
    ]);
  }

  // ---------------------------------------------------------------------
  // 7. Cleanup — reverse the "props are physical objects" logic:
  //    tiny anticipatory squash on the hat before it shrinks, blower curls
  //    back in rather than vanishing.
  // ---------------------------------------------------------------------
  await ctx.animate([
    ['#party-hat', { scale: 1.08 }, { duration: 0.05 / sm, ease: 'easeOut' }]
  ]);
  await Promise.all([
    ctx.animate([
      ['#party-hat', { scale: 0, opacity: 0, rotate: -8 }, { duration: 0.12 / sm, ease: 'easeIn' }],
      [
        '#left-arm-front-path',
        { d: [P.ARM_PATHS.leftHoldBlower, P.ARM_PATHS.leftHoldBlowerCurled ?? P.ARM_PATHS.leftHoldBlower] },
        { duration: 0.12 / sm, ease: 'easeIn' }
      ],
      ['#party-blower', { scaleX: 0.3 }, { duration: 0.12 / sm, ease: 'easeIn' }]
    ])
  ]);
  ctx.setAccessories(prev => ({ ...prev, partyHat: false, partyBlower: false }));
  await new Promise(r => setTimeout(r, 60 / sm));

  // ---------------------------------------------------------------------
  // 8. Settle — face/eyes settle first, legs follow ~60ms later. That gap
  //    is the follow-through: the last thing to move is the last thing to
  //    stop, so the whole reaction finishes in a wave, not all at once.
  // ---------------------------------------------------------------------
  P.resetEyes(ctx);
  const faceSettle = Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx),
    ctx.animate([
      ['#left-arm-front', { x: 0 }, { duration: 0.28 / sm, ease: 'easeOut' }],
      ['#left-cheek, #right-cheek', { opacity: 0 }, { duration: 0.2 / sm }],
      [
        '#left-eye-container, #right-eye-container, #left-eyebrow, #right-eyebrow, #mouth, #left-cheek, #right-cheek, #party-blower',
        { x: 0 },
        { duration: 0.28 / sm, ease: 'easeOut' }
      ]
    ])
  ]);
  await faceSettle;
  await new Promise(r => setTimeout(r, 60 / sm));
  await ctx.animate([
    ['#left-leg', { rotate: 0, y: 0, x: 0 }, { duration: 0.25 / sm, ease: 'backOut' }],
    ['#right-leg', { rotate: 0, y: 0, x: 0 }, { duration: 0.25 / sm, ease: 'backOut' }]
  ]);
};