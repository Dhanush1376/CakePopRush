import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #21 Proud:
 * Posture straightens (slight rise), eyes closed happily, confident smile, sparkles.
 * "I did it." Not arrogant.
 */
export const proudPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -5, scaleY: 1.02, scaleX: 0.98 },
  leftEyeShape: 'closed',
  rightEyeShape: 'closed',
  mouth: 'openSmile',
  leftArm: { rotate: -150, y: 5, x: 10 },
  rightArm: { rotate: 150, y: 5, x: -10 },
  activeParticles: ['sparkles']
};
