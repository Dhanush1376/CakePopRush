import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #28 Ta-Da!:
 * Arms sweep open, body rises, open happy expression, confetti.
 * "Look what I made!" (Confident, not like shrug)
 */
export const tadaPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -6, scaleX: 0.98, scaleY: 1.02 },
  mouth: 'openSmile',
  // Arms wide and high (confident)
  leftArm: { rotate: -120, y: -4, x: -4 , poseName: 'celebrate', handType: 'open' },
  rightArm: { rotate: 120, y: -4, x: 4 , poseName: 'celebrate', handType: 'open' },
  activeParticles: ['confetti']
};
