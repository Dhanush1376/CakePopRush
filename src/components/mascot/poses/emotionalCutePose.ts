import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const emotionalCutePose: MascotPose = {
  ...defaultPose,
  mouth: 'smallSmile',
  leftEyeShape: 'cute',
  rightEyeShape: 'cute',
  leftEyebrow: { ...defaultPose.leftEyebrow, rotate: 25, y: -2, scaleY: -1 },
  rightEyebrow: { ...defaultPose.rightEyebrow, rotate: -25, y: -2, scaleY: -1 },
  blushOpacity: 1
};
