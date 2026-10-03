import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #14 Sleeping:
 * Slowest reaction. Gentle transition into sleep.
 * Subtle breathing, Zzz particles, peaceful heavy tilt.
 */
export const playSleeping = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'sleepySmile');
    ctx.animate([
      ['#left-eyebrow', { rotate: 12, y: -1 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -12, y: -1 }, { duration: 0 }]
    ]);
    await P.eyesClosed(ctx);
    P.spawnSleepZs(ctx);
    return;
  }

  // 1. Eyelids become heavy (slow drooping)
  await P.eyesDroopy(ctx);
  await new Promise(r => setTimeout(r, 300 / sm));

  // 2. Slow blink (fighting sleep)
  await P.slowBlink(ctx);
  await new Promise(r => setTimeout(r, 200 / sm));

  // 3. Eyes close fully (crescent arcs) + mouth softens
  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.3 / sm }],
      ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: 0.3 / sm }]
    ]),
  ]);
  P.setMouth(ctx, 'sleepySmile');

  // 4. Body settles down heavily into sleeping tilt
  await animate([
    ['#torso-group', { y: 15, x: -8, scaleY: 0.94, scaleX: 1.06, rotate: -15 }, { duration: 1.2 / sm, ease: 'easeInOut' }]
  ]);

  // 5. Eyebrows soften
  ctx.animate([
    ['#left-eyebrow', { rotate: 15, y: -2 }, { duration: 0.6 / sm, ease: 'easeInOut' }],
    ['#right-eyebrow', { rotate: -15, y: -2 }, { duration: 0.6 / sm, ease: 'easeInOut' }]
  ]);

  // 6. Subtle breathing + Zzz
  P.spawnSleepZs(ctx);
  
  // Breathing cycle: very subtle scale/rotate pulse
  for (let i = 0; i < 3; i++) {
    await animate([
      ['#torso-group', { scaleY: 0.96, rotate: -14 }, { duration: 1.5 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { scaleY: 0.94, rotate: -15 }, { duration: 1.5 / sm, ease: 'easeInOut' }]
    ]);
  }

  // 7. Gentle wake/recovery
  P.setMouth(ctx, 'smallSmile');
  
  await Promise.all([
    ctx.animate([
      ['#left-eye-closed, #right-eye-closed', { opacity: 0 }, { duration: 0.4 / sm }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.4 / sm }]
    ]),
    animate([
      ['#torso-group', { y: 0, x: 0, scaleY: 1, scaleX: 1, rotate: 0 }, { duration: 1.0 / sm, ease: 'easeInOut' }]
    ])
  ]);
  
  await new Promise(r => setTimeout(r, 200 / sm));
  await P.slowBlink(ctx);
  
  P.resetBrows(ctx);
  P.setMouth(ctx, 'neutral');
};
