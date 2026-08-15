import { ReactionContext, animSpeed } from '../animations/animationTypes';
import { MascotMouthShape } from '../parts/MascotMouth';

export const setMouth = (ctx: ReactionContext, shape: MascotMouthShape) => {
  ctx.setMouthShape(shape);
};

export const showBlush = (ctx: ReactionContext, opacity: number = 1) => {
  ctx.animate([
    ['#left-cheek, #right-cheek', { opacity: opacity, scale: 1 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const hideBlush = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-cheek, #right-cheek', { opacity: 0, scale: 0.8 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const raiseBrows = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-eyebrow, #right-eyebrow', { y: -8, rotate: 0 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const lowerBrows = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-eyebrow, #right-eyebrow', { y: 6, rotate: 0 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const concernBrows = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-eyebrow', { y: -5, rotate: 10 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }],
    ['#right-eyebrow', { y: -5, rotate: -10 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const determinedBrows = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-eyebrow', { y: 2, rotate: -15 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }],
    ['#right-eyebrow', { y: 2, rotate: 15 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const resetBrows = (ctx: ReactionContext) => {
  ctx.animate([
    ['#left-eyebrow, #right-eyebrow', { y: 0, rotate: 0, x: 0 }, { duration: animSpeed(0.2, ctx.speedMultiplier) }]
  ]);
};

export const facialReaction = async (
  ctx: ReactionContext,
  options: {
    mouth?: MascotMouthShape;
    brows?: 'raised' | 'lowered' | 'concerned' | 'determined' | 'neutral';
    blush?: boolean;
    delay?: number;
  }
) => {
  if (options.brows === 'raised') raiseBrows(ctx);
  if (options.brows === 'lowered') lowerBrows(ctx);
  if (options.brows === 'concerned') concernBrows(ctx);
  if (options.brows === 'determined') determinedBrows(ctx);
  if (options.brows === 'neutral') resetBrows(ctx);

  const delay = options.delay;
  if (delay !== undefined) {
    await new Promise(r => setTimeout(r, animSpeed(delay, ctx.speedMultiplier) * 1000));
  }

  if (options.mouth) setMouth(ctx, options.mouth);
  if (options.blush === true) showBlush(ctx);
  if (options.blush === false) hideBlush(ctx);
};
