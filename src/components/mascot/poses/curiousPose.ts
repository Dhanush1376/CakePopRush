import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #9 Curious:
 * Eyes: normal, slightly wider (attentive)
 * Pupils: looking upward-right (diagonal — inquisitive)
 * Brows: one slightly raised (left)
 * Mouth: smallSmile (pleasant, questioning)
 * Arms: left hand near chin
 * Body: slight tilt (~3°)
 */
export const curiousPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 3 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.05, scaleX: 1.05 },
  rightEye: { ...defaultPose.rightEye, scaleY: 1.05, scaleX: 1.05 },
  leftPupil: { scale: 1, x: 4, y: -4 },
  rightPupil: { scale: 1, x: 4, y: -4 },
  leftEyebrow: { y: -4, x: 0, rotate: 5 },
  rightEyebrow: { y: -2, x: 0, rotate: 0 },
  mouth: 'smallSmile',
  leftArm: { rotate: -40, y: 0, x: 0 , poseName: 'chin', handType: 'round' }, // Peeks out near cheek
  rightArm: { rotate: 5, y: 0, x: 0 , poseName: 'relaxedDown', handType: 'round' },
};
