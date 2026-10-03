import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Banknote } from 'lucide-react';

interface OtpSuccessCelebrationProps {
  orderTotal?: number;
  isCod?: boolean;
}

const CONFETTI_COLORS = [
  '#10B981', // emerald
  '#F59E0B', // amber gold
  '#EC4899', // hot pink
  '#06B6D4', // cyan
  '#8B5CF6', // purple
  '#3B82F6', // blue
  '#F97316', // orange
];

// 20 confetti particles bursting outward
const PARTICLES = Array.from({ length: 20 }).map((_, i) => {
  const angle = (i / 20) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 85 + (i % 4) * 25;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 5 + (i % 3) * 3,
    shape: i % 2 === 0 ? 'circle' : 'rect',
    rotation: (i * 45) % 360,
  };
});

export const OtpSuccessCelebration: React.FC<OtpSuccessCelebrationProps> = ({
  orderTotal,
  isCod,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '320px',
      }}
    >
      {/* Expanding green background aura */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.4, 1.2], opacity: [0, 0.45, 0.25] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Confetti Explosion Particles */}
      <div style={{ position: 'absolute', top: '38%', left: '50%', pointerEvents: 'none' }}>
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.2, 0.8],
              opacity: [1, 1, 0],
              rotate: [0, p.rotation + 180],
            }}
            transition={{
              duration: 1.1,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'absolute',
              width: p.shape === 'circle' ? p.size : p.size * 1.4,
              height: p.size,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              backgroundColor: p.color,
              top: -p.size / 2,
              left: -p.size / 2,
            }}
          />
        ))}
      </div>

      {/* Pulsing Emerald Checkmark Hub */}
      <div style={{ position: 'relative', marginBottom: '22px' }}>
        {/* Ripple Ring 1 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.5)',
          }}
        />

        {/* Ripple Ring 2 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.4, delay: 0.3, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.35)',
          }}
        />

        {/* Animated Main Check Bubble */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: [0, 1.25, 0.95, 1], rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 18,
            delay: 0.1,
          }}
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 28px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.28, type: 'spring', stiffness: 500 }}
          >
            <Check size={44} strokeWidth={3.5} />
          </motion.div>
        </motion.div>
      </div>

      {/* Success Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <ShieldCheck size={20} color="#059669" />
          <h3
            style={{
              margin: 0,
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#064E3B',
              letterSpacing: '-0.02em',
            }}
          >
            OTP Verified!
          </h3>
        </div>

        <p
          style={{
            margin: '0 0 16px',
            fontSize: '0.92rem',
            color: '#047857',
            fontWeight: 500,
          }}
        >
          Order successfully delivered & completed
        </p>

        {/* COD or Prepaid status pill */}
        {isCod && orderTotal ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              color: '#92400E',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <Banknote size={16} />
            <span>₹{orderTotal} Cash Collected & Settled</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <Check size={15} strokeWidth={2.5} />
            <span>Prepaid Online Payment Verified</span>
          </motion.div>
        )}
      </motion.div>

      {/* Satisfying Progress Completion Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(16, 185, 129, 0.15)',
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.7, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #10B981, #059669)',
          }}
        />
      </div>
    </motion.div>
  );
};
