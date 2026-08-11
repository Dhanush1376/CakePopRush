import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #2 Winking:
 * Body: slight right tilt (~3°)
 * Left eye: closed (happy crescent wink)
 * Right eye: open, bright
 * Mouth: openSmile
 * Right arm: raised in wave/gesture
 * Left arm: resting
 */
export const winkingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 3 },
  leftEyeShape: 'closed',
  rightEyeShape: 'normal',
  mouth: 'openSmile',
  leftArm: { rotate: 5, y: 0, x: 0 , poseName: 'waveA', handType: 'open' },
  rightArm: { rotate: -10, y: 0, x: 0 , poseName: 'relaxedDown', handType: 'round' },
};
