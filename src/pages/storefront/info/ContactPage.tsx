import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Tag, MessageSquare, Send, ChevronDown, MapPin, Clock, Star } from 'lucide-react';
import styles from './ContactPage.module.css';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

import { FrostingCorner } from '@/pages/storefront/custom-orders/components/FrostingCorner';
import { FrostingSide } from '@/pages/storefront/custom-orders/components/FrostingSide';

const subjectOptions = [
  { value: 'general_inquiry', label: 'General Inquiry' },
  { value: 'bulk_orders', label: 'Bulk Orders' },
  { value: 'feedback', label: 'Feedback' },
];

export const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    rating: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        type: 'success',
        title: 'Message Sent!',
        message: 'We received your message. We will get back to you soon!',
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', rating: 0 });
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <FrostingCorner position="topRight" />
      <FrostingSide 
        color="#07C2BB" 
        style={{ 
          top: '45%', 
          left: 0,
          transform: 'translateY(-50%)'
        }} 
      />
      <div className={styles.contentWrapper}>
        <div className={styles.twoColumnGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.header}>
              <h1 className={styles.title}>Contact Us</h1>
              <p className={styles.subtitle}>
                We'll get back to you soon!
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <User className={styles.inputIcon} size={16} strokeWidth={1.5} />
                  <input
                    type="text"
                    name="name"
                    className={styles.input}
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Mail className={styles.inputIcon} size={16} strokeWidth={1.5} />
                  <input
                    type="email"
                    name="email"
                    className={styles.input}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <Phone className={styles.inputIcon} size={16} strokeWidth={1.5} />
                <input
                  type="tel"
                  name="phone"
                  className={styles.input}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup} ref={dropdownRef}>
                <Tag className={styles.inputIcon} size={16} strokeWidth={1.5} />
                
                <div 
                  className={`${styles.input} ${styles.customSelect} ${!formData.subject ? styles.placeholder : ''} ${isDropdownOpen ? styles.selectOpen : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {formData.subject ? subjectOptions.find(opt => opt.value === formData.subject)?.label : 'SUBJECT'}
                </div>
                
                <ChevronDown 
                  className={`${styles.selectIcon} ${isDropdownOpen ? styles.iconOpen : ''}`} 
                  size={16} 
                  strokeWidth={1.5} 
                />

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {subjectOptions.map(option => (
                      <div
                        key={option.value}
                        className={`${styles.dropdownItem} ${formData.subject === option.value ? styles.selected : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, subject: option.value }));
                          setIsDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.subject === 'feedback' && (
                <div className={`${styles.inputGroup} ${styles.ratingGroupAnimation}`}>
                  <Star className={styles.inputIcon} size={16} strokeWidth={1.5} />
                  <div className={`${styles.input} ${styles.ratingInput}`}>
                    <span className={styles.ratingLabel}>Rate your experience</span>
                    <div className={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`${styles.starIcon} ${(hoverRating || formData.rating) >= star ? styles.starFilled : ''}`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className={`${styles.inputGroup} ${styles.textareaGroup}`}>
                <MessageSquare className={styles.textareaIcon} size={16} strokeWidth={1.5} />
                <textarea
                  name="message"
                  className={styles.textarea}
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  data-gramm="false"
                  required
                ></textarea>
              </div>

              <Button
                type="submit"
                className={styles.submitBtn}
                isLoading={isSubmitting}
                rightIcon={<Send size={15} strokeWidth={1.5} />}
              >
                Send Message
              </Button>
            </form>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.divider}>
              <span>OR CONTACT US DIRECTLY</span>
            </div>

            <div className={styles.mapSection}>
              <h2 className={styles.mapHeading}>Find Us Here</h2>
              {/* TODO: When connected backend we need to be able to update in CMS future course */}
              <div className={styles.cleanMapCard}>
                <MapContainer 
                  center={[18.9674394, 72.8116404]} 
                  zoom={14} 
                  scrollWheelZoom={false}
                  dragging={true}
                  zoomControl={true}
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                >
                  <MapResizer />
                  <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  />
                  <Marker position={[18.9674394, 72.8116404]} />
                </MapContainer>
                
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=18.9674394,72.8116404" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.openMapsBtn}
                  title="Open in Google Maps"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <div className={`${styles.iconCircle} ${styles.pinkCircle}`}>
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>Call Us</h3>
                  <p className={styles.cardText}>+91 98765 43210</p>
                  <p className={styles.cardSubtext}>Mon - Sat, 10AM - 7PM</p>
                </div>
              </div>

              <div className={styles.card}>
                <div className={`${styles.iconCircle} ${styles.yellowCircle}`}>
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>Email Us</h3>
                  <p className={styles.cardText}>hello@cakepoprush.com</p>
                  <p className={styles.cardSubtext}>We reply within 24 hrs</p>
                </div>
              </div>

              <div className={styles.card}>
                <div className={`${styles.iconCircle} ${styles.tealCircle}`}>
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>Visit Us</h3>
                  {/* TODO: When connected backend we need to be able to update in CMS future course */}
                  <p className={styles.cardText}>Cake Pop Rush,</p>
                  <p className={styles.cardSubtext}>Mumbai<br/>India</p>
                </div>
              </div>

              <div className={styles.card}>
                <div className={`${styles.iconCircle} ${styles.purpleCircle}`}>
                  <Clock size={20} strokeWidth={1.5} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>Working Hours</h3>
                  <p className={styles.cardText}>Mon - Sat: 10AM - 7PM</p>
                  <p className={styles.cardSubtext}>Sunday: 11AM - 5PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
