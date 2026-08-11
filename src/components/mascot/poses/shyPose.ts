import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #23 Shy: wide eyes looking away, blush, hands together inward, compressed */
export const shyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 0.96, scaleY: 1.01, rotate: -3 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.05, scaleX: 1.05 },
  rightEye: { ...defaultPose.rightEye, scaleY: 1.05, scaleX: 1.05 },
  leftPupil: { scale: 1, x: -5, y: 1 },
  rightPupil: { scale: 1, x: -5, y: 1 },
  mouth: 'smallSmile',
  blushOpacity: 0.6,
  leftArm: { rotate: -90, y: 0, x: 12 , poseName: 'inwardDown', handType: 'round' },
  rightArm: { rotate: 90, y: 0, x: -12 , poseName: 'inwardDown', handType: 'round' },
};
