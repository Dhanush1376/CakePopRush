import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #15 Tired: half-open droopy eyes, exhausted, arms hanging */
export const tiredPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 5, scaleY: 0.96 },
  leftEye: { ...defaultPose.leftEye, scaleY: 0.45 },
  rightEye: { ...defaultPose.rightEye, scaleY: 0.45 },
  leftEyeShape: 'tired',
  rightEyeShape: 'tired',
  leftPupil: { scale: 1, x: 0, y: 2 },
  rightPupil: { scale: 1, x: 0, y: 2 },
  mouth: 'tiredFrown',
  leftEyebrow: { rotate: 15, y: -2, x: 0 },
  rightEyebrow: { rotate: -15, y: -2, x: 0 },
  leftArm: { rotate: -90, y: 3, x: 1 },
  rightArm: { rotate: 90, y: 3, x: -1 },
};
