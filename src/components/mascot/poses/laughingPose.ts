import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const laughingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 1.03, scaleY: 0.97, y: 2 }, // Slightly compressed
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  mouth: 'laugh',
  leftArm: { rotate: 25, y: -5, x: -2 },
  rightArm: { rotate: -25, y: -5, x: 2 },
};
