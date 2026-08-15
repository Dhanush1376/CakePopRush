import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion';
import { MascotReaction, MascotSize, MascotRef } from './reactions/reactionTypes';
import { SmartMascotState, MascotDirection } from './MascotState';
import { VIEWBOX, BODY, SHADOW } from './config/mascotConfig';
import { MascotBody } from './parts/MascotBody';
import { MascotEyes } from './parts/MascotEyes';
import { MascotEyebrows } from './parts/MascotEyebrows';
import { MascotMouth } from './parts/MascotMouth';
import { MascotCheeks } from './parts/MascotCheeks';
import { MascotWallHands } from './parts/MascotWallHands';
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
  hideArms?: boolean;
}

const TAP_REACTIONS: MascotReaction[] = ['cool', 'excited', 'laughing', 'love', 'silly', 'party', 'blowKiss', 'winking'];

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
  eyeY,
  hideArms = false
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
  const rawEyeX = useMotionValue(0);
  const rawEyeY = useMotionValue(0);
  const defaultEyeX = useSpring(rawEyeX, { stiffness: 200, damping: 25 });
  const defaultEyeY = useSpring(rawEyeY, { stiffness: 200, damping: 25 });

  const actualEyeX = eyeX || defaultEyeX;
  const actualEyeY = eyeY || defaultEyeY;

  const enableEyeTracking = false; // Set to true to activate global eye tracking

  useEffect(() => {
    if (eyeX && eyeY) return; // Parent handles tracking
    if (!enableEyeTracking) return; // Feature toggle

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const rect = scope.current?.getBoundingClientRect();
      if (!rect) return;

      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const x = clientX - mascotCenterX;
      const y = clientY - mascotCenterY;

      let targetX = (x / 200) * 3;
      let targetY = (y / 200) * 3;

      const maxR = 3;
      const dist = Math.sqrt(targetX * targetX + targetY * targetY);
      if (dist > maxR) {
        targetX = (targetX / dist) * maxR;
        targetY = (targetY / dist) * maxR;
      }

      rawEyeX.set(targetX);
      rawEyeY.set(targetY);
    };

    const handlePointerLeave = () => {
      rawEyeX.set(0);
      rawEyeY.set(0);
    };

    window.addEventListener('pointermove', handlePointerMove as EventListener);
    window.addEventListener('pointerdown', handlePointerMove as EventListener);
    window.addEventListener('touchmove', handlePointerMove as EventListener, { passive: true });
    window.addEventListener('touchstart', handlePointerMove as EventListener, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove as EventListener);
      window.removeEventListener('pointerdown', handlePointerMove as EventListener);
      window.removeEventListener('touchmove', handlePointerMove as EventListener);
      window.removeEventListener('touchstart', handlePointerMove as EventListener);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [eyeX, eyeY, rawEyeX, rawEyeY, scope, enableEyeTracking]);

  const torsoTranslateX = useTransform(actualEyeX, [-15, 15], [-4, 4]);
  const torsoTranslateY = useTransform(actualEyeY, [-15, 15], [-2, 3]);

  const handleTap = () => {
    if (staticMode) return;
    if (reaction) return; // Don't trigger tap reactions if parent is forcefully controlling it
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
          play('blowKiss');
          break;
        case 'leaving':
          play('winking');
          break;
        case 'waving':
          play('blowKiss');
          break;
        case 'fastSwipe':
          if (direction !== 'center') observeDirection(direction, true);
          break;
        case 'reacting':
          play('blowKiss');
          break;
        case 'watching':
          if (direction !== 'center') observeDirection(direction);
          break;
        case 'peeking':
          play('blowKiss');
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

          {/* 2. Background Particles (Confetti, etc) rendered behind the mascot body */}
          <ParticleEffects activeEffects={activeParticles.filter(p => !['emotionalTearLeft', 'emotionalTearRight', 'emotionalSparkle', 'tears', 'cryingFountainTears', 'kissHeart', 'sleepZ', 'oopsMarks', 'surprisedMarks'].includes(p))} />

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

            {/* 5. Body circle + sprinkles */}
            <MascotBody />

            <MascotCheeks />
            <MascotMouth shape={mouthShape} />
            <MascotEyes eyeX={actualEyeX} eyeY={actualEyeY} />
            <MascotEyebrows />

            {/* 7. Accessories */}
            <MascotAccessories
              showSunglasses={accessories.sunglasses}
              showPartyHat={accessories.partyHat}
              showPartyBlower={accessories.partyBlower}
              showBandage={accessories.bandage}
            />
          </motion.g>

          {/* Foreground Particles (Tears, Kiss Hearts, Zzzs) rendered in front of the mascot face */}
          <ParticleEffects activeEffects={activeParticles.filter(p => ['emotionalTearLeft', 'emotionalTearRight', 'emotionalSparkle', 'tears', 'cryingFountainTears', 'kissHeart', 'sleepZ', 'oopsMarks', 'surprisedMarks'].includes(p))} />

          {/* Wall and Hands (fixed, in front of body) */}
          {!hideArms && <MascotWallHands />}

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


