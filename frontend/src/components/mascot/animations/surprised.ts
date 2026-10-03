import { ReactionContext, animSpeed, TIMING } from './animationTypes';
import { setMouth } from '../primitives/face';
import { blink } from '../primitives/eyes';

export const getSurprisedSequence = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) {
    setMouth(ctx, 'oMouth');
    return;
  }

  const { animate, speedMultiplier } = ctx;

  // Very quick anticipation
  await animate([
    ['#torso-group', { scaleY: 0.95, scaleX: 1.05 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }]
  ]);

  // Fast action
  setMouth(ctx, 'oMouth');
  animate([
    ['#left-eyebrow', { y: -10, rotate: 5 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#right-eyebrow', { y: -10, rotate: -5 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#left-arm', { rotate: -45 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#right-arm', { rotate: 45 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#left-pupil-group', { scale: 0.7 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#right-pupil-group', { scale: 0.7 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }]
  ]);

  await animate([
    ['#torso-group', { scaleY: 1.05, scaleX: 0.95, y: -8 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#torso-group', { scaleY: 1, scaleX: 1, y: -4 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }]
  ]);

  // Hold surprised state
  await new Promise(r => setTimeout(r, animSpeed(800, speedMultiplier)));

  // Blink and recover
  await blink(ctx);

  await new Promise(r => setTimeout(r, animSpeed(200, speedMultiplier)));
};
