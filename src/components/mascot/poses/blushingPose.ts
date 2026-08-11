import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const blushingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 0.98, scaleY: 1.02 }, // Tiny inward squash
  leftPupil: { scale: 1, x: 4, y: -2 }, // Look away slightly
  rightPupil: { scale: 1, x: 4, y: -2 },
  mouth: 'smallSmile',
  blushOpacity: 1,
  leftArm: { rotate: -40, x: 0, y: 0 , poseName: 'cheekLeft', handType: 'round' }, // Hands peek out near cheeks from behind
  rightArm: { rotate: 40, x: 0, y: 0 , poseName: 'cheekRight', handType: 'round' },
};
