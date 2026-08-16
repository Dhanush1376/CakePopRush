import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SideCart.module.css';
import { useCart } from '@/lib/cartStore';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Price } from './Price';
import { QuantitySelector } from './QuantitySelector';
import { formatCurrency } from '@/lib/formatters/currency';
import { ProductImage } from './ProductImage';
import { CakePopMascot } from '@/components/mascot/CakePopMascot';
import { MascotRef, MascotReaction } from '@/components/mascot/reactions/reactionTypes';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';

let hasMascotAppeared = false;

export const SideCart = () => {
  const { isCartOpen, closeCart, items, total, subtotal, totalDiscount, removeItem, updateQuantity, totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/cart' && isCartOpen) {
      closeCart();
    }
  }, [location.pathname, isCartOpen, closeCart]);

  useEffect(() => {
    if (isCartOpen && !hasMascotAppeared) {
      const timer = setTimeout(() => {
        hasMascotAppeared = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  const mascotInitialY = hasMascotAppeared ? 0 : 150;
  const handInitialY = hasMascotAppeared ? 0 : 20;
  const handInitialOpacity = hasMascotAppeared ? 1 : 0;
  const handInitialScale = hasMascotAppeared ? 1 : 0.8;

  const { currentReaction, currentMessage, triggerReaction, tapMascot, prefersReducedMotion } = useMascotOrchestrator();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const mascotControlRef = useRef<MascotRef>(null);

  const eyeTargetX = useMotionValue(0);
  const eyeTargetY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 });
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 });

  // Reaction ref not needed for eye tracking since MascotEyes handles overrides natively

  useEffect(() => {
    const handlePointerEvent = (e: PointerEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const x = e.clientX - mascotCenterX;
      const y = e.clientY - mascotCenterY;

      let targetX = (x / 200) * 8;
      let targetY = (y / 200) * 8;

      const maxR = 8;
      const dist = Math.sqrt(targetX * targetX + targetY * targetY);
      if (dist > maxR) {
        targetX = (targetX / dist) * maxR;
        targetY = (targetY / dist) * maxR;
      }

      eyeTargetX.set(targetX);
      eyeTargetY.set(targetY);
    };

    document.body.addEventListener('pointermove', handlePointerEvent);
    document.body.addEventListener('pointerdown', handlePointerEvent);
    return () => {
      document.body.removeEventListener('pointermove', handlePointerEvent);
      document.body.removeEventListener('pointerdown', handlePointerEvent);
    };
  }, [eyeTargetX, eyeTargetY]);

  const handleMascotClick = () => {
    tapMascot();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isCartOpen, closeCart]);

  // Prevent background scroll when open and trigger arrival blowKiss
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
        const arrivalTimer = setTimeout(() => {
          if (!hasMascotAppeared) {
            const GREETINGS = ['winking', 'cool', 'silly', 'love', 'blushing', 'party', 'emotionalCute'] as any;
            mascotControlRef.current?.play(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
          }
      }, 600);
      return () => {
        clearTimeout(arrivalTimer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/cart');
  };

  if (location.pathname === '/cart') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.div
            className={`${styles.drawer} app-container`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            onClick={() => {
              if (itemToDelete) {
                setItemToDelete(null);
                triggerReaction('cart:item-delete-canceled', 'Yay! Thank you! 🥰');
              }
            }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>
                <ShoppingBag size={22} strokeWidth={2.5} />
                Your Bag <span className={styles.itemCount}>({totalItems})</span>
              </h2>
              <IconButton
                icon={<X size={20} strokeWidth={1.5} />}
                onClick={closeCart}
                aria-label="Close cart"
                variant="ghost"
              />
            </div>

            <div className={styles.content}>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrapper}>
                    <ShoppingBag size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.emptyTitle}>Your bag is empty</h3>
                  <p className={styles.emptyText}>Looks like you haven't added any sweet treats yet.</p>
                  <button
                    className={styles.exploreLink}
                    onClick={() => {
                      closeCart();
                      navigate('/shop');
                    }}
                  >
                    <span>Start Shopping</span>
                    <ArrowRight size={22} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className={styles.cartItem}
                    >
                      <div className={styles.itemImageContainer}>
                        <ProductImage
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.images[0]?.alt || item.product.name}
                          aspectRatio="square"
                        />
                      </div>

                      <div className={styles.itemDetails}>
                        <div className={styles.itemHeader}>
                          <h3 className={styles.itemName}>{item.product.name}</h3>
                        </div>

                        {item.variantName && (
                          <p className={styles.itemVariant}>Variant: {item.variantName}</p>
                        )}

                        <div className={styles.priceRow}>
                          <Price
                            amount={item.product.basePrice}
                            compareAtAmount={item.product.compareAtPrice || Math.round(item.product.basePrice * 1.25)}
                            size="md"
                          />
                        </div>

                        <div className={styles.itemFooter}>
                          <QuantitySelector
                            quantity={item.quantity}
                            onChange={(q) => {
                              if (q === 0) {
                                setItemToDelete(item.id);
                                triggerReaction('cart:item-delete-confirm', "Please noo... 🥺");
                              } else {
                                updateQuantity(item.id, q);
                              }
                            }}
                            min={0}
                            max={99}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {itemToDelete === item.id && (
                          <motion.div
                            className={styles.confirmDeleteLayer}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                              setItemToDelete(null);
                            }}
                          >
                            <Trash2 size={18} color="white" />
                            <span style={{ fontSize: '12px' }}>TAP TO REMOVE</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className={styles.footer}>
                <motion.div
                  className={styles.mascotContainer}
                  ref={mascotRef}
                  initial={{ y: mascotInitialY }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  onClick={handleMascotClick}
                >
                  <AnimatePresence>
                    {currentMessage && (
                      <motion.div
                        className={styles.speechBubble}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      >
                        {currentMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <CakePopMascot 
                    ref={mascotControlRef}
                    size="large" 
                    reaction={currentReaction} 
                    eyeX={eyeSpringX} 
                    eyeY={eyeSpringY} 
                    speedMultiplier={prefersReducedMotion ? 1 : 2} 
                    hideArms={true}
                  />
                </motion.div>
                <motion.div
                  className={styles.mascotHandLeft}
                  initial={{ y: handInitialY, opacity: handInitialOpacity, scale: handInitialScale }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: hasMascotAppeared ? 0 : 0.2 }}
                />
                <motion.div
                  className={styles.mascotHandRight}
                  initial={{ y: handInitialY, opacity: handInitialOpacity, scale: handInitialScale }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: hasMascotAppeared ? 0 : 0.1 }}
                />
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                    <span>Discount</span>
                    <span>- {formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <div>{formatCurrency(total)}</div>
                    <div className={styles.calculatedText}>Calculated at checkout</div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <Button size="sm" variant="outline" className={`${styles.actionBtn} ${styles.viewCartBtn}`} onClick={handleViewCart}>
                    Cart
                  </Button>
                  <Button
                    size="sm"
                    className={styles.actionBtn}
                    variant="primary"
                    onClick={handleCheckout}
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
