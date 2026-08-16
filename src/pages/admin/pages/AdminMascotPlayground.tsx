import { useState, useRef, useEffect } from 'react';
import { CakePopMascot } from '../../../components/mascot/CakePopMascot';
import { MascotReaction, MascotSize, MascotRef } from '../../../components/mascot/reactions/reactionTypes';
import { Smile, TriangleAlert, RotateCcw, Play, Dices } from 'lucide-react';
import styles from './AdminMascotPlayground.module.css';

// Import all primitives for testing
import * as P from '../../../components/mascot/primitives';
import { ReactionContext } from '../../../components/mascot/animations/animationTypes';
import { REACTIONS } from '../../../components/mascot/reactions/reactionRegistry';
import { applyPose } from '../../../components/mascot/poses/applyPose';

const REFERENCE_IMAGE_PATH = '/images/mascot-reference-sheet.png';

export const AdminMascotPlayground = () => {
  const mascotRef = useRef<MascotRef>(null);
  
  const [activeReaction, setActiveReaction] = useState<MascotReaction | null>(null);
  const [activePrimitive, setActivePrimitive] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [size, setSize] = useState<MascotSize>('large');

  const [showDebug, setShowDebug] = useState(false);
  const [showForeground, setShowForeground] = useState(false);
  
  // Phase 2 Lab Features
  const [holdTargetPose, setHoldTargetPose] = useState(false);
  const [autoDemo, setAutoDemo] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [refMatchMode, setRefMatchMode] = useState(false);
  const [overlayMode, setOverlayMode] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
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
    setActivePrimitive(primitiveFn.name || 'Custom');
    if (mascotRef.current && 'getCtx' in mascotRef.current) {
      const ctx = (mascotRef.current as MascotRef & { getCtx: () => ReactionContext }).getCtx();
      await primitiveFn(ctx);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><Smile size={28} className={styles.icon} /> Mascot Lab</h1>
          <p className={styles.subtitle}>Test and configure reactions</p>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* Sticky Left Column */}
        <div className={styles.stickyColumn}>
          {/* Stage Card */}
          <div className={`${styles.card} ${styles.stageCard}`}>
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

                <div style={{ transform: 'translateY(15px)', position: 'relative', zIndex: 5 }}>
                  <CakePopMascot
                    ref={mascotRef}
                    size={size}
                    showDebug={showDebug}
                    speedMultiplier={speed}
                    loop={false}
                    staticMode={staticMode}
                    hideArms={true} // As per previous phase for custom paws support
                  />
                </div>

                <div className={styles.wallContainer}>
                  <div className={styles.mascotHandLeft} />
                  <div className={styles.mascotHandRight} />
                </div>

                {showForeground && (
                  <div className={styles.foregroundMask}>
                    <svg viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path d="M 0 50 C 100 100 300 0 400 50 L 400 100 L 0 100 Z" fill="#F6A8C8" />
                    </svg>
                  </div>
                )}
              </div>

              <div className={styles.statusInfo}>
                <div className={styles.statusLine}><strong>Reaction:</strong> {activeReaction && REACTIONS[activeReaction] ? REACTIONS[activeReaction].label : 'None'}</div>
                <div className={styles.statusLine}><strong>Primitive:</strong> {activePrimitive || 'None'}</div>
              </div>
            </div>
            

            
            <div className={styles.controlsGroup}>
              <button onClick={handleReplay} className={styles.btnSecondary}>
                <Play size={16} /> <span>Replay</span>
              </button>
              <button onClick={handleRandom} className={styles.btnSecondary}>
                <Dices size={16} /> <span>Random</span>
              </button>
              <button onClick={handleReset} className={styles.btnPrimary}>
                <RotateCcw size={16} /> <span>Reset Mascot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Right Column */}
        <div className={styles.scrollableColumn}>
          {/* Reactions Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Full Reactions</h2>
            <div className={styles.reactionGrid}>
              {(Object.values(REACTIONS)).map(reaction => (
                <button 
                  key={reaction.id}
                  className={`${styles.reactionBtn} ${activeReaction === reaction.id ? styles.active : ''}`}
                  onClick={() => handlePlay(reaction.id)}
                >
                  {reaction.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primitives Testing Cards */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Rig Tests (Primitives)</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-brown)', marginBottom: 8 }}>EYES</div>
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

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-brown)', marginBottom: 8 }}>BODY</div>
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

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-brown)', marginBottom: 8 }}>FACE</div>
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

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-brown)', marginBottom: 8 }}>EFFECTS</div>
                <div className={styles.buttonGrid}>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnHearts)}>Hearts</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnKissHeart)}>Kiss Heart</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnSparkles)}>Sparkles</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnConfetti)}>Confetti</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnQuestionMarks)}>Question Marks</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnOopsMarks)}>Oops Marks</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnSurprisedMarks)}>Surprised Marks</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnThoughtDots)}>Thought Dots</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnSleepZs)}>Zzz</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnExcitementLines)}>Excitement</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnImpactLines)}>Impact</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnBonkStars)}>Bonk Stars</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnDizzyStars)}>Dizzy Stars</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.spawnFountainTears)}>Waterfall Tears</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(ctx => P.spawnEmotionalTears(ctx, 'sparkle'))}>Emo Sparkle</button>
                  <button className={styles.reactionBtn} onClick={() => runPrimitive(P.clearEffects)}>Clear Effects</button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Configuration</h2>
            <div className={styles.controlsGroup}>
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
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={showDebug} onChange={e => setShowDebug(e.target.checked)} />
                Show Debug Rig
              </label>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={showForeground} onChange={e => setShowForeground(e.target.checked)} />
                Foreground Test
              </label>
              
              <div className={styles.formRow} style={{ marginTop: 8 }}>
                <label>Speed</label>
                <select className={styles.select} value={speed} onChange={e => setSpeed(Number(e.target.value))}>
                  <option value={0.5}>0.5x - Slow</option>
                  <option value={1}>1x - Normal</option>
                  <option value={1.5}>1.5x - Fast</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label>Size</label>
                <select className={styles.select} value={size} onChange={e => setSize(e.target.value as MascotSize)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
