import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #32 Bonk:
 * Eyes: squeezed (reacting to hit)
 * Mouth: oMouth
 * Brows: raised (startled)
 * Body: squashed (impact)
 * Effects: bonkStars
 */
export const bonkPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 1.04, scaleY: 0.94, y: 4 },
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  mouth: 'oMouth',
  leftEyebrow: { rotate: 5, y: -4, x: 0 },
  rightEyebrow: { rotate: -5, y: -4, x: 0 },
  activeParticles: ['bonkStars'] as any
};
