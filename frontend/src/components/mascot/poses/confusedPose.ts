import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const confusedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: -8, scaleY: 0.98, scaleX: 1.02 }, // Head tilt
  leftPupil: { scale: 1, x: -3, y: -2 }, // Looking up sideways
  rightPupil: { scale: 1, x: -3, y: -2 },
  leftEyebrow: { y: -6, x: 0, rotate: 15 }, // One brow up (surprised)
  rightEyebrow: { y: 2, x: 0, rotate: -10 }, // One brow down (confused)
  mouth: 'uncertain',
  activeParticles: ['questionMarks']
};
