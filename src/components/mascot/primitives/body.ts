import { ReactionContext, animSpeed, TIMING, EASING } from '../animations/animationTypes';
import { legSupportLeft, legSupportRight, settleLegs, stanceNarrow, stanceWiden } from './legs';

export const syncShadowToRoot = (
  ctx: ReactionContext,
  y: number,
  options: { duration?: number; scale?: number; opacity?: number } = {}
) => {
  const lift = Math.max(0, -y);
  const scale = options.scale ?? Math.max(0.74, 1 - lift / 120);
  const opacity = options.opacity ?? Math.max(0.04, 0.08 - lift / 900);

  return ctx.animate([
    ['#mascot-shadow', { scaleX: scale, scaleY: Math.max(0.7, scale * 0.92), opacity }, {
      duration: animSpeed(options.duration ?? TIMING.FAST, ctx.speedMultiplier),
      ease: EASING.SOFT
    }]
  ]);
};

export const prepareJump = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;

  await Promise.all([
    ctx.animate([
      ['#mascot-root', { y: 10, scaleY: 0.92, scaleX: 1.08 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.EASE_IN }]
    ]),
    stanceNarrow(ctx),
    syncShadowToRoot(ctx, 8, { scale: 1.05, opacity: 0.1 })
  ]);
};

export const landJump = async (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;

  await Promise.all([
    ctx.animate([
      ['#mascot-root', { y: 0, scaleY: 0.94, scaleX: 1.06 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.EASE_IN }]
    ]),
    stanceWiden(ctx),
    syncShadowToRoot(ctx, 0, { scale: 1.06, opacity: 0.1 })
  ]);

  await Promise.all([
    ctx.animate([
      ['#mascot-root', { y: 0, scaleY: 1, scaleX: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.BOUNCY }]
    ]),
    settleLegs(ctx),
    syncShadowToRoot(ctx, 0, { scale: 1, opacity: 0.08, duration: TIMING.NORMAL })
  ]);
};

export const anticipate = prepareJump;

export const followThrough = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#torso-group', { y: 1, rotate: 0, scaleX: 1.01, scaleY: 0.99 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
  await ctx.animate([
    ['#torso-group', { y: 0, rotate: 0, scaleX: 1, scaleY: 1 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const leanLeft = (ctx: ReactionContext) => {
  return Promise.all([
    ctx.animate([
      ['#torso-group', { x: -3, rotate: -4 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
    ]),
    legSupportLeft(ctx)
  ]);
};

export const leanRight = (ctx: ReactionContext) => {
  return Promise.all([
    ctx.animate([
      ['#torso-group', { x: 3, rotate: 4 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
    ]),
    legSupportRight(ctx)
  ]);
};

export const tinyBodyReact = (ctx: ReactionContext, direction: 'left' | 'right' | 'center' = 'center') => {
  const x = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
  const rotate = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
  return ctx.animate([
    ['#torso-group', { x, rotate, y: -1 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const tinyBodyFreeze = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#torso-group', { scaleX: 1.01, scaleY: 0.99 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier), ease: EASING.EASE_IN }]
  ]);
};

export const bodyRise = (ctx: ReactionContext) => {
  ctx.animate([
    ['#torso-group', { y: -8 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const bodyLower = (ctx: ReactionContext) => {
  ctx.animate([
    ['#torso-group', { y: 4 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const tiltLeft = (ctx: ReactionContext) => {
  ctx.animate([
    ['#torso-group', { rotate: -8 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const tiltRight = (ctx: ReactionContext) => {
  ctx.animate([
    ['#torso-group', { rotate: 8 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const tinyBounce = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#torso-group', { scaleY: 0.95, scaleX: 1.05, y: 3 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
  ]);
  await ctx.animate([
    ['#torso-group', { scaleY: 1.05, scaleX: 0.95, y: -4 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
  ]);
  await ctx.animate([
    ['#torso-group', { scaleY: 1, scaleX: 1, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.BOUNCY }]
  ]);
};

export const bounce = async (ctx: ReactionContext) => {
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleY: 0.86, scaleX: 1.14, y: 12 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
    ]),
    stanceNarrow(ctx)
  ]);
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleY: 1.08, scaleX: 0.94, y: -12 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
    ]),
    stanceWiden(ctx)
  ]);
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleY: 1, scaleX: 1, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.BOUNCY }]
    ]),
    settleLegs(ctx)
  ]);
};

export const smallHop = async (ctx: ReactionContext) => {
  await prepareJump(ctx);
  await Promise.all([
    ctx.animate([
      ['#mascot-root', { y: -25, scaleY: 1.08, scaleX: 0.92 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SETTLE }]
    ]),
    syncShadowToRoot(ctx, -25)
  ]);
  await landJump(ctx);
};

export const squash = (ctx: ReactionContext) => {
  ctx.animate([
    ['#torso-group', { scaleY: 0.8, scaleX: 1.2, y: 20 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
  ]);
};

export const stretch = (ctx: ReactionContext) => {
  ctx.animate([
    ['#torso-group', { scaleY: 1.15, scaleX: 0.85, y: -15 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier), ease: EASING.SETTLE }]
  ]);
};

export const wiggle = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#torso-group', { rotate: -6 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
  await ctx.animate([
    ['#torso-group', { rotate: 6 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
  await ctx.animate([
    ['#torso-group', { rotate: -4 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
  await ctx.animate([
    ['#torso-group', { rotate: 0 }, { duration: animSpeed(TIMING.FAST, ctx.speedMultiplier) }]
  ]);
};

export const startle = async (ctx: ReactionContext) => {
  await ctx.animate([
    ['#torso-group', { scaleY: 1.1, scaleX: 0.9, y: -10 }, { duration: animSpeed(TIMING.INSTANT, ctx.speedMultiplier) }]
  ]);
  await ctx.animate([
    ['#torso-group', { scaleY: 1, scaleX: 1, y: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.BOUNCY }]
  ]);
};

export const settle = (ctx: ReactionContext) => {
  return ctx.animate([
    ['#torso-group', { scaleY: 1, scaleX: 1, x: 0, y: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#mascot-root', { scaleY: 1, scaleX: 1, x: 0, y: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#left-leg', { y: 0, x: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#right-leg', { y: 0, x: 0, rotate: 0 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }],
    ['#mascot-shadow', { scaleX: 1, scaleY: 1, opacity: 0.08 }, { duration: animSpeed(TIMING.NORMAL, ctx.speedMultiplier), ease: EASING.SOFT }]
  ]);
};

export const resetToIdle = settle;
