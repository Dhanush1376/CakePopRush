import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #10 Thinking:
 * Eyes: normal, looking upward-diagonal (internal processing)
 * Pupils: drifted upward-left
 * Brows: slightly furrowed/neutral (not raised like curious)
 * Mouth: neutral (not smiling — concentrating)
 * Arms: left hand on chin (thinking pose)
 * Body: settled tilt (~-3°, opposite direction from curious)
 * Effects: thought dots
 */
export const thinkingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: -3 },
  leftPupil: { scale: 1, x: -3, y: -5 },
  rightPupil: { scale: 1, x: -3, y: -5 },
  leftEyebrow: { y: -1, x: 0, rotate: -3 },
  rightEyebrow: { y: -1, x: 0, rotate: 3 },
  mouth: 'neutral',
  leftArm: { rotate: -40, y: 0, x: 0 , poseName: 'chin', handType: 'round' }, // Peeks out near cheek
  rightArm: { rotate: 5, y: 0, x: 0 , poseName: 'relaxedDown', handType: 'round' },
  activeParticles: ['thoughtDots']
};
