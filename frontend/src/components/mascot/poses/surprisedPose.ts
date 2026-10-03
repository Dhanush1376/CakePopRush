import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #7 Surprised:
 * Redesigned — no arms, proper eyeball positioning.
 * Eyes widen, pupils SHRINK and stay CENTERED (startled look).
 * Body jumps upward. O-mouth. Question marks above.
 */
export const surprisedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -8, scaleX: 0.96, scaleY: 1.06 },
  leftEye: { ...defaultPose.leftEye, scaleX: 1.08, scaleY: 1.08 },
  rightEye: { ...defaultPose.rightEye, scaleX: 1.08, scaleY: 1.08 },
  leftPupil: { scale: 1, x: 0, y: 0 },
  rightPupil: { scale: 1, x: 0, y: 0 },
  leftEyebrow: { rotate: 5, y: -8, x: 0 },
  rightEyebrow: { rotate: -5, y: -8, x: 0 },
  mouth: 'oMouth',
  activeParticles: ['questionMarks']
};
