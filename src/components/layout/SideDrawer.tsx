import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { X, Home, ShoppingBag, Edit3, Package, Heart, Users, Phone, Mail, ChevronDown, ChevronUp, LogIn, LogOut, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import styles from './SideDrawer.module.css'
import { Logo } from '@/assets/brand/Logo'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { useCart } from '@/lib/cartStore'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { MascotRef } from '@/components/mascot/reactions/reactionTypes'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'
import { AuthModal } from '@/components/auth/AuthModal'

let hasMascotAppeared = false;

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { openCart } = useCart()
  const location = useLocation()



  const { tapMascot } = useMascotOrchestrator()
  const mascotRef = useRef<HTMLDivElement>(null)
  const mascotControlRef = useRef<MascotRef>(null)
  
  const handleMascotClick = () => {
    tapMascot()
  }
  const eyeTargetX = useMotionValue(0)
  const eyeTargetY = useMotionValue(0)
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 })
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const arrivalTimer = setTimeout(() => {
        const GREETINGS = ['winking', 'cool', 'silly', 'love', 'blushing', 'party', 'emotionalCute'] as any;
        mascotControlRef.current?.play(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
      }, 950)
      return () => {
        clearTimeout(arrivalTimer)
        document.body.style.overflow = 'unset'
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Update mascot appeared flag after first render
  useEffect(() => {
    if (isOpen && !hasMascotAppeared) {
      const timer = setTimeout(() => {
        hasMascotAppeared = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const mascotInitialY = hasMascotAppeared ? 0 : 150;
  const handInitialY = hasMascotAppeared ? 0 : 20;
  const handInitialOpacity = hasMascotAppeared ? 1 : 0;
  const handInitialScale = hasMascotAppeared ? 1 : 0.8;

  useEffect(() => {
    const handlePointerEvent = (e: PointerEvent) => {
      if (!mascotRef.current) return
      const rect = mascotRef.current.getBoundingClientRect()
      const mascotCenterX = rect.left + rect.width / 2
      const mascotCenterY = rect.top + rect.height / 2

      const x = e.clientX - mascotCenterX
      const y = e.clientY - mascotCenterY
      
      let targetX = (x / 200) * 8
      let targetY = (y / 200) * 8

      const maxR = 8
      const dist = Math.sqrt(targetX * targetX + targetY * targetY)
      if (dist > maxR) {
        targetX = (targetX / dist) * maxR
        targetY = (targetY / dist) * maxR
      }

      eyeTargetX.set(targetX)
      eyeTargetY.set(targetY)
    }

    document.body.addEventListener('pointermove', handlePointerEvent)
    document.body.addEventListener('pointerdown', handlePointerEvent)
    return () => {
      document.body.removeEventListener('pointermove', handlePointerEvent)
      document.body.removeEventListener('pointerdown', handlePointerEvent)
    }
  }, [eyeTargetX, eyeTargetY])

  const mainLinks = [
    { label: 'Home', to: '/', icon: <Home size={20} strokeWidth={1.5} /> },
    { label: 'Shop', to: '/shop', icon: <ShoppingBag size={20} strokeWidth={1.5} /> },
    { label: 'Custom Orders', to: '/custom-orders', icon: <Edit3 size={20} strokeWidth={1.5} /> },
    { label: 'My Orders', to: '/orders', icon: <Package size={20} strokeWidth={1.5} /> },
  ]

  const secondaryLinks = [
    { label: 'About Us', to: '/about', icon: <Users size={20} strokeWidth={1.5} /> },
    { label: 'Contact Us', to: '/contact', icon: <Phone size={20} strokeWidth={1.5} /> },
  ]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className={styles.overlay} 
            onClick={onClose} 
            aria-hidden="true" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          <motion.div 
            className={styles.drawer} 
            role="dialog" 
            aria-modal="true" 
            aria-label="Navigation menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            
            <div className={styles.header}>
          <div className={styles.heroGraphic}>
            <Logo width={90} />
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className={styles.content}>
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {mainLinks.map((link) => (
                <li key={link.label}>
                  <NavLink 
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    <span className={styles.navIcon}>{link.icon}</span>
                    <span className={styles.navLabel}>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <ul className={styles.navList}>
              {secondaryLinks.map((link) => (
                <li key={link.label}>
                  <NavLink 
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    <span className={styles.navIcon}>{link.icon}</span>
                    <span className={styles.navLabel}>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.footer}>
          <div className={styles.mascotWrapper} onClick={handleMascotClick}>
            <motion.div 
              className={styles.mascotHandRight}
              initial={{ y: handInitialY, opacity: handInitialOpacity, scale: handInitialScale }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: hasMascotAppeared ? 0 : 0.3 }}
            />
            <motion.div 
              className={styles.mascotHandLeft}
              initial={{ y: handInitialY, opacity: handInitialOpacity, scale: handInitialScale }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: hasMascotAppeared ? 0 : 0.45 }}
            />
            <motion.div 
              className={styles.mascotContainer} 
              ref={mascotRef}
              initial={{ y: mascotInitialY }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: hasMascotAppeared ? 0 : 0.6 }}
            >
              <CakePopMascot
                  ref={mascotControlRef}
                  size="large"
                  eyeX={eyeSpringX}
                  eyeY={eyeSpringY}
                  hideArms={true}
                /></motion.div>
          </div>
          
          <div className={styles.actionRow}>
            <div className={styles.actionGroup}>
              <NavLink to="/wishlist" className={styles.actionItem} onClick={onClose}>
                <Heart size={20} strokeWidth={1.5} />
                <span>WISHLIST</span>
              </NavLink>
              <button className={styles.actionItem} onClick={() => { if (location.pathname !== '/cart') openCart(); onClose(); }}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span>BAG</span>
              </button>
              {isSignedIn && (
                <NavLink to="/orders" className={styles.actionItem} onClick={onClose}>
                  <User size={20} strokeWidth={1.5} />
                  <span>PROFILE</span>
                </NavLink>
              )}
            </div>
            
            <button 
              className={styles.actionItem} 
              onClick={() => {
                if (isSignedIn) {
                  setIsSignedIn(false)
                } else {
                  setIsAuthModalOpen(true)
                }
              }}
            >
              {isSignedIn ? <LogOut size={20} strokeWidth={1.5} /> : <LogIn size={20} strokeWidth={1.5} />}
              <span>{isSignedIn ? 'SIGN OUT' : 'SIGN IN'}</span>
            </button>
          </div>
          <div className={styles.socialLinks}>
            <a href="tel:+1234567890" className={`${styles.socialLink} ${styles.socialLinkPhone}`} aria-label="Phone">
              <Phone size={16} strokeWidth={1.5} />
            </a>
            <a href="mailto:hello@cakepoprush.com" className={`${styles.socialLink} ${styles.socialLinkMail}`} aria-label="Mail">
              <Mail size={16} strokeWidth={1.5} />
            </a>
            <a href="#" className={`${styles.socialLink} ${styles.socialLinkInsta}`} aria-label="Instagram">
              <InstagramIcon size={16} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </motion.div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSignIn={() => {
          setIsSignedIn(true)
        }} 
      />
      </>
      )}
    </AnimatePresence>,
    document.body
  )
}
