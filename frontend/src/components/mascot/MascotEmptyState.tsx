import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MascotEmptyState.module.css';
import { CakePopMascot } from './CakePopMascot';
import { MascotReaction } from './reactions/reactionTypes';

export interface AlternateMascotState {
  message: string;
  reaction: MascotReaction;
  highlightWord?: string;
  onAction?: () => void;
}

export interface MascotEmptyStateProps {
  message: string;
  reaction?: MascotReaction;
  size?: 'small' | 'medium' | 'large';
  alternateState?: AlternateMascotState;
  overrideMessage?: string;
  overrideReaction?: MascotReaction;
}

export const MascotEmptyState: React.FC<MascotEmptyStateProps> = ({
  message,
  reaction = 'sad',
  size = 'small',
  alternateState,
  overrideMessage,
  overrideReaction
}) => {
  // If a suggestion exists, start immediately on it (index 1) so user sees it right away
  const [activeStateIndex, setActiveStateIndex] = useState(alternateState ? 1 : 0);
  const [typedText, setTypedText] = useState('');
  const isFirstRender = useRef(true);

  // Sync index if suggestion appears or query changes
  useEffect(() => {
    setActiveStateIndex(alternateState ? 1 : 0);
  }, [alternateState?.highlightWord, message]);

  // Alternate between Did You Mean (index 1: 7.5s) and No Treats (index 0: 4.5s)
  useEffect(() => {
    if (!alternateState || overrideMessage) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const scheduleNext = (currentIdx: number) => {
      // Keep Did You Mean visible for a generous 7.5 seconds, and standard message for 4.5 seconds
      const duration = currentIdx === 1 ? 7500 : 4500;
      timer = setTimeout(() => {
        const nextIdx = currentIdx === 1 ? 0 : 1;
        setActiveStateIndex(nextIdx);
        scheduleNext(nextIdx);
      }, duration);
    };

    scheduleNext(activeStateIndex);

    return () => clearTimeout(timer);
  }, [alternateState?.highlightWord, alternateState?.message, message, overrideMessage]);

  const states: Array<{
    message: string;
    reaction: MascotReaction;
    highlightWord?: string;
    onAction?: () => void;
  }> = [
      { message, reaction },
      ...(alternateState ? [alternateState] : [])
    ];

  const currentState = overrideMessage
    ? { message: overrideMessage, reaction: overrideReaction || 'oops', highlightWord: undefined, onAction: undefined }
    : (states[activeStateIndex] || states[0]);

  const currentMessage = currentState.message;
  const currentReaction = currentState.reaction;
  const currentHighlight = currentState.highlightWord;
  const currentAction = currentState.onAction;

  useEffect(() => {
    let index = 0;
    setTypedText('');
    let interval: ReturnType<typeof setInterval>;

    // Start typing right as the mascot and bubble finish entrance on initial render,
    // or fast on reaction transition
    const delay = isFirstRender.current ? 850 : 150;
    isFirstRender.current = false;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (index <= currentMessage.length) {
          setTypedText(currentMessage.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [currentMessage, activeStateIndex]);

  const renderBubbleContent = () => {
    if (!currentHighlight || !typedText.toLowerCase().includes(currentHighlight.toLowerCase())) {
      return typedText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== typedText.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }

    const lowerText = typedText.toLowerCase();
    const lowerHighlight = currentHighlight.toLowerCase();
    const highlightIdx = lowerText.indexOf(lowerHighlight);
    const before = typedText.slice(0, highlightIdx);
    const matched = typedText.slice(highlightIdx, highlightIdx + currentHighlight.length);
    const after = typedText.slice(highlightIdx + currentHighlight.length);

    return (
      <>
        {before}
        <span
          className={styles.highlightAction}
          onClick={(e) => {
            if (currentAction) {
              e.stopPropagation();
              currentAction();
            }
          }}
        >
          {matched}
        </span>
        {after}
      </>
    );
  };

  return (
    <div className={styles.mascotArea}>
      {/* Speech / Thought Bubble (appears after mascot pops up) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStateIndex}
          className={`${styles.speechBubble} ${currentAction ? styles.clickableBubble : ''}`}
          initial={{ scale: 0, opacity: 0, y: 10, rotate: 6, originX: 0.1, originY: 1 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 4 }}
          exit={{ scale: 0.8, opacity: 0, y: 4 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18, delay: isFirstRender.current ? 0.52 : 0.05 }}
          onClick={() => {
            if (currentAction) {
              currentAction();
            }
          }}
          role={currentAction ? 'button' : undefined}
          tabIndex={currentAction ? 0 : undefined}
        >
          {renderBubbleContent()}
        </motion.div>
      </AnimatePresence>

      {/* Mascot Clipped Peeking Container: Pops up from behind the line */}
      <div className={styles.mascotClip}>
        <motion.div
          className={styles.mascotInner}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.1 }}
        >
          <CakePopMascot size={size} reaction={currentReaction} loop={true} hideArms={true} />
        </motion.div>
      </div>

      {/* Hands Gripping the Line: Clipped so they emerge from behind the line */}
      <div className={styles.handsClip}>
        <motion.div
          className={styles.mascotHandRight}
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.28 }}
        />
        <motion.div
          className={styles.mascotHandLeft}
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.38 }}
        />
      </div>

      {/* Horizontal Divider Line */}
      <div className={styles.wallTexture} />
    </div>
  );
};
