import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #7 Surprised:
 * Eyes: wide, slightly enlarged
 * Pupils: small, centered (startled)
 * Brows: raised high
 * Mouth: O mouth
 * Arms: splayed outward
 * Body: startled upward
 * Effects: question marks (not impact lines)
 */
export const surprisedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -6, scaleX: 0.95, scaleY: 1.05 },
  leftEye: { ...defaultPose.leftEye, scaleX: 1.1, scaleY: 1.1 },
  rightEye: { ...defaultPose.rightEye, scaleX: 1.1, scaleY: 1.1 },
  leftPupil: { scale: 0.8, x: 0, y: 0 },
  rightPupil: { scale: 0.8, x: 0, y: 0 },
  leftEyebrow: { rotate: 5, y: -6, x: 0 },
  rightEyebrow: { rotate: -5, y: -6, x: 0 },
  mouth: 'oMouth',
  leftArm: { rotate: -35, y: -2, x: -3 },
  rightArm: { rotate: 35, y: -2, x: 3 },
  activeParticles: ['questionMarks']
};
