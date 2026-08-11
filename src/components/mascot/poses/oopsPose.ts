import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #8 Oops!:
 * Eyes: slightly worried, asymmetric (one a bit wider)
 * Pupils: looking slightly sideways
 * Brows: asymmetric — one raised, one slightly furrowed
 * Mouth: tinyOops (small o)
 * Arms: one hand near/covering mouth (right hand)
 * Body: slight embarrassed recoil
 */
export const oopsPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 2, scaleX: 0.98, scaleY: 1.01 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.05 },
  rightEye: { ...defaultPose.rightEye, scaleY: 0.95 },
  leftPupil: { scale: 1, x: 3, y: -1 },
  rightPupil: { scale: 1, x: 3, y: -1 },
  leftEyebrow: { y: -4, x: 0, rotate: 8 },
  rightEyebrow: { y: -2, x: 0, rotate: -5 },
  mouth: 'tinyOops',
  leftArm: { rotate: 5, y: 0, x: 0 , poseName: 'relaxedDown', handType: 'round' },
  rightArm: { rotate: 50, y: 0, x: 0 , poseName: 'mouth', handType: 'round' }, // Hand peeks out near lower cheek
};
