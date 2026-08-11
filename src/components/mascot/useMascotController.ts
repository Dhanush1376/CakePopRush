import { useState, useCallback, useRef, useEffect } from 'react';
import { useAnimate } from 'framer-motion';
import { AnimationSequence } from 'framer-motion';
import { MascotReaction, MascotState } from './reactions/reactionTypes';
import { MascotMouthShape } from './parts/MascotMouth';
import { ParticleType } from './effects/ParticleEffects';
import { startIdle } from './hooks/useMascotIdle';
import { ReactionContext, getCanonicalResetSequence } from './animations/animationTypes';
import { REACTIONS } from './reactions/reactionRegistry';

const getTransitionSequence = () => [
  ['#torso-group', { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 }, { duration: 0.16, ease: 'easeOut' }],
  ['#left-arm, #right-arm', { y: 0, x: 0 }, { duration: 0.16, ease: 'easeOut' }],
  ['#left-leg, #right-leg', { y: 0, x: 0, rotate: 0 }, { duration: 0.16, ease: 'easeOut' }],
  ['#mascot-shadow', { scaleX: 1, scaleY: 1, opacity: 0.08 }, { duration: 0.16, ease: 'easeOut' }]
] as AnimationSequence;

export const useMascotController = (speedMultiplier: number = 1, loop: boolean = false) => {
  const [scope, animate] = useAnimate();
  
  const [state, setState] = useState<MascotState>('IDLE');
  const [currentReaction, setCurrentReaction] = useState<MascotReaction | null>(null);
  const [mouthShape, setMouthShape] = useState<MascotMouthShape>('neutral');
  const [activeParticles, setActiveParticles] = useState<ParticleType[]>([]);
  const [accessories, setAccessories] = useState({
    sunglasses: false,
    partyHat: false,
    partyBlower: false
  });

  const prefersReducedMotion = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playRef = useRef<((reaction: MascotReaction) => Promise<void>) | null>(null);
  const stateRef = useRef<MascotState>('IDLE');
  const currentReactionRef = useRef<MascotReaction | null>(null);

  useEffect(() => {
    stateRef.current = state;
    currentReactionRef.current = currentReaction;
  }, [currentReaction, state]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    const listener = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);


  const playIdle = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const ac = new AbortController();
    abortControllerRef.current = ac;

    const ctx: ReactionContext = {
      animate,
      setMouthShape,
      setActiveParticles,
      setAccessories,
      speedMultiplier,
      prefersReducedMotion: prefersReducedMotion.current
    };

    startIdle(ctx, ac.signal);
  }, [animate, speedMultiplier]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(async () => {
    stop();
    setState('IDLE');
    setCurrentReaction(null);
    setMouthShape('neutral');
    setActiveParticles([]);
    setAccessories({ sunglasses: false, partyHat: false, partyBlower: false });
    
    const ac = new AbortController();
    abortControllerRef.current = ac;
    
    if (scope.current) {
      try {
        await animate(getCanonicalResetSequence());
      } catch {
        // Animation reset failed/aborted
      }
      if (!ac.signal.aborted) {
        playIdle();
      }
    }
  }, [animate, playIdle, scope, stop]);

  const observeDirection = useCallback(async (direction: 'left' | 'right', fast = false) => {
    if (!scope.current || stateRef.current === 'PLAYING_REACTION') return;

    const sign = direction === 'right' ? 1 : -1;
    const ac = abortControllerRef.current;

    setMouthShape(fast ? 'oMouth' : 'smallSmile');

    try {
      if (fast) {
        await animate([
          ['#left-eye-container, #right-eye-container', { scaleX: 1.1, scaleY: 1.1 }, { duration: 0.08 }],
          ['#left-pupil-group, #right-pupil-group', { scale: 0.85 }, { duration: 0.08 }],
          ['#left-eyebrow, #right-eyebrow', { y: -7, x: 2 * sign }, { duration: 0.1 }],
          ['#torso-group', { x: -4 * sign, rotate: -4 * sign }, { duration: 0.16, ease: 'easeOut' }],
          ['#left-leg', { rotate: -5 * sign, x: -1 * sign }, { duration: 0.16, ease: 'easeOut' }],
          ['#right-leg', { rotate: 5 * sign, x: 1 * sign }, { duration: 0.16, ease: 'easeOut' }]
        ]);
        if (ac?.signal.aborted) return;
        await animate([
          ['#left-eye-container, #right-eye-container', { scaleX: 1, scaleY: 1 }, { duration: 0.18, ease: 'easeOut' }],
          ['#left-pupil-group, #right-pupil-group', { scale: 1 }, { duration: 0.18, ease: 'easeOut' }],
          ['#left-eyebrow, #right-eyebrow', { y: 0, x: 0 }, { duration: 0.18, ease: 'easeOut' }],
          ['#torso-group', { x: 0, rotate: 0 }, { duration: 0.26, ease: 'easeInOut' }],
          ['#left-leg, #right-leg', { rotate: 0, x: 0, y: 0 }, { duration: 0.26, ease: 'easeInOut' }]
        ]);
      } else {
        await animate([
          ['#left-pupil-group, #right-pupil-group', { scale: 1 }, { duration: 0.14, ease: 'easeOut' }],
          ['#left-eyebrow, #right-eyebrow', { x: 1.5 * sign, y: -1 }, { duration: 0.18, ease: 'easeOut' }],
          ['#torso-group', { x: 2 * sign, rotate: 2 * sign }, { duration: 0.22, ease: 'easeInOut' }],
          ['#left-leg', { rotate: -2 * sign, x: -0.5 * sign }, { duration: 0.22, ease: 'easeInOut' }],
          ['#right-leg', { rotate: 2 * sign, x: 0.5 * sign }, { duration: 0.22, ease: 'easeInOut' }]
        ]);
        if (ac?.signal.aborted) return;
        await animate([
          ['#left-eyebrow, #right-eyebrow', { x: 0, y: 0 }, { duration: 0.22, ease: 'easeInOut' }],
          ['#torso-group', { x: 0, rotate: 0 }, { duration: 0.28, ease: 'easeInOut' }],
          ['#left-leg, #right-leg', { rotate: 0, x: 0, y: 0 }, { duration: 0.28, ease: 'easeInOut' }]
        ]);
      }
    } catch {
      // Observation animation was interrupted.
    } finally {
      if (!ac?.signal.aborted) {
        setMouthShape('neutral');
      }
    }
  }, [animate, scope]);

  const play = useCallback(async (reaction: MascotReaction) => {
    if (!scope.current) return;

    const nextDefinition = REACTIONS[reaction];
    const activeDefinition = currentReactionRef.current ? REACTIONS[currentReactionRef.current] : null;

    if (
      stateRef.current === 'PLAYING_REACTION' &&
      activeDefinition &&
      nextDefinition &&
      nextDefinition.priority > activeDefinition.priority
    ) {
      return;
    }
    
    stop();
    
    // Safe transition: abort active timers, then settle the rig before the new intent.
    const ac = new AbortController();
    abortControllerRef.current = ac;

    setState('ENTERING_REACTION');
    setState('PLAYING_REACTION');
    setCurrentReaction(reaction);
    
    setMouthShape('neutral');
    setActiveParticles([]);
    setAccessories({ sunglasses: false, partyHat: false, partyBlower: false });
    
    try {
      await animate(getTransitionSequence());
      await animate(getCanonicalResetSequence());
    } catch {
      // Aborted early
    }

    if (ac.signal.aborted) return;

    const ctx: ReactionContext = {
      animate,
      setMouthShape,
      setActiveParticles,
      setAccessories,
      speedMultiplier,
      prefersReducedMotion: prefersReducedMotion.current
    };

    try {
      if (REACTIONS[reaction] && typeof REACTIONS[reaction].playFn === 'function') {
        await REACTIONS[reaction].playFn(ctx);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch {
      // Interrupted
    }

    if (ac.signal.aborted) return;

    if (loop) {
      setTimeout(() => {
        if (!ac.signal.aborted && playRef.current) playRef.current(reaction);
      }, 500);
    } else {
      reset();
    }

  }, [animate, loop, reset, scope, speedMultiplier, stop]);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  // Start idle on mount or when state returns to IDLE
  useEffect(() => {
    if (state === 'IDLE') {
      playIdle();
    }
    // We do NOT return () => stop() here because play() already calls stop() synchronously.
    // If we return () => stop() here, React will run the cleanup when state changes from IDLE to PLAYING_REACTION,
    // which will abort the NEW animation controller created by play()!
  }, [playIdle, state]);

  // Clean up on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    scope,
    state,
    currentReaction,
    mouthShape,
    activeParticles,
    accessories,
    play,
    observeDirection,
    stop,
    reset,
    getCtx: () => ({ animate, setMouthShape, setActiveParticles, setAccessories, speedMultiplier, prefersReducedMotion: prefersReducedMotion.current })
  };
};
