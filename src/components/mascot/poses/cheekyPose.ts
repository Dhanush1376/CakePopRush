import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #19 Cheeky:
 * Tongue out, one eyebrow raised (asymmetric), slight sideways tilt.
 */
export const cheekyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 4 },
  leftEyebrow: { y: -6, rotate: 10, x: 0 },
  rightEyebrow: { y: -2, rotate: -5, x: 0 },
  mouth: 'tongue',
  leftArm: { rotate: -40, y: 0, x: 0 }, // Hand peeks out near cheek
  rightArm: { rotate: 20, y: 0, x: 0 },
};
