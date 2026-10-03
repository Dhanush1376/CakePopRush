import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #03 Blushing:
 * "Oh stop it, you're making me blush!!"
 * 
 * Phase 1: Startled — eyes go wide for a split second (caught off guard)
 * Phase 2: Blush floods in — eyes squeeze shut into happy crescents, body shrinks inward
 * Phase 3: Shy wiggle — tiny embarrassed side-to-side sway with head turned away
 * Phase 4: Peek — one eye opens shyly then closes again
 * Phase 5: Recover — slowly opens eyes, blush fades, returns to neutral
 */
export const playBlushing = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    P.showBlush(ctx);
    await P.eyesClosed(ctx);
    return;
  }

  // ═══════════════════════════════════════════════
  // PHASE 1: Startled (caught off guard, 0.3s)
  // ═══════════════════════════════════════════════
  // Eyes go briefly wide — "Wait, me?!"
  await Promise.all([
    P.eyesWide(ctx),
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { y: -2 }, { duration: 0.1 / sm, ease: 'easeOut' }]
    ]),
    animate([
      ['#torso-group', { scaleY: 1.03, scaleX: 0.97, y: -3 }, { duration: 0.12 / sm, ease: 'easeOut' }]
    ])
  ]);
  P.setMouth(ctx, 'oMouth');

  await new Promise(r => setTimeout(r, 200 / sm));

  // ═══════════════════════════════════════════════
  // PHASE 2: Blush floods in (0.5s)
  // ═══════════════════════════════════════════════
  // Eyes squeeze shut into happy crescents — too embarrassed to look!
  P.setMouth(ctx, 'smallSmile');
  P.showBlush(ctx);

  await Promise.all([
    // Eyes close into happy crescents
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.15 / sm }],
      ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: 0.15 / sm }]
    ]),
    // Body shrinks inward and turns away
    animate([
      ['#torso-group', { scaleX: 0.95, scaleY: 1.05, y: 6, rotate: -6 }, { duration: 0.35 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ]),
    // Eye containers shrink (squinting from blush)
    ctx.animate([
      ['#left-eye-container, #right-eye-container', { scaleY: 1, scaleX: 1 }, { duration: 0.2 / sm }]
    ]),
    // Blush circles pulse in
    ctx.animate([
      ['#left-cheek, #right-cheek', { opacity: 1, scale: 1.15 }, { duration: 0.2 / sm, ease: 'easeOut' }],
    ])
  ]);

  // Blush settles
  await ctx.animate([
    ['#left-cheek, #right-cheek', { scale: 1 }, { duration: 0.15 / sm, ease: 'easeInOut' }],
  ]);

  // ═══════════════════════════════════════════════
  // PHASE 3: Shy embarrassed wiggle (1.2s)
  // ═══════════════════════════════════════════════
  // Tiny side-to-side sway like they're squirming with embarrassment
  for (let i = 0; i < 3; i++) {
    await animate([
      ['#torso-group', { rotate: -8, scaleX: 0.94, scaleY: 1.06 }, { duration: 0.2 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { rotate: -4, scaleX: 0.96, scaleY: 1.04 }, { duration: 0.2 / sm, ease: 'easeInOut' }]
    ]);
  }

  // Settle back to shy tilt
  await animate([
    ['#torso-group', { rotate: -6 }, { duration: 0.15 / sm, ease: 'easeOut' }]
  ]);

  // ═══════════════════════════════════════════════
  // PHASE 4: Shy peek (0.6s)
  // ═══════════════════════════════════════════════
  // One eye opens shyly to peek... then shuts again!
  await ctx.animate([
    ['#right-eye-closed', { opacity: 0 }, { duration: 0.1 / sm }],
    ['#right-eye-normal', { opacity: 1 }, { duration: 0.1 / sm }]
  ]);
  // Peek with pupil looking to the side (subtle — stays inside eye)
  await ctx.animate([
    ['#right-pupil-group', { x: 2, y: 1 }, { duration: 0.15 / sm, ease: 'easeOut' }]
  ]);

  await new Promise(r => setTimeout(r, 350 / sm));

  // Nope, too embarrassed! Close it again
  await ctx.animate([
    ['#right-eye-normal', { opacity: 0 }, { duration: 0.08 / sm }],
    ['#right-eye-closed', { opacity: 1 }, { duration: 0.08 / sm }],
    ['#right-pupil-group', { x: 0, y: 0 }, { duration: 0.1 / sm }]
  ]);

  await new Promise(r => setTimeout(r, 500 / sm));

  // ═══════════════════════════════════════════════
  // PHASE 5: Recover (0.6s)
  // ═══════════════════════════════════════════════
  // Slowly open both eyes, blush fades, return to neutral
  P.hideBlush(ctx);

  // Ensure all eye layers are fully reset first
  await P.eyesNormal(ctx);

  await Promise.all([
    // Blush circles fade
    ctx.animate([
      ['#left-cheek, #right-cheek', { opacity: 0 }, { duration: 0.4 / sm, ease: 'easeInOut' }]
    ]),
    // Body returns
    animate([
      ['#torso-group', { scaleX: 1, scaleY: 1, y: 0, rotate: 0 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ]),
    // Pupils center
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: 0, y: 0 }, { duration: 0.3 / sm }]
    ])
  ]);

  P.setMouth(ctx, 'neutral');
};
