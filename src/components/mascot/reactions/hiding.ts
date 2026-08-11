import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #25 Hiding:
 * visible → surprised/startled → FAST drop → hands remain visible → eyes peek → blink → pause → fully disappear.
 */
export const playHiding = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'oMouth');
    return;
  }

  // 1. Surprised/startled
  P.setMouth(ctx, 'oMouth');
  await P.startle(ctx);
  await new Promise(r => setTimeout(r, 150 / speedMultiplier));

  // 2. FAST drop (leaving hands temporarily behind if possible, but moving root is easier. We'll drop root to 85)
  ctx.animate([
    ['#left-arm', { rotate: -180, y: -20, x: 30 }, { duration: 0.1 / speedMultiplier }],
    ['#right-arm', { rotate: 180, y: -20, x: -30 }, { duration: 0.1 / speedMultiplier }]
  ]);
  await ctx.animate([
    ['#mascot-root', { y: 85 }, { duration: 0.15 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 3. Eyes peek (look around nervously)
  P.setMouth(ctx, 'neutral');
  await P.lookLeft(ctx);
  await new Promise(r => setTimeout(r, 300 / speedMultiplier));
  await P.lookRight(ctx);
  await new Promise(r => setTimeout(r, 300 / speedMultiplier));
  
  // 4. Blink
  await P.lookCenter(ctx);
  await P.blink(ctx);

  // 5. Tiny pause
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));

  // 6. Fully disappear
  await ctx.animate([
    ['#mascot-root', { y: 150 }, { duration: 0.3 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 7. Reset to canonical behind scenes
  await new Promise(r => setTimeout(r, 200 / speedMultiplier));
  P.setMouth(ctx, 'happy');
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
