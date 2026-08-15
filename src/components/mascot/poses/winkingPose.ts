import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const winkingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 4, y: 2, scaleY: 0.98, scaleX: 1.02 }, // Head tilt and tiny squash
  mouth: 'openSmile',
  leftEyeShape: 'closed', // Wink with left eye (viewer's right)
  rightEyeShape: 'normal',
};
