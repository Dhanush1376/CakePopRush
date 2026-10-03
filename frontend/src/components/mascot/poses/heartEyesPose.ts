import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

export const heartEyesPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -12, scaleY: 1.05, scaleX: 0.95 }, // Floating up slightly
  leftEyeShape: 'heart',
  rightEyeShape: 'heart',
  mouth: 'openSmile',
  activeParticles: ['hearts']
};
