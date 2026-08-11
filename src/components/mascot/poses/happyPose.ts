import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const happyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleY: 1.02, scaleX: 0.98, y: -4 },
  leftArm: { ...defaultPose.leftArm, rotate: 20, y: -2, x: -1 },
  rightArm: { ...defaultPose.rightArm, rotate: -20, y: -2, x: 1 },
  mouth: 'happy',
  leftEyeShape: 'normal',
  rightEyeShape: 'normal'
};
