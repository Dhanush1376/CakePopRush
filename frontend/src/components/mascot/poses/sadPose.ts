import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #31 Sad:
 * Extremely droopy, crying gently, sad mouth, concerned brows.
 */
export const sadPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 10, scaleY: 0.92, scaleX: 1.08 }, // Deeply sunk in sadness
  mouth: 'tiredFrown',
  leftEyebrow: { rotate: 20, y: -2, x: 0 },
  rightEyebrow: { rotate: -20, y: -2, x: 0 },
  leftPupil: { scale: 1, x: 0, y: 4 }, // Looking down
  rightPupil: { scale: 1, x: 0, y: 4 },
  activeParticles: ['tears']
};
