import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #13 Cool:
 * Sunglasses accessory, confident smirk, lean back slightly, hand gesture (peace/pointing), sparkle.
 */
export const coolPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: -5, y: -2 },
  mouth: 'confident',
  accessories: {
    sunglasses: true,
    partyHat: false,
    partyBlower: false
  },
  leftArm: { rotate: -140, y: -8, x: -6 },
  rightArm: { rotate: 5, y: 0, x: 0 },
  activeParticles: ['sparkles']
};
