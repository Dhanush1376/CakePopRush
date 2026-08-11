import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion';
import { MascotReaction, MascotSize, MascotRef } from './reactions/reactionTypes';
import { SmartMascotState, MascotDirection } from './MascotState';
import { VIEWBOX, BODY, SHADOW } from './config/mascotConfig';
import { MascotBody } from './parts/MascotBody';
import { MascotEyes } from './parts/MascotEyes';
import { MascotEyebrows } from './parts/MascotEyebrows';
import { MascotMouth } from './parts/MascotMouth';
import { MascotCheeks } from './parts/MascotCheeks';
import { MascotArms } from './parts/MascotArms';
import { MascotFrontArms } from './parts/MascotFrontArms';
import { MascotLegs } from './parts/MascotLegs';
import { MascotStick } from './parts/MascotStick';
import { MascotAccessories } from './parts/MascotAccessories';
import { ParticleEffects } from './effects/ParticleEffects';
import styles from './CakePopMascot.module.css';
import { useMascotController } from './useMascotController';

interface CakePopMascotProps {
  reaction?: MascotReaction | null;
  size?: MascotSize;
  showDebug?: boolean;
  showGuides?: boolean;
  speedMultiplier?: number;
  loop?: boolean;
  staticMode?: boolean;  // Disable all idle animation for calibration
  
  // Smart Mascot properties
  smartState?: SmartMascotState;
  direction?: MascotDirection;
  eyeX?: MotionValue<number>;
  eyeY?: MotionValue<number>;
}

const TAP_REACTIONS: MascotReaction[] = ['excited', 'laughing', 'love', 'silly', 'party'];

export const CakePopMascot = forwardRef<MascotRef, CakePopMascotProps>(({
  reaction = null,
  size = 'medium',
  showDebug = false,
  showGuides = false,
  speedMultiplier = 1,
  loop = false,
  staticMode = false,
  smartState,
  direction = 'center',
  eyeX,
  eyeY
}, ref) => {
  const {
    scope,
    play,
    stop,
    reset,
    state,
    currentReaction,
    mouthShape,
    activeParticles,
    accessories,
    observeDirection
  } = useMascotController(speedMultiplier, loop);

  // Map eye motion to subtle torso movement
  // Assuming eyeX ranges roughly -15 to 15 based on tracking logic
  // We use a fallback if eyeX/Y aren't provided
  const defaultEye = useMotionValue(0);
  const actualEyeX = eyeX || defaultEye;
  const actualEyeY = eyeY || defaultEye;
  
  const torsoTranslateX = useTransform(actualEyeX, [-15, 15], [-4, 4]);
  const torsoTranslateY = useTransform(actualEyeY, [-15, 15], [-2, 3]);

  const handleTap = () => {
    if (staticMode || state === 'PLAYING_REACTION') return;
    const randomReaction = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    play(randomReaction);
  };

  useImperativeHandle(ref, () => ({
    play,
    stop,
    reset,
    getState: () => state,
    getCurrentReaction: () => currentReaction
  }));

  useEffect(() => {
    if (staticMode) {
      stop();
      return;
    }
    
    // Legacy reaction prop handling
    if (reaction) {
      play(reaction);
      return;
    }
    
    // Smart Mascot State handling
    if (smartState) {
      switch (smartState) {
        case 'introWink':
          play('winking');
          break;
        case 'leaving':
          play('goodbye');
          break;
        case 'waving':
          play('wave');
          break;
        case 'fastSwipe':
          if (direction !== 'center') observeDirection(direction, true);
          break;
        case 'reacting':
          play('excited');
          break;
        case 'watching':
          if (direction !== 'center') observeDirection(direction);
          break;
        case 'peeking':
          play('peeking');
          break;
        case 'idle':
        case 'returning':
        default:
          reset();
          break;
      }
    } else if (!reaction) {
      reset();
    }
  }, [direction, observeDirection, reaction, smartState, play, reset, staticMode, stop]);

  return (
    <div className={`${styles.mascotContainer} ${styles[size]} ${showDebug ? styles.debug : ''}`}>
      <motion.svg
        ref={scope}
        viewBox={VIEWBOX}
        className={styles.mascotSvg}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleTap}
        style={{ cursor: state === 'IDLE' ? 'pointer' : 'default' }}
      >
        <motion.g id="mascot-root" style={{ originX: `${BODY.cx}px`, originY: '180px' }}>

          {/* 1. Shadow */}
          <motion.ellipse
            id="mascot-shadow"
            cx={SHADOW.cx} cy={SHADOW.cy}
            rx={SHADOW.rx} ry={SHADOW.ry}
            fill="#000000" opacity={SHADOW.opacity}
          />

          {/* 2. Stick (behind body) */}
          <MascotStick />

          {/* 3. Legs (behind body) */}
          <MascotLegs />


          {/* Torso group — body + face move together, plus tracks cursor */}
          <motion.g 
            id="torso-group" 
            style={{ 
              originX: `${BODY.cx}px`, 
              originY: `${BODY.cy}px`,
              x: torsoTranslateX,
              y: torsoTranslateY
            }}
          >
            {/* 4. Arms (behind body, but moves with torso) */}
            <MascotArms />

            {/* 5. Body circle + sprinkles */}
            <MascotBody />

            {/* 6. Face elements (in front of body) */}
            <MascotCheeks />
            <MascotFrontArms />
            <MascotEyes eyeX={actualEyeX} eyeY={actualEyeY} />
            <MascotEyebrows />
            <MascotMouth shape={mouthShape} />

            {/* 7. Accessories */}
            <MascotAccessories
              showSunglasses={accessories.sunglasses}
              showPartyHat={accessories.partyHat}
              showPartyBlower={accessories.partyBlower}
            />
          </motion.g>

          {/* 8. Particles (on top of everything) */}
          <ParticleEffects activeEffects={activeParticles} />

        </motion.g>

        {showDebug && (
          <g id="debug-overlays" pointerEvents="none">
            <circle cx={BODY.cx} cy={BODY.cy} r="3" fill="cyan" opacity="0.8" />
            <text x={BODY.cx + 6} y={BODY.cy + 4} fontSize="8" fill="cyan">body center</text>
            
            {/* Shoulders */}
            <circle cx={95} cy={178} r="3" fill="magenta" opacity="0.8" />
            <text x={95 + 6} y={178 + 4} fontSize="8" fill="magenta">L shoulder</text>
            <circle cx={205} cy={178} r="3" fill="magenta" opacity="0.8" />
            <text x={205 + 6} y={178 + 4} fontSize="8" fill="magenta">R shoulder</text>

            {/* Hips */}
            <circle cx={133} cy={236} r="3" fill="lime" opacity="0.8" />
            <text x={133 + 6} y={236 + 4} fontSize="8" fill="lime">L hip</text>
            <circle cx={167} cy={236} r="3" fill="lime" opacity="0.8" />
            <text x={167 + 6} y={236 + 4} fontSize="8" fill="lime">R hip</text>

            {/* Eyes */}
            <circle cx={115} cy={148} r="2" fill="yellow" opacity="0.8" />
            <circle cx={185} cy={148} r="2" fill="yellow" opacity="0.8" />
          </g>
        )}

        {showGuides && (
          <g id="geometry-guides" pointerEvents="none" opacity="0.4">
            <line x1={BODY.cx} y1="0" x2={BODY.cx} y2="360" stroke="red" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1={BODY.cy} x2="300" y2={BODY.cy} stroke="red" strokeWidth="1" strokeDasharray="4" />
            <circle cx={BODY.cx} cy={BODY.cy} r={BODY.r} fill="none" stroke="blue" strokeWidth="1" strokeDasharray="4" />
          </g>
        )}
      </motion.svg>
    </div>
  );
});

CakePopMascot.displayName = 'CakePopMascot';
