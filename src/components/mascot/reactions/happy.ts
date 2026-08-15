import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #01 Happy:
 * A gentle, joyful bounce. Much calmer than laughing or excited.
 * Eyes remain open but squeeze into happy crescents at the peak.
 */
export const playHappy = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'openSmile');
    await P.eyesClosed(ctx); // Happy crescents
    return;
  }

  // 1. Anticipation dip
  P.setMouth(ctx, 'smallSmile');
  await animate([
    ['#torso-group', { scaleY: 0.95, scaleX: 1.05, y: 5 }, { duration: 0.2 / sm, ease: 'easeIn' }]
  ]);

  // 2. Rise and transition to open smile + happy crescent eyes
  P.setMouth(ctx, 'openSmile');
  
  await Promise.all([
    ctx.animate([
      ['#left-eye-normal, #right-eye-normal', { opacity: 0 }, { duration: 0.1 / sm }],
      ['#left-eye-closed, #right-eye-closed', { opacity: 1 }, { duration: 0.1 / sm }]
    ]),
    animate([
      ['#torso-group', { scaleY: 1.03, scaleX: 0.97, y: -4 }, { duration: 0.25 / sm, ease: 'backOut' }]
    ])
  ]);

  // 3. Smooth gentle bobbing (happy wobble)
  for (let i = 0; i < 2; i++) {
    await animate([
      ['#torso-group', { scaleY: 0.98, scaleX: 1.02, y: 0 }, { duration: 0.3 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { scaleY: 1.03, scaleX: 0.97, y: -4 }, { duration: 0.3 / sm, ease: 'easeInOut' }]
    ]);
  }

  // 4. Hold the happy smile
  await new Promise(resolve => setTimeout(resolve, 1200 / sm));

  // 5. Recover smoothly
  await Promise.all([
    ctx.animate([
      ['#left-eye-closed, #right-eye-closed', { opacity: 0 }, { duration: 0.3 / sm }],
      ['#left-eye-normal, #right-eye-normal', { opacity: 1 }, { duration: 0.3 / sm }]
    ]),
    animate([
      ['#torso-group', { scaleY: 1, scaleX: 1, y: 0 }, { duration: 0.4 / sm, ease: 'easeOut' }]
    ])
  ]);
  
  P.setMouth(ctx, 'neutral');
};
