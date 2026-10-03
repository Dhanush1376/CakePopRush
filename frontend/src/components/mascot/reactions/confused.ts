import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #11 Confused:
 * "Wait... what?" — cute double-take, asymmetric eyebrows, and question marks.
 */
export const playConfused = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion, animate } = ctx;
  const sm = speedMultiplier;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'uncertain');
    P.concernBrows(ctx);
    P.spawnQuestionMarks(ctx);
    return;
  }

  // 1. Double-take look left
  P.setMouth(ctx, 'smallSmile');
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: -5, y: 0 }, { duration: 0.15 / sm, ease: 'easeOut' }]
    ]),
    animate([
      ['#torso-group', { rotate: -4, y: 2, scaleY: 0.98, scaleX: 1.02 }, { duration: 0.2 / sm, ease: 'easeOut' }]
    ])
  ]);
  await new Promise(r => setTimeout(r, 150 / sm));

  // 2. Double-take look right
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: 5, y: 0 }, { duration: 0.15 / sm, ease: 'easeInOut' }]
    ]),
    animate([
      ['#torso-group', { rotate: 4, y: 2, scaleY: 0.98, scaleX: 1.02 }, { duration: 0.2 / sm, ease: 'easeInOut' }]
    ])
  ]);
  await new Promise(r => setTimeout(r, 150 / sm));

  // 3. Realization of confusion! (Asymmetric eyebrows, uncertain mouth, look up sideways)
  P.setMouth(ctx, 'uncertain');
  P.spawnQuestionMarks(ctx);

  await Promise.all([
    // One brow up, one brow down
    ctx.animate([
      ['#left-eyebrow', { y: -6, rotate: 15 }, { duration: 0.2 / sm, ease: 'backOut' }],
      ['#right-eyebrow', { y: 2, rotate: -10 }, { duration: 0.2 / sm, ease: 'easeOut' }]
    ]),
    // Pupils look up and away
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: -3, y: -4 }, { duration: 0.2 / sm, ease: 'easeOut' }]
    ]),
    // Confused head tilt and stretch
    animate([
      ['#torso-group', { rotate: -8, y: -2, scaleY: 1.04, scaleX: 0.96 }, { duration: 0.3 / sm, ease: 'backOut' }]
    ])
  ]);

  // 4. Subtle confused bobbing while holding the pose
  for (let i = 0; i < 2; i++) {
    await animate([
      ['#torso-group', { rotate: -6 }, { duration: 0.4 / sm, ease: 'easeInOut' }]
    ]);
    await animate([
      ['#torso-group', { rotate: -10 }, { duration: 0.4 / sm, ease: 'easeInOut' }]
    ]);
  }

  await animate([
    ['#torso-group', { rotate: -8 }, { duration: 0.2 / sm, ease: 'easeInOut' }]
  ]);

  await new Promise(r => setTimeout(r, 600 / sm));

  // 5. Recover smoothly
  P.resetBrows(ctx);
  
  await Promise.all([
    ctx.animate([
      ['#left-pupil-group, #right-pupil-group', { x: 0, y: 0 }, { duration: 0.3 / sm }]
    ]),
    animate([
      ['#torso-group', { rotate: 0, y: 0, scaleY: 1, scaleX: 1 }, { duration: 0.5 / sm, ease: [0.25, 0.1, 0.25, 1] }]
    ])
  ]);
  
  P.setMouth(ctx, 'neutral');
};
