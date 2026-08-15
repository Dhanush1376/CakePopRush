import { useEffect, useState, useCallback, useRef } from 'react';
import { MascotReaction } from '../reactions/reactionTypes';
import { mascotEmotionController } from './mascotEmotionController';
import { EventKey } from './mascotEventMap';

export const useMascotOrchestrator = () => {
  const [currentReaction, setCurrentReaction] = useState<MascotReaction | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Handle accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    
    // Check if there's already an idle reaction
    const initialIdle = mascotEmotionController.getIdleReaction();
    if (initialIdle) {
      setCurrentReaction(initialIdle);
    }

    // Subscribe to controller updates
    const unsubscribe = mascotEmotionController.subscribe((reaction, message) => {
      setCurrentReaction(reaction);
      
      // Handle message with auto-clear
      if (message) {
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        setCurrentMessage(message);
        
        // Auto-clear message after 3.5s (sync with standard reaction duration)
        messageTimeoutRef.current = setTimeout(() => {
          setCurrentMessage(null);
        }, 3500);
      }
    });

    // Handle visibility changes (stop idle timer when tab is hidden)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        mascotEmotionController.resetIdleTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener('change', listener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const triggerReaction = useCallback((eventKey: EventKey, message?: string) => {
    mascotEmotionController.triggerEvent(eventKey, message);
  }, []);

  const tapMascot = useCallback(() => {
    mascotEmotionController.handleTap();
  }, []);

  return {
    currentReaction,
    currentMessage,
    prefersReducedMotion,
    triggerReaction,
    tapMascot,
  };
};
