import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #6 Excited:
 * Redesigned to be VERY different from Happy and Laughing.
 * Happy = calm open-eyed smile, gentle bounce.
 * Laughing = squeezed eyes, belly-laugh rocking.
 * Excited = WIDE eyes, rapid jumping, sparkles, high energy!
 * 
 * The mascot is bouncing off the walls with excitement!
 */
export const playExcited = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    P.spawnExcitementLines(ctx);
    return;
  }

  // 1. Gasp moment — eyes widen, brows shoot up, mouth opens
  P.setMouth(ctx, 'oMouth');
  await Promise.all([
    ctx.animate([
      ['#left-eye-group, #right-eye-group', { scaleX: 1.15, scaleY: 1.15 }, { duration: 0.15 / sm, ease: 'backOut' }]
    ]),
    ctx.animate([
      ['#left-eyebrow', { y: -8, rotate: 5 }, { duration: 0.12 / sm }],
      ['#right-eyebrow', { y: -8, rotate: -5 }, { duration: 0.12 / sm }]
    ])
  ]);

  await new Promise(r => setTimeout(r, 200 / sm));

  // 2. Realization hits — mouth goes to big excited smile
  P.setMouth(ctx, 'openSmile');
  P.spawnExcitementLines(ctx);

  await new Promise(r => setTimeout(r, 100 / sm));

  // 3. RAPID jumping! Deep squash → big hop → land → repeat
  for (let i = 0; i < 3; i++) {
    // Deep squash (crouch before jump)
    await ctx.animate([
      ['#torso-group', { scaleY: 0.85, scaleX: 1.12, y: 12 }, { duration: 0.1 / sm, ease: 'easeIn' }]
    ]);
    // BIG hop upward (stretch tall)
    await ctx.animate([
      ['#torso-group', { scaleY: 1.12, scaleX: 0.9, y: -18 }, { duration: 0.15 / sm, ease: 'easeOut' }]
    ]);
    // Land with squash impact
    await ctx.animate([
      ['#torso-group', { scaleY: 0.92, scaleX: 1.06, y: 4 }, { duration: 0.1 / sm, ease: 'easeIn' }]
    ]);
    // Recover to neutral before next jump
    await ctx.animate([
      ['#torso-group', { scaleY: 1, scaleX: 1, y: 0 }, { duration: 0.08 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ]);
  }

  // 4. Final peak — body stretches up tall and stays there
  await ctx.animate([
    ['#torso-group', { scaleY: 1.08, scaleX: 0.94, y: -12 }, { duration: 0.2 / sm, ease: 'backOut' }]
  ]);

  // Sparkle burst at peak!
  P.spawnSparkles(ctx);

  // 5. Hold the excited peak pose
  await new Promise(r => setTimeout(r, 800 / sm));

  // 6. Slowly come down — settle, eyes return to normal
  P.resetBrows(ctx);
  
  await ctx.animate([
    ['#left-eye-group, #right-eye-group', { scaleX: 1, scaleY: 1 }, { duration: 0.3 / sm, ease: [0.25, 0.1, 0.25, 1] }]
  ]);

  P.setMouth(ctx, 'neutral');
  await P.settle(ctx);
};
