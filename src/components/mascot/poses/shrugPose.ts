import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #12 Shrug:
 * Eyes: wide, innocent
 * Pupils: centered
 * Brows: slightly raised (innocent)
 * Mouth: neutral/small (not confident — uncertain)
 * Arms: BOTH raised outward at ~70° ("I dunno" gesture)
 * Body: slight rise
 */
export const shrugPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -3 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.05, scaleX: 1.05 },
  rightEye: { ...defaultPose.rightEye, scaleY: 1.05, scaleX: 1.05 },
  leftEyebrow: { y: -3, x: 0, rotate: 0 },
  rightEyebrow: { y: -3, x: 0, rotate: 0 },
  mouth: 'neutral',
  leftArm: { rotate: -70, y: -2, x: -2 , poseName: 'shrugUp', handType: 'open' },
  rightArm: { rotate: 70, y: -2, x: 2 , poseName: 'shrugUp', handType: 'open' },
};
