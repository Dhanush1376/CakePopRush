import { MascotPose } from './types';
import { defaultPose } from './defaultPose';
import { ARM_PATHS } from '../primitives/arms';

/** Reference #14 Sleeping: closed eyes, peaceful, Zzz, body settled */
export const sleepingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 4, scaleY: 0.97 },
  leftEyeShape: 'closed',
  rightEyeShape: 'closed',
  mouth: 'sleepySmile',
  leftEyebrow: { rotate: 12, y: -1, x: 0 },
  rightEyebrow: { rotate: -12, y: -1, x: 0 },
  leftArm: { rotate: 0, y: 0, x: 0, path: ARM_PATHS.leftFolded },
  rightArm: { rotate: 0, y: 0, x: 0, path: ARM_PATHS.rightFolded },
  activeParticles: ['sleepZ']
};
