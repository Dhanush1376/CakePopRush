import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/**
 * Laughing Pose — Eyes squeezed tight, body tilted with belly-laugh squash.
 * Distinct from Happy (which uses open eyes + open smile).
 */
export const laughingPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, scaleX: 1.06, scaleY: 0.94, y: 6, rotate: -3 },
  leftEyeShape: 'squeezed',
  rightEyeShape: 'squeezed',
  mouth: 'laugh',
  blushOpacity: 0.2,
};
