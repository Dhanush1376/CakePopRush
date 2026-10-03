import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #15 Tired: half-open droopy eyes, exhausted */
export const tiredPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 8, scaleY: 0.94, scaleX: 1.06 }, // Heavy sagging
  leftEyeShape: 'tired',
  rightEyeShape: 'tired',
  leftPupil: { scale: 1, x: 0, y: 3 },
  rightPupil: { scale: 1, x: 0, y: 3 },
  mouth: 'tiredFrown',
  leftEyebrow: { rotate: 15, y: -2, x: 0 },
  rightEyebrow: { rotate: -15, y: -2, x: 0 },
};
