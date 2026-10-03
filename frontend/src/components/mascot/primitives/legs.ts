import { ReactionContext, animSpeed, TIMING, EASING } from '../animations/animationTypes';

export const shiftWeightLeft = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#torso-group', { x: -3, rotate: -2 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-leg', { rotate: -5, x: -1, y: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 6, x: 1, y: -1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const shiftWeightRight = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#torso-group', { x: 3, rotate: 2 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-leg', { rotate: -6, x: -1, y: -1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 5, x: 1, y: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const legSupportLeft = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-leg', { rotate: -7, x: -2, y: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 4, x: 1, y: -1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const legSupportRight = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-leg', { rotate: -4, x: -1, y: -1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 7, x: 2, y: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const stabilizeLeft = legSupportLeft;
export const stabilizeRight = legSupportRight;

export const tinyStepLeft = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-leg', { rotate: -9, x: -3, y: -2 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }],
    ['#left-leg', { rotate: -5, x: -2, y: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const tinyStepRight = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#right-leg', { rotate: 9, x: 3, y: -2 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }],
    ['#right-leg', { rotate: 5, x: 2, y: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const stanceWiden = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-leg', { rotate: -8, x: -3, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 8, x: 3, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const stanceNarrow = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-leg', { rotate: -2, x: -1, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 2, x: 1, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const legWobble = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#left-leg', { rotate: -6, x: -1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 6, x: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
  await ctx.animate([
    ['#left-leg', { rotate: -3, x: 0 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 3, x: 0 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const settleLegs = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-leg', { y: 0, x: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { y: 0, x: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};
