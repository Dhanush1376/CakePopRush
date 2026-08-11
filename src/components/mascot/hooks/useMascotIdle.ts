import { blink } from '../primitives/eyes';
import { ReactionContext } from '../animations/animationTypes';

export const startIdle = (ctx: ReactionContext, signal: AbortSignal) => {
  if (ctx.prefersReducedMotion) return;

  // 1. Subtle breathing
  const playBreathing = async () => {
    if (signal.aborted) return;
    try {
      await ctx.animate([
        ['#torso-group', { scaleX: 1.008, scaleY: 0.992 }, { duration: 2, ease: 'easeInOut' }],
        ['#torso-group', { scaleX: 1, scaleY: 1 }, { duration: 2, ease: 'easeInOut' }]
      ]);
      if (!signal.aborted) {
        playBreathing(); // loop
      }
    } catch {
      // animation cancelled
    }
  };
  playBreathing();

  // 2. Occasional blink (every 3-6 seconds)
  const scheduleBlink = () => {
    if (signal.aborted) return;
    const nextBlink = 3000 + Math.random() * 3000;
    setTimeout(async () => {
      if (signal.aborted) return;
      try {
        await blink(ctx);
      } catch {
        // animation cancelled
      }
      scheduleBlink();
    }, nextBlink);
  };
  scheduleBlink();

  // 3. Rare pupil micro-movement (every 5-10 seconds)
  const schedulePupilMicromove = () => {
    if (signal.aborted) return;
    const nextMove = 5000 + Math.random() * 5000;
    setTimeout(async () => {
      if (signal.aborted) return;
      try {
        const dx = (Math.random() - 0.5) * 4; // -2 to +2
        const dy = (Math.random() - 0.5) * 2; // -1 to +1
        await ctx.animate([
          ['#left-pupil-group, #right-pupil-group', { x: dx, y: dy }, { duration: 0.3 }]
        ]);
        await new Promise(r => setTimeout(r, 800));
        if (signal.aborted) return;
        await ctx.animate([
          ['#left-pupil-group, #right-pupil-group', { x: 0, y: 0 }, { duration: 0.3 }]
        ]);
      } catch {
        // animation cancelled
      }
      schedulePupilMicromove();
    }, nextMove);
  };
  schedulePupilMicromove();
};
