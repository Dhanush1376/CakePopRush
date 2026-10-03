import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #04 Heart Eyes:
 * A dreamy, romantic reaction.
 * Eyes widen → explode into hearts → body floats upward softly while heart eyes throb.
 */
export const playHeartEyes = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    await P.eyesHeart(ctx);
    return;
  }

  // 1. Extreme squash (anticipation build-up)
  await animate([
    ['#torso-group', { scaleY: 0.85, scaleX: 1.15, y: 15 }, { duration: 0.25 / sm, ease: 'easeIn' }]
  ]);

  // 2. Explode upward into Heart Eyes, floating softly
  P.setMouth(ctx, 'openSmile');
  
  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.1 / sm }],
      ['#left-eye-heart, #right-eye-heart', { opacity: 1 }, { duration: 0.1 / sm }]
    ]),
    // Body floats up and stretches softly
    animate([
      ['#torso-group', { scaleY: 1.05, scaleX: 0.95, y: -15 }, { duration: 0.4 / sm, ease: 'easeOut' }]
    ])
  ]);

  // 3. Beating heart eyes & soft floating body loop
  // Do 3 slow dreamy heartbeats
  for (let i = 0; i < 3; i++) {
    // heartbeat throb - soft and bouncy
    ctx.animate([
      ['#left-eye-heart, #right-eye-heart', { scale: [1, 1.25, 0.95, 1.1, 1] }, { duration: 0.6 / sm, ease: 'easeInOut' }]
    ]);
    
    // dreamy float cycle
    await animate([
      ['#torso-group', { y: -20, scaleY: 1.08, scaleX: 0.92 }, { duration: 0.4 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { y: -15, scaleY: 1.05, scaleX: 0.95 }, { duration: 0.4 / sm, ease: 'easeInOut' }]
    ]);
  }

  // 4. Final float up before recovery
  await animate([
    ['#torso-group', { y: -18 }, { duration: 0.3 / sm, ease: 'easeOut' }]
  ]);

  // 5. Recover smoothly
  await Promise.all([
    ctx.animate([
      ['#left-eye-heart, #right-eye-heart', { opacity: 0 }, { duration: 0.3 / sm }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.3 / sm }]
    ]),
    animate([
      ['#torso-group', { scaleY: 1, scaleX: 1, y: 0 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
  
  P.setMouth(ctx, 'neutral');
};
