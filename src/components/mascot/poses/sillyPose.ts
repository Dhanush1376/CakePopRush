import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #20 Silly:
 * Squeezed eyes (>_<), tongue out, arms popped upward, slightly squashed/wiggly.
 */
export const sillyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleY: 0.95, scaleX: 1.05, rotate: -5 },
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  mouth: 'tongue',
  leftArm: { rotate: -150, y: -5, x: 4 , poseName: 'raisedUp', handType: 'open' },
  rightArm: { rotate: 150, y: -5, x: -4 , poseName: 'raisedUp', handType: 'open' },
};
