import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Excited Pose — Eyes WIDE open (not squeezed!), sparkle effect, body stretched up tall.
 * Distinct from Happy (calm smile) and Laughing (squeezed eyes, squashed).
 */
export const excitedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -12, scaleY: 1.08, scaleX: 0.94 },
  leftEye: { ...defaultPose.leftEye, scaleY: 1.15, scaleX: 1.15 },
  rightEye: { ...defaultPose.rightEye, scaleY: 1.15, scaleX: 1.15 },
  leftPupil: { scale: 1.1, x: 0, y: 0 },
  rightPupil: { scale: 1.1, x: 0, y: 0 },
  leftEyebrow: { y: -8, x: 0, rotate: 5 },
  rightEyebrow: { y: -8, x: 0, rotate: -5 },
  mouth: 'openSmile',
  activeParticles: ['excitementLines', 'sparkles']
};
