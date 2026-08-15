import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const sillyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleY: 0.95, scaleX: 1.05, rotate: -8 }, // Playful tilt and squash
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  mouth: 'tongue',
};
