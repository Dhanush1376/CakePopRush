import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const determinedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 2, scaleY: 0.98, scaleX: 1.02, y: 2 },
  leftPupil: { scale: 1, x: 0, y: 0 },
  rightPupil: { scale: 1, x: 0, y: 0 },
  leftEyebrow: { y: 2, rotate: -15, x: 0 },
  rightEyebrow: { y: 2, rotate: 15, x: 0 },
  mouth: 'confident',
  activeParticles: ['impactLines']
};
