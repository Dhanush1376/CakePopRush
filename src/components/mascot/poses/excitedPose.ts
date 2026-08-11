import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #6 Excited:
 * Eyes wide, openSmile, arms raised high, excitement lines, stretched posture.
 */
export const excitedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -8, scaleY: 1.05, scaleX: 0.95 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.1, scaleX: 1.1 },
  rightEye: { ...defaultPose.rightEye, scaleY: 1.1, scaleX: 1.1 },
  mouth: 'laugh',
  leftArm: { rotate: -160, y: -2, x: 2 , poseName: 'celebrate', handType: 'open' },
  rightArm: { rotate: 160, y: -2, x: -2 , poseName: 'celebrate', handType: 'open' },
  activeParticles: ['excitementLines']
};
