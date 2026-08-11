import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #11 Confused:
 * Eyes: normal
 * Pupils: slightly off-center (uncertain gaze)
 * Brows: concerned/worried (angled inward-up)
 * Mouth: uncertain (wiggly line)
 * Arms: slightly out/helpless
 * Body: slight tilt
 * Effects: question marks
 */
export const confusedPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: -4 },
  leftPupil: { scale: 1, x: -2, y: -1 },
  rightPupil: { scale: 1, x: 2, y: -1 },
  leftEyebrow: { y: -4, x: 0, rotate: 10 },
  rightEyebrow: { y: -4, x: 0, rotate: -10 },
  mouth: 'uncertain',
  leftArm: { rotate: -20, y: 0, x: -1 , poseName: 'chin', handType: 'round' },
  rightArm: { rotate: 20, y: 0, x: 1 , poseName: 'relaxedDown', handType: 'round' },
  activeParticles: ['questionMarks']
};
