import { ReactionContext, animSpeed, TIMING, EASING } from '../animations/animationTypes';

export const blink = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 0.1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-container, #right-eye-container', { scaleY: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

export const doubleBlink = async (ctx: ReactionContext) => {
  await blink(ctx);
  await new Promise(r => setTimeout(r, animSpeed(50, ctx.speedMultiplier)));
  await blink(ctx);
};

export const slowBlink = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 0.1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier) }],
  ]);
  await new Promise(r => setTimeout(r, animSpeed(200, ctx.speedMultiplier)));
  await ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 1 }, { duration: animSpeed(TIMING.SLOW, ctx.speedMultiplier) }]
  ]);
};

export const winkLeft = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#left-eye-normal', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-closed', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
  await new Promise(r => setTimeout(r, animSpeed(TIMING.NORMAL * 1000, ctx.speedMultiplier)));
  await ctx.animate([
    ['#left-eye-closed', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-normal', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
};

export const winkRight = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#right-eye-normal', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#right-eye-closed', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
  await new Promise(r => setTimeout(r, animSpeed(TIMING.NORMAL * 1000, ctx.speedMultiplier)));
  await ctx.animate([
    ['#right-eye-closed', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#right-eye-normal', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
};

// Parameterized pupil direction
export const lookAt = (ctx: ReactionContext, x: number, y: number, duration?: number) => {
  return ctx.animate([
    ['#left-pupil-group, #right-pupil-group', { x, y }, { duration: animSpeed(duration ?? TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

export const lookLeft = (ctx: ReactionContext) => lookAt(ctx, -6, 0);
export const lookRight = (ctx: ReactionContext) => lookAt(ctx, 6, 0);
export const lookUp = (ctx: ReactionContext) => lookAt(ctx, 0, -6);
export const lookDown = (ctx: ReactionContext) => lookAt(ctx, 0, 6);
export const lookCenter = (ctx: ReactionContext) => lookAt(ctx, 0, 0);
export const lookToward = (ctx: ReactionContext, direction: 'left' | 'right' | 'up' | 'down' | 'center') => {
  if (direction === 'left') return lookLeft(ctx);
  if (direction === 'right') return lookRight(ctx);
  if (direction === 'up') return lookUp(ctx);
  if (direction === 'down') return lookDown(ctx);
  return lookCenter(ctx);
};
export const lookAway = (ctx: ReactionContext) => lookAt(ctx, -5, 1, TIMING.NORMAL);

export const lookAround = async (ctx: ReactionContext) => {
  await lookLeft(ctx);
  await new Promise(r => setTimeout(r, animSpeed(TIMING.NORMAL * 1000, ctx.speedMultiplier)));
  await lookRight(ctx);
  await new Promise(r => setTimeout(r, animSpeed(TIMING.NORMAL * 1000, ctx.speedMultiplier)));
  await lookCenter(ctx);
};

export const eyesWide = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleX: 1.1, scaleY: 1.1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }],
    ['#left-pupil-group, #right-pupil-group', { scale: 0.8 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

export const eyesSleepy = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 0.6 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier) }]
  ]);
};

export type MascotEyeShape = 'normal' | 'closed' | 'squeezed' | 'heart' | 'tired';

export const eyesDroopy = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 0.45 }, { duration: animSpeed(TIMING.SLOW, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

// Switch to tired eyelids
export const eyesTired = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-tired, #right-eye-tired', { opacity: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier) }]
  ]);
};

// Switch to closed eye arcs (happy crescents)
export const eyesClosed = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
};

// Switch to squeezed eyes (>_<)
export const eyesSqueezed = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-closed, #right-eye-closed', { opacity: 0 }, { duration: 0 }],
    ['#left-eye-squeezed, #right-eye-squeezed', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
};

// Switch to heart eyes
export const eyesHeart = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-heart, #right-eye-heart', { opacity: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

// Restore normal eyes from any state
export const eyesNormal = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-closed, #right-eye-closed, #left-eye-squeezed, #right-eye-squeezed, #left-eye-heart, #right-eye-heart, #left-eye-tired, #right-eye-tired', { opacity: 0 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }],
    ['#left-eye-container, #right-eye-container', { scaleY: 1, scaleX: 1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

export const resetEyes = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#left-eye-container, #right-eye-container', { scaleY: 1, scaleX: 1, y: 0, x: 0 }, { duration: 0 }],
    ['#left-pupil-group, #right-pupil-group', { x: 0, y: 0, scale: 1 }, { duration: 0 }],
    ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0 }],
    ['#left-eye-closed, #right-eye-closed, #left-eye-squeezed, #right-eye-squeezed, #left-eye-heart, #right-eye-heart, #left-eye-tired, #right-eye-tired', { opacity: 0 }, { duration: 0 }]
  ]);
};
