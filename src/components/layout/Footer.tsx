import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, MapPin, Mail, Phone, Heart, ChevronDown } from 'lucide-react'
import styles from './Footer.module.css'
import { Container } from './Container'
import { Logo } from '@/assets/brand/Logo'
import { InstagramIcon } from '@/components/ui/InstagramIcon'

export const Footer = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    company: false,
    contact: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.confettiBg}>
        {/* Top section (avoiding logo on top left) */}
        <div className={styles.confetti} style={{ top: '10%', left: '75%', backgroundColor: 'var(--color-brand-pink)' }}></div>
        <div className={styles.confettiHeart} style={{ top: '15%', right: '15%', color: '#fca5a5' }}>
          <Heart size={10} fill="currentColor" stroke="none" />
        </div>
        <div className={styles.confetti} style={{ top: '25%', right: '5%', backgroundColor: '#fde68a' }}></div>
        <div className={styles.confetti} style={{ top: '22%', left: '60%', backgroundColor: 'var(--color-brand-turquoise)' }}></div>
        <div className={styles.confettiHeart} style={{ top: '28%', right: '40%', color: 'var(--color-brand-pink)' }}>
          <Heart size={8} fill="currentColor" stroke="none" />
        </div>
        
        {/* Middle section (around accordions) */}
        <div className={styles.confettiHeart} style={{ top: '35%', left: '10%', color: 'var(--color-brand-pink)' }}>
          <Heart size={12} fill="currentColor" stroke="none" />
        </div>
        <div className={styles.confetti} style={{ top: '40%', right: '25%', backgroundColor: 'var(--color-brand-turquoise)' }}></div>
        <div className={styles.confetti} style={{ top: '45%', left: '40%', backgroundColor: '#fde68a' }}></div>
        <div className={styles.confettiHeart} style={{ top: '50%', right: '10%', color: '#fca5a5' }}>
          <Heart size={10} fill="currentColor" stroke="none" />
        </div>
        <div className={styles.confetti} style={{ top: '55%', left: '20%', backgroundColor: 'var(--color-brand-pink)' }}></div>
        <div className={styles.confetti} style={{ top: '60%', right: '35%', backgroundColor: 'var(--color-chocolate)' }}></div>
        <div className={styles.confettiHeart} style={{ top: '65%', left: '80%', color: 'var(--color-brand-pink)' }}>
          <Heart size={8} fill="currentColor" stroke="none" />
        </div>
        <div className={styles.confetti} style={{ top: '70%', left: '15%', backgroundColor: '#fde68a' }}></div>
        <div className={styles.confetti} style={{ top: '75%', right: '50%', backgroundColor: 'var(--color-brand-turquoise)' }}></div>

        {/* Bottom section (around copyright) */}
        <div className={styles.confettiHeart} style={{ top: '80%', right: '10%', color: 'var(--color-brand-pink)' }}>
          <Heart size={10} fill="currentColor" stroke="none" />
        </div>
        <div className={styles.confetti} style={{ top: '85%', left: '5%', backgroundColor: 'var(--color-chocolate)' }}></div>
        <div className={styles.confetti} style={{ top: '88%', right: '5%', backgroundColor: '#fde68a' }}></div>
        <div className={styles.confettiHeart} style={{ top: '92%', left: '10%', color: '#fca5a5' }}>
          <Heart size={12} fill="currentColor" stroke="none" />
        </div>
        <div className={styles.confetti} style={{ top: '95%', right: '10%', backgroundColor: 'var(--color-brand-turquoise)' }}></div>
        <div className={styles.confetti} style={{ top: '90%', left: '5%', backgroundColor: 'var(--color-brand-pink)' }}></div>
      </div>
      <Container>
        <div className={styles.mainContent}>
          <div className={styles.brandSection}>
            <div className={styles.brandHeader}>
              <div className={styles.logoLink}>
                <Logo height={48} className={styles.footerLogo} />
              </div>
              <div className={styles.socialLinks}>
                <a href="#" className={`${styles.socialIcon} ${styles.phoneIcon}`} aria-label="Phone">
                  <Phone size={18} />
                </a>
                <a href="#" className={`${styles.socialIcon} ${styles.mailIcon}`} aria-label="Email">
                  <Mail size={18} />
                </a>
                <a href="#" className={`${styles.socialIcon} ${styles.instaIcon}`} aria-label="Instagram">
                  <InstagramIcon size={18} />
                </a>
              </div>
            </div>
            <p className={styles.description}>
              Small bites, biggest celebrations. Handcrafted premium cake pops bringing joy to every moment.
            </p>
          </div>

          <div className={styles.scallopDivider}></div>

          <div className={styles.accordionSection}>
            <div className={styles.accordionItem}>
              <button 
                className={styles.accordionHeader} 
                onClick={() => toggleSection('shop')}
                aria-expanded={openSections.shop}
              >
                <h3 className={styles.heading}>Shop</h3>
                <ChevronDown size={20} className={`${styles.chevron} ${openSections.shop ? styles.open : ''}`} />
              </button>
              <div className={`${styles.accordionContent} ${openSections.shop ? styles.contentOpen : ''}`}>
                <div className={styles.inlineLinks}>
                  <Link to="/shop?category=cake-pops">Cake Pops</Link>
                  <Link to="/shop?category=cupcakes">Cupcakes</Link>
                  <Link to="/shop?category=cookies">Cookies</Link>
                  <Link to="/custom-orders">Custom Orders</Link>
                </div>
              </div>
            </div>

            <div className={styles.accordionItem}>
              <button 
                className={styles.accordionHeader} 
                onClick={() => toggleSection('company')}
                aria-expanded={openSections.company}
              >
                <h3 className={styles.heading}>Company</h3>
                <ChevronDown size={20} className={`${styles.chevron} ${openSections.company ? styles.open : ''}`} />
              </button>
              <div className={`${styles.accordionContent} ${openSections.company ? styles.contentOpen : ''}`}>
                <div className={styles.inlineLinks}>
                  <Link to="/about">About Us</Link>
                  <Link to="/contact">Contact</Link>
                  <Link to="/faq">FAQ</Link>
                  <Link to="/terms">Terms & Conditions</Link>
                  <Link to="/privacy">Privacy Policy</Link>
                </div>
              </div>
            </div>

            <div className={styles.accordionItem}>
              <button 
                className={styles.accordionHeader} 
                onClick={() => toggleSection('contact')}
                aria-expanded={openSections.contact}
              >
                <h3 className={styles.heading}>Get in Touch</h3>
                <ChevronDown size={20} className={`${styles.chevron} ${openSections.contact ? styles.open : ''}`} />
              </button>
              <div className={`${styles.accordionContent} ${openSections.contact ? styles.contentOpen : ''}`}>
                <ul className={styles.contactList}>
                  <li>
                    <div className={styles.contactIconWrapper}>
                      <MapPin size={14} />
                    </div>
                    <span>Shop No. 5, Pali Hill, Bandra West, Mumbai 400050</span>
                  </li>
                  <li>
                    <div className={styles.contactIconWrapper}>
                      <Phone size={14} />
                    </div>
                    <span>+91 98765 43210</span>
                  </li>
                  <li>
                    <div className={styles.contactIconWrapper}>
                      <Mail size={14} />
                    </div>
                    <span>hello@cakepoprush.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      <div className={styles.bottomSection}>
        <div className={styles.confettiBg}>
          {/* Decorative confetti elements */}
          <div className={styles.confetti} style={{ top: '20%', left: '10%', backgroundColor: 'var(--color-brand-pink)' }}></div>
          <div className={styles.confetti} style={{ top: '60%', left: '15%', backgroundColor: 'var(--color-chocolate)' }}></div>
          <div className={styles.confettiHeart} style={{ top: '40%', left: '25%' }}><Heart size={10} fill="var(--color-brand-pink)" strokeWidth={0} /></div>
          <div className={styles.confetti} style={{ top: '30%', left: '80%', backgroundColor: 'var(--color-chocolate)' }}></div>
          <div className={styles.confetti} style={{ top: '70%', left: '85%', backgroundColor: 'var(--color-brand-turquoise)' }}></div>
          <div className={styles.confettiHeart} style={{ top: '50%', left: '75%' }}><Heart size={12} fill="#ffd1dc" strokeWidth={0} /></div>
          <div className={styles.confetti} style={{ top: '80%', left: '40%', backgroundColor: 'var(--color-brand-turquoise)' }}></div>
          <div className={styles.confetti} style={{ top: '15%', left: '60%', backgroundColor: '#fcd34d' }}></div>
        </div>
        
        <Container>
          <div className={styles.bottomContent}>
            <div className={styles.copyrightText}>
              <p>
                &copy; {new Date().getFullYear()} Cake Pop Rush. <span className={styles.madeWithLove}>Handcrafted with <span><Heart size={14} fill="currentColor" strokeWidth={0} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /></span> in India</span>
              </p>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
