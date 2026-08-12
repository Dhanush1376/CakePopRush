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
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes'
import { AuthModal } from '@/components/auth/AuthModal'
import { mockCategories } from '@/mocks/products'

const CATEGORY_COLORS: Record<string, string> = {
  'cake-pops': '#FF4F7B',
  'cupcakes': '#FFB6D0',
  'cookies': '#E8C396',
  'brownies': '#8D3E25',
  'desserts': '#20B2AA',
  'cakes': '#FF9F43',
  'birthday-cakes': '#FF9F43',
  'macarons': '#B892FF',
  'cake-jars': '#FF6B6B',
  'gift-boxes': '#10AC84',
}

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const [isShopExpanded, setIsShopExpanded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { openCart } = useCart()
  const location = useLocation()

  const isCategoryActive = (categoryId: string = 'all') => {
    const searchParams = new URLSearchParams(location.search)
    const currentCategory = searchParams.get('category')
    if (categoryId === 'all') return location.pathname === '/shop' && (!currentCategory || currentCategory === 'all')
    return location.pathname === '/shop' && (currentCategory === categoryId || currentCategory === categoryId.replace('-', ''))
  }



  const mascotRef = useRef<HTMLDivElement>(null)
  const mascotControlRef = useRef<MascotRef>(null)

  const handleMascotClick = () => {
    const TAP_REACTIONS: MascotReaction[] = ['cool', 'blowKiss', 'love', 'excited', 'laughing', 'winking', 'silly', 'party', 'tada', 'happy']
    const random = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)]
    mascotControlRef.current?.play(random)
  }
  const eyeTargetX = useMotionValue(0)
  const eyeTargetY = useMotionValue(0)
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 })
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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
    { label: 'Shop', to: '/shop', icon: <ShoppingBag size={20} strokeWidth={1.5} />, isExpandable: true },
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
                  {link.isExpandable ? (
                    <div className={styles.expandableItem}>
                      <button 
                        className={styles.navLink} 
                        onClick={() => setIsShopExpanded(!isShopExpanded)}
                        style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span className={styles.navIcon}>{link.icon}</span>
                        <span className={styles.navLabel}>{link.label}</span>
                        <motion.span 
                          className={styles.expandIcon}
                          animate={{ rotate: isShopExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {isShopExpanded && (
                          <motion.div 
                            className={styles.categoriesGrid}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            style={{ overflow: 'hidden' }}
                          >
                            {mockCategories.map((cat) => {
                              const isAll = cat.id === 'all'
                              const toPath = isAll ? '/shop' : `/shop?category=${cat.id}`
                              const active = isCategoryActive(cat.id)
                              const color = CATEGORY_COLORS[cat.id] || '#FF4F7B'

                              if (isAll) {
                                return (
                                  <NavLink 
                                    key={cat.id}
                                    to={toPath} 
                                    onClick={onClose} 
                                    className={`${styles.categoryPillAll} ${active ? styles.activeCategory : ''}`}
                                  >
                                    <span className={styles.allCategoryDots}>
                                      <span style={{ background: '#FF4F7B' }} />
                                      <span style={{ background: '#FFB6D0' }} />
                                      <span style={{ background: '#E8C396' }} />
                                      <span style={{ background: '#B892FF' }} />
                                    </span>
                                    <span className={styles.categoryName}>{cat.name}</span>
                                  </NavLink>
                                )
                              }

                              return (
                                <NavLink 
                                  key={cat.id}
                                  to={toPath} 
                                  onClick={onClose} 
                                  className={`${styles.categoryPill} ${active ? styles.activeCategory : ''}`}
                                >
                                  <span className={styles.categoryDot} style={{ background: color }} />
                                  <span className={styles.categoryName}>{cat.name}</span>
                                </NavLink>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <NavLink 
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                    >
                      <span className={styles.navIcon}>{link.icon}</span>
                      <span className={styles.navLabel}>{link.label}</span>
                    </NavLink>
                  )}
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
              initial={{ y: 90 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            />
            <motion.div 
              className={styles.mascotHandLeft}
              initial={{ y: 90 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.45 }}
            />
            <motion.div 
              className={styles.mascotContainer} 
              ref={mascotRef}
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
            >
              <CakePopMascot ref={mascotControlRef} size="large" eyeX={eyeSpringX} eyeY={eyeSpringY} />
            </motion.div>
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
