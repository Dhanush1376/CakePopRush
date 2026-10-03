import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #14 Sleeping: mascot rests head down, heavily tilted to side, closed eyes, Zzz on left */
export const sleepingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 15, x: -8, scaleY: 0.94, scaleX: 1.06, rotate: -15 }, // Heavy resting tilt
  leftEyeShape: 'closed',
  rightEyeShape: 'closed',
  mouth: 'sleepySmile',
  leftEyebrow: { rotate: 15, y: -2, x: 0 },
  rightEyebrow: { rotate: -15, y: -2, x: 0 },
  activeParticles: ['sleepZ']
};
