import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const blushingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 0.95, scaleY: 1.05, y: 6, rotate: -6 },
  leftPupil: { scale: 1, x: 2, y: 1 }, // Subtle shy glance — stays inside eye
  rightPupil: { scale: 1, x: 2, y: 1 },
  mouth: 'smallSmile',
  blushOpacity: 1,
};
