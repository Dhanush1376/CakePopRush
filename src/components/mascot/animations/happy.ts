import { ReactionContext, animSpeed, TIMING } from './animationTypes';
import { setMouth } from '../primitives/face';
import { blink } from '../primitives/eyes';

export const getHappySequence = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) {
    setMouth(ctx, 'happy');
    return;
  }

  const { animate, speedMultiplier } = ctx;

  // 1. Anticipation
  setMouth(ctx, 'happy');
  await animate([
    ['#torso-group', { scaleY: 0.95, scaleX: 1.05, y: 5 }, { duration: animSpeed(TIMING.FAST, speedMultiplier) }],
  ]);

  // 2. Action (Rise and open arms)
  animate([
    ['#left-eyebrow', { y: -5, rotate: -5 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }],
    ['#right-eyebrow', { y: -5, rotate: 5 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }],
    ['#left-arm', { rotate: -25 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }],
    ['#right-arm', { rotate: 25 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }]
  ]);

  await animate([
    ['#torso-group', { scaleY: 1.05, scaleX: 0.95, y: -10 }, { duration: animSpeed(TIMING.FAST, speedMultiplier) }],
    ['#torso-group', { scaleY: 1, scaleX: 1, y: -5 }, { duration: animSpeed(TIMING.FAST, speedMultiplier) }]
  ]);

  // 3. Hold
  await new Promise(r => setTimeout(r, animSpeed(1000, speedMultiplier)));

  // Optional tiny blink
  await blink(ctx);

  await new Promise(r => setTimeout(r, animSpeed(300, speedMultiplier)));
};
