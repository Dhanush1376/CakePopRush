import { ReactionContext, animSpeed, TIMING, EASING } from '../animations/animationTypes';
import { legSupportLeft, legSupportRight, settleLegs } from './legs';

export const openArms = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-arm', { rotate: 55, y: -1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: -55, y: -1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-leg', { rotate: -4, x: -1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 4, x: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const raiseLeftArm = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-arm', { rotate: 145, y: -2 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#torso-group', { x: 2, rotate: 2 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 6, x: 1, y: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const raiseRightArm = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#right-arm', { rotate: -145, y: -2 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#torso-group', { x: -2, rotate: -2 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-leg', { rotate: -6, x: -1, y: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const ARM_PATHS = {
  leftNormal: "M 0 0 C -5 25 -10 50 -15 75",
  rightNormal: "M 0 0 C 5 25 10 50 15 75",
  leftFolded: "M 0 0 C -10 40 20 65 35 50",
  rightFolded: "M 0 0 C 10 40 -20 65 -35 50",
  leftCheekHold: "M 0 0 C -45 50 -30 50 -5 12",
  rightCheekHold: "M 0 0 C 45 50 30 50 5 12",
  leftHoldBlower: "M 0 0 C 15 15 25 5 35 -13",
  leftHoldBlowerCurled: "M 0 0 C 10 10 20 0 25 -8",
  leftHidden: "M 0 0 L 0 0",
  rightHidden: "M 0 0 L 0 0"
};

export const lowerArms = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-arm', { rotate: 0, opacity: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: 0, opacity: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-arm-front, #right-arm-front', { opacity: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-arm-path', { d: ARM_PATHS.leftNormal }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm-path', { d: ARM_PATHS.rightNormal }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#torso-group', { x: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-leg', { rotate: 0, x: 0, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { rotate: 0, x: 0, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const foldArms = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm', { rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-arm-path', { d: ARM_PATHS.leftFolded }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm-path', { d: ARM_PATHS.rightFolded }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const handsToCheeks = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm, #right-arm', { opacity: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier) }],
    ['#left-arm-front', { rotate: 0, x: 0, y: 0, opacity: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm-front', { rotate: 0, x: 0, y: 0, opacity: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-arm-front-path', { d: ARM_PATHS.leftCheekHold }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm-front-path', { d: ARM_PATHS.rightCheekHold }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const handsToMouth = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm', { rotate: 60, x: 0, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: -60, x: 0, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const handsToChest = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm', { rotate: -50, x: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: 50, x: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const thinkingHand = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm', { rotate: 60, x: 0, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const shrugArms = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm', { rotate: 70 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-arm', { rotate: -70 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const waveLeft = async (ctx: ReactionContext) => {
  await Promise.all([
    ctx.animate([
      ['#torso-group', { x: 2, rotate: 2 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }],
      ['#left-arm', { rotate: 145 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
    ]),
    legSupportRight(ctx)
  ]);
  for (let i = 0; i < 2; i++) {
    await ctx.animate([['#left-arm', { rotate: 115 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
    await ctx.animate([['#left-arm', { rotate: 160 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
  }
  await ctx.animate([['#left-arm', { rotate: 138 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
  await settleLegs(ctx);
};

export const waveRight = async (ctx: ReactionContext) => {
  await waveRightCustom(ctx, 2);
};

export const waveRightLong = async (ctx: ReactionContext) => {
  await waveRightCustom(ctx, 5); // 5 waves = ~2.2 seconds
};

export const swapToWinkingArm = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-arm', { opacity: 0 }, { duration: 0 }],
    ['#winking-arm', { opacity: 1 }, { duration: 0 }]
  ]);
};

export const swapToNormalArm = (ctx: ReactionContext) => {
  ctx.animate([
    ['#winking-arm', { opacity: 0 }, { duration: 0 }],
    ['#left-arm', { opacity: 1 }, { duration: 0 }]
  ]);
};

export const waveWinkingArm = async (ctx: ReactionContext) => {
  // Wave the bent arm
  await ctx.animate([
    ['#winking-arm', { rotate: -15 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
  ]);
  for (let i = 0; i < 5; i++) {
    await ctx.animate([['#winking-arm', { rotate: 20 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
    await ctx.animate([['#winking-arm', { rotate: -25 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
  }
  await ctx.animate([['#winking-arm', { rotate: 0 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
};

const waveRightCustom = async (ctx: ReactionContext, count: number) => {
  await Promise.all([
    ctx.animate([
      ['#torso-group', { x: -2, rotate: -2 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }],
      ['#right-arm', { rotate: -145 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
    ]),
    legSupportLeft(ctx)
  ]);
  for (let i = 0; i < count; i++) {
    await ctx.animate([['#right-arm', { rotate: -115 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
    await ctx.animate([['#right-arm', { rotate: -160 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
  }
  await ctx.animate([['#right-arm', { rotate: -110 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]]);
  await settleLegs(ctx);
};

export const clapOnce = async (ctx: ReactionContext) => {
  // Anticipate
  await ctx.animate([
    ['#left-arm', { rotate: 60 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }],
    ['#right-arm', { rotate: -60 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
  // Clap under body
  await ctx.animate([
    ['#left-arm', { rotate: -50, x: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#right-arm', { rotate: 50, x: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
  // Recover slightly
  await ctx.animate([
    ['#left-arm', { rotate: -30, x: 0 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }],
    ['#right-arm', { rotate: 30, x: 0 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

export const clapThreeTimes = async (ctx: ReactionContext) => {
  for (let i = 0; i < 3; i++) {
    await clapOnce(ctx);
  }
};
