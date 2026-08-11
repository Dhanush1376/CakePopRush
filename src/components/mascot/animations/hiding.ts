import { ReactionContext, animSpeed, TIMING, EASING } from './animationTypes';
import { setMouth } from '../primitives/face';
import { blink } from '../primitives/eyes';

export const getHidingSequence = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) {
    setMouth(ctx, 'oMouth');
    return;
  }

  const { animate, speedMultiplier } = ctx;

  // Start visible
  setMouth(ctx, 'oMouth');

  // Startled
  animate([
    ['#left-pupil-group, #right-pupil-group', { scale: 0.8 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#left-eyebrow, #right-eyebrow', { y: -8 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }]
  ]);

  await animate([
    ['#torso-group', { scaleY: 1.05, scaleX: 0.95 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }]
  ]);

  // Rapid drop
  animate([
    ['#torso-group', { scaleY: 1, scaleX: 1 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    // arms fly up
    ['#left-arm', { rotate: -140 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }],
    ['#right-arm', { rotate: 140 }, { duration: animSpeed(TIMING.INSTANT, speedMultiplier) }]
  ]);

  await animate([
    ['#mascot-root', { y: 175 }, { duration: animSpeed(TIMING.FAST, speedMultiplier), ease: EASING.EASE_IN }]
  ]);

  // Arms follow
  await animate([
    ['#left-arm, #right-arm', { rotate: 0, y: 0, x: 0 }, { duration: animSpeed(TIMING.FAST, speedMultiplier) }]
  ]);

  await new Promise(r => setTimeout(r, animSpeed(800, speedMultiplier)));

  // Tiny peek
  await animate([
    ['#mascot-root', { y: 95 }, { duration: animSpeed(0.4, speedMultiplier), ease: EASING.SETTLE }]
  ]);

  await blink(ctx);

  await new Promise(r => setTimeout(r, animSpeed(600, speedMultiplier)));

  // Completely hide
  await animate([
    ['#mascot-root', { y: 175 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier), ease: EASING.EASE_IN }]
  ]);
};
