import { ReactionContext, animSpeed } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #32 Bonk (Hit reaction):
 * - Instant squash impact on #torso-group
 * - Eyes squeeze shut, brows raise, oMouth
 * - Small rotational wobble (recovering from hit)
 * - bonkStars particles
 */
export const playBonk = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'oMouth');
    P.raiseBrows(ctx);
    P.spawnBonkStars(ctx);
    await ctx.animate([['#torso-group', { scaleX: 0.96, scaleY: 0.96 }, { duration: animSpeed(0.1, speedMultiplier) }]]);
    await ctx.animate([['#torso-group', { scaleX: 1, scaleY: 1 }, { duration: animSpeed(0.4, speedMultiplier) }]]);
    P.setMouth(ctx, 'neutral');
    P.resetBrows(ctx);
    return;
  }

  const dir = Math.random() > 0.5 ? 1 : -1;

  // 1. HARD IMPACT (0-80ms)
  // Extreme squash, eyes squeezed, oMouth
  P.spawnBonkStars(ctx);
  P.raiseBrows(ctx);
  P.setMouth(ctx, 'oMouth');
  P.eyesSqueezed(ctx);
  
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleX: 1.25, scaleY: 0.65, y: 16 }, { duration: animSpeed(0.05, speedMultiplier), ease: 'easeOut' }]
    ]),
    ctx.animate([
      ['#mascot-root', { y: 6 }, { duration: animSpeed(0.05, speedMultiplier), ease: 'easeOut' }]
    ])
  ]);

  // 2. DIZZY PHASE START & REBOUND
  P.concernBrows(ctx);
  P.setMouth(ctx, 'tiredFrown');
  P.eyesDizzyDamaged(ctx);

  // Add bandage and rotating dizzy stars
  ctx.setAccessories(prev => ({ ...prev, bandage: true }));
  setTimeout(() => {
    ctx.setActiveParticles(['dizzyStars']);
  }, animSpeed(200, speedMultiplier));

  // Elastic rebound up
  await Promise.all([
    ctx.animate([
      ['#torso-group', { scaleX: 0.9, scaleY: 1.15, y: -12, rotate: 18 * dir, x: 12 * dir }, { duration: animSpeed(0.12, speedMultiplier), ease: 'easeOut' }]
    ])
  ]);

  // 3. ORGANIC DECAYING WOBBLE (~3.2 seconds)
  const swings = [
    { amp: -14, dur: 0.20 },
    { amp: 11, dur: 0.25 },
    { amp: -8, dur: 0.30 },
    { amp: 6, dur: 0.35 },
    { amp: -4, dur: 0.40 },
    { amp: 2, dur: 0.45 },
    { amp: -1, dur: 0.50 },
    { amp: 0, dur: 0.60 } // settle
  ];

  for (const swing of swings) {
    const rot = swing.amp * dir;
    const xDist = (swing.amp * 0.7) * dir;
    // The body leads the movement
    await ctx.animate([
      ['#torso-group', { 
        rotate: rot, 
        x: xDist, 
        y: Math.abs(swing.amp) * -0.2, // slight bobbing
        scaleX: 1 + (swing.amp * 0.005), 
        scaleY: 1 - (swing.amp * 0.005) 
      }, { duration: animSpeed(swing.dur, speedMultiplier), ease: 'easeInOut' }]
    ]);
  }

  // Final wait before shaking it off
  await new Promise(r => setTimeout(r, animSpeed(400, speedMultiplier)));

  // 4. RECOVERY (End of 4.5s)
  // Shake it off quickly!
  await ctx.animate([
    ['#torso-group', { rotate: -4 }, { duration: animSpeed(0.05, speedMultiplier) }],
    ['#torso-group', { rotate: 4 }, { duration: animSpeed(0.05, speedMultiplier) }],
    ['#torso-group', { rotate: 0 }, { duration: animSpeed(0.05, speedMultiplier) }]
  ]);

  ctx.setActiveParticles([]);
  ctx.setAccessories(prev => ({ ...prev, bandage: false }));
  
  P.resetBrows(ctx);
  P.setMouth(ctx, 'neutral');
  P.eyesNormal(ctx);
  
  await ctx.animate([
    ['#mascot-root', { y: 0 }, { duration: animSpeed(0.1, speedMultiplier), ease: 'easeOut' }]
  ]);
};
