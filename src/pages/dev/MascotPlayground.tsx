import { useState, useRef, useEffect } from 'react';
import { CakePopMascot } from '../../components/mascot/CakePopMascot';
import { MascotReaction, MascotSize, MascotRef } from '../../components/mascot/reactions/reactionTypes';
import { Cake, TriangleAlert } from 'lucide-react';
import styles from './MascotPlayground.module.css';

// Import all primitives for testing
import * as P from '../../components/mascot/primitives';
import { ReactionContext } from '../../components/mascot/animations/animationTypes';
import { REACTIONS } from '../../components/mascot/reactions/reactionRegistry';
import { applyPose } from '../../components/mascot/poses/applyPose';

const REFERENCE_IMAGE_PATH = '/images/mascot-reference-sheet.png';

export const MascotPlayground = () => {
  const mascotRef = useRef<MascotRef>(null);
  
  const [activeReaction, setActiveReaction] = useState<MascotReaction | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [size, setSize] = useState<MascotSize>('large');

  const [showDebug, setShowDebug] = useState(false);
  const [showForeground, setShowForeground] = useState(false);
  
  // Phase 2 Lab Features
  const [holdTargetPose, setHoldTargetPose] = useState(false);
  const [autoDemo, setAutoDemo] = useState(false);
  const [showReference, setShowReference] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reducedMotion, setReducedMotion] = useState(false); // Can be used to preview reduced motion if we pipe it to controller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refMatchMode, setRefMatchMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [overlayMode, setOverlayMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [staticMode, setStaticMode] = useState(false);
  const [refImageError, setRefImageError] = useState(false);

  const handlePlay = async (reaction: MascotReaction) => {
    setActiveReaction(reaction);
    
    if (holdTargetPose) {
      // Direct apply target pose
      mascotRef.current?.stop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = (mascotRef.current as any).getCtx();
      if (REACTIONS[reaction]?.pose) {
        await applyPose(ctx, REACTIONS[reaction].pose);
      } else {
        console.warn(`No pose defined for ${reaction}`);
      }
    } else {
      // Normal animation
      mascotRef.current?.play(reaction);
    }
  };

  // Auto Demo Logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (autoDemo) {
      const keys = Object.keys(REACTIONS) as MascotReaction[];
      let currentIndex = keys.findIndex(k => k === activeReaction);
      if (currentIndex === -1) currentIndex = 0;
      else currentIndex = (currentIndex + 1) % keys.length;
      
      const nextId = keys[currentIndex];
      const duration = REACTIONS[nextId].duration;
      
      timeoutId = setTimeout(() => {
        handlePlay(nextId);
      }, duration + 1000); // Wait for reaction + 1s pause
    }
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemo, activeReaction, holdTargetPose]);

  const handleReset = () => {
    setActiveReaction(null);
    setAutoDemo(false);
    mascotRef.current?.reset();
  };

  const handleRandom = () => {
    const keys = Object.keys(REACTIONS) as MascotReaction[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    handlePlay(randomKey);
  };

  const handleReplay = () => {
    if (activeReaction) {
      handlePlay(activeReaction);
    }
  };

  const runPrimitive = async (primitiveFn: (c: ReactionContext) => void | Promise<void>) => {
    if (mascotRef.current && 'getCtx' in mascotRef.current) {
      const ctx = (mascotRef.current as MascotRef & { getCtx: () => ReactionContext }).getCtx();
      await primitiveFn(ctx);
    }
  };

  return (
    <div className={styles.playground}>
      <header className={styles.header}>
        <h1><Cake size={32} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} /> CakePop Mascot Lab — Phase 2</h1>
        <p>Animation Rig & Motion Primitives Testing</p>
      </header>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          {/* ─── Stage Area ───────────────────────────────── */}
      <div className={styles.stageArea}>
        {showReference && (
          <div className={styles.refPanel}>
            <div className={styles.panelLabel}>REFERENCE SHEET</div>
            {refImageError ? (
              <div className={styles.refPlaceholder}>
                <p><TriangleAlert size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}} /> Reference image not found.</p>
                <p>Save the reference sheet to:</p>
                <code>public/images/mascot-reference-sheet.png</code>
              </div>
            ) : (
              <img
                src={REFERENCE_IMAGE_PATH}
                alt="Reference mascot expression sheet"
                className={styles.refImage}
                onError={() => setRefImageError(true)}
              />
            )}
          </div>
        )}

        <div className={styles.livePanel}>
          <div className={`${styles.stage} ${refMatchMode ? styles.stageCalibration : ''}`}>
            {showForeground && <div className={styles.stageBackground} />}

            {/* Overlay: reference image behind/on top of SVG */}
            {refMatchMode && overlayMode && !refImageError && (
              <img
                src={REFERENCE_IMAGE_PATH}
                alt=""
                className={styles.overlayImage}
                style={{ opacity: overlayOpacity / 100 }}
                onError={() => setRefImageError(true)}
              />
            )}

            <CakePopMascot
              ref={mascotRef}
              size={size}
              showDebug={showDebug}
              speedMultiplier={speed}
              loop={false}
              staticMode={staticMode}
            />

            {showForeground && (
              <div className={styles.foregroundMask}>
                <svg viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path d="M 0 50 C 100 100 300 0 400 50 L 400 100 L 0 100 Z" fill="#F6A8C8" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    <div className={styles.rightColumn}>
          {/* ─── Status & Controls ────────────────────────── */}
      <div className={styles.statusPanel}>
        <div className={styles.statusInfo}>
          <div><strong>Current:</strong> {activeReaction && REACTIONS[activeReaction] ? REACTIONS[activeReaction].label : 'None'}</div>
          {/* Status omitted because ref shouldn't be accessed during render */}
        </div>

        <div className={styles.controlsGroup}>
          <button onClick={handleReplay} className={styles.actionBtn}>REPLAY</button>
          <button onClick={handleRandom} className={styles.actionBtn}>RANDOM</button>
          <button onClick={handleReset} className={styles.resetBtn}>RESET MASCOT</button>
          
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={holdTargetPose} onChange={e => setHoldTargetPose(e.target.checked)} />
            Hold Target Pose
          </label>
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={autoDemo} onChange={e => setAutoDemo(e.target.checked)} />
            Auto Demo
          </label>
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={showReference} onChange={e => setShowReference(e.target.checked)} />
            Show Reference
          </label>
        </div>
        
        <div className={styles.controlsGroup}>
          <label>Speed:</label>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
          </select>

          <label>Size:</label>
          <select value={size} onChange={e => setSize(e.target.value as MascotSize)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          <label><input type="checkbox" checked={showDebug} onChange={e => setShowDebug(e.target.checked)} /> Debug Rig</label>
          <label><input type="checkbox" checked={showForeground} onChange={e => setShowForeground(e.target.checked)} /> Foreground Test</label>
        </div>
      </div>

      {/* ─── 30 Reactions Grid ────────────────────────── */}
      <div className={styles.sectionsContainer}>
        <div className={styles.section}>
          <h2>CAKEPOP MASCOT REACTIONS</h2>
          <div className={styles.reactionGrid}>
            {(Object.values(REACTIONS)).map(reaction => (
              <button 
                key={reaction.id}
                className={`${styles.reactionBtn} ${activeReaction === reaction.id ? styles.active : ''} ${['winking', 'blushing', 'heartEyes', 'tired', 'silly', 'blowKiss', 'cool', 'cryingFountain', 'party', 'sad', 'bonk', 'confused', 'emotionalCute', 'pleadingCute', 'sleeping', 'laughing', 'excited', 'surprised', 'oops', 'yawning', 'love'].includes(reaction.id) ? styles.completed : ''}`}
                onClick={() => handlePlay(reaction.id)}
              >
                {reaction.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Primitives Testing Sections ──────────────── */}
      <div className={styles.sectionsContainer}>
        <details>
          <summary className={styles.summaryTitle}>Rig Tests (Primitives)</summary>
        <div className={styles.section}>
          <h2>EYES</h2>
          <div className={styles.buttonGrid}>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.blink)}>Blink</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.doubleBlink)}>Double Blink</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.winkLeft)}>Wink Left</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.winkRight)}>Wink Right</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lookLeft)}>Look Left</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lookRight)}>Look Right</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lookUp)}>Look Up</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lookDown)}>Look Down</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lookAround)}>Look Around</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.eyesWide)}>Eyes Wide</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.eyesSleepy)}>Sleepy</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.eyesClosed)}>Closed</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.resetEyes)}>Reset Eyes</button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>BODY</h2>
          <div className={styles.buttonGrid}>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.tinyBounce)}>Tiny Bounce</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.bounce)}>Bounce</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.smallHop)}>Hop</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.squash)}>Squash</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.stretch)}>Stretch</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.tiltLeft)}>Tilt Left</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.tiltRight)}>Tilt Right</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.wiggle)}>Wiggle</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.startle)}>Startle</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.bodyRise)}>Rise</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.bodyLower)}>Lower</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.settle)}>Settle (Reset)</button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>ARMS</h2>
          <div className={styles.buttonGrid}>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.openArms)}>Open Arms</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.raiseLeftArm)}>Raise Left</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.raiseRightArm)}>Raise Right</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.waveLeft)}>Wave Left</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.waveRight)}>Wave Right</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.handsToCheeks)}>Hands to Cheeks</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.handsToMouth)}>Hands to Mouth</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.handsToChest)}>Hands to Chest</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.thinkingHand)}>Thinking Hand</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.shrugArms)}>Shrug</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.clapOnce)}>Clap</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lowerArms)}>Reset Arms</button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>FACE</h2>
          <div className={styles.buttonGrid}>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.showBlush)}>Blush On</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.hideBlush)}>Blush Off</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(ctx => P.setMouth(ctx, 'happy'))}>Happy Mouth</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(ctx => P.setMouth(ctx, 'oMouth'))}>O Mouth</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(ctx => P.setMouth(ctx, 'frown'))}>Frown</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(ctx => P.setMouth(ctx, 'tongue'))}>Tongue</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(ctx => P.setMouth(ctx, 'neutral'))}>Reset Mouth</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.raiseBrows)}>Raise Brows</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.lowerBrows)}>Lower Brows</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.concernBrows)}>Concern Brows</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.determinedBrows)}>Determined Brows</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.resetBrows)}>Reset Brows</button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>EFFECTS</h2>
          <div className={styles.buttonGrid}>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnHearts)}>Hearts</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnSparkles)}>Sparkles</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnConfetti)}>Confetti</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnQuestionMarks)}>Question Marks</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnThoughtDots)}>Thought Dots</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnSleepZs)}>Zzz</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnExcitementLines)}>Excitement</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnImpactLines)}>Impact</button>
            <button className={styles.reactionBtn} onClick={() => runPrimitive(P.clearEffects)}>Clear Effects</button>
          </div>
        </div>

          </details>
        </div>
      </div>
    </div>
  </div>
  );
};
