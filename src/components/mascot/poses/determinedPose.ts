import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #22 Determined:
 * Pupils locked center, eyebrows angled (determined), forward lean, determined mouth, impact lines.
 * "Let's do this." (Not angry).
 */
export const determinedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 2, scaleY: 0.98, scaleX: 1.02, y: 2 },
  leftPupil: { scale: 1, x: 0, y: 0 },
  rightPupil: { scale: 1, x: 0, y: 0 },
  leftEyebrow: { y: 2, rotate: -15, x: 0 },
  rightEyebrow: { y: 2, rotate: 15, x: 0 },
  mouth: 'confident',
  leftArm: { rotate: -150, y: 5, x: 10 },
  rightArm: { rotate: 150, y: 5, x: -10 },
  activeParticles: ['impactLines']
};
