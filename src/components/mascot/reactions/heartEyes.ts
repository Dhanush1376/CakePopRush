import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #4 Heart Eyes:
 * eyes widen → anticipation → heart eyes replace normal → hands rise → bounce → optional hearts.
 */
export const playHeartEyes = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    await P.eyesHeart(ctx);
    P.spawnHearts(ctx);
    return;
  }

  // 1. Eyes widen (anticipation)
  await P.eyesWide(ctx);
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 2. Anticipation squash
  await ctx.animate([
    ['#torso-group', { scaleY: 0.9, scaleX: 1.1, y: 10 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
  ]);

  // 3. Heart eyes appear + arms rise + body lifts
  P.setMouth(ctx, 'openSmile');
  await P.eyesHeart(ctx);
  
  await Promise.all([
    ctx.animate([['#torso-group', { scaleY: 1, scaleX: 1, y: -4 }, { duration: 0.2 / speedMultiplier, ease: 'backOut' }]]),
    ctx.animate([
      ['#left-arm', { rotate: -150, y: -2, x: 2 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }],
      ['#right-arm', { rotate: 150, y: -2, x: -2 }, { duration: 0.2 / speedMultiplier, ease: 'easeOut' }]
    ])
  ]);

  // 4. Spawn hearts
  P.spawnHearts(ctx);

  // 5. Tiny happy bounce
  await P.tinyBounce(ctx);

  // 6. Hold target
  await new Promise(r => setTimeout(r, 600 / speedMultiplier));

  // 7. Recover
  await P.eyesNormal(ctx);
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
