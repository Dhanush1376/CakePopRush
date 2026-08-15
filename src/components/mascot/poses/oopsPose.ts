import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #8 Oops!:
 * Redesigned — no arms, proper eyeball positioning.
 * One eye squeezed shut (wince), body squashes down.
 * Pupils stay centered, no darting off-screen.
 */
export const oopsPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 8, scaleX: 1.04, scaleY: 0.94 },
  leftEyeShape: 'normal',
  rightEyeShape: 'squeezed',
  leftEye: { ...defaultPose.leftEye },
  rightEye: { ...defaultPose.rightEye },
  leftPupil: { scale: 1, x: 0, y: 0 },
  rightPupil: { scale: 1, x: 0, y: 0 },
  leftEyebrow: { y: -6, x: 0, rotate: 12 },
  rightEyebrow: { y: 3, x: 0, rotate: -18 },
  mouth: 'uncertain',
  blushOpacity: 0.3,
};
