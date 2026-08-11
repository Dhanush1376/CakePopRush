import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Reference #26 Hello / Wave:
 * Notice viewer, pupils center, smile, one arm raised for a wave.
 * "Hi!"
 */
export const helloPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, rotate: -2, y: -1 },
  mouth: 'openSmile',
  leftArm: { rotate: -140, y: 0, x: 0 , poseName: 'relaxedDown', handType: 'round' },
  // Right arm raised high for wave
  rightArm: { rotate: -45, y: -4, x: -2 , poseName: 'waveA', handType: 'open' },
  activeParticles: ['excitementLines']
};
