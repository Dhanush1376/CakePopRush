import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #15 Tired:
 * Awake but exhausted. NOT sleeping.
 * Droopy half-open eyes, heavy sagging body, head bobs weakly.
 */
export const playTired = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'tiredFrown');
    ctx.animate([
      ['#left-eyebrow', { rotate: 15, y: -2 }, { duration: 0 }],
      ['#right-eyebrow', { rotate: -15, y: -2 }, { duration: 0 }]
    ]);
    await P.eyesTired(ctx);
    return;
  }

  // 1. Heavy sigh / Body sags downwards
  P.setMouth(ctx, 'tiredFrown');
  await animate([
    ['#torso-group', { y: 8, scaleY: 0.94, scaleX: 1.06 }, { duration: 0.6 / sm, ease: 'easeOut' }]
  ]);

  // 2. Eyelids droop slowly and eyebrows rotate
  ctx.animate([
    ['#left-eyebrow', { rotate: 15, y: -2 }, { duration: 0.4 / sm, ease: 'easeInOut' }],
    ['#right-eyebrow', { rotate: -15, y: -2 }, { duration: 0.4 / sm, ease: 'easeInOut' }]
  ]);
  
  await P.eyesTired(ctx);

  // 3. Pupils droop downward weakly
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { y: 3 }, { duration: 0.5 / sm, ease: 'easeInOut' }]
    ])
  ]);

  // 4. Exhausted head bobbing (struggling to stay awake)
  for (let i = 0; i < 2; i++) {
    // Bob down deeper
    await animate([
      ['#torso-group', { y: 12, rotate: -3 }, { duration: 0.8 / sm, ease: 'easeInOut' }]
    ]);
    
    // Slow sleepy blink
    if (i === 0) await P.slowBlink(ctx);
    
    // Catch itself and bob slightly up
    await animate([
      ['#torso-group', { y: 8, rotate: 2 }, { duration: 0.6 / sm, ease: 'easeOut' }]
    ]);
  }

  // Final settle back to center
  await animate([
    ['#torso-group', { rotate: 0, y: 8 }, { duration: 0.5 / sm, ease: 'easeInOut' }]
  ]);
  
  await new Promise(r => setTimeout(r, 600 / sm));

  // 5. Recover (shake it off softly)
  P.resetBrows(ctx);
  await Promise.all([
    P.eyesNormal(ctx),
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { y: 0 }, { duration: 0.3 / sm }]
    ]),
    animate([
      ['#torso-group', { y: 0, scaleY: 1, scaleX: 1 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
  
  P.setMouth(ctx, 'neutral');
};
