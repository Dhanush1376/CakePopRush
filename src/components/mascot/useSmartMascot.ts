import { useState, useEffect, useRef, RefObject, useCallback } from 'react';
import { useMotionValue, useSpring, useScroll, useMotionValueEvent, animate } from 'framer-motion';
import { SmartMascotState, MascotDirection, INTRO_KEY } from './MascotState';

interface SmartMascotOptions {
  heroRef: RefObject<HTMLElement | null>;
  disableScrollHide?: boolean;
  stayVisible?: boolean;
  startY?: number;
}

export function useSmartMascot({ heroRef, disableScrollHide = false, stayVisible = false, startY = 200 }: SmartMascotOptions) {
  const [state, setState] = useState<SmartMascotState>('hidden');
  const [direction, setDirection] = useState<MascotDirection>('center');
  
  const eyeTargetX = useMotionValue(-8);
  const eyeTargetY = useMotionValue(-6);
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
      
      if (hasShown) {
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
  
  // Track pointer
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    
    const handlePointerMove = (e: PointerEvent) => {
      // If intro is not done, don't interrupt
      if (!introDone.current) return;

      // If hidden or leaving, pop back up only if we are still at the top!
      if ((state === 'hidden' || state === 'leaving') && scrollY.get() < 150) {
        mascotTargetY.set(0);
        setState('idle');
      }
      
      const rect = hero.getBoundingClientRect();
      
      // Calculate cursor position relative to the mascot's approximate physical location
      // Mascot is positioned at the bottom-right (roughly 80% width, 80% height of hero)
      const mascotOriginX = rect.left + rect.width * 0.8;
      const mascotOriginY = rect.top + rect.height * 0.8;
      
      const x = e.clientX - mascotOriginX;
      const y = e.clientY - mascotOriginY;
      
      let targetX = (x / (rect.width / 2)) * 12;
      let targetY = (y / (rect.height / 2)) * 8;
      
      // Mathematically constrain to the eye socket (max radius 8px)
      // scleraR (27) - pupilR (19) = 8px max movement without bleeding
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
      eyeTargetX.set(-8);
      eyeTargetY.set(-6);
    };

    document.body.addEventListener('pointermove', handlePointerMove);
    document.body.addEventListener('pointerdown', handlePointerMove);
    document.body.addEventListener('pointerleave', handlePointerLeave);
    
    return () => {
      document.body.removeEventListener('pointermove', handlePointerMove);
      document.body.removeEventListener('pointerdown', handlePointerMove);
      document.body.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [eyeTargetX, eyeTargetY, heroRef, state, scrollY]);

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
      // Default idle look target (also clamped)
      const idleDist = Math.sqrt((-8)*(-8) + (-6)*(-6)); // 10
      eyeTargetX.set((-8 / idleDist) * maxR);
      eyeTargetY.set((-6 / idleDist) * maxR);
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
