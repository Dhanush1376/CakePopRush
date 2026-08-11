import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #4 Heart Eyes:
 * Heart eyes accessory (replaces normal eyes), hands raised happily,
 * slight body lift.
 */
export const heartEyesPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -4 },
  leftEyeShape: 'heart',
  rightEyeShape: 'heart',
  mouth: 'openSmile',
  leftArm: { rotate: -150, y: -2, x: 2 },
  rightArm: { rotate: 150, y: -2, x: -2 },
  activeParticles: ['hearts']
};
