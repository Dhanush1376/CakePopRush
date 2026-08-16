import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Heart } from 'lucide-react';
import styles from './ShopHero.module.css';
import { Container } from '@/components/layout/Container';

interface ShopHeroProps {
  isHeaderHidden?: boolean;
}

export const ShopHero = ({ isHeaderHidden = false }: ShopHeroProps) => {
  const { scrollY } = useScroll();

  const [heroHeight, setHeroHeight] = useState(700);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      setHeroHeight(heroRef.current.clientHeight);
    }
  }, []);

  // Subtle parallax effects for a premium feel
  const parallaxBg = useTransform(scrollY, [0, 500], [0, 15]);
  const parallaxBalloonsFast = useTransform(scrollY, [0, 500], [0, -40]);
  const parallaxBalloonsSlow = useTransform(scrollY, [0, 500], [0, -20]);

  // Fade darker effect when scrolling
  const fadeOpacity = useTransform(scrollY, [0, 400], [0, 0.4]);

  return (
    <section className={styles.heroSection} ref={heroRef}>
      {/* Main Background Cream (covers everything including under navbar) */}
      <div className={styles.bgCream} />

      <div className={styles.decorationsLayer}>

        {/* Organic Yellow Blob Outline */}
        <div className={styles.organicBlobOutline} />

        {/* Organic Yellow Blob */}
        <div className={styles.organicBlob} />

        {/* Pink Dots */}
        <motion.div className={`${styles.dot} ${styles.dotPink} ${styles.dot1}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className={`${styles.dot} ${styles.dotPink} ${styles.dot3}`} animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
        <motion.div className={`${styles.dot} ${styles.dotPink} ${styles.dot12}`} animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

        {/* Yellow Dots */}
        <motion.div className={`${styles.dot} ${styles.dotYellow} ${styles.dot5}`} animate={{ y: [0, -7, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        <motion.div className={`${styles.dot} ${styles.dotYellow} ${styles.dot6}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
        <motion.div className={`${styles.dot} ${styles.dotYellow} ${styles.dot7}`} animate={{ y: [0, -9, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} />
        <motion.div className={`${styles.dot} ${styles.dotYellow} ${styles.dot13}`} animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Teal Dots */}
        <motion.div className={`${styles.dot} ${styles.dotTeal} ${styles.dot9}`} animate={{ y: [0, -6, 0] }} transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.7 }} />
        <motion.div className={`${styles.dot} ${styles.dotTeal} ${styles.dot10}`} animate={{ y: [0, -8, 0] }} transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut", delay: 1.8 }} />
        <motion.div className={`${styles.dot} ${styles.dotTeal} ${styles.dot11}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
        <motion.div className={`${styles.dot} ${styles.dotTeal} ${styles.dot14}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />

        {/* Top Right Bunting */}
        <motion.div className={styles.buntingContainer} style={{ y: parallaxBg }}>
          <svg viewBox="0 0 300 150" className={styles.buntingSvg}>
            {/* Yellow Flag */}
            <polygon points="30,12.6 80,27.4 55,72.6" fill="var(--hero-yellow-flag)" />
            {/* Teal Flag */}
            <polygon points="120,33.6 170,34.4 145,84" fill="var(--hero-teal)" />
            {/* Pink Flag */}
            <polygon points="210,29.4 260,16.2 235,75" fill="var(--hero-pink)" />
            {/* String (drawn last so it covers the top seams) */}
            <path d="M 0 0 Q 150 70 300 0" fill="none" stroke="var(--hero-string)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Top Left Pink Balloon */}
        <motion.div className={styles.balloonTopLeft} style={{ y: parallaxBalloonsFast }}>
          <svg viewBox="-20 -20 140 240" className={styles.balloonSvg}>
            {/* String */}
            <path d="M 50 100 Q 45 150 20 200" fill="none" stroke="var(--hero-string)" strokeWidth="2" strokeLinecap="round" />
            {/* Balloon Body */}
            <path d="M 50 100 C 15 100 0 50 15 20 C 30 -15 70 -15 85 20 C 100 50 85 100 50 100 Z" fill="var(--hero-pink)" />
            {/* Highlight */}
            <path d="M 25 20 C 15 35 20 60 35 70 C 40 60 35 30 25 20 Z" fill="var(--hero-pink-highlight)" opacity="0.8" />
            {/* Bow */}
            <path d="M 50 100 L 35 110 L 45 115 Z" fill="var(--hero-pink)" stroke="var(--hero-string)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 50 100 L 65 110 L 55 115 Z" fill="var(--hero-pink)" stroke="var(--hero-string)" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Bottom Left Teal Balloon */}
        <motion.div className={styles.balloonBottomLeft} style={{ y: parallaxBalloonsSlow }}>
          <svg viewBox="-20 -20 140 240" className={styles.balloonSvg}>
            {/* String */}
            <path d="M 50 100 Q 55 150 40 200" fill="none" stroke="var(--hero-string)" strokeWidth="2" strokeLinecap="round" />
            {/* Balloon Body */}
            <path d="M 50 100 C 15 100 0 50 15 20 C 30 -15 70 -15 85 20 C 100 50 85 100 50 100 Z" fill="var(--hero-teal)" />
            {/* Highlight */}
            <path d="M 25 20 C 15 35 20 60 35 70 C 40 60 35 30 25 20 Z" fill="var(--hero-teal-highlight)" opacity="0.8" />
            {/* Bow */}
            <path d="M 50 100 L 35 110 L 45 115 Z" fill="var(--hero-teal)" stroke="var(--hero-string)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 50 100 L 65 110 L 55 115 Z" fill="var(--hero-teal)" stroke="var(--hero-string)" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

      <Container className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Shop</h1>
          <p className={styles.subtitle}>
            Your daily dose of deliciousness on a stick! <Heart className={styles.heartIcon} size={14} />
          </p>
        </div>
      </Container>

      {/* Dark overlay that fades in on scroll, covers background and text */}
      <motion.div className={styles.darkOverlay} style={{ opacity: fadeOpacity }} />

      {/* Foreground elements that should not get darker */}
      <div className={styles.foregroundDecorationsLayer}>

        {/* Right Middle Yellow Balloon */}
        <motion.div className={styles.balloonRight}>
          <svg viewBox="-20 -20 140 240" className={styles.balloonSvg}>
            {/* String */}
            <path d="M 50 100 Q 45 150 20 200" fill="none" stroke="var(--hero-string)" strokeWidth="2" strokeLinecap="round" />
            {/* Balloon Body */}
            <path d="M 50 100 C 15 100 0 50 15 20 C 30 -15 70 -15 85 20 C 100 50 85 100 50 100 Z" fill="var(--hero-yellow-balloon)" />
            {/* Highlight */}
            <path d="M 25 20 C 15 35 20 60 35 70 C 40 60 35 30 25 20 Z" fill="var(--hero-yellow-highlight)" opacity="0.8" />
            {/* Bow */}
            <path d="M 50 100 L 35 110 L 45 115 Z" fill="var(--hero-yellow-balloon)" stroke="var(--hero-string)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 50 100 L 65 110 L 55 115 Z" fill="var(--hero-yellow-balloon)" stroke="var(--hero-string)" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

    </section>
  );
};
