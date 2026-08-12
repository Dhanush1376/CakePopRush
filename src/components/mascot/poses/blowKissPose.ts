import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const blowKissPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleY: 0.98, scaleX: 1.02 },
  leftArm: { ...defaultPose.leftArm, rotate: 20, y: -2, x: -1 },
  rightArm: { ...defaultPose.rightArm, rotate: -20, y: -2, x: 1 },
  mouth: 'kiss',
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  blushOpacity: 1
};
