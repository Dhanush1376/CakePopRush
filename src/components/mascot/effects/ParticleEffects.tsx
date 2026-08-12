import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ParticleType = 'hearts' | 'sparkles' | 'confetti' | 'questionMarks' | 'sleepZ' | 'thoughtDots' | 'excitementLines' | 'impactLines' | 'tears' | 'bonkStars' | 'cryingFountainTears' | 'kissHeart';

interface ParticleEffectsProps {
  activeEffects: ParticleType[];
}

// Pre-generate random offsets so they don't change on re-render and reset the animation
const LEFT_TEAR_OFFSETS = Array.from({ length: 12 }).map(() => ({
  yTop: 90 - Math.random() * 40,
  xMid1: 80 - Math.random() * 30,
  xMid2: 50 - Math.random() * 20
}));

const RIGHT_TEAR_OFFSETS = Array.from({ length: 12 }).map(() => ({
  yTop: 90 - Math.random() * 40,
  xMid1: 220 + Math.random() * 30,
  xMid2: 250 + Math.random() * 20
}));

export const ParticleEffects: React.FC<ParticleEffectsProps> = ({ activeEffects }) => {
  // To handle re-triggering the same effect, we use keys based on render cycles,
  // but for simplicity we rely on Framer Motion AnimatePresence and state.
  return (
    <motion.g id="particle-effects-group" style={{ pointerEvents: 'none' }}>
        {activeEffects.includes('hearts') && (
          <motion.g key="hearts-effect">
            {[
              { id: 1, x: 25, y: 65, scale: 1.2, rotate: -25, delay: 0 },
              { id: 2, x: 15, y: 125, scale: 0.8, rotate: -15, delay: 0.4 },
              { id: 3, x: 255, y: 70, scale: 1.0, rotate: 25, delay: 0.2 },
              { id: 4, x: 265, y: 135, scale: 0.7, rotate: 15, delay: 0.6 }
            ].map((h) => (
              <motion.path
                key={`heart-${h.id}`}
                d="M 10 30 A 20 20 0 0 1 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 90 Q 10 60 10 30 Z"
                fill="#F20D6F"
                initial={{ x: h.x, y: h.y, scale: 0, rotate: h.rotate, opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 1, 0],
                  y: [h.y, h.y - 20, h.y - 30, h.y - 40, h.y - 50],
                  scale: [0, h.scale, h.scale, h.scale * 1.1] 
                }}
                transition={{ duration: 2.5, delay: h.delay, repeat: Infinity, repeatDelay: 0.5 }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('sparkles') && (
          <motion.g key="sparkles-effect">
            {[1, 2, 3, 4].map((i) => {
              const dx = ((i * 43) % 100) - 50;
              const dy = ((i * 19) % 100) - 50;
              return (
                <motion.path
                  key={`sparkle-${i}`}
                  d="M 0 10 Q 5 5 10 0 Q 5 -5 0 -10 Q -5 -5 -10 0 Q -5 5 0 10 Z"
                  fill="#FFD700"
                  initial={{ opacity: 0, x: 150 + dx, y: 150 + dy, scale: 0, rotate: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 90, 180]
                  }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              );
            })}
          </motion.g>
        )}

        {activeEffects.includes('confetti') && (
          <motion.g key="confetti-effect">
            {Array.from({ length: 12 }).map((_, i) => {
              const colors = ['#FF4B72', '#4DC0F0', '#FAD23C', '#07C2BB'];
              // Pseudo-random based on i
              const dx = ((i * 37) % 200) - 100;
              const dy = ((i * 59) % 150);
              const drot = (i * 73) % 360;
              return (
                <motion.rect
                  key={`confetti-${i}`}
                  width={8} height={12} rx={2}
                  fill={colors[i % colors.length]}
                  initial={{ opacity: 0, x: 150, y: 150, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    x: 150 + dx,
                    y: 150 - dy + 50,
                    rotate: drot,
                    scale: 1
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              );
            })}
          </motion.g>
        )}

        {activeEffects.includes('questionMarks') && (
          <motion.g key="question-effect">
            {[1, 2].map((i) => (
              <motion.text
                key={`q-${i}`}
                x={150 + (i === 1 ? -40 : 40)}
                y={60}
                fill="#FF4B72"
                fontSize="40"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
                initial={{ opacity: 0, y: 80, scale: 0.5, rotate: i === 1 ? -15 : 15 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: 40,
                  scale: [0.5, 1.2, 1]
                }}
                transition={{ duration: 1.2, delay: i * 0.15 }}
              >
                ?
              </motion.text>
            ))}
          </motion.g>
        )}

        {activeEffects.includes('sleepZ') && (
          <motion.g key="sleep-effect">
            {[
              { id: 1, targetX: 230, targetY: 80, size: 20, delay: 0 },
              { id: 2, targetX: 250, targetY: 55, size: 26, delay: 0.8 },
              { id: 3, targetX: 270, targetY: 25, size: 34, delay: 1.6 }
            ].map((z) => (
              <motion.text
                key={`z-${z.id}`}
                x={z.targetX}
                y={z.targetY}
                fill="#4DC0F0"
                fontSize={z.size}
                fontWeight="bold"
                fontFamily='"Arial Rounded MT Bold", "Nunito", sans-serif'
                textAnchor="middle"
                style={{ originX: '50%', originY: '50%' }}
                initial={{ opacity: 0, x: z.targetX - 5, y: z.targetY + 15, scale: 0.5, rotate: 15 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: [z.targetX - 5, z.targetX, z.targetX + 3, z.targetX + 5],
                  y: [z.targetY + 15, z.targetY, z.targetY - 10, z.targetY - 20],
                  scale: [0.5, 1, 1, 1.1]
                }}
                transition={{ duration: 3.5, delay: z.delay, repeat: Infinity, repeatDelay: 0.5 }}
              >
                Z
              </motion.text>
            ))}
          </motion.g>
        )}

        {activeEffects.includes('thoughtDots') && (
          <motion.g key="thought-effect">
            <motion.path 
              d="M 190 70 Q 185 90 170 100 Q 185 95 190 70" 
              fill="#fff" stroke="#ddd" strokeWidth="2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.ellipse 
              cx="220" cy="50" rx="40" ry="25" 
              fill="#fff" stroke="#ddd" strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
            />
            {[1, 2, 3].map((i) => (
              <motion.circle
                key={`dot-${i}`}
                cx={195 + i * 12}
                cy={50}
                r={4}
                fill="#aaa"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.5, repeat: 0, delay: i * 0.2 }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('excitementLines') && (
          <motion.g key="excitement-effect">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.line
                key={`line-${angle}`}
                x1={150} y1={150}
                x2={150} y2={40}
                stroke="#FAD23C"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${angle} 150 150)`}
                initial={{ opacity: 0, strokeDasharray: "0 100", strokeDashoffset: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  strokeDasharray: ["0 100", "40 100", "0 100"],
                  strokeDashoffset: [0, -20, -60]
                }}
                transition={{ duration: 0.6 }}
              />
            ))}
          </motion.g>
        )}
        
        {activeEffects.includes('impactLines') && (
          <motion.g key="impact-effect">
            {[0, 72, 144, 216, 288].map((angle) => (
              <motion.path
                key={`impact-${angle}`}
                d="M 150 150 L 145 90 L 150 80 L 155 90 Z"
                fill="#fff"
                transform={`rotate(${angle} 150 150)`}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 1, 0], scaleY: [0.5, 1.5, 0] }}
                transition={{ duration: 0.4 }}
                style={{ originX: '150px', originY: '150px' }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('tears') && (
          <motion.g key="tears-effect">
            {[1, 2].map((i) => (
              <motion.path
                key={`tear-${i}`}
                d="M 0 0 C -5 5 -5 10 0 12 C 5 10 5 5 0 0 Z"
                fill="#4DC0F0"
                initial={{ opacity: 0, x: i === 1 ? 115 : 185, y: 150, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [150, 180, 200],
                  scale: [0, 1.2, 1.5, 0.5]
                }}
                transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity, repeatDelay: 0.2 }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('bonkStars') && (
          <motion.g key="bonk-effect">
            {[
              { id: 1, angle: -30, x: 100, y: 70 },
              { id: 2, angle: 10, x: 150, y: 55 },
              { id: 3, angle: 45, x: 200, y: 70 }
            ].map((star) => (
              <motion.path
                key={`bonkstar-${star.id}`}
                d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z"
                fill="#FAD23C"
                initial={{ opacity: 0, scale: 0.2, x: star.x, y: star.y + 20, rotate: star.angle }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0],
                  y: [star.y + 10, star.y - 15, star.y - 5],
                  rotate: [star.angle, star.angle + 45, star.angle + 90]
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('cryingFountainTears') && (
          <motion.g key="crying-fountain-effect">
            {/* Left Eye Solid Waterfall */}
            <motion.path
              d="M 115 155 Q 100 165, 80 280 L 110 280 Q 125 170, 115 155 Z"
              fill="#4DC0F0"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 0.8, 0.8, 0] }}
              style={{ originY: '155px', originX: '100px' }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            />
            {/* Left Eye Waterfall Flow Lines (to give illusion of motion) */}
            <motion.path
              d="M 105 160 L 95 200 M 110 180 L 100 220 M 100 230 L 90 270"
              stroke="#E0F7FA"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 50, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Right Eye Solid Waterfall */}
            <motion.path
              d="M 185 155 Q 200 165, 220 280 L 190 280 Q 175 170, 185 155 Z"
              fill="#4DC0F0"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 0.8, 0.8, 0] }}
              style={{ originY: '155px', originX: '200px' }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear', delay: 0.1 }}
            />
            {/* Right Eye Waterfall Flow Lines */}
            <motion.path
              d="M 195 160 L 205 200 M 190 180 L 200 220 M 200 230 L 210 270"
              stroke="#E0F7FA"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 50, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'linear', delay: 0.1 }}
            />
            
            {/* Puddle */}
            <motion.ellipse
              cx="150"
              cy="255"
              rx="40"
              ry="8"
              fill="#4DC0F0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.4, 0], scale: [0, 1, 1.2] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </motion.g>
        )}

        {activeEffects.includes('kissHeart') && (
          <motion.g key="kiss-heart-effect">
            {/* The Hearts */}
            {[0, 1, 2].map((i) => (
              <motion.path
                key={`kissheart-multi-${i}`}
                d="M 0 6 C 0 1, 5 -3, 10 2 C 15 -3, 20 1, 20 6 C 20 13, 10 20, 10 20 C 10 20, 0 13, 0 6 Z"
                fill="#FFFFFF"
                initial={{ x: 150, y: 190, scale: 0.6, opacity: 0 }}
                animate={{ 
                  x: [150, 125 - i * 15, 90 - i * 20, 70 - i * 25], 
                  y: [190, 160 + i * 5, 120 + i * 15, 100 + i * 20],
                  scale: [0.6, 1.5 - i * 0.2, 2 - i * 0.3, 1.8 - i * 0.3], 
                  opacity: [0, 1, 1, 0],
                  rotate: [0, -5 - i*5, -10 - i*10, -15 - i*10]
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.15, // stagger them by 150ms
                  times: [0, 0.2, 0.6, 1],
                  ease: "easeOut" 
                }}
              />
            ))}
            {/* Tiny Sparkles */}
            {[
              { id: 1, x: 70, y: 90, delay: 0.6 },
              { id: 2, x: 90, y: 110, delay: 0.65 },
              { id: 3, x: 60, y: 120, delay: 0.7 }
            ].map(sparkle => (
              <motion.path
                key={`kissparkle-${sparkle.id}`}
                d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
                fill="#FFD700"
                initial={{ x: sparkle.x, y: sparkle.y, scale: 0, opacity: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.5, 0], 
                  opacity: [0, 1, 0],
                  rotate: [0, -45, -90]
                }}
                transition={{ duration: 0.35, delay: sparkle.delay, ease: "easeInOut" }}
              />
            ))}
          </motion.g>
        )}
    </motion.g>
  );
};
