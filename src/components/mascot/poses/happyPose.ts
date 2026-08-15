import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const happyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleY: 1.02, scaleX: 0.98, y: -4 },
  mouth: 'happy',
  leftEyeShape: 'normal',
  rightEyeShape: 'normal'
};
