import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #24 Peeking:
 * hidden below foreground → top of head rises → eyes appear → hands grip edge →
 * pupils look left → pupils look right → blink → smile → hold → descend.
 */
export const playPeeking = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'smallSmile');
    return;
  }

  // 1. Initial hidden state (instant)
  await ctx.animate([
    ['#mascot-root', { y: 150 }, { duration: 0 }]
  ]);
  
  // Set initial pose: gripping hands, looking forward
  P.setMouth(ctx, 'neutral');
  ctx.animate([
    ['#left-arm', { rotate: -180, y: -25, x: 20 }, { duration: 0 }],
    ['#right-arm', { rotate: 180, y: -25, x: -20 }, { duration: 0 }]
  ]);

  // 2. Head rises to peek
  await ctx.animate([
    ['#mascot-root', { y: 70 }, { duration: 0.6 / speedMultiplier, ease: 'easeOut' }]
  ]);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 3. Look left, then right
  await P.lookLeft(ctx);
  await new Promise(r => setTimeout(r, 400 / speedMultiplier));
  await P.lookRight(ctx);
  await new Promise(r => setTimeout(r, 400 / speedMultiplier));
  await P.lookCenter(ctx);
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 4. Blink + Smile
  await P.blink(ctx);
  P.setMouth(ctx, 'smallSmile');

  // 5. Hold
  await new Promise(r => setTimeout(r, 1000 / speedMultiplier));

  // 6. Descend back down
  await ctx.animate([
    ['#mascot-root', { y: 150 }, { duration: 0.5 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 7. Instant reset to canonical state
  P.setMouth(ctx, 'happy');
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
