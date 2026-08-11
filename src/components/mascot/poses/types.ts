import { MascotMouthShape } from '../parts/MascotMouth';
import { ParticleType } from '../effects/ParticleEffects';

export interface MascotPose {
  body: { scaleX: number; scaleY: number; y: number; x: number; rotate: number };
  leftArm: { rotate: number; y: number; x: number; path?: string; isFront?: boolean; poseName?: string; handType?: string };
  rightArm: { rotate: number; y: number; x: number; path?: string; isFront?: boolean; poseName?: string; handType?: string };
  leftLeg: { rotate: number; y: number; x?: number };
  rightLeg: { rotate: number; y: number; x?: number };
  leftEye: { scaleY: number; scaleX: number; y: number; x: number };
  rightEye: { scaleY: number; scaleX: number; y: number; x: number };
  leftEyeShape: 'normal' | 'closed' | 'squeezed' | 'heart' | 'tired';
  rightEyeShape: 'normal' | 'closed' | 'squeezed' | 'heart' | 'tired';
  leftPupil: { scale: number; y: number; x: number };
  rightPupil: { scale: number; y: number; x: number };
  leftEyebrow: { y: number; x: number; rotate: number };
  rightEyebrow: { y: number; x: number; rotate: number };
  mouth: MascotMouthShape;
  blushOpacity: number;
  accessories: { sunglasses: boolean; partyHat: boolean; partyBlower: boolean };
  activeParticles: ParticleType[];
  faceX?: number;
  faceY?: number;
}
