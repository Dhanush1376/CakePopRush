import { MascotPose } from './types';
import { defaultPose } from './defaultPose';
import { ARM_PATHS } from '../primitives/arms';

/**
 * Reference: Crying Fountain
 * Eyes: sad shape
 * Mouth: sad frown
 * Brows: angled upward/inward
 * Body: slightly squashed
 */
export const cryingFountainPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -15, scaleY: 0.95, scaleX: 1.05 },
  mouth: 'tiredFrown',
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  leftEyebrow: { rotate: -15, y: -5, x: 5 },
  rightEyebrow: { rotate: 15, y: -5, x: -5 },
  leftArm: { rotate: 20, y: 5, x: -5, path: ARM_PATHS.leftHidden },
  rightArm: { rotate: -20, y: 5, x: 5, path: ARM_PATHS.rightHidden },
  leftLeg: { rotate: 10, y: -5, x: 0 },
  rightLeg: { rotate: -10, y: -5, x: 0 },
  leftPupil: { scale: 1, x: 0, y: -4 },
  rightPupil: { scale: 1, x: 0, y: -4 },
  blushOpacity: 0.3,
};
