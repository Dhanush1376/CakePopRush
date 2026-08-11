import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #29 Clapping:
 * Happy face, hands together (CONTACT), blush.
 */
export const clappingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -2, rotate: -2 },
  mouth: 'openSmile',
  blushOpacity: 0.5,
  // Hands touching in front
  leftArm: { rotate: -150, y: 0, x: 0 , poseName: 'clapInner', handType: 'round' }, // Clasped under body
  rightArm: { rotate: 150, y: 0, x: 0 , poseName: 'clapInner', handType: 'round' },
  activeParticles: ['impactLines']
};
