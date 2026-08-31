import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Mail, Phone, ChevronRight, User, Heart, ClipboardList, Package, CheckCircle2, Truck, PackageCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes'
import { useSmartMascot } from '@/components/mascot/useSmartMascot'
import { FrostingCorner } from '@/pages/storefront/custom-orders/components/FrostingCorner'
import styles from '@/pages/storefront/profile/ProfilePage.module.css'

let hasMascotAppeared = false;

const phrases = [
  "Hi there!",
  "Welcome back, Chocolate Explorer!",
  "Taste Profile: Sweet Tooth 🍫",
  "How was your day?",
  "Life is better with sprinkles!",
  "Your wishlist is looking sweet!"
]

const TypingText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = React.useState('');
  React.useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [text]);
  return <>{displayed}</>;
};

const AnimatedSpeechBubble = ({ delay }: { delay: number }) => {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, 7500)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div 
      className={styles.speechBubble}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          <TypingText text={phrases[index]} />
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}

const ProfileHeader = () => (
  <header className={styles.header}>
    <h1 className={styles.pageTitle}>Profile</h1>
  </header>
);

const ProfileCard = ({ onEditProfile }: { onEditProfile?: () => void }) => (
  <div className={styles.card}>
    <motion.div
      className={styles.mascotHandRight}
      initial={{ y: 20, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
    />
    <motion.div
      className={styles.mascotHandLeft}
      initial={{ y: 20, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.45 }}
    />
    <div className={styles.profileHeader}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatarPlaceholder}>
          <User size={36} strokeWidth={1.5} />
        </div>
        <button className={styles.editButton} aria-label="Edit Profile" onClick={onEditProfile}>
          <Pencil size={14} />
        </button>
      </div>
      <div className={styles.userInfo}>
        <div className={styles.userNameRow}>
          <h2>Hey!&nbsp;<span className={styles.highlightName}>Guest!</span></h2>
          <div className={styles.chevronRightWrapper}>
            <ChevronRight size={18} className={styles.chevronRight} strokeWidth={2.5} />
          </div>
        </div>
        <p className={styles.quote}>Life is better with something sweet! <Heart size={16} fill="currentColor" strokeWidth={0} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--color-brand-pink)' }} /></p>
        <div className={styles.contactInfo}>
          <div className={styles.contactRow}>
            <Mail size={12} />
            <span>cakepoprush@example.com</span>
          </div>
          <div className={styles.contactRow}>
            <Phone size={12} />
            <span>+91 98765 43210</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const OrdersSection = () => {
  const navigate = useNavigate()

  const items = [
    { label: 'All Orders', icon: <ClipboardList size={20} />, iconClass: styles.orderIcon1, tab: 'all' },
    { label: 'Pending', icon: <Package size={20} />, iconClass: styles.orderIcon2, tab: 'pending' },
    { label: 'Confirmed', icon: <CheckCircle2 size={20} />, iconClass: styles.orderIcon3, tab: 'confirmed' },
    { label: 'Shipped', icon: <Truck size={20} />, iconClass: styles.orderIcon4, tab: 'shipped' },
    { label: 'Delivered', icon: <PackageCheck size={20} />, iconClass: styles.orderIcon5, tab: 'delivered' },
  ]

  return (
    <section>
      <div className={styles.sectionTitleRow}>
        <h3 className={styles.sectionTitle}>My Orders</h3>
        <Link to="/orders" className={styles.viewAllLink}>View All <ChevronRight size={14} /></Link>
      </div>
      <div className={styles.ordersGrid}>
        <div className={styles.ordersIconRow}>
          {items.map((item, index) => (
            <div
              key={index}
              className={styles.orderItem}
              onClick={() => navigate('/orders')}
              style={{ cursor: 'pointer' }}
            >
              <div className={`${styles.orderIconWrapper} ${item.iconClass}`}>
                {item.icon}
              </div>
              <span className={styles.orderLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const ProfileLayout = ({ children, isMobileStandalone = false, onEditProfile }: { children: React.ReactNode, isMobileStandalone?: boolean, onEditProfile?: () => void }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroRef = React.useRef<HTMLElement>(null);
  const mascotRef = React.useRef<HTMLDivElement>(null);
  const mascotControlRef = React.useRef<MascotRef>(null);

  const handleMascotClick = () => {
    const TAP_REACTIONS: MascotReaction[] = ['cool', 'blowKiss', 'love', 'excited', 'laughing', 'winking', 'silly', 'party'];
    const random = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    mascotControlRef.current?.play(random);
  };

  React.useEffect(() => {
    if (!hasMascotAppeared) {
      hasMascotAppeared = true;
      const arrivalTimer = setTimeout(() => {
        const GREETINGS = ['winking', 'cool', 'silly', 'love', 'blushing', 'party', 'emotionalCute'] as MascotReaction[];
        mascotControlRef.current?.play(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      }, 1000);
      return () => clearTimeout(arrivalTimer);
    }
  }, []);

  const mascotInitialY = hasMascotAppeared ? 0 : 120;
  const mascotInitialOpacity = hasMascotAppeared ? 1 : 0;
  const mascotProps = useSmartMascot({ heroRef, mascotRef, disableScrollHide: true, stayVisible: true, startY: 0 });

  if (!isDesktop && isMobileStandalone) {
    return <>{children}</>;
  }

  return (
    <div className={styles.pageContainer} ref={heroRef as React.RefObject<HTMLDivElement>}>
      <FrostingCorner position="topLeft" />
      <FrostingCorner position="bottomRight" />
      <div className={styles.contentWrapper}>
        <ProfileHeader />
        <div className={styles.desktopGrid}>
          <div className={styles.leftCol}>
            <div className={styles.mascotContainer}>
              <AnimatedSpeechBubble delay={hasMascotAppeared ? 0 : 0.6} />
              <motion.div
                ref={mascotRef}
                className={styles.mascotLayer}
                initial={{ y: mascotInitialY, opacity: mascotInitialOpacity }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: hasMascotAppeared ? 0 : 0.6 }}
                onClick={handleMascotClick}
              >
                <CakePopMascot
                  ref={mascotControlRef}
                  size="large"
                  smartState={mascotProps.state}
                  direction={mascotProps.direction}
                  eyeX={mascotProps.eyeX}
                  eyeY={mascotProps.eyeY}
                  hideArms={true}
                />
              </motion.div>
            </div>
            <ProfileCard onEditProfile={onEditProfile} />
            <OrdersSection />
          </div>
          <div className={styles.rightCol}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
