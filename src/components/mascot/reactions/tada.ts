import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #28 Ta-Da!:
 * anticipation squash → arms sweep open → body rises → open happy expression → controlled sparkle/confetti burst → presentation hold → settle.
 */
export const playTada = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    P.spawnConfetti(ctx);
    return;
  }

  // 1. Anticipation squash (arms inward)
  ctx.animate([
    ['#left-arm', { rotate: 20 }, { duration: 0.2 / speedMultiplier }],
    ['#right-arm', { rotate: -20 }, { duration: 0.2 / speedMultiplier }]
  ]);
  await ctx.animate([
    ['#torso-group', { scaleY: 0.85, scaleX: 1.15, y: 15 }, { duration: 0.2 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 2. Arms sweep open + body rises + open happy expression
  P.setMouth(ctx, 'openSmile');
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleY: 1.02, scaleX: 0.98, y: -6 }, { duration: 0.3 / speedMultiplier, ease: 'backOut' }]
    ]),
    ctx.animate([
      ['#left-arm', { rotate: -120, y: -4, x: -4 }, { duration: 0.3 / speedMultiplier, ease: 'backOut' }],
      ['#right-arm', { rotate: 120, y: -4, x: 4 }, { duration: 0.3 / speedMultiplier, ease: 'backOut' }]
    ])
  ]);

  // 3. Controlled confetti burst
  P.spawnConfetti(ctx);

  // 4. Presentation hold
  await new Promise(r => setTimeout(r, 1000 / speedMultiplier));

  // 5. Settle
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
