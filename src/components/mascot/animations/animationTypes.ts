import { AnimationSequence } from 'framer-motion';
import { TIMING, EASING, animSpeed } from './animationConstants';

export { TIMING, EASING, animSpeed };

import React from 'react';

import { MascotMouthShape } from '../parts/MascotMouth';
import { ParticleType } from '../effects/ParticleEffects';

// Context interface for sequences
export interface ReactionContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate: any; // from useAnimate
  setMouthShape: React.Dispatch<React.SetStateAction<MascotMouthShape>>;
  setActiveParticles: React.Dispatch<React.SetStateAction<ParticleType[]>>;
  setAccessories: React.Dispatch<React.SetStateAction<{ sunglasses: boolean; partyHat: boolean; partyBlower: boolean }>>;
  speedMultiplier: number;
  prefersReducedMotion: boolean;
}

export const getCanonicalResetSequence = (duration: number = 0.3): AnimationSequence => [
  // Body & Root
  ['#mascot-root', { y: 0, x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, { duration, ease: 'easeOut' }],
  ['#torso-group', { scaleX: 1, scaleY: 1, rotate: 0 }, { duration, ease: 'easeOut' }],
  
  // Eyes
  ['#left-eye-container', { y: 0, x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, { duration, ease: 'easeOut' }],
  ['#right-eye-container', { y: 0, x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, { duration, ease: 'easeOut' }],
  ['#left-pupil-group', { scale: 1 }, { duration, ease: 'easeOut' }],
  ['#right-pupil-group', { scale: 1 }, { duration, ease: 'easeOut' }],
  ['#left-eye-normal', { opacity: 1 }, { duration, ease: 'easeOut' }],
  ['#right-eye-normal', { opacity: 1 }, { duration, ease: 'easeOut' }],
  ['#left-eye-closed, #left-eye-squeezed, #left-eye-heart, #left-eye-tired', { opacity: 0 }, { duration, ease: 'easeOut' }],
  ['#right-eye-closed, #right-eye-squeezed, #right-eye-heart, #right-eye-tired', { opacity: 0 }, { duration, ease: 'easeOut' }],
  
  // Eyebrows
  ['#left-eyebrow', { y: 0, x: 0, rotate: 0 }, { duration, ease: 'easeOut' }],
  ['#right-eyebrow', { y: 0, x: 0, rotate: 0 }, { duration, ease: 'easeOut' }],
  
  // Cheeks & Mouth
  ['#left-cheek, #right-cheek', { opacity: 0, scale: 1, x: 0, y: 0 }, { duration, ease: 'easeOut' }],
  ['#mouth', { x: 0, y: 0 }, { duration, ease: 'easeOut' }],
  ['#party-blower', { x: 0, y: 0, scaleX: 0, opacity: 0 }, { duration, ease: 'easeOut' }],
  
  // Arms
  ['#left-arm', { rotate: 0, y: 0, x: 0, opacity: 1 }, { duration, ease: 'easeOut' }],
  ['#right-arm', { rotate: 0, y: 0, x: 0, opacity: 1 }, { duration, ease: 'easeOut' }],
  ['#left-arm-front', { rotate: 0, y: 0, x: 0, opacity: 0 }, { duration, ease: 'easeOut' }],
  ['#right-arm-front', { rotate: 0, y: 0, x: 0, opacity: 0 }, { duration, ease: 'easeOut' }],
  
  // Legs
  ['#left-leg', { y: 0, x: 0, rotate: 0 }, { duration, ease: 'easeOut' }],
  ['#right-leg', { y: 0, x: 0, rotate: 0 }, { duration, ease: 'easeOut' }],

  // Shadow
  ['#mascot-shadow', { scale: 1, opacity: 0.08 }, { duration, ease: 'easeOut' }]
];
