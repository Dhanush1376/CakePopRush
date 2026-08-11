import { MascotPose } from './types';
import { defaultPose } from './defaultPose';
import { ARM_PATHS } from '../primitives/arms';

/** Reference #17 Love: bright wide eyes, hearts floating, hands on cheeks, warm */
export const lovePose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 0.97, scaleY: 1.02 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.08, scaleX: 1.05 },
  rightEye: { ...defaultPose.rightEye, scaleY: 1.08, scaleX: 1.05 },
  leftPupil: { scale: 1.1, x: 0, y: 0 },
  rightPupil: { scale: 1.1, x: 0, y: 0 },
  mouth: 'smallSmile',
  leftEyebrow: { rotate: 15, y: 0, x: 0 },
  rightEyebrow: { rotate: -15, y: 0, x: 0 },
  leftArm: { rotate: 0, y: 0, x: 0, path: ARM_PATHS.leftCheekHold, isFront: true },
  rightArm: { rotate: 0, y: 0, x: 0, path: ARM_PATHS.rightCheekHold, isFront: true },
  blushOpacity: 0.4,
  activeParticles: ['hearts']
};
