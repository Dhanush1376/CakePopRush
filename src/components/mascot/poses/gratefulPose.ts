import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #18 Grateful: closed happy eyes, hands near chest, tiny bow, hearts */
export const gratefulPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: 3, rotate: 3 },
  leftEyeShape: 'closed',
  rightEyeShape: 'closed',
  mouth: 'smallSmile',
  leftArm: { rotate: -150, y: 0, x: 0 , poseName: 'chest', handType: 'round' }, // Clasped near bottom edge
  rightArm: { rotate: 150, y: 0, x: 0 , poseName: 'chest', handType: 'round' },
  activeParticles: ['hearts']
};
