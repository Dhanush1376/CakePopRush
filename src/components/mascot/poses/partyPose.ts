import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const partyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -8, scaleY: 1.05, scaleX: 0.95 }, // Jumping up
  mouth: 'blowMouth',
  accessories: {
    sunglasses: false,
    partyHat: true,
    partyBlower: true
  },
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  leftEyebrow: { rotate: 15, y: -6, x: 0 },
  rightEyebrow: { rotate: -15, y: -6, x: 0 },
  activeParticles: ['confetti'],
};
