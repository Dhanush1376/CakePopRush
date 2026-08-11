import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #7 Surprised:
 * - Wide eyes with small pupils
 * - O mouth
 * - Question mark above head (not impact lines)
 * - Arms splayed outward
 * - Body startles backward/upward
 * - Brows raised high
 */
export const playSurprised = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'oMouth');
    P.raiseBrows(ctx);
    await P.eyesWide(ctx);
    return;
  }

  // 1. Micro beat before surprise
  await new Promise(r => setTimeout(r, 80 / speedMultiplier));

  // 2. INSTANT: eyes widen + brows jump + O mouth (eyes lead, ~30ms stagger)
  P.setMouth(ctx, 'oMouth');
  P.eyesWide(ctx);
  P.raiseBrows(ctx);
  await new Promise(r => setTimeout(r, 40 / speedMultiplier));

  // 3. Body startles + arms splay + question marks
  await Promise.all([
    P.startle(ctx),
    P.openArms(ctx),
    P.spawnQuestionMarks(ctx)
  ]);

  // 4. Frozen surprised hold
  await new Promise(r => setTimeout(r, 800 / speedMultiplier));

  // 5. Recover (eyes first, then body)
  P.resetBrows(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));
  await Promise.all([
    P.resetEyes(ctx),
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
