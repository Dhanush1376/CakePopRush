import { useState, useEffect, useRef, RefObject, useCallback } from 'react';
import { useMotionValue, useSpring, useScroll, useMotionValueEvent } from 'framer-motion';
import { SmartMascotState, MascotDirection, INTRO_KEY } from './MascotState';

interface SmartMascotOptions {
  heroRef: RefObject<HTMLElement | null>;
  mascotRef?: RefObject<HTMLElement | null>;
  disableScrollHide?: boolean;
  stayVisible?: boolean;
  startY?: number;
}

export function useSmartMascot({ heroRef, mascotRef, disableScrollHide = false, stayVisible = false, startY = 200 }: SmartMascotOptions) {
  const [state, setState] = useState<SmartMascotState>('hidden');
  const [direction, setDirection] = useState<MascotDirection>('center');
  
  const eyeTargetX = useMotionValue(0);
  const eyeTargetY = useMotionValue(0);
  const mascotTargetY = useMotionValue(startY); // Start hidden below the drawer

  const introDone = useRef(false);

  // Springs for smooth tracking
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 });
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 });
  const mascotSpringY = useSpring(mascotTargetY, { stiffness: 100, damping: 20 });

  const isVisible = useRef(false);

  // Intersection Observer for Hero Visibility
  useEffect(() => {
    if (!heroRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1 } // 10% visible
    );
    
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [heroRef]);

  // Phase 1: Intro sequence
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const startIntroSequence = () => {
      const hasShown = sessionStorage.getItem(INTRO_KEY) === 'true';
      
      if (hasShown || stayVisible) {
        introDone.current = true;
        mascotTargetY.set(0); // Pop up immediately
        setState('idle'); // Skip the wink, just be present to observe
        return;
      }
      
      // Sequence: Wait -> Enter -> Wink -> Wait -> Hide
      timeoutId = setTimeout(() => {
        setState('entering');
        mascotTargetY.set(0); // Pop up
        
        timeoutId = setTimeout(() => {
          setState('introWink');
          
          timeoutId = setTimeout(() => {
            sessionStorage.setItem(INTRO_KEY, 'true');
            introDone.current = true;
            
            if (!stayVisible) {
              setState('leaving');
              mascotTargetY.set(200); // Hide again
              
              timeoutId = setTimeout(() => {
                setState('hidden');
              }, 800);
            } else {
              setState('idle');
            }
            
          }, 1500); // Wink duration + pause
          
        }, 600); // Entrance duration
        
      }, 1500); // Initial wait
    };

    startIntroSequence();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Phase 3 & 4: Scroll tracking
  const { scrollY } = useScroll();

  // Phase 2: Eye Tracking Blending
  
  // Track pointer across window (mouse move, clicks, touch taps)
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent | PointerEvent) => {
      // If intro is not done, don't interrupt
      if (!introDone.current) return;

      // If hidden or leaving, pop back up only if we are still at the top!
      if ((state === 'hidden' || state === 'leaving') && scrollY.get() < 150) {
        mascotTargetY.set(0);
        setState('idle');
      }

      const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as PointerEvent).clientY;

      if (clientX === undefined || clientY === undefined) return;
      
      const targetRef = mascotRef?.current || heroRef.current;
      if (!targetRef) return;

      const rect = targetRef.getBoundingClientRect();
      const mascotCenterX = mascotRef?.current
        ? rect.left + rect.width / 2
        : rect.left + rect.width * 0.8;
      const mascotCenterY = mascotRef?.current
        ? rect.top + rect.height / 2
        : rect.top + rect.height * 0.8;
      
      const x = clientX - mascotCenterX;
      const y = clientY - mascotCenterY;
      
      let targetX = (x / 200) * 8;
      let targetY = (y / 200) * 8;
      
      // Mathematically constrain to the eye socket (max radius 8px)
      const maxR = 8;
      const dist = Math.sqrt(targetX * targetX + targetY * targetY);
      if (dist > maxR) {
        targetX = (targetX / dist) * maxR;
        targetY = (targetY / dist) * maxR;
      }
      
      eyeTargetX.set(targetX);
      eyeTargetY.set(targetY);
    };
    
    const handlePointerLeave = () => {
      eyeTargetX.set(0);
      eyeTargetY.set(0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [eyeTargetX, eyeTargetY, heroRef, mascotRef, state, scrollY]);

  // Carousel Callbacks
  const onCarouselSwipe = useCallback((direction: 'left' | 'right', fast = false) => {
    if (!introDone.current) return;

    mascotTargetY.set(0); // Ensure it's popped up
    setState(fast ? 'fastSwipe' : 'watching');
    setDirection(direction);
    // Clamp the fast swipe target to max 8px
    let targetX = direction === 'right' ? 8 : -8;
    let targetY = fast ? -2 : -6;
    const maxR = 8;
    const dist = Math.sqrt(targetX * targetX + targetY * targetY);
    if (dist > maxR) {
      targetX = (targetX / dist) * maxR;
      targetY = (targetY / dist) * maxR;
    }
    
    eyeTargetX.set(targetX);
    eyeTargetY.set(targetY);
    
    setTimeout(() => {
      setState('idle');
      setDirection('center');
      eyeTargetX.set(0);
      eyeTargetY.set(0);
    }, fast ? 950 : 600);
  }, [eyeTargetX, eyeTargetY, mascotTargetY]);

  // Phase 3 & 4: Scroll tracking
  const prevScrollY = useRef(0);
  const lastWaveAt = useRef(0);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Only process if intro is done and scroll hide isn't disabled
    if (!introDone.current || disableScrollHide) return;
    
    const diff = latest - prevScrollY.current;
    
    // Ignore tiny fluctuations
    if (Math.abs(diff) < 5) return;
    
    // Scrolling DOWN (leaving hero)
    if (diff > 0 && latest > 150 && state !== 'leaving') {
      setState('leaving');
      eyeTargetY.set(10); // Look down
      
      // Wait for wave, then drop down
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
      leaveTimeout.current = setTimeout(() => {
        mascotTargetY.set(200); // Drop below hero
        eyeTargetY.set(0);
      }, 800);
    } 
    // Scrolling UP (returning to hero)
    else if (diff < 0 && latest < 100 && state === 'leaving') {
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
      
      mascotTargetY.set(0); // Rise back up
      
      const now = Date.now();
      // Wave if cooldown passed (e.g. 5 seconds)
      if (now - lastWaveAt.current > 5000) {
        setState('waving');
        lastWaveAt.current = now;
        
        setTimeout(() => {
          setState('idle');
        }, 1500);
      } else {
        setState('returning');
        setTimeout(() => {
          setState('idle');
        }, 500);
      }
    }
    
    prevScrollY.current = latest;
  });

  return {
    state,
    direction,
    eyeX: eyeSpringX,
    eyeY: eyeSpringY,
    mascotY: mascotSpringY,
    onCarouselSwipe
  };
}
