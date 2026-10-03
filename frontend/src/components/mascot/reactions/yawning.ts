import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #16 Yawning:
 * Deep body stretch upward, eyes flutter closed, huge yawn.
 */
export const playYawning = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'yawn');
    await P.eyesDroopy(ctx);
    return;
  }

  // 1. Anticipation: slight squash down, eyes become sleepy
  P.setMouth(ctx, 'smallSmile');
  await Promise.all([
    P.eyesSleepy(ctx),
    animate([
      ['#torso-group', { y: 3, scaleY: 0.95, scaleX: 1.05 }, { duration: 0.3 / sm, ease: 'easeIn' }]
    ])
  ]);
  
  await new Promise(r => setTimeout(r, 150 / sm));

  // 2. Yawn opens wide + body stretches tall + eyes squeeze shut from the stretch
  P.setMouth(ctx, 'yawn');
  
  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.2 / sm }],
      ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 1 }, { duration: 0.2 / sm }]
    ]),
    animate([
      ['#torso-group', { y: -4, scaleY: 1.08, scaleX: 0.92 }, { duration: 0.6 / sm, ease: 'easeOut' }]
    ])
  ]);

  // 3. Hold full yawn (shaking slightly from the stretch)
  for (let i = 0; i < 4; i++) {
    await animate([
      ['#torso-group', { rotate: 1 }, { duration: 0.15 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { rotate: -1 }, { duration: 0.15 / sm, ease: 'easeInOut' }]
    ]);
  }
  
  await animate([
    ['#torso-group', { rotate: 0 }, { duration: 0.1 / sm }]
  ]);

  // 4. Sleepy settle downward (heavy drop)
  P.setMouth(ctx, 'sleepySmile');
  await Promise.all([
    ctx.animate([
      ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 0 }, { duration: 0.3 / sm }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.3 / sm }]
    ]),
    animate([
      ['#torso-group', { y: 6, scaleY: 0.95, scaleX: 1.05 }, { duration: 0.5 / sm, ease: 'easeOut' }]
    ])
  ]);
  
  await P.eyesTired(ctx);

  // 5. Recover to neutral slowly
  await new Promise(r => setTimeout(r, 400 / sm));
  
  await Promise.all([
    P.eyesNormal(ctx),
    animate([
      ['#torso-group', { y: 0, scaleY: 1, scaleX: 1 }, { duration: 0.6 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
  
  P.setMouth(ctx, 'neutral');
};
