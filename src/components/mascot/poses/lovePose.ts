import { MascotPose } from './types';
import { defaultPose } from './defaultPose';
import { ARM_PATHS } from '../primitives/arms';

/** Reference #17 Love: Redesigned to be a soft, sweet, romantic sway (unlike the intense heartEyes) */
export const lovePose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 1.02, scaleY: 0.98, rotate: -3 },
  leftEyeShape: 'closed',
  rightEyeShape: 'closed',
  mouth: 'smallSmile',
  leftEyebrow: { rotate: 10, y: -2, x: 0 },
  rightEyebrow: { rotate: -10, y: -2, x: 0 },
  blushOpacity: 1,
  activeParticles: ['hearts']
};
