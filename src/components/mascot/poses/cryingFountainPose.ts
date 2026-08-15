import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const cryingFountainPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 0, scaleY: 1, scaleX: 1 },
  mouth: 'cryingFrown',
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  leftEyebrow: { rotate: -15, y: -5, x: 5 },
  rightEyebrow: { rotate: 15, y: -5, x: -5 },
  leftPupil: { scale: 1, x: 0, y: 0 },
  rightPupil: { scale: 1, x: 0, y: 0 },
  blushOpacity: 0.3,
};
