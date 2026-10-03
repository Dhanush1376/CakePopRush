import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #02 Winking:
 * A cheeky, smooth wink.
 * Head tilts, mouth smiles wide, double wink with a pause. No arms.
 */
export const playWinking = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    await animate([
      ['#left-eye-normal', { opacity: 0 }, { duration: 0 }],
      ['#left-eye-closed', { opacity: 1 }, { duration: 0 }]
    ]);
    return;
  }

  // 1. Anticipation: Quick look down-left, small body dip
  P.setMouth(ctx, 'smallSmile');
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: -4, y: 3 }, { duration: 0.15 / sm, ease: 'easeOut' }]
    ]),
    animate([
      ['#torso-group', { scaleY: 0.96, scaleX: 1.04, y: 3, rotate: -2 }, { duration: 0.2 / sm, ease: 'easeIn' }]
    ])
  ]);

  await new Promise(r => setTimeout(r, 100 / sm));

  // 2. The Wink: Snap back up, tilt right, smile wide, wink left eye
  P.setMouth(ctx, 'openSmile');
  await Promise.all([
    // Pupils snap back to center looking forward
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: 0, y: 0 }, { duration: 0.2 / sm, ease: 'backOut' }]
    ]),
    // Body rises and tilts cheerfully
    animate([
      ['#torso-group', { scaleY: 1.02, scaleX: 0.98, y: -2, rotate: 6 }, { duration: 0.3 / sm, ease: 'backOut' }]
    ]),
    // The Wink (left eye closes into happy crescent)
    ctx.animate([
      ['#left-eye-normal', { opacity: 0 }, { duration: 0.1 / sm }],
      ['#left-eye-closed', { opacity: 1 }, { duration: 0.1 / sm }]
    ])
  ]);

  // 3. Hold the wink with a tiny settle
  await animate([
    ['#torso-group', { scaleY: 1, scaleX: 1, y: 0, rotate: 4 }, { duration: 0.2 / sm, ease: 'easeOut' }]
  ]);
  
  await new Promise(r => setTimeout(r, 400 / sm));

  // 5. Recover smoothly
  await Promise.all([
    ctx.animate([
      ['#left-eye-closed', { opacity: 0 }, { duration: 0.2 / sm }],
      ['#left-eye-normal', { opacity: 1 }, { duration: 0.2 / sm }]
    ]),
    animate([
      ['#torso-group', { rotate: 0 }, { duration: 0.4 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
  
  P.setMouth(ctx, 'neutral');
};
