import { ReactionContext, animSpeed, TIMING, EASING } from './animationTypes';
import { setMouth } from '../primitives/face';
import { blink } from '../primitives/eyes';

export const getWaveSequence = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) {
    setMouth(ctx, 'happy');
    return;
  }

  const { animate, speedMultiplier } = ctx;

  setMouth(ctx, 'happy');

  // Rise slightly
  animate([
    ['#torso-group', { y: -5 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }],
    ['#left-eyebrow, #right-eyebrow', { y: -2 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }]
  ]);

  // Wave right arm (from shoulder)
  await animate([
    ['#right-arm', { rotate: -15 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.SETTLE }],
    ['#right-arm', { rotate: 18 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: -14 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: 15 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: -8 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: 0 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.SETTLE }]
  ]);

  // Optional blink during recovery
  await blink(ctx);

  await new Promise(r => setTimeout(r, animSpeed(200, speedMultiplier)));
};
