import { ReactionContext } from '../animations/animationTypes';
import * as P from '../primitives';

/**
 * Reference #22 Determined:
 * pupils lock center → eyebrows lower/angle → torso leans slightly forward → small squash → determined mouth → impact lines → strong target hold.
 */
export const playDetermined = async (ctx: ReactionContext) => {
  const { speedMultiplier, prefersReducedMotion } = ctx;

  if (prefersReducedMotion) {
    P.setMouth(ctx, 'confident');
    P.determinedBrows(ctx);
    P.spawnImpactLines(ctx);
    return;
  }

  // 1. Pupils lock center
  await P.lookCenter(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));

  // 2. Small anticipation squash (gathering energy)
  await ctx.animate([
    ['#torso-group', { scaleY: 0.95, scaleX: 1.05, y: 5 }, { duration: 0.2 / speedMultiplier, ease: 'easeIn' }]
  ]);

  // 3. Leans forward + eyebrows angle + determined mouth (strong hit)
  P.setMouth(ctx, 'confident');
  P.determinedBrows(ctx);
  
  await Promise.all([
    ctx.animate([
      ['#torso-group', { rotate: 2, scaleY: 0.98, scaleX: 1.02, y: 2 }, { duration: 0.15 / speedMultiplier, ease: 'easeOut' }]
    ]),
    ctx.animate([
      ['#left-arm', { rotate: -40, y: 2, x: -2 }, { duration: 0.15 / speedMultiplier, ease: 'easeOut' }],
      ['#right-arm', { rotate: 40, y: 2, x: 2 }, { duration: 0.15 / speedMultiplier, ease: 'easeOut' }]
    ])
  ]);

  // 4. Impact lines
  P.spawnImpactLines(ctx);

  // 5. Strong target hold
  await new Promise(r => setTimeout(r, 800 / speedMultiplier));

  // 6. Release/Recover
  P.resetBrows(ctx);
  await new Promise(r => setTimeout(r, 100 / speedMultiplier));
  await Promise.all([
    P.settle(ctx),
    P.lowerArms(ctx)
  ]);
};
