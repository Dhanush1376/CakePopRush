import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, MapPin, Mail, Phone, Heart } from 'lucide-react'
import styles from './Footer.module.css'
import { Container } from './Container'
import { Logo } from '@/assets/brand/Logo'
import { InstagramIcon } from '@/components/ui/InstagramIcon'

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.mainGrid}>
          <div className={styles.brandSection}>
            <div className={styles.logoLink}>
              <Logo height={56} className={styles.footerLogo} />
            </div>
            <p className={styles.description}>
              Small bites for your biggest celebrations. We handcraft premium cake pops and desserts that bring a rush of joy to every moment.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="WhatsApp">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div className={styles.linksWrapper}>
            <div className={styles.linkSection}>
              <h3 className={styles.heading}>Shop</h3>
              <ul className={styles.linkList}>
                <li><Link to="/shop?category=cake-pops">Cake Pops</Link></li>
                <li><Link to="/shop?category=cupcakes">Cupcakes</Link></li>
                <li><Link to="/shop?category=cookies">Cookies</Link></li>
                <li><Link to="/custom-orders">Custom Orders</Link></li>
              </ul>
            </div>

            <div className={styles.linkSection}>
              <h3 className={styles.heading}>Company</h3>
              <ul className={styles.linkList}>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h3 className={styles.heading}>Get in Touch</h3>
            <ul className={styles.contactList}>
              <li>
                <div className={styles.contactIconWrapper}>
                  <MapPin size={16} />
                </div>
                <span>123 Sweet Street, Mumbai, India</span>
              </li>
              <li>
                <div className={styles.contactIconWrapper}>
                  <Phone size={16} />
                </div>
                <span>+91 98765 43210</span>
              </li>
              <li>
                <div className={styles.contactIconWrapper}>
                  <Mail size={16} />
                </div>
                <span>hello@cakepoprush.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>&copy; {new Date().getFullYear()} Cake Pop Rush. All rights reserved.</p>
          <p className={styles.madeWithLove}>Handcrafted with <span><Heart size={14} fill="currentColor" strokeWidth={0} style={{ display: 'inline', verticalAlign: 'middle' }} /></span> in India</p>
        </div>
      </Container>
    </footer>
  )
}
