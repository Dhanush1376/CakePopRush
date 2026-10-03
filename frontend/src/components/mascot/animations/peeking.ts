import { ReactionContext, animSpeed, TIMING, EASING } from './animationTypes';
import { setMouth } from '../primitives/face';
import { blink } from '../primitives/eyes';

export const getPeekingSequence = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) {
    setMouth(ctx, 'smallSmile');
    return;
  }

  const { animate, speedMultiplier } = ctx;

  setMouth(ctx, 'neutral');

  // Start hidden
  await animate([
    ['#mascot-root', { y: 175 }, { duration: 0 }]
  ]);

  // Rise slowly so only top of head and eyes appear
  await animate([
    ['#mascot-root', { y: 60 }, { duration: animSpeed(0.8, speedMultiplier), ease: EASING.SETTLE }]
  ]);

  // Hands grab edge (rotate up, keeping shoulder attached)
  animate([
    ['#left-arm', { rotate: -160 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }],
    ['#right-arm', { rotate: 160 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }]
  ]);

  // Pupils look around
  await new Promise(r => setTimeout(r, animSpeed(300, speedMultiplier)));
  await animate([
    ['#left-pupil-group, #right-pupil-group', { x: -4 }, { duration: animSpeed(TIMING.FAST, speedMultiplier) }]
  ]);
  await new Promise(r => setTimeout(r, animSpeed(500, speedMultiplier)));
  await animate([
    ['#left-pupil-group, #right-pupil-group', { x: 4 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }]
  ]);
  await new Promise(r => setTimeout(r, animSpeed(400, speedMultiplier)));
  
  // Center eyes, blink, smile
  setMouth(ctx, 'smallSmile');
  animate([
    ['#left-pupil-group, #right-pupil-group', { x: 0 }, { duration: animSpeed(TIMING.FAST, speedMultiplier) }]
  ]);
  await blink(ctx);

  await new Promise(r => setTimeout(r, animSpeed(1000, speedMultiplier)));

  // Hide again
  animate([
    ['#left-arm, #right-arm', { rotate: 0, y: 0, x: 0 }, { duration: animSpeed(TIMING.NORMAL, speedMultiplier) }]
  ]);
  await animate([
    ['#mascot-root', { y: 175 }, { duration: animSpeed(0.5, speedMultiplier), ease: EASING.EASE_IN }]
  ]);
};
