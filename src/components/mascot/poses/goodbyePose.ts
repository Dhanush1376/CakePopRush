import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #27 Goodbye:
 * Slower, broader wave. Small body movement away/down. Warm smile.
 * "See you!"
 */
export const goodbyePose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: 2, y: 3 },
  mouth: 'smallSmile',
  // Left arm waving (opposite of Hello) to differentiate, or just lower energy
  leftArm: { rotate: 45, y: -2, x: 0 , poseName: 'waveA', handType: 'open' },
  rightArm: { rotate: 90, y: 0, x: 0 , poseName: 'relaxedDown', handType: 'round' },
  activeParticles: []
};
