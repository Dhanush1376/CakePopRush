import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const coolPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: -8, y: 3, scaleY: 0.97, scaleX: 1.03 }, // Confident lean back and relaxed squash
  mouth: 'confident',
  accessories: {
    sunglasses: true,
    partyHat: false,
    partyBlower: false
  },
  activeParticles: ['sparkles']
};
