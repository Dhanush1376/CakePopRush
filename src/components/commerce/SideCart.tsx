import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SideCart.module.css';
import { useCart } from '@/features/cart';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Price } from './Price';
import { QuantitySelector } from './QuantitySelector';
import { formatCurrency } from '@/lib/formatters/currency';
import { ProductImage } from './ProductImage';
import { CakePopMascot } from '@/components/mascot/CakePopMascot';
import { MascotRef } from '@/components/mascot/reactions/reactionTypes';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';
import { getCartReaction, extractProductTags, CartAction, CartAIContext } from './cartAIReactions';

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

  const [hasAppeared, setHasAppeared] = useState(hasMascotAppeared);

  useEffect(() => {
    if (isCartOpen && !hasMascotAppeared) {
      const timer = setTimeout(() => {
        hasMascotAppeared = true;
        setHasAppeared(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCartOpen) {
      setHasAppeared(true);
    }
  }, [isCartOpen]);

  const mascotInitialY = hasAppeared ? 0 : 150;
  const handInitialY = hasAppeared ? 0 : 20;
  const handInitialOpacity = hasAppeared ? 1 : 0;
  const handInitialScale = hasAppeared ? 1 : 0.8;

  const { currentReaction, currentMessage, playDirectEmotion, setMessage, tapMascot, prefersReducedMotion } = useMascotOrchestrator();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const mascotControlRef = useRef<MascotRef>(null);

  // AI Companion state
  const messageHistoryRef = useRef<string[]>([]);
  const lastMessageTimeRef = useRef<number>(0);
  const MESSAGE_COOLDOWN = 800; // ms between text updates

  // Build context and generate AI message
  const reactWithAI = useCallback((action: CartAction, productName?: string, categoryName?: string, quantity?: number, previousQuantity?: number) => {
    const now = Date.now();
    const timeSinceLast = now - lastMessageTimeRef.current;

    // Collect all categories and tags from cart
    const categories = [...new Set(items.map(i => i.product.categoryName))];
    const cartTags = items.flatMap(i => extractProductTags(i.product.name, i.product.categoryName));
    const sameCategoryCount = categoryName 
      ? items.filter(i => i.product.categoryName.toLowerCase() === categoryName.toLowerCase()).length
      : 0;
    const hasDiscount = productName 
      ? items.some(i => i.product.name === productName && i.product.compareAtPrice && i.product.compareAtPrice > i.product.basePrice)
      : false;

    const context: CartAIContext = {
      action,
      productName,
      categoryName,
      quantity,
      previousQuantity,
      hasDiscount,
      cartSize: items.length,
      totalQuantity: totalItems,
      totalDiscount,
      categories,
      sameCategoryCount,
      productTags: productName && categoryName ? extractProductTags(productName, categoryName) : [],
      cartTags,
    };

    const reactionData = getCartReaction(context, messageHistoryRef.current);

    // Always trigger mascot animation using the dynamically selected emotion
    playDirectEmotion(reactionData.emotion, reactionData.message);

    // Text message respects cooldown (except for critical actions)
    const criticalActions: CartAction[] = ['delete-confirm', 'delete-cancel', 'remove', 'empty'];
    if (timeSinceLast < MESSAGE_COOLDOWN && !criticalActions.includes(action)) {
      return; // Skip text update, animation still plays
    }

    messageHistoryRef.current.push(reactionData.message);
    if (messageHistoryRef.current.length > 8) messageHistoryRef.current.shift();
    lastMessageTimeRef.current = now;
    setMessage(reactionData.message);
  }, [items, totalItems, totalDiscount, playDirectEmotion, setMessage]);

  const eyeTargetX = useMotionValue(0);
  const eyeTargetY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 800, damping: 40 });
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 800, damping: 40 });

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
                reactWithAI('delete-cancel');
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
                                reactWithAI('delete-confirm', item.product.name, item.product.categoryName);
                              } else {
                                const prevQty = item.quantity;
                                if (q > item.quantity) {
                                  reactWithAI('increase', item.product.name, item.product.categoryName, q, prevQty);
                                } else if (q < item.quantity) {
                                  reactWithAI('decrease', item.product.name, item.product.categoryName, q, prevQty);
                                }
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
                              reactWithAI('remove', item.product.name, item.product.categoryName);
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
                <AnimatePresence>
                  {currentMessage && (
                    <motion.div
                      className={styles.speechBubble}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    >
                      <TypingText text={currentMessage} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className={styles.mascotContainer}
                  ref={mascotRef}
                  initial={{ y: mascotInitialY }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  onClick={handleMascotClick}
                >
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
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: hasAppeared ? 0 : 0.2 }}
                />
                <motion.div
                  className={styles.mascotHandRight}
                  initial={{ y: handInitialY, opacity: handInitialOpacity, scale: handInitialScale }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: hasAppeared ? 0 : 0.1 }}
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
