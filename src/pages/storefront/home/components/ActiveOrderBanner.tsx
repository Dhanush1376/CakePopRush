import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Phone, ChevronRight, X, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './ActiveOrderBanner.module.css';

export const ActiveOrderBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'active' | 'delivered'>('active');
  const [ratingState, setRatingState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  const handleRate = (e: React.MouseEvent, star: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (ratingState !== 'idle') return;
    setSelectedStar(star);
    setRatingState('loading');
    setTimeout(() => {
      setRatingState('success');
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => setIsVisible(false), 300);
      }, 1500);
    }, 1000);
  };

  // Simulate order delivery after 12 seconds for demo
  useEffect(() => {
    if (!hasStarted) return;
    const timer = setTimeout(() => {
      setOrderStatus('delivered');
    }, 12000);
    return () => clearTimeout(timer);
  }, [hasStarted]);

  // Using hardcoded data to match the screenshot for now.
  // In a real app, you would fetch the user's active order status here.
  const driverName = "Rahul";
  const driverRating = 4.8;
  const driverPhone = "+91 98765 43210";
  // Fallback dummy tracking link
  const trackingLink = orderStatus === 'active' ? "/orders/CPR-20210" : "/orders/CPR-20210/feedback";

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `tel:${driverPhone.replace(/ /g, '')}`;
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Wait for transition
  };

  if (!isVisible) return null;

  return (
    <div ref={bannerRef} className={`${styles.bannerContainer} ${isClosing ? styles.closing : ''}`}>
      <Link to={trackingLink} className={styles.card}>
        <button 
          className={styles.closeBtn} 
          onClick={handleClose}
          aria-label="Close banner"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        
        {orderStatus === 'active' ? (
          <>
            <div className={styles.topSection}>
              <div className={styles.leftSection}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.driverAvatar}>
                    <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Rahul&backgroundColor=f59e0b" alt="Driver" />
                  </div>
                </div>
                <div className={styles.driverInfo}>
                  <h4 className={styles.title}>
                    <span className={styles.driverName}>{driverName}</span>
                    <span className={styles.deliveryText}> is delivering your order</span>
                  </h4>
                  <div className={styles.detailsRow}>
                    <div className={styles.liveStatus}>
                      <div className={styles.liveDot} />
                      <span className={styles.statusText}>On the way</span>
                    </div>
                    <div className={styles.separator} />
                    <div className={styles.otpContainer}>
                      <span className={styles.otpLabel}>OTP</span>
                      <span className={styles.otpCode}>8294</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Island style sleek progress bar replacing the hr line */}
            <div className={styles.progressContainer}>
              <div className={styles.progressTrack}>
                <div className={`${styles.progressFill} ${hasStarted ? styles.running : ''}`}>
                  <div className={styles.scootyMarker}>
                    <svg viewBox="0 0 40 60" style={{ width: '20px', height: '30px', transform: 'rotate(90deg)', filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))' }}>
                      <rect x="17" y="4" width="6" height="12" fill="#222" rx="3" />
                      <rect x="17" y="44" width="6" height="12" fill="#222" rx="3" />
                      <rect x="11" y="10" width="18" height="38" fill="#EAEAEA" rx="9" />
                      <rect x="13" y="24" width="14" height="14" fill="#333" rx="3" />
                      <path d="M 8 16 Q 20 10 32 16" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
                      <rect x="17" y="10" width="6" height="3" fill="#FFF" rx="1" />
                      <rect x="6" y="38" width="28" height="22" fill="#FFC107" rx="4" stroke="#D97706" strokeWidth="2" />
                      <rect x="9" y="41" width="22" height="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" rx="2" />
                      <rect x="11" y="21" width="18" height="14" fill="#14B8A6" rx="6" />
                      <path d="M 12 25 Q 7 24 8 17" fill="none" stroke="#14B8A6" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M 28 25 Q 33 24 32 17" fill="none" stroke="#14B8A6" strokeWidth="4.5" strokeLinecap="round" />
                      <circle cx="20" cy="24" r="8" fill="#222" />
                      <path d="M 14 23 Q 20 17 26 23" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.estimateInfo}>
                <MapPin size={18} className={styles.mapPin} />
                <span>Estimated delivery:</span>
                <span className={styles.estimateTime}>15–20 mins</span>
              </div>
              <div className={styles.bottomActions}>
                <button 
                  className={styles.callBtn} 
                  onClick={handlePhoneClick}
                  aria-label="Call driver"
                >
                  <Phone size={16} strokeWidth={2.5} />
                </button>
                <div className={styles.trackBtn}>Track order</div>
              </div>
            </div>
          </>
        ) : ratingState === 'success' ? (
          <div className={styles.successState}>
            <CheckCircle2 size={28} color="#10B981" />
            <p>Thank you for your feedback!</p>
          </div>
        ) : (
          <div className={styles.feedbackContainer}>
            <div className={styles.feedbackContent}>
              <h4 className={styles.feedbackTitle}>Rate your last order</h4>
              <div className={styles.horizontalDivider} />
              <div className={styles.starRating}>
                {ratingState === 'loading' ? (
                  <div className={styles.loadingStars}>
                    <Loader2 size={24} className={styles.spinner} color="#F21B5B" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  [1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={28} 
                      className={`${styles.ratingStar} ${(hoveredStar >= star || selectedStar >= star) ? styles.ratingStarFilled : ''}`} 
                      strokeWidth={1.5}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={(e) => handleRate(e, star)}
                    />
                  ))
                )}
              </div>
              <div className={styles.orderSummary}>
                <p className={styles.orderItemPrimary}>
                  White Cake pops <span className={styles.orderItemSecondary}>+ 2 items</span>
                </p>
                <p className={styles.deliveryDate}>Delivered on 30 August 2026</p>
              </div>
            </div>
            <div className={styles.feedbackImage}>
              <img src="/images/Products/White choclate cakepops.jpeg" alt="White Chocolate Cake Pops" />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};
