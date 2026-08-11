import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #24 Peeking:
 * Peeking over a surface. Hands gripping edge.
 * Eyes visible, smile.
 */
export const peekingPose: MascotPose = {
  ...defaultPose,
  // Move the whole mascot down as if behind a surface
  body: { ...defaultPose.body, y: 70 },
  leftPupil: { scale: 1, x: 2, y: 0 },
  rightPupil: { scale: 1, x: 2, y: 0 },
  mouth: 'smallSmile',
  // Hands gripping edge
  leftArm: { rotate: -180, y: -25, x: 20 , poseName: 'ledgeGrip', handType: 'grip' },
  rightArm: { rotate: 180, y: -25, x: -20 , poseName: 'ledgeGrip', handType: 'grip' },
};
