import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #25 Hiding:
 * Dropped low. Eyes barely peeking. Surprised/startled before drop.
 */
export const hidingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 85 },
  leftEyeShape: 'normal',
  rightEyeShape: 'normal',
  mouth: 'neutral',
  leftArm: { rotate: -180, y: -20, x: 30 , poseName: 'ledgeGrip', handType: 'grip' },
  rightArm: { rotate: 180, y: -20, x: -30 , poseName: 'ledgeGrip', handType: 'grip' },
};
