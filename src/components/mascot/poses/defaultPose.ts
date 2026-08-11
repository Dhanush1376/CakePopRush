import { MascotPose } from './types';

export const defaultPose: MascotPose = {
  body: { scaleX: 1, scaleY: 1, y: 0, x: 0, rotate: 0 },
  leftArm: { rotate: 0, y: 0, x: 0 },
  rightArm: { rotate: 0, y: 0, x: 0 },
  leftLeg: { rotate: 0, y: 0 },
  rightLeg: { rotate: 0, y: 0 },
  leftEye: { scaleY: 1, scaleX: 1, y: 0, x: 0 },
  rightEye: { scaleY: 1, scaleX: 1, y: 0, x: 0 },
  leftEyeShape: 'normal',
  rightEyeShape: 'normal',
  leftPupil: { scale: 1, y: 0, x: 0 },
  rightPupil: { scale: 1, y: 0, x: 0 },
  leftEyebrow: { y: 0, x: 0, rotate: 0 },
  rightEyebrow: { y: 0, x: 0, rotate: 0 },
  mouth: 'happy',
  blushOpacity: 0,
  accessories: { sunglasses: false, partyHat: false, partyBlower: false },
  activeParticles: []
};
