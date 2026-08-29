import React, { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ShopByCategorySection, BestSellersSection, NewLaunchSection, FestiveOccasionsSection, CustomOrderSection } from './home/HomeSections'
import styles from './home/HomePage.module.css'
import { HomeFrosting } from './home/components/HomeFrosting'

export function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // Momentum tracking
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumId = useRef<number | null>(null);
  const exactScroll = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;

    const scroll = () => {
      // Auto-scroll when not interacting and no momentum is happening
      if (el && !isHovered && !isDragging && Math.abs(velocity.current) < 0.5) {
        // Sync exactScroll with actual scroll if it diverges (e.g., from manual dragging)
        if (Math.abs(exactScroll.current - el.scrollLeft) > 2) {
          exactScroll.current = el.scrollLeft;
        }

        exactScroll.current += 0.4; // Adjusted to closely match the coupon banner speed
        el.scrollLeft = exactScroll.current;

        if (el.scrollLeft >= el.scrollWidth / 2) {
          exactScroll.current = 0;
          el.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isHovered, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (momentumId.current) cancelAnimationFrame(momentumId.current);
    velocity.current = 0;

    setIsDragging(true);
    if (scrollRef.current) {
      dragStartX.current = e.pageX;
      dragScrollLeft.current = scrollRef.current.scrollLeft;
      lastX.current = e.pageX;
      lastTime.current = Date.now();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();

    const x = e.pageX;
    const walk = (x - dragStartX.current) * 1.5;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;

    // Calculate velocity
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      // Distance moved since last check
      const dx = x - lastX.current;
      velocity.current = dx / dt;
    }
    lastX.current = x;
    lastTime.current = now;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);

    // Apply momentum
    if (Math.abs(velocity.current) > 0.1 && scrollRef.current) {
      const applyMomentum = () => {
        if (!scrollRef.current || Math.abs(velocity.current) < 0.1) {
          velocity.current = 0;
          return;
        }

        scrollRef.current.scrollLeft -= velocity.current * 15;
        velocity.current *= 0.92; // Friction multiplier

        // Loop back logic for momentum
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        } else if (scrollRef.current.scrollLeft <= 0) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth / 2;
        }

        momentumId.current = requestAnimationFrame(applyMomentum);
      };
      momentumId.current = requestAnimationFrame(applyMomentum);
    } else {
      velocity.current = 0;
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDragging || Math.abs(velocity.current) > 0.5) {
      e.preventDefault();
    }
  };

  const heroProducts = [
    { src: '/images/Products/Dark choclate cakepops.jpeg', id: 'prod_4', name: 'Dark Chocolate Cake Pops' },
    { src: '/images/Products/Red velvet cookies.jpeg', id: 'prod_8', name: 'Red Velvet Cookies' },
    { src: '/images/Products/Oreo pops.jpeg', id: 'prod_7', name: 'Oreo Pops' },
    { src: '/images/Products/vanilla mango cupcakes.jpeg', id: 'prod_22', name: 'Vanilla Mango Cupcakes' },
    { src: '/images/Products/Chocolate biscoff brownie.jpeg', id: 'prod_2', name: 'Chocolate Biscoff Brownie' }
  ];

  return (
    <div className={styles.homePage}>
      <HomeFrosting position="leftSide" style={{ top: '30%', zIndex: 0 }} />
      <HomeFrosting position="rightSidePink" style={{ top: '105vh', zIndex: 0 }} />
      <HomeFrosting position="rightSide" style={{ top: '40%', zIndex: 0 }} />
      <HomeFrosting position="leftSideBlue" style={{ top: '84%', zIndex: 0 }} />

      <div className={styles.rwdyHero}>
        <div
          className={styles.heroScrollingBackground}
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleMouseUpOrLeave(); }}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
        >
          <div className={styles.scrollingTrack}>
            {/* Repeat the images multiple times for seamless looping on ultra-wide screens */}
            {[...heroProducts, ...heroProducts, ...heroProducts, ...heroProducts].map((product, i) => (
              <Link
                to={`/product/${product.id}`}
                key={i}
                className={styles.imageLink}
                draggable={false}
                onClick={handleLinkClick}
              >
                <img src={product.src} alt="Product" className={styles.scrollingImage} draggable={false} />
                <div className={styles.imageOverlayName}>
                  <span>{product.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.heroGradientOverlay} />
        <Link to="/shop" className={styles.rwdyHeroButtonWrapper}>
          <button className={styles.rwdyHeroButton}>
            <span>ORDER NOW</span>
            <ChevronRight className={styles.buttonArrow} size={16} strokeWidth={2} />
          </button>
        </Link>
      </div>

      {/* Scrolling Offer Banner */}
      <div className={styles.offerBannerContainer}>
        <div className={styles.offerBannerTrack}>
          <span>GET 20% OFF YOUR FIRST ORDER WITH CODE: <strong>RUSH20</strong> • FREE SHIPPING ON ORDERS OVER 250/- • </span>
          <span>GET 20% OFF YOUR FIRST ORDER WITH CODE: <strong>RUSH20</strong> • FREE SHIPPING ON ORDERS OVER 250/- • </span>
          <span>GET 20% OFF YOUR FIRST ORDER WITH CODE: <strong>RUSH20</strong> • FREE SHIPPING ON ORDERS OVER 250/- • </span>
          <span>GET 20% OFF YOUR FIRST ORDER WITH CODE: <strong>RUSH20</strong> • FREE SHIPPING ON ORDERS OVER 250/- • </span>
        </div>
      </div>

      <ShopByCategorySection />
      <NewLaunchSection />
      <FestiveOccasionsSection />
      <BestSellersSection />
      <CustomOrderSection />
    </div>
  )
}
