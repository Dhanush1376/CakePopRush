import { MascotPose } from './types';
import { defaultPose } from './defaultPose';
import { ARM_PATHS } from '../primitives/arms';

/**
 * Reference #30 Party:
 * Party hat, party blower, arms celebrate, confetti, happy bounce.
 */
export const partyPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -6, scaleY: 1.02, scaleX: 0.98 },
  mouth: 'blowMouth',
  accessories: {
    sunglasses: false,
    partyHat: true,
    partyBlower: true
  },
  leftArm: { rotate: 0, y: 0, x: -65, path: ARM_PATHS.leftHoldBlower, isFront: true },
  rightArm: { rotate: 0, y: 0, x: 0, path: ARM_PATHS.rightHidden },
  leftLeg: { rotate: 45, y: -20, x: -10 },
  rightLeg: { rotate: -15, y: 0, x: 10 },
  leftPupil: { scale: 1, x: 6, y: -8 },
  rightPupil: { scale: 1, x: 6, y: -8 },
  leftEyebrow: { rotate: 15, y: -6, x: 0 },
  rightEyebrow: { rotate: -15, y: -6, x: 0 },
  activeParticles: ['confetti'],
  faceX: -35
};
