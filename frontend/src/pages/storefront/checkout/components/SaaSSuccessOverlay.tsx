import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SaaSSuccessOverlayProps {
  orderNumber?: string;
  paymentMethod?: 'cod' | 'razorpay';
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const SaaSSuccessOverlay: React.FC<SaaSSuccessOverlayProps> = ({
  orderNumber,
  paymentMethod,
  onClose,
  showCloseButton,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#10B981',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close Preview"
          title="Close Preview"
        >
          <X size={20} />
        </button>
      )}

      {/* Main SaaS Card / Icon Hub */}
      <div style={{ position: 'relative', marginBottom: '28px' }}>
        {/* 1 Single Thin Round Ring - Starts Top Middle, Sweeps Fast, Joins Slowly & Ends */}
        <div
          style={{
            position: 'absolute',
            inset: -12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <svg
            width="134"
            height="134"
            viewBox="0 0 134 134"
            fill="none"
            style={{
              transform: 'scaleX(-1) rotate(-90deg)',
              transformOrigin: 'center',
            }}
          >
            <motion.circle
              cx="67"
              cy="67"
              r="61"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.35,
                delay: 0.15,
                ease: [0.08, 0.82, 0.17, 1],
              }}
            />
          </svg>
        </div>

        {/* Crisp Solid White Check Circle with Slower Spring */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.14, 0.97, 1], rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 18,
            delay: 0.15,
            duration: 0.9,
          }}
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.85)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Animated SVG Path Checkmark - Slower Draw */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10B981"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M4 12L9 17L20 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.85,
                delay: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Centered Main Title Only */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: 'easeOut' }}
        style={{ zIndex: 2 }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#FFFFFF',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.15)',
          }}
        >
          {paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment & Order Confirmed!'}
        </h1>
      </motion.div>
    </motion.div>
  );
};
