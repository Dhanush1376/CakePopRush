import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const pleadingCutePose: MascotPose = {
  ...defaultPose,
  mouth: 'tinyPout',
  leftEyeShape: 'pleading',
  rightEyeShape: 'pleading',
  leftEyebrow: { ...defaultPose.leftEyebrow, y: -6, rotate: -12 },  // Inner end tilts UP (sad puppy)
  rightEyebrow: { ...defaultPose.rightEyebrow, y: -6, rotate: 12 }, // Inner end tilts UP (sad puppy)
  blushOpacity: 1
};
