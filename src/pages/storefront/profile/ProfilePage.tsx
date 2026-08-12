import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Pencil, Mail, Phone, ChevronRight,
  ClipboardList, Package, CheckCircle2, Truck, PackageCheck,
  User, MapPin, CreditCard, Bell,
  Headphones, Info, FileText, Shield, LogOut, Heart, Gift, Star
} from 'lucide-react'
import styles from './ProfilePage.module.css'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { MyDetailsPage } from './MyDetailsPage'
import { AddressesPage } from './AddressesPage'
import { NotificationsPage } from './NotificationsPage'

const Sprinkles = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '200px', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
    <svg width="100%" height="100%" style={{ position: 'absolute' }}>
      <rect x="10%" y="30%" width="12" height="4" rx="2" fill="#FFC700" transform="rotate(-30 40 40)" opacity="0.5"/>
      <rect x="40%" y="20%" width="12" height="4" rx="2" fill="#FFC700" transform="rotate(45 150 20)" opacity="0.5"/>
      <rect x="60%" y="50%" width="12" height="4" rx="2" fill="#07C2BB" transform="rotate(-20 250 80)" opacity="0.5"/>
      <rect x="85%" y="25%" width="12" height="4" rx="2" fill="#F20D6F" transform="rotate(60 350 30)" opacity="0.2"/>
      <rect x="25%" y="65%" width="12" height="4" rx="2" fill="#07C2BB" transform="rotate(25 100 120)" opacity="0.3"/>
      <rect x="75%" y="75%" width="12" height="4" rx="2" fill="#F20D6F" transform="rotate(-40 300 140)" opacity="0.3"/>
    </svg>
  </div>
)

import { useSmartMascot } from '@/components/mascot/useSmartMascot'
import { motion } from 'framer-motion'

import { AnimatePresence } from 'framer-motion'

const phrases = [
  "Hi there!",
  "Order something sweet!",
  "How was your day?",
  "Explore new collections!",
  "Life is better with sprinkles!"
]

const AnimatedSpeechBubble = () => {
  const [index, React_useState] = React.useState(0)
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      React_useState((prev) => (prev + 1) % phrases.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className={styles.speechBubble}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

const ProfileHeader = () => (
  <header className={styles.header}>
    <h1 className={styles.pageTitle}>
      Profile
      <span className={styles.titleUnderline}>
        <span className={styles.line}></span>
        <span className={styles.dot}></span>
      </span>
    </h1>
  </header>
);

const ProfileCard = () => (
  <div className={styles.card}>
    <div className={styles.mascotHandLeft}></div>
    <div className={styles.mascotHandRight}></div>
    <div className={styles.profileHeader}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatarPlaceholder}>
          <User size={36} strokeWidth={1.5} />
        </div>
        <button className={styles.editButton} aria-label="Edit Profile">
          <Pencil size={14} />
        </button>
      </div>
      <div className={styles.userInfo}>
        <div className={styles.userNameRow}>
          <h2>Hey! {' '}<span className={styles.highlightName}>Guest!</span></h2>
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
              onClick={() => navigate('/orders', { state: { tab: item.tab } })}
              style={{ cursor: 'pointer' }}
            >
              <div className={`${styles.orderIconWrapper} ${item.iconClass}`}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.ordersLabelRow}>
          {items.map((item, index) => (
            <span key={index} className={styles.orderLabel}>{item.label}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

const MenuSection = ({ title, items }: { title: string, items: { icon: React.ReactNode, label: string, to?: string, onClick?: () => void }[] }) => (
  <section>
    <div className={styles.sectionTitleRow}>
      <h3 className={styles.sectionTitle}>{title}</h3>
    </div>
    <div className={styles.menuList}>
      {items.map((item, index) => (
        item.to ? (
          <Link key={index} to={item.to} className={styles.menuItem} style={{ textDecoration: 'none' }}>
            <div className={styles.menuIcon}>{item.icon}</div>
            <span className={styles.menuText}>{item.label}</span>
            <ChevronRight size={18} className={styles.menuChevron} />
          </Link>
        ) : (
          <div key={index} className={styles.menuItem} onClick={item.onClick} style={{ cursor: item.onClick ? 'pointer' : 'default' }}>
            <div className={styles.menuIcon}>{item.icon}</div>
            <span className={styles.menuText}>{item.label}</span>
            <ChevronRight size={18} className={styles.menuChevron} />
          </div>
        )
      ))}
    </div>
  </section>
)

export const ProfilePage = () => {
  const [activeModal, setActiveModal] = React.useState<'details' | 'addresses' | 'notifications' | null>(null)

  const accountItems = [
    { icon: <User size={20} strokeWidth={1.5} />,       label: 'My Details',               onClick: () => setActiveModal('details') },
    { icon: <MapPin size={20} strokeWidth={1.5} />,     label: 'Addresses',                onClick: () => setActiveModal('addresses') },
    { icon: <Bell size={20} strokeWidth={1.5} />,       label: 'Notification Preferences', onClick: () => setActiveModal('notifications') },
  ]
  
  const moreItems = [
    { icon: <Headphones size={20} strokeWidth={1.5} />, label: 'Help & Support' },
    { icon: <Info size={20} strokeWidth={1.5} />, label: 'About CakePopRush' },
    { icon: <FileText size={20} strokeWidth={1.5} />, label: 'Terms & Conditions', to: '/terms' },
    { icon: <Shield size={20} strokeWidth={1.5} />, label: 'Privacy Policy', to: '/privacy' },
  ]

  const heroRef = React.useRef<HTMLElement>(null);
  const mascotControlRef = React.useRef<MascotRef>(null);

  const handleMascotClick = () => {
    const TAP_REACTIONS: MascotReaction[] = ['cool', 'blowKiss', 'love', 'excited', 'laughing', 'winking', 'silly', 'party', 'tada', 'happy'];
    const random = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    mascotControlRef.current?.play(random);
  };

  const mascotProps = useSmartMascot({ heroRef, disableScrollHide: true, stayVisible: true, startY: 0 });

  return (
    <div className={styles.pageContainer} ref={heroRef as any}>
      <Sprinkles />
      
      <div className={styles.contentWrapper}>
        <ProfileHeader />
        
        <div className={styles.desktopGrid}>
          <div className={styles.leftCol}>
            <div className={styles.mascotContainer}>
              <AnimatedSpeechBubble />
              <motion.div className={styles.mascotLayer} style={{ y: mascotProps.mascotY }} onClick={handleMascotClick}>
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
            <ProfileCard />
            <OrdersSection />
          </div>
          
          <div className={styles.rightCol}>
            <MenuSection title="Account" items={accountItems} />
            <MenuSection title="More" items={moreItems} />
            
            <button className={styles.logoutButton}>
              <div className={styles.logoutLeft}>
                <LogOut size={20} strokeWidth={1.5} />
                <span className={styles.logoutText}>Log Out</span>
              </div>
              <ChevronRight size={18} className={styles.logoutChevron} />
            </button>
          </div>
        </div>
      </div>
      
      <ResponsiveModal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)}
        title={activeModal === 'details' ? 'My Details' : activeModal === 'addresses' ? 'Addresses' : activeModal === 'notifications' ? 'Notification Preferences' : ''}
      >
        {activeModal === 'details' && <MyDetailsPage />}
        {activeModal === 'addresses' && <AddressesPage />}
        {activeModal === 'notifications' && <NotificationsPage />}
      </ResponsiveModal>
    </div>
  )
}
