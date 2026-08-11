import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #16 Yawning: sleepy eyes, yawn mouth wide, hand near mouth */
export const yawningPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -2, scaleY: 1.03 },
  leftEye: { ...defaultPose.leftEye, scaleY: 0.5 },
  rightEye: { ...defaultPose.rightEye, scaleY: 0.5 },
  mouth: 'yawn',
  leftArm: { rotate: 5, y: 0, x: 0 },
  rightArm: { rotate: 50, y: 0, x: 0 }, // Peeks out near lower cheek
};
